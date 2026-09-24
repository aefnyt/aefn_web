/**
 * Búsqueda de fragmentos relevantes (BM25)
 * ===========================================
 * No usa servicios externos ni "embeddings": es 100% gratis y corre en el
 * servidor. Para una base de conocimiento de hasta unos miles de fragmentos
 * funciona muy bien.
 */
import knowledge from "@/data/knowledge.json";

export type Doc = { source: string; text: string };

const STOPWORDS = new Set(
  (
    "a al algo algun alguna algunas alguno algunos ante antes como con contra cual cuales cuando de del desde donde dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estan estas este esto estos fue fueron ha hay la las le les lo los mas me mi mis mucho muy nada ni no nos o otra otro para pero poco por porque que quien quienes se ser si sin sobre son su sus tambien te tiene tienen todo todos tu tus un una uno unos y ya yo " +
    "the of and to in is for on with what who how are an be"
  ).split(" ")
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map((t) => (t.length > 4 ? t.replace(/(es|s)$/, "") : t)); // plural → singular (aprox.)
}

const docs: Doc[] = (knowledge as { docs: Doc[] }).docs ?? [];
const docTokens = docs.map((d) => tokenize(d.source + " " + d.text));
const avgLen = docTokens.reduce((s, t) => s + t.length, 0) / Math.max(docTokens.length, 1);
const df = new Map<string, number>();
for (const toks of docTokens) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);

export function search(query: string, k = 6): Doc[] {
  const q = [...new Set(tokenize(query))];
  if (!q.length || !docs.length) return [];
  const N = docs.length;
  const k1 = 1.4;
  const b = 0.75;
  const scored = docTokens.map((toks, i) => {
    let score = 0;
    for (const term of q) {
      const n = df.get(term);
      if (!n) continue;
      let tf = 0;
      for (const t of toks) if (t === term) tf++;
      if (!tf) continue;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * toks.length) / avgLen)));
    }
    return { i, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => docs[s.i]);
}

export const knowledgeSize = docs.length;
