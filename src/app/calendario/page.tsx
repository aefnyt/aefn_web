"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { MapPin, Clock } from "lucide-react";

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  tipo: string;
  estado: string;
  link: string;
}

const tipoColors: Record<string, string> = {
  reunion: "text-amber-600",
  academico: "text-blue-400",
  social: "text-emerald-400",
  investigacion: "text-purple-400",
};

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((data) => {
        setEventos(data);
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

  const now = new Date();
  const proximos = eventos
    .filter((e) => new Date(e.fecha) >= now)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const pasados = eventos
    .filter((e) => new Date(e.fecha) < now)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  function formatDate(fecha: string) {
    try {
      return new Date(fecha).toLocaleDateString("es-EC", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  }

  function formatTime(fecha: string) {
    try {
      return new Date(fecha).toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  const EventCard = ({ e, i }: { e: Evento; i: number }) => (
    <motion.div
      custom={i}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="flex items-start gap-6 bg-neutral-950 p-6 hover:bg-neutral-900 transition-colors"
    >
      <div className="flex-shrink-0 text-center w-16">
        <div className="text-3xl font-light text-amber-400">
          {new Date(e.fecha).getDate()}
        </div>
        <div className="text-xs text-neutral-500 uppercase tracking-widest font-light">
          {new Date(e.fecha).toLocaleDateString("es-EC", { month: "short" })}
        </div>
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`text-xs uppercase tracking-wider font-light ${tipoColors[e.tipo] || "text-amber-400"}`}>
            {e.tipo}
          </span>
          {e.estado === "finalizado" && (
            <span className="text-xs text-neutral-600 font-light">· Finalizado</span>
          )}
        </div>
        <h3 className="font-normal text-white text-lg mb-1">{e.titulo}</h3>
        {e.descripcion && (
          <p className="text-sm text-neutral-400 font-light leading-relaxed mb-2">
            {e.descripcion}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-light">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(e.fecha)} · {formatTime(e.fecha)}
          </span>
          {e.ubicacion && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {e.ubicacion}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeader
        label="Agenda"
        title={<>Calendario <span className="text-amber-400">académico</span></>}
        description="Eventos, charlas, defensas de tesis y actividades de la asociación a lo largo del año."
      />

      {proximos.length > 0 && (
        <section className="bg-neutral-950 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">
                Próximos eventos
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-white">Agenda próxima</h2>
            </div>
            <div className="space-y-px bg-neutral-800">
              {proximos.map((e, i) => (
                <EventCard key={e.id} e={e} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {pasados.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">
                Historial
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-neutral-900">
                Eventos anteriores
              </h2>
            </div>
            <div className="space-y-px bg-neutral-200">
              {pasados.map((e, i) => (
                <motion.div
                  key={e.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex items-start gap-6 bg-white p-6 hover:bg-neutral-50 transition-colors opacity-70"
                >
                  <div className="flex-shrink-0 text-center w-16">
                    <div className="text-3xl font-light text-neutral-400">
                      {new Date(e.fecha).getDate()}
                    </div>
                    <div className="text-xs text-neutral-400 uppercase tracking-widest font-light">
                      {new Date(e.fecha).toLocaleDateString("es-EC", { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-neutral-500 uppercase tracking-wider font-light">
                        {e.tipo}
                      </span>
                    </div>
                    <h3 className="font-normal text-neutral-900 text-lg mb-1">{e.titulo}</h3>
                    {e.descripcion && (
                      <p className="text-sm text-neutral-500 font-light leading-relaxed">
                        {e.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-neutral-500 font-light mt-2">
                      <span>{formatDate(e.fecha)}</span>
                      {e.ubicacion && <span>· {e.ubicacion}</span>}
                    </div>
                  </div>
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
