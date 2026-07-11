"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { ArrowRight, Mail, Users, FlaskConical, BookOpen, GraduationCap, ExternalLink } from "lucide-react";

interface Participant {
  name: string;
  role: string;
}
interface Project {
  title: string;
  year: number;
}
interface ResearchGroup {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  image: string;
  participants: Participant[];
  long_description: string;
  projects: Project[];
  contact_email: string;
}

interface Paper {
  title: string;
  authors: string;
  year: number;
  journal: string;
  link: string;
  published: boolean;
}

interface Thesis {
  title: string;
  author: string;
  year: number;
  abstract: string;
  link: string;
  status: string;
}

export default function InvestigacionPage() {
  const [grupos, setGrupos] = useState<ResearchGroup[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [tesis, setTesis] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/investigation-groups.json").then((r) => r.json()),
      fetch("/data/papers.json").then((r) => r.json()),
      fetch("/data/theses.json").then((r) => r.json()),
    ])
      .then(([g, p, t]) => {
        setGrupos(g);
        setPapers(p);
        setTesis(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-amber-400 text-sm font-light animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeader
        label="Investigación"
        title={<>Grupos de <span className="text-amber-400">investigación</span></>}
        description="La Escuela de Ciencias Físicas y Nanotecnología desarrolla investigación fundamental y aplicada en áreas clave para el desarrollo científico y tecnológico del país."
      />

      {/* Grupos de investigación */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-px bg-neutral-200">
            {grupos.map((grupo, i) => (
              <motion.div
                key={grupo.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-white p-8 lg:p-10"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-sm bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-normal text-neutral-900 mb-2">{grupo.title}</h2>
                    <p className="text-sm text-neutral-600 font-light leading-relaxed">
                      {grupo.short_description}
                    </p>
                  </div>
                </div>

                <p className="text-neutral-600 font-light leading-relaxed mb-6">
                  {grupo.long_description}
                </p>

                {grupo.participants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Integrantes
                    </h3>
                    <ul className="space-y-1.5">
                      {grupo.participants.map((p, j) => (
                        <li key={j} className="flex items-baseline gap-2 text-sm">
                          <span className="text-neutral-900 font-normal">{p.name}</span>
                          <span className="text-neutral-400 font-light">— {p.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {grupo.projects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs text-amber-600 uppercase tracking-widest font-light mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      Proyectos
                    </h3>
                    <ul className="space-y-1.5">
                      {grupo.projects.map((proj, j) => (
                        <li key={j} className="flex items-baseline gap-2 text-sm">
                          <span className="text-amber-500 font-light">{proj.year}</span>
                          <span className="text-neutral-700 font-light">{proj.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {grupo.contact_email && (
                  <a
                    href={`mailto:${grupo.contact_email}`}
                    className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Contactar al grupo
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Papers */}
      {papers.length > 0 && (
        <section className="bg-neutral-950 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">
                Publicaciones
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-white leading-tight">
                Artículos científicos
              </h2>
            </div>
            <div className="space-y-px bg-neutral-800">
              {papers.map((paper, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="bg-neutral-950 p-6 hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="text-lg font-normal text-white mb-2 leading-snug">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-neutral-400 font-light mb-1">{paper.authors}</p>
                      <p className="text-xs text-amber-400/70 font-light">
                        {paper.journal} · {paper.year}
                      </p>
                    </div>
                    {paper.link && (
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tesis */}
      {tesis.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl">
              <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">
                Trabajos de titulación
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-neutral-900 leading-tight">
                Tesis defendidas
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {tesis.map((t, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="border-t-2 border-neutral-200 pt-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                    <span className="text-xs text-neutral-500 uppercase tracking-wider font-light">
                      {t.status || "Defendida"} · {t.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-normal text-neutral-900 mb-2 leading-snug">
                    {t.title}
                  </h3>
                  <p className="text-sm text-neutral-600 font-light mb-2">{t.author}</p>
                  {t.abstract && (
                    <p className="text-sm text-neutral-500 font-light leading-relaxed">
                      {t.abstract}
                    </p>
                  )}
                  {t.link && (
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal mt-3"
                    >
                      Ver documento
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
