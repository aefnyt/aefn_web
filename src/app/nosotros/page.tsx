"use client";

import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { Atom, Beaker, GraduationCap, Globe2, Users } from "lucide-react";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeader label="Sobre nosotros" title={<>La <span className="text-amber-400">asociación</span></>} description="La Asociación de Estudiantes de Física y Nanotecnología reúne a la comunidad estudiantil de la ECFN en Yachay Tech." />

      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Misión</p>
            <p className="text-xl font-light text-neutral-900 leading-relaxed">
              Fomentar el desarrollo científico y académico de los estudiantes de Física y Nanotecnología, promoviendo la investigación, la colaboración interdisciplinaria y la difusión del conocimiento dentro y fuera de la universidad.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-neutral-950 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Visión</p>
            <p className="text-xl font-light text-white leading-relaxed">
              Ser la comunidad estudiantil referente en ciencias físicas y nanotecnología en Ecuador, contribuyendo al desarrollo científico del país y formando a la próxima generación de investigadores e innovadores.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Valores</p>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-900 leading-tight">Lo que nos guía</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200">
            {[
              { icon: Atom, title: "Rigor científico", desc: "Buscamos la verdad mediante el método científico y la evidencia." },
              { icon: Users, title: "Colaboración", desc: "Trabajamos en equipo, valorando la diversidad de ideas y perspectivas." },
              { icon: Beaker, title: "Innovación", desc: "Exploramos nuevas ideas y enfoques con creatividad y curiosidad." },
              { icon: Globe2, title: "Impacto social", desc: "Aplicamos el conocimiento para benefitar a la comunidad." },
            ].map((v, i) => (
              <motion.div key={v.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white p-8">
                <v.icon className="w-8 h-8 text-amber-500 mb-4" strokeWidth={1.5} />
                <h3 className="font-normal text-neutral-900 text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-600 font-light leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Historia</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-6 leading-tight">Nuestra trayectoria</h2>
            <div className="space-y-4 text-neutral-300 font-light leading-relaxed">
              <p>La Asociación de Estudiantes de Física y Nanotecnología nace como una iniciativa de los estudiantes de la Escuela de Ciencias Físicas y Nanotecnología de Yachay Tech para agrupar a la comunidad estudiantil y representar sus intereses académicos y científicos.</p>
              <p>A lo largo de los años, la asociación ha organizado congresos, observaciones astronómicas, charlas de divulgación científica y actividades de vinculación con la comunidad, consolidándose como un espacio de encuentro para los amantes de la física y la nanotecnología.</p>
              <p>Hoy, la AEFN sigue trabajando para fortalecer los lazos entre estudiantes, profesores e investigadores, y para promover el desarrollo científico en Ecuador desde la universidad.</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Miembros de la asociación */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-12 max-w-3xl">
            <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Equipo</p>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-900 leading-tight">Miembros de la asociación</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                nombre: "Sebastian Calderón",
                cargo: "Presidente",
                iniciales: "SC",
                foto: "",
              },
              {
                nombre: "Gissel Velasco",
                cargo: "Vicepresidente",
                iniciales: "N2",
                foto: "",
              },
              {
                nombre: "Dylan Rodriguez",
                cargo: "Secretario",
                iniciales: "N3",
                foto: "",
              },
              {
                nombre: "Santiago Reascos",
                cargo: "Tesorero",
                iniciales: "N4",
                foto: "",
              },
              {
                nombre: "Diana Mora",
                cargo: "Comunicación",
                iniciales: "N5",
                foto: "",
              },
            ].map((m, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
                <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 mb-4 overflow-hidden flex items-center justify-center">
                  {m.foto ? (
                    <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-light text-neutral-400">{m.iniciales}</span>
                  )}
                </div>
                <h3 className="font-normal text-neutral-900 text-base mb-1">{m.nombre}</h3>
                <p className="text-xs text-amber-600 uppercase tracking-wider font-light">{m.cargo}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <img
                src="/images/logos/ecfn-logo.png"
                alt="ECFN - Escuela de Ciencias Físicas y Nanotecnología"
                className="h-16 w-auto mb-6 object-contain"
              />
              <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Escuela de Ciencias Físicas y Nanotecnología</p>
              <h2 className="text-3xl font-light text-neutral-900 mb-6 leading-tight">Explora lo infinitesimal y lo cósmico</h2>
              <div className="space-y-4 text-neutral-600 font-light leading-relaxed">
                <p>La Escuela de Ciencias Físicas y Nanotecnología se enfoca en el desarrollo de dos departamentos (Física y Nanotecnología) que cubren la investigación fundamental y aplicada, conformando áreas de investigación clave.</p>
                <p>Esto provee un perfil altamente competitivo e internacional a los programas que ofertamos a nivel de pregrado. Nuestro futuro programa de postgrado nos permite centrarnos en problemas específicos que requieren ser resueltos a nivel nacional.</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="https://yachaytech.edu.ec/escuela-de-ciencias-fisicas-y-nanotecnologia/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-normal text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-sm">
                  <GraduationCap className="w-4 h-4" />
                  Visitar ECFN
                </a>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { label: "Carreras", value: "02", desc: "Física y Nanotecnología" },
                { label: "Posgrados", value: "02", desc: "Física Fundamental y Docencia STEM" },
                { label: "Departamentos", value: "02", desc: "Física y Nanotecnología" },
                { label: "Líneas", value: "06+", desc: "Áreas de investigación activas" },
              ].map((s) => (
                <div key={s.label} className="border-t-2 border-neutral-200 pt-4">
                  <div className="text-3xl font-light text-amber-500 mb-1">{s.value}</div>
                  <div className="text-xs text-neutral-900 font-normal uppercase tracking-wider mb-1">{s.label}</div>
                  <div className="text-xs text-neutral-500 font-light">{s.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
