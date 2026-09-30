/**
 * POST /api/chat — Chatbot de la AEFN
 * ===========================================
 * 1. Recibe la pregunta y el historial corto de la conversación.
 * 2. Busca los fragmentos más relevantes en la base de conocimiento.
 * 3. Le pide la respuesta a un modelo gratuito:
 *      - Google Gemini (GEMINI_API_KEY)  ← principal
 *      - Groq (GROQ_API_KEY)             ← respaldo opcional
 * 4. Si no hay clave o se acabó la cuota gratis, responde mostrando
 *    directamente los fragmentos encontrados (el chat nunca se "cae").
 *
 * Las claves van en variables de entorno de Vercel, NUNCA en el código.
 */
import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge, buildContext as buildContextFromChunks, type KnowledgeChunk } from "@/lib/chat-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // el GET de diagnóstico siempre fresco

type Msg = { role: "user" | "assistant"; content: string };

/** Resultado de la búsqueda RAG: fragmento + score de relevancia */
type SearchResult = { chunk: KnowledgeChunk; score: number };

const BOT_NAME = process.env.CHATBOT_NAME || "Asistente AEFN";

const SYSTEM_PROMPT = `Eres ${BOT_NAME}, el asistente virtual de la Asociación de Estudiantes de Física y Nanotecnología (AEFN) de la Universidad Yachay Tech, en Ecuador.

Reglas:
- Responde SIEMPRE en el idioma en que te escriben (normalmente español), de forma breve, clara y amable.
- Usa SOLO la información de la sección CONTEXTO. Si la respuesta no está ahí, dilo con honestidad y sugiere revisar las secciones del sitio o preguntar a los miembros de la AEFN. No inventes nombres, fechas, correos ni cifras.
- Puedes usar **negritas** y listas cortas con "- ". No uses títulos ni tablas.
- Si mencionas una página del sitio, usa estos enlaces: profesores → /profesores, eventos → /calendario, clubes → /clubes, investigación → /investigacion, galería → /galeria, noticias → /noticias, departamentos y directiva → /nosotros.`;

// ---------- Límite de uso por IP (protege tu cuota gratis) ----------
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = Number(process.env.CHATBOT_MAX_REQUESTS || 25);
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_REQ;
}

// ---------- Búsqueda RAG sobre la base de conocimiento ----------
function search(question: string, maxResults: number): SearchResult[] {
  return searchKnowledge(question, maxResults);
}

function buildContext(results: SearchResult[]): string {
  const context = buildContextFromChunks(results);
  return context || "(No se encontró información relacionada.)";
}

// ---------- Diagnóstico (GET /api/chat) ----------
/** Último error de cada proveedor (sanitizado, sin claves). Se resetea en cada redeploy. */
const lastErrors: Record<string, string | null> = { gemini: null, groq: null };
/** Oculta cualquier fragmento de clave que pudiera aparecer en un mensaje de error. */
const sanitize = (s: unknown) => String(s).replace(/(AIza|gsk_)[A-Za-z0-9_-]+/g, "$1***");

/** Elimina caracteres de ancho cero que hacen que una respuesta "vacía" parezca llena (ej. "\u200B"). */
const cleanAnswer = (raw: unknown) =>
  (typeof raw === "string" ? raw.replace(/[\u200B-\u200F\uFEFF]/g, "") : "").trim();

async function askGemini(history: Msg[], question: string, context: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[chat] GEMINI_API_KEY no está definida en Vercel (Settings → Environment Variables)");
    return null;
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = [
    ...history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: `CONTEXTO:\n${context}\n\nPREGUNTA: ${question}` }] },
  ];
  const maxOut = Math.max(500, Number(process.env.CHATBOT_MAX_OUTPUT_TOKENS || 4000));
  const generationConfig: Record<string, unknown> = { temperature: 0.3, maxOutputTokens: maxOut };
  if (model.startsWith("gemini-2.5-flash")) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  else if (model.startsWith("gemini-3")) generationConfig.thinkingConfig = { thinkingLevel: "none" };

  const call = (cfg: Record<string, unknown>) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, generationConfig: cfg }),
    });

  let res = await call(generationConfig);
  if (res.status === 400 && generationConfig.thinkingConfig) {
    // El modelo no aceptó esta config de "thinking": reintentar sin ella
    const clean: Record<string, unknown> = { ...generationConfig };
    delete clean.thinkingConfig;
    res = await call(clean);
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = cleanAnswer(data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join(""));
  if (!text) {
    console.error(`[chat] Gemini (${model}) devolvió respuesta vacía — finishReason: ${data?.candidates?.[0]?.finishReason ?? "?"}. Si es MAX_TOKENS, sube CHATBOT_MAX_OUTPUT_TOKENS.`);
  }
  return text || null;
}

// ---------- Groq: auto-reparación de modelo ----------
/**
 * Groq depreca modelos con frecuencia (error 404 "model not found"). Cuando
 * pasa, se consulta la lista de modelos vigentes y se elige uno de chat.
 * La elección se memoriza aquí (variable de módulo) hasta el próximo despliegue.
 */
let effectiveGroqModel: string | null = null;

/** Preferencia de modelos de Groq para la auto-reparación: número menor = se prueba antes. */
function groqModelPriority(id: string): number {
  const s = id.toLowerCase();
  if (s.includes("gpt-oss")) return 0; // OpenAI open-weight — mejor calidad en Groq hoy
  if (s.includes("kimi")) return 1; // Moonshot — fuerte multilingüe
  if (s.includes("qwen")) return 2; // Alibaba — fuerte multilingüe
  if (s.includes("llama")) return 3; // Meta — si Groq los trae de vuelta
  if (s.includes("gemma")) return 4; // Google — decente multilingüe
  if (s.includes("groq")) return 7; // compound y otros agénticos — no ideales para RAG
  if (s.includes("allam")) return 8; // árabe-céntrico, pobre en español — último recurso
  return 5; // desconocidos
}

/** Tamaño insinuado en el id ("-120b" > "-20b"): más grande primero en la misma familia. */
function modelSize(id: string): number {
  const m = id.match(/(\d+(?:\.\d+)?)b\b/i);
  return m ? parseFloat(m[1]) : 0;
}

/** Modelos de chat vivos en Groq (excluye whisper/tts/guard; ordenados por preferencia). */
async function listLiveGroqChatModels(key: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.error(`[chat] Groq: no se pudo listar modelos (${res.status})`);
      return [];
    }
    const data = await res.json();
    const ids: string[] = (Array.isArray(data?.data) ? data.data : [])
      .map((m: { id?: unknown }) => String(m?.id ?? ""))
      .filter((id) => id !== "" && !/whisper|tts|guard/i.test(id))
      .sort(
        (a, b) =>
          groqModelPriority(a) - groqModelPriority(b) || // mejor familia primero
          modelSize(b) - modelSize(a) || // más grande primero
          a.localeCompare(b), // orden estable entre despliegues
      );
    return ids;
  } catch {
    return [];
  }
}

async function askGroq(history: Msg[], question: string, context: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    console.error("[chat] GROQ_API_KEY no está definida en Vercel (Settings → Environment Variables → Redeploy)");
    return null;
  }
  const configured = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: `CONTEXTO:\n${context}\n\nPREGUNTA: ${question}` },
  ];

  /** Una llamada: devuelve el contenido saneado (null si vacío) o el texto del error. */
  const callGroq = async (model: string) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: Math.max(500, Number(process.env.GROQ_MAX_TOKENS || 2000)),
        messages,
      }),
    });
    if (!res.ok) return { status: res.status, text: (await res.text()).slice(0, 300), content: null };
    const data = await res.json().catch(() => null);
    return { status: res.status, text: null as string | null, content: cleanAnswer(data?.choices?.[0]?.message?.content) || null };
  };

  // 1er intento: modelo reparado memorizado o el configurado
  const first = effectiveGroqModel ?? configured;
  let attempt = await callGroq(first);

  // Auto-reparación: 404 (modelo retirado) o 200 con respuesta vacía (modelo débil)
  if (!attempt.content && (attempt.status === 404 || attempt.status === 200)) {
    console.warn(
      attempt.status === 404
        ? `[chat] Groq retiró "${first}" — buscando un modelo vigente…`
        : `[chat] Groq "${first}" respondió en blanco — buscando un modelo mejor…`,
    );
    const live = (await listLiveGroqChatModels(key)).filter((m) => m !== first);
    for (const candidate of live.slice(0, 3)) {
      console.warn(`[chat] Groq probando "${candidate}"…`);
      attempt = await callGroq(candidate);
      if (attempt.content) {
        effectiveGroqModel = candidate; // memorizado hasta el próximo despliegue
        console.warn(`[chat] Groq auto-reparado: usando "${candidate}"`);
        break;
      }
      if (attempt.status !== 404 && attempt.status !== 200) break; // auth/cuota: probar más no ayuda
    }
  }

  if (attempt.status !== 200) throw new Error(`Groq ${attempt.status}: ${attempt.text ?? "respuesta vacía"}`);
  return attempt.content; // null → el POST continúa con el modo fragmentos
}

function fallbackAnswer(found: SearchResult[]) {
  if (!found.length) {
    return "No encontré información sobre eso. Puedes revisar las secciones del sitio (profesores, clubes, calendario) o preguntarme de otra forma.";
  }
  const top = found.slice(0, 2).map((r) => `**${r.chunk.source}**\n${r.chunk.text.slice(0, 400)}${r.chunk.text.length > 400 ? "…" : ""}`);
  return `Esto es lo más relacionado que encontré:\n\n${top.join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ answer: "Has enviado muchas preguntas seguidas. Espera unos minutos e intenta de nuevo." }, { status: 429 });
  }

  let body: { message?: string; history?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const question = String(body.message ?? "").trim().slice(0, 1000);
  if (!question) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

  const history: Msg[] = (Array.isArray(body.history) ? body.history : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));

  // Se incluye la última pregunta del usuario para entender seguimientos ("¿y su correo?")
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const found = search(`${question} ${lastUser}`, 6);
  const context = buildContext(found);

  const providers: Array<{ name: string; ask: typeof askGemini | typeof askGroq }> = [
    { name: "gemini", ask: askGemini },
    { name: "groq", ask: askGroq },
  ];
  for (const { name, ask } of providers) {
    try {
      const answer = await ask(history, question, context);
      if (answer) return NextResponse.json({ answer });
      lastErrors[name] = sanitize(`${name}: respuesta vacía (clave ausente o finishReason MAX_TOKENS — mira el log de Vercel)`);
      console.error(`[chat] ${lastErrors[name]}`);
    } catch (err) {
      lastErrors[name] = sanitize(err instanceof Error ? err.message : err);
      console.error(`[chat] ${name} falló: ${lastErrors[name]}`);
    }
  }
  return NextResponse.json({ answer: fallbackAnswer(found), fallback: true });
}

// GET /api/chat — diagnóstico (no expone claves; errores sanitizados)
export async function GET() {
  return NextResponse.json({
    gemini: {
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      lastError: lastErrors.gemini,
    },
    groq: {
      hasKey: Boolean(process.env.GROQ_API_KEY),
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      effectiveModel: effectiveGroqModel, // modelo elegido por la auto-reparación (null = aún sin necesidad / usa "model")
      lastError: lastErrors.groq,
    },
    note: "hasKey=false → añade la clave en Vercel y REDESPLIEGA. lastError=null → todavía no hay intentos desde el último deploy (haz una pregunta al chat y recarga). groq.effectiveModel = modelo vigente que la auto-reparación eligió tras un 404 (se memoriza hasta el próximo deploy; null = usa groq.model).",
  });
}
