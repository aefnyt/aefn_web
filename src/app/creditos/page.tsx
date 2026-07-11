import Link from "next/link";
import { ArrowLeft, Heart, Users, Code, Github } from "lucide-react";
import { AEFN_LOGOS } from "@/lib/theme";

/**
 * Página /creditos — Agradecimientos y colaboradores
 * ===========================================
 * Muestra un agradecimiento a todas las personas que han colaborado
 * con el desarrollo y mantenimiento del sitio web de la AEFN.
 *
 * 📚 Cómo editar esta página:
 * Para añadir, quitar o modificar nombres, edita los arrays COLABORADORES
 * y DESARROLLO más abajo. No necesitas tocar el resto del código.
 *
 * La página es un Server Component (no tiene estado ni interactividad),
 * por lo que se renderiza en el servidor y es muy rápida.
 */

export const metadata = {
  title: "Créditos - AEFN",
  description: "Agradecimientos a los colaboradores del sitio web de la AEFN",
};

// ====================================================================
// COLABORADORES — Editar esta lista para añadir/quitar nombres
// ====================================================================
// Formato: { nombre: string, rol: string, periodo?: string }
const COLABORADORES: Array<{
  nombre: string;
  rol: string;
  periodo?: string;
}> = [
  {
    nombre: "Ariel Sebastian Calderon Rodriguez,
    rol: "Desarrollador principal",
    periodo: "2025",
  },
  // Añade más colaboradores aquí siguiendo el mismo formato:
  // {
  //   nombre: "Nombre Apellido",
  //   rol: "Presidente AEFN 2025",
  //   periodo: "2025",
  // },
];

// ====================================================================
// DESARROLLO TÉCNICO — Personas que contribuyeron al código
// ====================================================================
const DESARROLLO: Array<{
  nombre: string;
  contribucion: string;
}> = [
  {
    nombre: "Ariel Sebastian Calderon Rodriguez",
    contribucion: "Migración a Next.js, panel de administración y backend",
  },
  // Añade más desarrolladores aquí:
  // {
  //   nombre: "Nombre",
  //   contribucion: "Descripción de la contribución",
  // },
];
// ====================================================================

export default function CreditosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white aefn-mesh-light">
      {/* Header */}
      <header className="aefn-mesh-dark border-b border-amber-500/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 group-hover:shadow-[0_0_18px_rgba(255,215,0,0.6)] transition-shadow overflow-hidden">
              <img
                src={AEFN_LOGOS.ecfnSymbol}
                alt="ECFN"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="font-bold text-white group-hover:text-amber-300 transition-colors">AEFN</span>
          </Link>
          <Link
            href="/"
            className="aefn-mono text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            VOLVER
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Título */}
        <div className="text-center mb-12 aefn-fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4 aefn-glow">
            <Heart className="w-10 h-10 text-neutral-950" />
          </div>
          <div className="aefn-tag mx-auto mb-3 inline-flex">
            <span className="aefn-mono">AGRADECIMIENTOS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Créditos y <span className="text-amber-600">Agradecimientos</span>
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Este sitio web es posible gracias al esfuerzo colaborativo de
            estudiantes y miembros de la Asociación de Estudiantes de Física y
            Nanotecnología de Yachay Tech.
          </p>
        </div>

        {/* Sección: Colaboradores */}
        {COLABORADORES.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-neutral-900">
                Colaboradores
              </h2>
              <div className="aefn-divider flex-1 !my-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COLABORADORES.map((colab, i) => (
                <div
                  key={i}
                  className="aefn-card aefn-glow-hover p-5"
                >
                  <h3 className="font-semibold text-neutral-900">
                    {colab.nombre}
                  </h3>
                  <p className="aefn-mono text-xs text-amber-700 mt-1 uppercase tracking-wider">{colab.rol}</p>
                  {colab.periodo && (
                    <p className="aefn-mono text-[11px] text-neutral-400 mt-2">
                      Período: {colab.periodo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección: Desarrollo técnico */}
        {DESARROLLO.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-neutral-900">
                Desarrollo técnico
              </h2>
              <div className="aefn-divider flex-1 !my-0" />
            </div>
            <div className="space-y-3">
              {DESARROLLO.map((dev, i) => (
                <div
                  key={i}
                  className="aefn-card aefn-glow-hover p-5"
                >
                  <h3 className="font-semibold text-neutral-900">
                    {dev.nombre}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {dev.contribucion}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sección: Tecnología */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Github className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-neutral-900">
              Tecnología y herramientas
            </h2>
            <div className="aefn-divider flex-1 !my-0" />
          </div>
          <div className="aefn-card-featured">
            <div className="aefn-card-inner p-6">
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                Este sitio está construido con tecnologías modernas de código
                abierto:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui", "GitHub API", "Vercel", "Prisma", "sharp (imágenes)"].map((tech) => (
                  <div
                    key={tech}
                    className="aefn-mono text-xs px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 text-center"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mensaje final */}
        <section className="text-center py-8 border-t border-neutral-200">
          <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            ¿Quieres colaborar con el sitio? Escríbenos a{" "}
            <a
              href="mailto:aefn@yachaytech.edu.ec"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              aefn@yachaytech.edu.ec
            </a>{" "}
            o visita nuestro repositorio en{" "}
            <a
              href="https://github.com/aefnyt/web_aefn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              GitHub
            </a>
            .
          </p>
          <p className="aefn-mono text-xs text-neutral-400 mt-6 uppercase tracking-wider">
            AEFN · Asociación de Estudiantes de Física y Nanotecnología ·
            Yachay Tech
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto aefn-mesh-dark border-t border-amber-500/20 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_14px_rgba(255,215,0,0.5)]" />
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="aefn-mono text-xs text-amber-500/70 mb-1">AEFN · YACHAY TECH</div>
        </div>
      </footer>
    </div>
  );
}
