/* ============================================================
   AEFN — Carrusel dinámico JSON-driven
   ============================================================
   Lee public/data/carrusel.json y renderiza el carrusel de
   Bootstrap 5 dinámicamente. Soporta:

   - tipo: "imagen"  → <img> con src local
   - tipo: "video"   → <iframe> de YouTube/Vimeo embebido
                       con autoplay + muted + loop

   El JSON se edita directamente en GitHub. No requiere tocar
   el HTML. Para añadir un slide, solo añades un objeto al array.

   📚 Formato del JSON (cada slide):
   ----------------------------------
   {
     "id": "slide-8",                 // identificador único
     "tipo": "imagen" | "video",      // requerido
     "src": "welcome_screen/8.jpeg",  // ruta imagen o URL YouTube/Vimeo
     "alt": "Descripción",            // solo para imágenes (opcional)
     "duracion": 4000                 // ms en pantalla (solo imágenes)
   }

   Para videos de YouTube, "src" puede ser:
   - https://www.youtube.com/watch?v=VIDEO_ID
   - https://youtu.be/VIDEO_ID
   - https://www.youtube.com/embed/VIDEO_ID

   Para Vimeo:
   - https://vimeo.com/VIDEO_ID
   - https://player.vimeo.com/video/VIDEO_ID

   El script convierte cualquier formato a embed automáticamente.
   ============================================================ */

(function () {
  "use strict";

  const CAROUSEL_JSON_PATH = "data/carrusel.json";
  const CAROUSEL_CONTAINER_ID = "homeCarousel";
  const FALLBACK_INTERVAL = 4000; // ms si el slide no especifica duración

  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById(CAROUSEL_CONTAINER_ID);
    if (!container) {
      console.warn("[carrusel] No se encontró el contenedor #" + CAROUSEL_CONTAINER_ID);
      return;
    }

    // Guardar el intervalo original del HTML (data-bs-interval)
    const htmlInterval = parseInt(container.getAttribute("data-bs-interval"), 10);
    const defaultInterval = isNaN(htmlInterval) ? FALLBACK_INTERVAL : htmlInterval;

    fetch(CAROUSEL_JSON_PATH, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (slides) {
        if (!Array.isArray(slides) || slides.length === 0) {
          console.warn("[carrusel] JSON vacío o inválido. Manteniendo slides del HTML.");
          return;
        }
        renderCarousel(container, slides, defaultInterval);
      })
      .catch(function (err) {
        console.error("[carrusel] No se pudo cargar carrusel.json:", err);
        // Silencioso: el carrusel HTML original ya está renderizado como fallback
      });
  });

  /* ------------------------------------------------------------
     Renderiza los slides dentro del contenedor existente.
     Respeta el efecto carousel-fade y el data-bs-ride.
     ------------------------------------------------------------ */
  function renderCarousel(container, slides, defaultInterval) {
    const inner = container.querySelector(".carousel-inner");
    if (!inner) {
      console.warn("[carrusel] Falta .carousel-inner");
      return;
    }

    // Limpiar slides hardcodeados
    inner.innerHTML = "";

    slides.forEach(function (slide, index) {
      const isActive = index === 0;
      const item = document.createElement("div");
      item.className = "carousel-item" + (isActive ? " active" : "");

      // Las imágenes usan el intervalo del JSON; los videos se autogestionan
      if (slide.tipo === "video") {
        item.setAttribute("data-bs-interval", "false"); // el video controla su duración
      } else {
        const dur = parseInt(slide.duracion, 10);
        item.setAttribute("data-bs-interval", isNaN(dur) ? defaultInterval : dur);
      }

      // Contenido del slide
      if (slide.tipo === "video") {
        item.appendChild(buildVideoSlide(slide));
      } else {
        item.appendChild(buildImageSlide(slide));
      }

      inner.appendChild(item);
    });

    // Inicializar/reiniciar el carrusel de Bootstrap
    initBootstrapCarousel(container, slides);
  }

  /* ------------------------------------------------------------
     Slide de imagen: <img> con clase hero-carousel-image
     ------------------------------------------------------------ */
  function buildImageSlide(slide) {
    const wrapper = document.createElement("div");
    wrapper.className = "hero-carousel-image-wrapper";
    wrapper.style.cssText = "position:relative;width:100%;height:100%;";

    const img = document.createElement("img");
    img.src = slide.src;
    img.alt = slide.alt || "Slide AEFN";
    img.className = "d-block w-100 hero-carousel-image";
    img.loading = "lazy";
    wrapper.appendChild(img);

    return wrapper;
  }

  /* ------------------------------------------------------------
     Slide de video: iframe YouTube/Vimeo con autoplay+mute+loop
     ------------------------------------------------------------ */
  function buildVideoSlide(slide) {
    const wrapper = document.createElement("div");
    wrapper.className = "hero-carousel-video-wrapper";
    wrapper.style.cssText =
      "position:relative;width:100%;height:100%;background:#000;";

    // Detectar plataforma y construir URL de embed
    const embedUrl = buildEmbedUrl(slide.src);
    if (!embedUrl) {
      // Fallback: si la URL no es válida, mostrar placeholder
      const placeholder = document.createElement("div");
      placeholder.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#FFD700;font-family:monospace;background:#0a0a0a;";
      placeholder.textContent = "⚠ URL de video no válida";
      wrapper.appendChild(placeholder);
      return wrapper;
    }

    // Ratio 16:9 responsivo
    const aspect = document.createElement("div");
    aspect.style.cssText =
      "position:relative;padding-bottom:56.25%;height:0;overflow:hidden;";

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = slide.alt || "Video AEFN";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;border:0;";
    iframe.loading = "lazy";

    aspect.appendChild(iframe);
    wrapper.appendChild(aspect);

    return wrapper;
  }

  /* ------------------------------------------------------------
     Convierte cualquier URL de YouTube/Vimeo a URL de embed
     con autoplay=1&mute=1&loop=1&playlist=ID (requerido por YT para loop)
     ------------------------------------------------------------ */
  function buildEmbedUrl(url) {
    if (!url || typeof url !== "string") return null;

    // YouTube: watch?v=, youtu.be/, /embed/
    var ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      var videoId = ytMatch[1];
      return (
        "https://www.youtube.com/embed/" + videoId +
        "?autoplay=1&mute=1&loop=1&playlist=" + videoId +
        "&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1"
      );
    }

    // Vimeo: vimeo.com/ID o player.vimeo.com/video/ID
    var vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch) {
      var vimeoId = vimeoMatch[1];
      return (
        "https://player.vimeo.com/video/" + vimeoId +
        "?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0"
      );
    }

    // Si ya es una URL de embed válida, devolverla con params
    if (url.includes("/embed/")) {
      return url;
    }

    return null;
  }

  /* ------------------------------------------------------------
     Inicializa el carrusel Bootstrap con manejo especial de videos:
     - Cuando un video está activo, NO se avanza automáticamente
       hasta que termine el video o pase un tiempo máximo de seguridad
     - Cuando una imagen está activa, se usa su duración
     ------------------------------------------------------------ */
  function initBootstrapCarousel(container, slides) {
    // Asegurar que tenga ride=carousel y pause=hover
    container.setAttribute("data-bs-ride", "carousel");
    container.setAttribute("data-bs-pause", "hover");

    // Usar la API de Bootstrap si está disponible
    if (typeof bootstrap !== "undefined" && bootstrap.Carousel) {
      // Destruir instancia previa si existe
      var existing = bootstrap.Carousel.getInstance(container);
      if (existing) {
        existing.dispose();
      }

      var carousel = new bootstrap.Carousel(container, {
        ride: "carousel",
        pause: "hover",
        // interval se maneja por-slide via data-bs-interval
      });

      // Evento: cuando cambia a un slide de video, pausar el avance auto
      // hasta que termine el video (o timeout de seguridad de 30s)
      container.addEventListener("slid.bs.carousel", function (e) {
        var activeIndex = Array.from(
          container.querySelectorAll(".carousel-item")
        ).indexOf(container.querySelector(".carousel-item.active"));

        var currentSlide = slides[activeIndex];
        if (!currentSlide) return;

        if (currentSlide.tipo === "video") {
          carousel.pause();
          // Timeout de seguridad: avanzar tras 30s máximo (por si el video es muy largo)
          var safetyTimeout = setTimeout(function () {
            carousel.next();
          }, 30000);

          // Escuchar fin del video (solo YouTube via postMessage es complejo;
          // confiamos en loop=true y el timeout de seguridad)
          container._aefnVideoSafetyTimeout = safetyTimeout;
        } else {
          // Si veníamos de un video, limpiar timeout y reanudar
          if (container._aefnVideoSafetyTimeout) {
            clearTimeout(container._aefnVideoSafetyTimeout);
            container._aefnVideoSafetyTimeout = null;
          }
          carousel.cycle();
        }
      });
    }
  }
})();
