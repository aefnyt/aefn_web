"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { Mail, Users, Calendar } from "lucide-react";

interface ClubActividad { fecha: string; titulo: string; descripcion: string; }
interface ClubDirectiva { cargo: string; nombre: string; email: string; }
interface Club { id: string; nombre: string; icono: string; descripcion: string; descripcion_larga: string; directiva: ClubDirectiva[]; actividades: ClubActividad[]; contacto_email: string; }

export default function ClubesPage() {
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/clubes.json").then((r) => r.json()).then((data) => { setClubes(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-950"><div className="text-amber-400 text-sm font-light animate-pulse">Cargando...</div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeader label="Vida estudiantil" title={<>Clubes <span className="text-amber-400">estudiantiles</span></>} description="Espacios de aprendizaje colaborativo donde los estudiantes exploran sus intereses científicos más allá del aula." />
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {clubes.map((club, i) => (
            <motion.div key={club.id} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-2xl lg:text-3xl font-light text-neutral-900 mb-4">{club.nombre}</h2>
                <p className="text-neutral-600 font-light leading-relaxed mb-6">{club.descripcion_larga || club.descripcion}</p>
                {club.contacto_email && <a href={`mailto:${club.contacto_email}`} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal"><Mail className="w-4 h-4" />{club.contacto_email}</a>}
              </div>
              <div className="space-y-6">
                {club.directiva.length > 0 && (
                  <div>
                    <h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-3 flex items-center gap-2"><Users className="w-3.5 h-3.5" />Directiva</h3>
                    <ul className="space-y-1.5">{club.directiva.map((d, j) => <li key={j} className="flex items-baseline gap-2 text-sm"><span className="text-neutral-900 font-normal">{d.nombre}</span><span className="text-neutral-400 font-light">— {d.cargo}</span></li>)}</ul>
                  </div>
                )}
                {club.actividades.length > 0 && (
                  <div>
                    <h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-3 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />Actividades</h3>
                    <ul className="space-y-2">{club.actividades.map((a, j) => <li key={j} className="text-sm"><span className="text-amber-500 font-light">{a.fecha}</span><span className="text-neutral-700 font-light ml-2">{a.titulo}</span></li>)}</ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
