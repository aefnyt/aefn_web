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
import { search, type Doc } from "@/lib/chat-search";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

const BOT_NAME = process.env.CHATBOT_NAME || "Asistente AEFN";

const SYSTEM_PROMPT = `Eres ${BOT_NAME}, el asistente virtual de la Asociación de Estudiantes de Física y Nanotecnología (AEFN) de la Universidad Yachay Tech, en Ecuador.

Reglas:
- Responde SIEMPRE en el idioma en que te escriben (normalmente español), de forma breve, clara y amable.
- Usa SOLO la información de la sección CONTEXTO. Si la respuesta no está ahí, dilo con honestidad y sugiere escribir a la AEFN por la página de contacto (/contact.html). No inventes nombres, fechas, correos ni cifras.
- Puedes usar **negritas** y listas cortas con "- ". No uses títulos ni tablas.
- Si mencionas una página del sitio, usa estos enlaces: profesores → /profesores.html, eventos → /calendario.html, clubes → /clubes.html, investigación → /investigacion.html, galería → /galeria.html, noticias → /noticias, contacto → /contact.html.`;

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

function buildContext(found: Doc[]) {
  if (!found.length) return "(No se encontró información relacionada.)";
  return found.map((d, i) => `[${i + 1}] Fuente: ${d.source}\n${d.text}`).join("\n\n---\n\n");
}

async function askGemini(history: Msg[], question: string, context: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = [
    ...history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: `CONTEXTO:\n${context}\n\nPREGUNTA: ${question}` }] },
  ];
  const generationConfig: Record<string, unknown> = { temperature: 0.3, maxOutputTokens: 700 };
  if (model.startsWith("gemini-2.5-flash")) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, generationConfig }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();
  return text || null;
}

async function askGroq(history: Msg[], question: string, context: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 700,
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

function fallbackAnswer(found: Doc[]) {
  if (!found.length) {
    return "No encontré información sobre eso. Puedes escribirle a la AEFN desde la página de [contacto](/contact.html).";
  }
  const top = found.slice(0, 2).map((d) => `**${d.source}**\n${d.text.slice(0, 400)}${d.text.length > 400 ? "…" : ""}`);
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

  for (const ask of [askGemini, askGroq]) {
    try {
      const answer = await ask(history, question, context);
      if (answer) return NextResponse.json({ answer });
    } catch (err) {
      console.error("[chat]", err instanceof Error ? err.message : err);
    }
  }
  return NextResponse.json({ answer: fallbackAnswer(found), fallback: true });
}
