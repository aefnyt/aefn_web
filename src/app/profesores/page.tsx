"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { Mail, GraduationCap, BookOpen, ExternalLink } from "lucide-react";

interface Profesor {
  nombre: string; titulo: string; area: string[]; areas_investigacion: string[];
  foto: string; email: string; telefono: string; oficina: string; bio: string;
  educacion: string[]; publicaciones: string[]; proyectos: string[];
  social: { linkedin: string; google_scholar: string; github: string; };
}

const areaLabels: Record<string, string> = {
  astronomia: "Astronomía", computacion: "Computación", nanotecnologia: "Nanotecnología",
  fisica: "Física", optica: "Óptica",
};

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profesor | null>(null);

  useEffect(() => {
    fetch("/data/profesores.json").then((r) => r.json()).then((data) => { setProfesores(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-950"><div className="text-amber-400 text-sm font-light animate-pulse">Cargando...</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeader label="Cuerpo docente" title={<>Directorio de <span className="text-amber-400">profesores</span></>} description="Académicos e investigadores que lideran los grupos de investigación de la Escuela de Ciencias Físicas y Nanotecnología." />

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profesores.map((p, i) => {
              const iniciales = p.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("");
              return (
                <motion.button key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} onClick={() => setSelected(p)} className="group text-left">
                  <div className="aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 mb-4 overflow-hidden flex items-center justify-center relative">
                    {p.foto ? <img src={p.foto} alt={p.nombre} className="w-full h-full object-cover" /> : <span className="text-4xl font-light text-neutral-400 group-hover:text-amber-500 transition-colors">{iniciales}</span>}
                  </div>
                  <h3 className="font-normal text-neutral-900 text-base mb-1 group-hover:text-amber-700 transition-colors">{p.nombre}</h3>
                  {p.titulo && <p className="text-xs text-neutral-500 font-light mb-2">{p.titulo}</p>}
                  <div className="flex flex-wrap gap-1">
                    {p.area.map((a) => <span key={a} className="text-[10px] text-amber-600 uppercase tracking-wider font-light">{areaLabels[a] || a}</span>).reduce((acc: React.ReactNode[], el, idx) => { if (idx > 0) acc.push(<span key={`sep-${idx}`} className="text-neutral-300">·</span>); acc.push(el); return acc; }, [])}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-neutral-950 p-8 relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-amber-400 transition-colors text-sm">✕</button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-light text-neutral-950 flex-shrink-0">
                  {selected.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-white mb-1">{selected.nombre}</h2>
                  {selected.titulo && <p className="text-amber-400 text-sm font-light">{selected.titulo}</p>}
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {selected.bio && (<div><h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-2">Biografía</h3><p className="text-neutral-600 font-light leading-relaxed">{selected.bio}</p></div>)}
              {selected.areas_investigacion.length > 0 && (<div><h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-2">Áreas de investigación</h3><ul className="space-y-1">{selected.areas_investigacion.map((a, j) => <li key={j} className="flex items-baseline gap-2 text-sm text-neutral-700 font-light"><span className="text-amber-500">·</span>{a}</li>)}</ul></div>)}
              {selected.educacion.length > 0 && (<div><h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-2 flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" />Educación</h3><ul className="space-y-1">{selected.educacion.filter((e) => e).map((e, j) => <li key={j} className="text-sm text-neutral-700 font-light">{e}</li>)}</ul></div>)}
              {selected.publicaciones.filter((p) => p).length > 0 && (<div><h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-2 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />Publicaciones</h3><ul className="space-y-1.5">{selected.publicaciones.filter((p) => p).map((p, j) => <li key={j} className="text-sm text-neutral-700 font-light leading-relaxed">{p}</li>)}</ul></div>)}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-200">
                {selected.email && <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal"><Mail className="w-4 h-4" />{selected.email}</a>}
                {selected.social?.linkedin && <a href={selected.social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-amber-600 transition-colors font-normal"><ExternalLink className="w-4 h-4" />LinkedIn</a>}
                {selected.social?.google_scholar && <a href={selected.social.google_scholar} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-amber-600 transition-colors font-normal"><ExternalLink className="w-4 h-4" />Google Scholar</a>}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
}
