/**
 * Chatbot AEFN — widget flotante
 * Se agrega a cualquier página con:
 *   <link rel="stylesheet" href="css/chatbot.css">
 *   <script src="js/chatbot.js" defer></script>
 */
(function () {
  if (window.__aefnChatLoaded) return;
  window.__aefnChatLoaded = true;

  // Carga los estilos si la página no los incluyó
  if (!document.querySelector('link[href$="chatbot.css"]')) {
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/css/chatbot.css";
    document.head.appendChild(css);
  }

  var API_URL = "/api/chat";
  var STORAGE_KEY = "aefn-chat-history";
  var SUGGESTIONS = ["¿Qué clubes hay?", "¿Cuáles son los próximos eventos?", "¿Qué profesores trabajan en nanotecnología?"];
  var WELCOME = "¡Hola! Soy el asistente de la **AEFN**. Pregúntame sobre profesores, eventos, clubes, investigación o la asociación.";

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) { history = []; }

  function save() { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20))); } catch (e) {} }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Markdown mínimo y seguro: negritas, cursivas, enlaces, listas, párrafos
  function render(md) {
    var html = escapeHtml(md)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/(^|\s)(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    return html
      .split(/\n{2,}/)
      .map(function (block) {
        var lines = block.split("\n");
        if (lines.every(function (l) { return /^\s*[-•*]\s+/.test(l); })) {
          return "<ul>" + lines.map(function (l) { return "<li>" + l.replace(/^\s*[-•*]\s+/, "") + "</li>"; }).join("") + "</ul>";
        }
        return "<p>" + lines.join("<br>") + "</p>";
      })
      .join("");
  }

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="5" ry="2.2" transform="rotate(35 12 12)"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var root = document.createElement("div");
  root.className = "aefn-chat";
  root.innerHTML =
    '<button type="button" class="aefn-chat__launcher" aria-label="Abrir chat de ayuda">' + ICON_CHAT + "</button>" +
    '<section class="aefn-chat__panel" role="dialog" aria-label="Chat de la AEFN">' +
      '<header class="aefn-chat__header">' +
        '<div class="aefn-chat__avatar" aria-hidden="true">AEFN</div>' +
        '<div><p class="aefn-chat__title">Asistente AEFN</p><p class="aefn-chat__subtitle">Física y Nanotecnología · Yachay Tech</p></div>' +
        '<button type="button" class="aefn-chat__close" aria-label="Cerrar chat">×</button>' +
      "</header>" +
      '<div class="aefn-chat__messages" aria-live="polite"></div>' +
      '<form class="aefn-chat__form">' +
        '<textarea class="aefn-chat__input" rows="1" placeholder="Escribe tu pregunta…" aria-label="Tu pregunta" maxlength="1000"></textarea>' +
        '<button type="submit" class="aefn-chat__send" aria-label="Enviar">' + ICON_SEND + "</button>" +
      "</form>" +
      '<p class="aefn-chat__note">Respuestas generadas por IA. Verifica la información importante.</p>' +
    "</section>";
  document.body.appendChild(root);

  var launcher = root.querySelector(".aefn-chat__launcher");
  var closeBtn = root.querySelector(".aefn-chat__close");
  var list = root.querySelector(".aefn-chat__messages");
  var form = root.querySelector(".aefn-chat__form");
  var input = root.querySelector(".aefn-chat__input");
  var send = root.querySelector(".aefn-chat__send");
  var busy = false;

  function addMessage(role, text) {
    var el = document.createElement("div");
    el.className = "aefn-chat__msg aefn-chat__msg--" + (role === "user" ? "user" : "bot");
    el.innerHTML = role === "user" ? "<p>" + escapeHtml(text).replace(/\n/g, "<br>") + "</p>" : render(text);
    list.appendChild(el);
    list.scrollTop = list.scrollHeight;
    return el;
  }

  function showSuggestions() {
    var wrap = document.createElement("div");
    wrap.className = "aefn-chat__suggestions";
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "aefn-chat__chip";
      b.textContent = s;
      b.addEventListener("click", function () { wrap.remove(); ask(s); });
      wrap.appendChild(b);
    });
    list.appendChild(wrap);
  }

  function init() {
    list.innerHTML = "";
    addMessage("assistant", WELCOME);
    if (!history.length) showSuggestions();
    history.forEach(function (m) { addMessage(m.role, m.content); });
  }

  function ask(text) {
    if (busy || !text.trim()) return;
    busy = true;
    send.disabled = true;
    var chips = list.querySelector(".aefn-chat__suggestions");
    if (chips) chips.remove();

    addMessage("user", text);
    var typing = addMessage("assistant", "");
    typing.innerHTML = '<span class="aefn-chat__typing" aria-label="Escribiendo"><span></span><span></span><span></span></span>';

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history.slice(-6) }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var answer = data.answer || "No pude responder. Intenta de nuevo en un momento.";
        typing.innerHTML = render(answer);
        history.push({ role: "user", content: text }, { role: "assistant", content: answer });
        save();
      })
      .catch(function () {
        typing.innerHTML = render("No hay conexión con el asistente. Revisa tu internet e intenta de nuevo.");
      })
      .finally(function () {
        busy = false;
        send.disabled = false;
        list.scrollTop = list.scrollHeight;
        input.focus();
      });
  }

  launcher.addEventListener("click", function () {
    root.classList.add("is-open");
    if (!list.children.length) init();
    input.focus();
  });
  closeBtn.addEventListener("click", function () { root.classList.remove("is-open"); launcher.focus(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) { root.classList.remove("is-open"); launcher.focus(); }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = input.value;
    input.value = "";
    input.style.height = "";
    ask(t);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit")); }
  });
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 100) + "px";
  });
})();
