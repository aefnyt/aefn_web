"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Atom,
  FlaskConical,
  Telescope,
  Newspaper,
  Calendar,
  Users,
  Image as ImageIcon,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Microscope,
  Orbit,
  Hexagon,
  Radio,
  Star,
  Clock,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  Camera,
  Mail,
  MapPin,
  BookOpen,
  Beaker,
  Brain,
  Cpu,
  Waves,
  Globe2,
  Menu,
  X,
} from "lucide-react";

/* ============================================================
   AEFN — Página principal
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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Areas />
      <Research />
      <News />
      <Professors />
      <Events />
      <Clubs />
      <Cta />
      <Footer />
    </div>
  );
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Inicio", href: "#inicio" },
    { label: "Áreas", href: "#areas" },
    { label: "Investigación", href: "#investigacion" },
    { label: "Noticias", href: "/noticias" },
    { label: "Profesores", href: "/profesores" },
    { label: "Clubes", href: "/clubes" },
    { label: "Calendario", href: "/calendario" },
    { label: "Galería", href: "/galeria" },
    { label: "Nosotros", href: "/nosotros" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Atom className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-white text-lg tracking-tight">AEFN</span>
            <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-light">
              Yachay Tech
            </span>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-7">
          {links.map((l, i) => (
            <li key={l.label}>
              <a
                href={l.href}
                className={`text-sm font-normal transition-colors ${
                  i === 0 ? "text-amber-400" : "text-neutral-300 hover:text-amber-400"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
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
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="lg:hidden bg-neutral-950 border-t border-neutral-800 mt-3"
        >
          <ul className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-neutral-300 hover:text-amber-400 transition-colors text-sm"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </header>
  );
}

/* ─── HERO ─── */
interface CarruselSlide {
  id: string;
  tipo: "imagen" | "video";
  src: string;
  alt?: string;
  duracion?: number;
}

function Hero() {
  const [slides, setSlides] = useState<CarruselSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    fetch("/data/carrusel.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setSlides(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[activeIndex];
    if (!current) return;
    const dur = current.tipo === "video" ? 20000 : (current.duracion ?? 6000);
    const timer = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, dur);
    return () => clearTimeout(timer);
  }, [activeIndex, slides]);

  function buildEmbedUrl(url: string): string | null {
    if (!url) return null;
    const yt = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (yt) {
      const id = yt[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1`;
    }
    const vimeo = url.match(
      /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/
    );
    if (vimeo)
      return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
    return null;
  }

  return (
    <section id="inicio" ref={heroRef} className="relative h-screen min-h-[600px] overflow-hidden bg-neutral-950">
      <motion.div style={{ y }} className="absolute inset-0">
        {slides.map((slide, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {slide.tipo === "video" ? (
                <div className="relative w-full h-full bg-black">
                  {isActive &&
                    (() => {
                      const embed = buildEmbedUrl(slide.src);
                      if (!embed) return null;
                      return (
                        <iframe
                          src={embed}
                          title={slide.alt || "Video AEFN"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                          loading="lazy"
                        />
                      );
                    })()}
                </div>
              ) : (
                <img
                  src={slide.src}
                  alt={slide.alt || "AEFN"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
        {slides.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-950" />
        )}
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none" />

      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-4">
            ECFN · Yachay Tech · Ecuador
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[1.1] mb-6">
            Asociación de Estudiantes de{" "}
            <span className="text-amber-400">Física y Nanotecnología</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 mb-8 font-light leading-relaxed max-w-2xl">
            Explora lo infinitesimal y lo cósmico. Comunidad científica estudiantil
            dedicada a la investigación, la innovación y la difusión del conocimiento.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#areas"
              className="inline-flex items-center gap-2 text-sm font-normal text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-sm"
            >
              Explorar áreas
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/noticias"
              className="inline-flex items-center gap-2 text-sm font-normal text-white border border-white/30 hover:border-amber-400 hover:text-amber-400 transition-colors px-6 py-3 rounded-sm"
            >
              Ver noticias
            </a>
          </div>
        </motion.div>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 right-8 z-20 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIndex ? "w-8 bg-amber-400" : "w-4 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {slides[activeIndex]?.tipo === "video" && (
        <div className="absolute bottom-8 left-8 z-20 flex items-center gap-2 text-amber-400 text-xs font-light">
          <PlayCircle className="w-4 h-4" />
          <span className="uppercase tracking-widest">Time-lapse astronómico</span>
        </div>
      )}
    </section>
  );
}

/* ─── STATS ─── */
function Stats() {
  const stats = [
    { value: "240+", label: "Estudiantes" },
    { value: "08", label: "Grupos de investigación" },
    { value: "06", label: "Clubes estudiantiles" },
    { value: "42", label: "Publicaciones" },
  ];
  return (
    <section className="bg-neutral-950 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="text-3xl lg:text-4xl font-light text-amber-400 mb-1">{s.value}</div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-light">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ÁREAS ─── */
function Areas() {
  const areas = [
    {
      icon: Atom,
      title: "Física",
      desc: "Desde la mecánica cuántica hasta la astrofísica. Formación teórica y experimental que desvela las leyes fundamentales del universo.",
      skills: ["Mecánica clásica y cuántica", "Electromagnetismo y física estadística", "Astrofísica y cosmología", "Sistemas complejos y computacional"],
      link: "/mallas/Malla-Curricular-Fisica-Ajuste_page-0001.jpg",
      linkLabel: "Ver malla curricular",
    },
    {
      icon: Beaker,
      title: "Nanotecnología",
      desc: "Manipulación de materia a escala nanométrica para crear innovaciones en medicina, energía, electrónica y materiales avanzados.",
      skills: ["Síntesis de nanomateriales", "Caracterización espectroscópica", "Materiales de baja dimensión", "Ciencia de materiales computacional"],
      link: "/mallas/Malla-Curricular-Nanotecnologia-Ajuste_page-0001.jpg",
      linkLabel: "Ver malla curricular",
    },
    {
      icon: GraduationCap,
      title: "Yachay Tech",
      desc: "Universidad de Investigación de Tecnología Experimental. Campus de conocimiento en Ecuador dedicado a la ciencia aplicada y la innovación.",
      skills: ["Programas de pregrado y posgrado", "Investigación interdisciplinaria", "Colaboraciones internacionales", "Vinculación con la comunidad"],
      link: "https://yachaytech.edu.ec/",
      external: true,
      linkLabel: "Visitar sitio",
    },
  ];
  return (
    <section id="areas" className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 max-w-3xl">
          <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Áreas</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 leading-tight">Pilares de la comunidad</h2>
          <p className="text-neutral-600 text-lg font-light leading-relaxed">
            Tres ejes que articulan la vida académica y científica de la asociación, inspirados en la tradición investigativa de las mejores escuelas de física del mundo.
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-3 gap-8">
          {areas.map((area, i) => (
            <motion.div key={area.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group">
              <div className="border-t-2 border-neutral-200 pt-6 group-hover:border-amber-400 transition-colors">
                <area.icon className="w-8 h-8 text-amber-500 mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-normal text-neutral-900 mb-3">{area.title}</h3>
                <p className="text-neutral-600 font-light leading-relaxed mb-6">{area.desc}</p>
                <ul className="space-y-2 mb-6">
                  {area.skills.map((skill) => (
                    <li key={skill} className="flex items-start gap-2 text-sm text-neutral-700 font-light">
                      <span className="text-amber-500 mt-1.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
                <a href={area.link} target={area.external ? "_blank" : undefined} rel={area.external ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal">
                  {area.linkLabel}
                  {area.external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── RESEARCH ─── */
function Research() {
  const lines = [
    { title: "Materiales Nanoestructurados", desc: "Síntesis, diseño y caracterización de materiales en nanoescala utilizando técnicas avanzadas de fabricación y análisis espectroscópico." },
    { title: "Ciencia de Materiales Teórica", desc: "Modelado computacional y simulación de propiedades electrónicas, magnéticas y estructurales de materiales novedosos." },
    { title: "Sistemas Complejos", desc: "Estudio de sistemas dinámicos no lineales, redes complejas y física estadística aplicada a problemas interdisciplinarios." },
    { title: "Astrofísica y Cosmología", desc: "Investigación teórica en astrofísica, cosmología física y gravitación, con énfasis en materia oscura y energía oscura." },
    { title: "Óptica y Fotónica", desc: "Estudio de la interacción luz-materia, óptica cuántica y desarrollo de sensores fotónicos para aplicaciones industriales." },
    { title: "Energía y Sostenibilidad", desc: "Desarrollo de materiales para energía solar, almacenamiento energético y tecnologías limpias con impacto ambiental positivo." },
  ];
  return (
    <section id="investigacion" className="bg-neutral-950 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 max-w-3xl">
          <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Líneas de investigación</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 leading-tight">Áreas activas de investigación</h2>
          <p className="text-neutral-400 text-lg font-light leading-relaxed">
            La Escuela de Ciencias Físicas y Nanotecnología desarrolla investigación fundamental y aplicada en líneas alineadas con los desafíos científicos del siglo XXI.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800">
          {lines.map((line, i) => (
            <motion.div key={line.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-neutral-950 p-8 group cursor-pointer hover:bg-neutral-900 transition-colors">
              <h3 className="text-lg font-normal text-white mb-3 group-hover:text-amber-400 transition-colors">{line.title}</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">{line.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12">
          <a href="/investigacion" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors font-normal border-b border-amber-400/30 hover:border-amber-400 pb-1">
            Ver grupos de investigación
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── NEWS ─── */
function News() {
  const news = [
    { cat: "Investigación", date: "8 julio 2026", title: "Estudiantes publican en Nature Nanotechnology sobre nanomateriales 2D", excerpt: "Grupo de investigación de la ECFN caracteriza propiedades electrónicas de materiales bidimensionales con aplicaciones en fotovoltaica.", featured: true },
    { cat: "Evento", date: "5 julio 2026", title: "III Congreso Nacional de Física amplía inscripciones", excerpt: "Inscripciones abiertas hasta el 30 de julio para estudiantes de todo el país." },
    { cat: "Club", date: "2 julio 2026", title: "Club de Astronomía organiza observación nocturna", excerpt: "Evento abierto al público con telescopios en el campus de Yachay Tech." },
    { cat: "Académico", date: "28 junio 2026", title: "Defensa de tesis: computación cuántica aplicada", excerpt: "Estudiante defiende trabajo de titulación en algoritmos cuánticos." },
  ];
  const featured = news.find((n) => n.featured) || news[0];
  const rest = news.filter((n) => n !== featured);
  return (
    <section className="bg-neutral-950 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Noticias</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">Últimas publicaciones</h2>
          </div>
          <a href="/noticias" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-normal border-b border-amber-400/30 hover:border-amber-400 pb-1">
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.a href="/noticias" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group block bg-white">
            <div className="aspect-[16/10] bg-gradient-to-br from-neutral-800 to-neutral-950 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Atom className="w-20 h-20 text-amber-400/20" strokeWidth={1} />
              </div>
              <div className="absolute top-4 left-4 text-xs font-light text-amber-400 uppercase tracking-widest bg-black/40 px-3 py-1">Destacada</div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-xs">
                <span className="text-amber-600 font-normal uppercase tracking-wider">{featured.cat}</span>
                <span className="text-neutral-400 font-light">{featured.date}</span>
              </div>
              <h3 className="text-xl font-normal text-neutral-900 mb-3 leading-snug group-hover:text-amber-700 transition-colors">{featured.title}</h3>
              <p className="text-neutral-600 font-light leading-relaxed mb-4">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-normal">
                Leer noticia
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.a>
          <div className="space-y-px bg-neutral-800">
            {rest.map((n, i) => (
              <motion.a key={n.title} href="/noticias" custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group block bg-white p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3 mb-2 text-xs">
                  <span className="text-amber-600 font-normal uppercase tracking-wider">{n.cat}</span>
                  <span className="text-neutral-400 font-light">{n.date}</span>
                </div>
                <h4 className="font-normal text-neutral-900 text-base leading-snug group-hover:text-amber-700 transition-colors mb-2">{n.title}</h4>
                <p className="text-sm text-neutral-600 font-light line-clamp-2">{n.excerpt}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PROFESSORS ─── */
function Professors() {
  const profesores = [
    { nombre: "Dr. Carlos Mendoza", area: "Física Cuántica", iniciales: "CM" },
    { nombre: "Dra. Ana Lucía Vega", area: "Nanomateriales", iniciales: "AV" },
    { nombre: "Dr. Pablo Reyes", area: "Astrofísica", iniciales: "PR" },
    { nombre: "Dra. Sofía Ramírez", area: "Óptica y Fotónica", iniciales: "SR" },
  ];
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 max-w-3xl">
          <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Cuerpo docente</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 leading-tight">Profesores investigadores</h2>
          <p className="text-neutral-600 text-lg font-light leading-relaxed">
            Académicos que lideran los grupos de investigación de la Escuela de Ciencias Físicas y Nanotecnología.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profesores.map((p, i) => (
            <motion.a key={p.nombre} href="/profesores" custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group block">
              <div className="aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 mb-4 overflow-hidden flex items-center justify-center relative">
                <span className="text-4xl font-light text-neutral-400 group-hover:text-amber-500 transition-colors">{p.iniciales}</span>
              </div>
              <h3 className="font-normal text-neutral-900 text-base mb-1 group-hover:text-amber-700 transition-colors">{p.nombre}</h3>
              <p className="text-xs text-neutral-500 font-light uppercase tracking-wider">{p.area}</p>
            </motion.a>
          ))}
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12">
          <a href="/profesores" className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal border-b border-amber-400/30 hover:border-amber-400 pb-1">
            Ver directorio completo
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── EVENTS ─── */
function Events() {
  const eventos = [
    { date: "15", month: "JUL", title: "Nanoscience Summer School Yachay 2026", type: "Académico", location: "Campus Yachay Tech" },
    { date: "22", month: "JUL", title: "Observación astronómica nocturna", type: "Club", location: "Plaza central" },
    { date: "05", month: "AGO", title: "Defensa de tesis: Materiales 2D", type: "Académico", location: "Auditorio ECFN" },
  ];
  return (
    <section className="bg-neutral-950 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Próximos eventos</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">Agenda científica</h2>
          </div>
          <a href="/calendario" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-normal border-b border-amber-400/30 hover:border-amber-400 pb-1">
            Ver calendario
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
        <div className="space-y-px bg-neutral-800">
          {eventos.map((e, i) => (
            <motion.a key={e.title} href="/calendario" custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group flex items-center gap-6 bg-neutral-950 hover:bg-neutral-900 transition-colors p-6">
              <div className="flex-shrink-0 text-center w-16">
                <div className="text-3xl font-light text-amber-400">{e.date}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-widest font-light">{e.month}</div>
              </div>
              <div className="flex-grow">
                <div className="text-xs text-amber-400 font-normal uppercase tracking-wider mb-1">{e.type}</div>
                <h3 className="font-normal text-white text-lg group-hover:text-amber-300 transition-colors">{e.title}</h3>
                <p className="text-sm text-neutral-400 font-light mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {e.location}
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CLUBS ─── */
function Clubs() {
  const clubes = [
    { nombre: "Club de Astronomía", desc: "Observaciones, charlas y construcción de telescopios.", icon: Telescope },
    { nombre: "Club de Robótica", desc: "Diseño y programación de robots para competencias.", icon: Cpu },
    { nombre: "Club de Óptica", desc: "Experimentos con láseres, holografía y fibra óptica.", icon: Waves },
    { nombre: "Club de Programación", desc: "Algoritmos, machine learning y física computacional.", icon: Brain },
  ];
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-16 max-w-3xl">
          <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Vida estudiantil</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-neutral-900 mb-4 leading-tight">Clubes científicos</h2>
          <p className="text-neutral-600 text-lg font-light leading-relaxed">
            Espacios de aprendizaje colaborativo donde los estudiantes exploran sus intereses científicos más allá del aula.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200">
          {clubes.map((c, i) => (
            <motion.a key={c.nombre} href="/clubes" custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group block bg-white p-8 hover:bg-neutral-50 transition-colors">
              <c.icon className="w-8 h-8 text-amber-500 mb-4 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
              <h3 className="font-normal text-neutral-900 text-lg mb-2">{c.nombre}</h3>
              <p className="text-sm text-neutral-600 font-light leading-relaxed">{c.desc}</p>
            </motion.a>
          ))}
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-12">
          <a href="/clubes" className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal border-b border-amber-400/30 hover:border-amber-400 pb-1">
            Ver todos los clubes
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function Cta() {
  return (
    <section className="bg-neutral-950 py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-4">Únete a la comunidad</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6 leading-tight">Forma parte de la asociación</h2>
          <p className="text-neutral-400 text-lg font-light leading-relaxed mb-10 max-w-2xl mx-auto">
            Si eres estudiante de Física o Nanotecnología en Yachay Tech, contribuye al desarrollo científico del país junto a nosotros.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:aefn@yachaytech.edu.ec" className="inline-flex items-center gap-2 text-sm font-normal text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-sm">
              <Mail className="w-4 h-4" />
              Contáctanos
            </a>
            <a href="/nosotros" className="inline-flex items-center gap-2 text-sm font-normal text-white border border-white/30 hover:border-amber-400 hover:text-amber-400 transition-colors px-6 py-3 rounded-sm">
              Conoce más
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Atom className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
              <div>
                <span className="text-xl font-normal text-white block">AEFN</span>
                <span className="text-[10px] text-amber-400/70 uppercase tracking-widest font-light">Yachay Tech · Ecuador</span>
              </div>
            </div>
            <p className="text-neutral-400 text-sm font-light leading-relaxed max-w-md mb-6">
              Asociación de Estudiantes de Física y Nanotecnología. Escuela de Ciencias Físicas y Nanotecnología, Universidad de Investigación de Tecnología Experimental Yachay Tech.
            </p>
          </div>
          <div>
            <h4 className="text-xs text-amber-400 uppercase tracking-widest font-light mb-4">Secciones</h4>
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
                  <a href={l.href} className="text-neutral-400 hover:text-amber-400 transition-colors font-light">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs text-amber-400 uppercase tracking-widest font-light mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-neutral-400 font-light">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <a href="mailto:aefn@yachaytech.edu.ec" className="hover:text-amber-400 transition-colors break-all">
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
                <a href="https://yachaytech.edu.ec/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                  yachaytech.edu.ec
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 font-light">© 2026 AEFN · Yachay Tech · ECFN</span>
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-neutral-300 hover:text-amber-400 transition-colors font-light border-b border-neutral-700 hover:border-amber-400 pb-0.5">
                Administración
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
