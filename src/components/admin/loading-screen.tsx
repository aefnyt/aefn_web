/**
 * LoadingScreen — Pantalla de carga con skeletons shimmer
 * ===========================================
 * Reemplaza los aburridos "Cargando..." por placeholders
 * animados con efecto shimmer dorado.
 *
 * Mantiene la paleta oficial dorado/negro de la ECFN.
 * Clases aefn-skeleton-dark definidas en src/app/globals.css.
 */

export function LoadingScreen({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center aefn-mesh-dark relative overflow-hidden">
      {/* Grid sutil de fondo */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,215,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Logo con glow */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mb-4 aefn-glow">
            <svg
              className="w-9 h-9 text-amber-400 aefn-spin-slow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <ellipse cx="12" cy="12" rx="10" ry="4" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
            </svg>
          </div>
          <div className="aefn-mono text-amber-400/80 text-sm tracking-wider uppercase">
            {label}
            <span className="inline-block ml-1 animate-pulse">●</span>
          </div>
        </div>

        {/* Skeletons shimmer */}
        <div className="space-y-3">
          <div className="aefn-skeleton-dark h-10 w-3/4 rounded-lg" />
          <div className="aefn-skeleton-dark h-4 w-full rounded" />
          <div className="aefn-skeleton-dark h-4 w-5/6 rounded" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="aefn-skeleton-dark h-20 rounded-lg" />
            <div className="aefn-skeleton-dark h-20 rounded-lg" />
            <div className="aefn-skeleton-dark h-20 rounded-lg" />
          </div>
        </div>

        {/* Línea de progreso dorada */}
        <div className="mt-6 h-0.5 bg-amber-500/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
            style={{
              width: "40%",
              animation: "aefn-shimmer 1.4s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
