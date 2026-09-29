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
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();
  if (!text) {
    console.error(`[chat] Gemini (${model}) devolvió respuesta vacía — finishReason: ${data?.candidates?.[0]?.finishReason ?? "?"}. Si es MAX_TOKENS, sube CHATBOT_MAX_OUTPUT_TOKENS.`);
  }
  return text || null;
}

async function askGroq(history: Msg[], question: string, context: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    console.error("[chat] GROQ_API_KEY no está definida en Vercel (Settings → Environment Variables → Redeploy)");
    return null;
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: Math.max(500, Number(process.env.GROQ_MAX_TOKENS || 2000)),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: `CONTEXTO:\n${context}\n\nPREGUNTA: ${question}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
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
      lastError: lastErrors.groq,
    },
    note: "hasKey=false → añade la clave en Vercel y REDESPLIEGA. lastError=null → todavía no hay intentos desde el último deploy (haz una pregunta al chat y recarga).",
  });
}
