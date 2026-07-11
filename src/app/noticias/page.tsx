import Link from "next/link";
import { readJsonFile } from "@/lib/github";
import { MODULES, NEWS_CATEGORIES } from "@/lib/config";
import type { Noticia, NewsCategory } from "@/lib/types";
import { Calendar, User, ArrowRight, Star, Newspaper, Atom, ChevronRight } from "lucide-react";

/**
 * Página pública /noticias
 * ===========================================
 * Muestra:
 * 1. La noticia destacada como "hero" cinematográfico (imagen grande + glow)
 * 2. Las demás noticias en un grid de tarjetas modernas (3 columnas desktop)
 *
 * 📚 Concepto: Server Component
 * Esta página es un "Server Component": se renderiza en el servidor.
 * - Más rápido, mejor SEO, acceso directo a GitHub API.
 *
 * NOTA VISUAL: Las clases aefn-* están definidas en src/app/globals.css
 * y proporcionan mesh gradients, glow dorado, glass morphism y tipografía
 * técnica monospace. NO afectan la lógica de datos.
 */

export const dynamic = "force-dynamic"; // Siempre datos frescos

export const metadata = {
  title: "Noticias - AEFN",
  description: "Noticias y anuncios de la Asociación de Estudiantes de Física y Nanotecnología",
};

function formatDate(fecha: string): string {
  try {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return fecha;
  }
}

export default async function NoticiasPage() {
  // Leer noticias desde GitHub
  let noticias: Noticia[] = [];
  let loadError = false;

  try {
    const { data } = await readJsonFile<Noticia[]>(MODULES.noticias.jsonPath);
    noticias = data ?? [];
  } catch {
    loadError = true;
  }

  // Filtrar solo publicadas y ordenar por fecha descendente
  const publicadas = noticias
    .filter((n) => n.publicada)
    .sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA;
    });

  // La destacada es la primera con destacada=true (o fallback a la más reciente)
  const destacada =
    publicadas.find((n) => n.destacada) || publicadas[0] || null;

  // Las demás (sin la destacada)
  const demas = destacada
    ? publicadas.filter((n) => n.id !== destacada.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header — mesh dark con glow dorado */}
      <header className="aefn-mesh-dark border-b border-amber-500/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 group"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 group-hover:shadow-[0_0_18px_rgba(255,215,0,0.6)] transition-shadow">
                  <Atom className="w-5 h-5 text-amber-400 aefn-spin-slow" />
                </div>
                <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                  AEFN
                </span>
              </Link>
              <span className="text-amber-500/30">/</span>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-400" />
                Noticias
              </h1>
            </div>
            <Link
              href="/"
              className="aefn-mono text-xs text-amber-400/80 hover:text-amber-300 hidden sm:flex items-center gap-1.5 transition-colors"
            >
              ← <span className="aefn-mono">VOLVER</span>
            </Link>
          </div>
          <p className="text-neutral-400 mt-2 text-sm">
            Noticias, anuncios e información relevante para la comunidad de Física y Nanotecnología.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Tag científico superior */}
        <div className="mb-6 flex items-center gap-3">
          <div className="aefn-tag">
            <span className="aefn-mono">NOTICIAS · LIVE</span>
          </div>
          <div className="aefn-divider flex-1 !my-0" />
        </div>

        {loadError && (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 aefn-glow">
            <p className="font-semibold">No se pudieron cargar las noticias.</p>
            <p className="text-sm mt-1">
              Intenta recargar la página en unos momentos.
            </p>
          </div>
        )}

        {!loadError && publicadas.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 text-neutral-400 mb-4 aefn-glow">
              <Newspaper className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">
              Aún no hay noticias publicadas
            </h2>
            <p className="text-neutral-500">
              Vuelve pronto para conocer las últimas novedades de la asociación.
            </p>
          </div>
        )}

        {/* === NOTICIA DESTACADA (HERO CINEMATOGRÁFICO) === */}
        {destacada && (
          <section className="mb-12 aefn-fade-up">
            <Link
              href={`/noticias/${destacada.id}`}
              className="aefn-card-featured group block"
            >
              <div className="aefn-card-inner grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Imagen */}
                <div className="aspect-video lg:aspect-auto lg:h-full bg-neutral-900 overflow-hidden relative">
                  {destacada.imagen ? (
                    <img
                      src={`/${destacada.imagen}`}
                      alt={destacada.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="aefn-particles" />
                      <Newspaper className="w-20 h-20 text-amber-400/30 relative z-10" />
                    </div>
                  )}
                  {/* Overlay con glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-amber-500/10 pointer-events-none" />
                  <div className="absolute top-4 left-4 aefn-tag aefn-tag-dark">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="aefn-mono">DESTACADA</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="aefn-tag">
                      <span className="aefn-mono">
                        {NEWS_CATEGORIES[destacada.categoria as NewsCategory] || destacada.categoria}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 leading-tight group-hover:text-amber-700 transition-colors">
                    {destacada.titulo}
                  </h2>

                  {destacada.resumen && (
                    <p className="text-neutral-600 mb-5 line-clamp-3 leading-relaxed">
                      {destacada.resumen}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="aefn-mono text-xs text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {formatDate(destacada.fecha)}
                    </span>
                    {destacada.autor && (
                      <span className="aefn-mono text-xs text-neutral-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        {destacada.autor}
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <span className="aefn-btn-gold inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm">
                      <span className="aefn-mono">LEER NOTICIA</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* === GRID DE NOTICIAS === */}
        {demas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
                {destacada ? "Más noticias" : "Todas las noticias"}
              </h3>
              <span className="aefn-mono text-xs text-neutral-500">
                {demas.length.toString().padStart(2, "0")} publicaciones
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {demas.map((noticia, i) => (
                <Link
                  key={noticia.id}
                  href={`/noticias/${noticia.id}`}
                  className="aefn-card aefn-glow-hover group block aefn-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Imagen */}
                  <div className="aspect-video bg-neutral-100 overflow-hidden relative">
                    {noticia.imagen ? (
                      <img
                        src={`/${noticia.imagen}`}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <Newspaper className="w-10 h-10 text-amber-500/40 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 aefn-tag text-[10px] py-1">
                      <span className="aefn-mono">
                        {NEWS_CATEGORIES[noticia.categoria as NewsCategory] || noticia.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h4 className="font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
                      {noticia.titulo}
                    </h4>

                    {noticia.resumen && (
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3 leading-relaxed">
                        {noticia.resumen}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="aefn-mono text-[11px] text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        {formatDate(noticia.fecha)}
                      </span>
                      <span className="aefn-mono text-[11px] text-amber-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        LEER
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer — mesh dark con glow */}
      <footer className="mt-auto aefn-mesh-dark border-t border-amber-500/20 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_14px_rgba(255,215,0,0.5)]" />
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <div className="aefn-mono text-xs text-amber-500/70 mb-1">
            AEFN · YACHAY TECH
          </div>
          <div className="text-xs text-neutral-500">
            Asociación de Estudiantes de Física y Nanotecnología
          </div>
        </div>
      </footer>
    </div>
  );
}
