/**
 * Construye la "base de conocimiento" del chatbot
 * ===========================================
 * Lee:
 *   1. Todos los archivos de la carpeta /conocimiento (.md, .txt, .pdf, .docx, .json)
 *   2. Los datos del sitio en /public/data/*.json (profesores, noticias, eventos...)
 *
 * Los parte en fragmentos pequeños y los guarda en public/data/knowledge-index.json,
 * con el formato exacto que lee src/lib/chat-search.ts: {id, text, source, section}.
 * El endpoint /api/chat busca en esos fragmentos los más relevantes para
 * cada pregunta y se los pasa al modelo de IA como contexto.
 *
 * Se ejecuta solo antes de cada build (ver "build" en package.json).
 * Manualmente:  node scripts/build-knowledge.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "conocimiento");
const SITE_DATA_DIR = path.join(ROOT, "public", "data");
const OUT_FILE = path.join(ROOT, "public", "data", "knowledge-index.json");

const CHUNK_SIZE = 900; // caracteres por fragmento
const CHUNK_OVERLAP = 150;

// Campos de los JSON del sitio que no aportan nada al chatbot
const SKIP_KEYS = new Set(["id", "foto", "image", "imagen", "photos", "icono", "slug", "published", "orden"]);

const SITE_LABELS = {
  "profesores.json": "Profesores",
  "noticias.json": "Noticias",
  "events.json": "Eventos",
  "clubes.json": "Clubes estudiantiles",
  "investigation-groups.json": "Grupos de investigación",
  "papers.json": "Publicaciones (papers)",
  "theses.json": "Tesis",
  "gallery.json": "Galería",
  "departamentos.json": "Departamentos AEFN",
};

/** Convierte un texto en un id-slug corto (para el campo id del índice) */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/** Deduce la sección (título) de un fragmento: su primera línea si parece título */
function sectionOf(text, fallback) {
  const first = text.split("\n")[0].trim();
  if (first && first.length <= 90 && text.length > first.length) return first;
  return fallback;
}

function clean(text) {
  return text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function chunk(text) {
  const paragraphs = clean(text).split(/\n\s*\n/);
  const chunks = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > CHUNK_SIZE && current) {
      chunks.push(current.trim());
      current = current.slice(-CHUNK_OVERLAP) + "\n\n" + p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
    // Párrafos gigantes: se cortan a la fuerza
    while (current.length > CHUNK_SIZE * 1.5) {
      chunks.push(current.slice(0, CHUNK_SIZE).trim());
      current = current.slice(CHUNK_SIZE - CHUNK_OVERLAP);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function objectToText(obj, indent = "") {
  if (obj == null) return "";
  if (typeof obj !== "object") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.every((v) => typeof v !== "object")) return obj.join(", ");
    return obj.map((v) => objectToText(v, indent + "  ")).join("\n");
  }
  return Object.entries(obj)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && v !== "" && v != null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      const val = typeof v === "object" && !Array.isArray(v) ? "\n" + objectToText(v, indent + "  ") : objectToText(v, indent + "  ");
      return `${indent}${k.replace(/_/g, " ")}: ${val}`;
    })
    .join("\n");
}

async function readPdf(file) {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const buf = new Uint8Array(await fs.readFile(file));
  const pdf = await getDocumentProxy(buf);
  const { text } = await extractText(pdf, { mergePages: false });
  return Array.isArray(text) ? text.join("\n\n") : text;
}

async function readDocx(file) {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ path: file });
  return value;
}

async function walk(dir) {
  let out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(full));
    else out.push(full);
  }
  return out;
}

async function main() {
  const docs = [];
  let seq = 0;

  /** Añade fragmentos con el formato que lee chat-search.ts */
  function pushChunks(text, source, sectionFallback) {
    const parts = chunk(text);
    parts.forEach((t) => {
      const section = sectionOf(t, sectionFallback);
      const slug = slugify(section);
      docs.push({ id: `${slugify(source)}#${slug || String(seq)}`, text: t, source, section });
      seq++;
    });
    return parts.length;
  }

  // 1. Documentos propios
  const files = await walk(DOCS_DIR);
  for (const file of files) {
    const rel = path.relative(DOCS_DIR, file);
    const source = rel.replace(/\.[^.]+$/, "");
    const ext = path.extname(file).toLowerCase();
    if (path.basename(file).toLowerCase() === "readme.md") continue;
    try {
      let text = "";
      if (ext === ".md" || ext === ".txt") text = await fs.readFile(file, "utf8");
      else if (ext === ".pdf") text = await readPdf(file);
      else if (ext === ".docx") text = await readDocx(file);
      else if (ext === ".json") text = objectToText(JSON.parse(await fs.readFile(file, "utf8")));
      else {
        console.warn(`  (omitido, formato no soportado) ${rel}`);
        continue;
      }
      const n = pushChunks(text, source, source);
      console.log(`  ✓ ${rel} → ${n} fragmentos`);
    } catch (err) {
      console.warn(`  ✗ No se pudo leer ${rel}: ${err.message}`);
    }
  }

  // 2. Datos del sitio (se actualizan solos cuando se edita desde /admin)
  for (const [fileName, label] of Object.entries(SITE_LABELS)) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(SITE_DATA_DIR, fileName), "utf8"));
      const items = Array.isArray(data) ? data : [data];
      let n = 0;
      for (const item of items) {
        const text = objectToText(item);
        if (!text.trim()) continue;
        const itemName = item.nombre || item.titulo || item.title || item.album || item.id || label;
        n += pushChunks(text, `Sitio web · ${label}`, String(itemName));
      }
      console.log(`  ✓ ${fileName} → ${n} fragmentos (${items.length} elementos)`);
    } catch {
      /* archivo no existe: se ignora */
    }
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(docs));
  console.log(`\nBase de conocimiento lista: ${docs.length} fragmentos → ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
