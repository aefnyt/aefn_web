import { readFileSync } from "fs";
import { join } from "path";

/**
 * Buscador de fragmentos (RAG retrieval)
 * ===========================================
 * Carga el índice de conocimiento (generado por scripts/build-knowledge.mjs)
 * y busca los fragmentos más relevantes para una pregunta dada.
 *
 * Usa una técnica simple pero efectiva: TF (Term Frequency) con
 * normalización. No requiere embeddings ni APIs externas.
 */

interface KnowledgeChunk {
  id: string;
  text: string;
  source: string;
  section: string;
}

let cachedIndex: KnowledgeChunk[] | null = null;

/** Stopwords en español (palabras muy comunes que no aportan a la búsqueda) */
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al",
  "y", "o", "que", "en", "es", "se", "por", "para", "con", "como", "su", "sus",
  "mas", "pero", "si", "no", "ya", "esto", "eso", "esta", "ese", "aquel",
  "mi", "tu", "yo", "me", "te", "le", "les", "nos", "vos", "ellos", "ellas",
  "fue", "son", "ser", "estar", "tener", "hacer", "poder", "decir", "ver",
  "the", "is", "are", "was", "were", "a", "an", "the", "and", "or", "in",
  "on", "at", "to", "for", "of", "with", "by", "from", "as", "it",
]);

/** Tokeniza un texto en palabras (minúsculas, sin acentos, sin signos) */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Carga el índice de conocimiento (con caché) */
function loadIndex(): KnowledgeChunk[] {
  if (cachedIndex) return cachedIndex;

  try {
    const indexPath = join(process.cwd(), "public", "data", "knowledge-index.json");
    const raw = readFileSync(indexPath, "utf-8");
    cachedIndex = JSON.parse(raw);
    return cachedIndex || [];
  } catch (e) {
    console.warn("[chat-search] knowledge-index.json no encontrado:", e instanceof Error ? e.message : "");
    return [];
  }
}

/**
 * Busca los fragmentos más relevantes para una pregunta.
 * @param question La pregunta del usuario
 * @param maxResults Número máximo de fragmentos a devolver (default 5)
 * @returns Array de fragmentos con score
 */
export function searchKnowledge(
  question: string,
  maxResults: number = 5
): { chunk: KnowledgeChunk; score: number }[] {
  const index = loadIndex();
  if (index.length === 0) return [];

  const questionTokens = tokenize(question);
  if (questionTokens.length === 0) return [];

  const scored = index.map((chunk) => {
    const chunkTokens = tokenize(chunk.text);
    const chunkSet = new Set(chunkTokens);

    // Score: cuántos tokens de la pregunta aparecen en el chunk
    let score = 0;
    for (const qt of questionTokens) {
      if (chunkSet.has(qt)) {
        score += 1;
        // Bonus si el token aparece en el título/sección
        if (chunk.section.toLowerCase().includes(qt)) {
          score += 0.5;
        }
      }
    }

    // Normalizar por longitud del chunk (penalizar chunks muy cortos)
    score = score / Math.sqrt(chunkTokens.length || 1);

    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => ({ chunk: s.chunk, score: s.score }));
}

/**
 * Construye el contexto para el LLM a partir de los fragmentos encontrados.
 */
export function buildContext(results: { chunk: KnowledgeChunk; score: number }[]): string {
  if (results.length === 0) return "";

  return results
    .map((r, i) => {
      return `[Fragmento ${i + 1}] (Fuente: ${r.chunk.source} — ${r.chunk.section})\n${r.chunk.text}`;
    })
    .join("\n\n---\n\n");
}
