"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Atom, Menu, X, Mail, MapPin, ExternalLink, ChevronDown, FolderOpen, Globe } from "lucide-react";

/* ============================================================
   Componentes compartidos para páginas públicas
   Estética: Oxford Physics + identidad ECFN (dorado/negro)
   ============================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

/* ─── Navbar ─── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recursosOpen, setRecursosOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Inicio", href: "/" },
    { label: "Noticias", href: "/noticias" },
    { label: "Profesores", href: "/profesores" },
    { label: "Clubes", href: "/clubes" },
    { label: "Investigación", href: "/investigacion" },
    { label: "Calendario", href: "/calendario" },
    { label: "Galería", href: "/galeria" },
    { label: "Nosotros", href: "/nosotros" },
  ];

  const recursos = [
    {
      label: "Material de Estudio",
      href: "https://drive.google.com/drive/folders/1qMnYS6zYltRx96gtm2YVGF_hamFiRC0d",
      desc: "Recursos académicos en Google Drive",
      icon: FolderOpen,
      external: true,
    },
    {
      label: "Vinculación ECFN",
      href: "https://www.vinculacion-ecfn.com/",
      desc: "Proyectos de vinculación de la escuela",
      icon: Globe,
      external: true,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 py-3"
          : "bg-neutral-950 py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logos/ecfn-symbol.png"
            alt="ECFN"
            className="w-9 h-9 object-contain group-hover:opacity-80 transition-opacity"
          />
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-white text-lg tracking-tight">AEFN</span>
            <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-light">
              Yachay Tech
            </span>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm font-normal text-neutral-300 hover:text-amber-400 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {/* Dropdown Recursos */}
          <li
            className="relative"
            onMouseEnter={() => setRecursosOpen(true)}
            onMouseLeave={() => setRecursosOpen(false)}
          >
            <button
              className="text-sm font-normal text-neutral-300 hover:text-amber-400 transition-colors flex items-center gap-1"
              onClick={() => setRecursosOpen(!recursosOpen)}
            >
              Recursos
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${recursosOpen ? "rotate-180" : ""}`} />
            </button>
            {recursosOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-72">
                <div className="bg-white shadow-2xl border border-neutral-200">
                  {recursos.map((r) => (
                    <a
                      key={r.label}
                      href={r.href}
                      target={r.external ? "_blank" : undefined}
                      rel={r.external ? "noopener noreferrer" : undefined}
                      className="flex items-start gap-3 p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                    >
                      <r.icon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div>
                        <div className="text-sm font-normal text-neutral-900 flex items-center gap-1.5">
                          {r.label}
                          {r.external && <ExternalLink className="w-3 h-3 text-neutral-400" />}
                        </div>
                        <div className="text-xs text-neutral-500 font-light mt-0.5">{r.desc}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </li>
        </ul>

        <button
          className="lg:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-neutral-950 border-t border-neutral-800 mt-3">
          <ul className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-neutral-300 hover:text-amber-400 transition-colors text-sm"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {/* Recursos en móvil */}
            <li className="pt-2 mt-2 border-t border-neutral-800">
              <div className="px-3 py-1.5 text-[10px] text-amber-400/70 uppercase tracking-widest font-light">Recursos</div>
              {recursos.map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  target={r.external ? "_blank" : undefined}
                  rel={r.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-neutral-300 hover:text-amber-400 transition-colors text-sm"
                >
                  <r.icon className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  {r.label}
                  {r.external && <ExternalLink className="w-3 h-3 text-neutral-500" />}
                </a>
              ))}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ─── Footer ─── */
export function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/images/logos/aefn-logo.png"
                alt="AEFN"
                className="h-12 w-auto object-contain"
              />
              <div className="border-l border-neutral-700 pl-4">
                <span className="text-xl font-normal text-white block">AEFN</span>
                <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-light">
                  Yachay Tech · Ecuador
                </span>
              </div>
            </div>
            <p className="text-neutral-400 text-sm font-light leading-relaxed max-w-md mb-6">
              Asociación de Estudiantes de Física y Nanotecnología.
              Escuela de Ciencias Físicas y Nanotecnología, Universidad de Investigación
              de Tecnología Experimental Yachay Tech.
            </p>
          </div>

          <div>
            <h4 className="text-xs text-amber-400 uppercase tracking-widest font-light mb-4">
              Secciones
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Inicio", href: "/" },
                { label: "Noticias", href: "/noticias" },
                { label: "Profesores", href: "/profesores" },
                { label: "Investigación", href: "/investigacion" },
                { label: "Clubes", href: "/clubes" },
                { label: "Galería", href: "/galeria" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Créditos", href: "/creditos" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-neutral-400 hover:text-amber-400 transition-colors font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs text-amber-400 uppercase tracking-widest font-light mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400 font-light">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:aefn@yachaytech.edu.ec"
                  className="hover:text-amber-400 transition-colors break-all"
                >
                  aefn@yachaytech.edu.ec
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div>Yachay City, Urcuquí</div>
                  <div>Imbabura, Ecuador</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <a
                  href="https://yachaytech.edu.ec/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  yachaytech.edu.ec
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 font-light">
              © 2026 AEFN · Yachay Tech · ECFN
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-neutral-300 hover:text-amber-400 transition-colors font-light border-b border-neutral-700 hover:border-amber-400 pb-0.5"
              >
                Administración
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── PageHeader — hero pequeño para páginas internas ─── */
export function PageHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <section className="bg-neutral-950 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">
            {label}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-neutral-400 text-lg font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export { fadeUp };
