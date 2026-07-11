"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";
import { MapPin, Clock, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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
  reunion: "bg-amber-400",
  academico: "bg-blue-400",
  social: "bg-emerald-400",
  investigacion: "bg-purple-400",
  taller: "bg-cyan-400",
  seminario: "bg-rose-400",
  charla: "bg-indigo-400",
  competencia: "bg-orange-400",
  otro: "bg-neutral-400",
};

const tipoLabels: Record<string, string> = {
  reunion: "Reunión",
  academico: "Académico",
  social: "Social",
  investigacion: "Investigación",
  taller: "Taller",
  seminario: "Seminario",
  charla: "Charla",
  competencia: "Competencia",
  otro: "Otro",
};

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((data) => {
        setEventos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const eventosPorDia = useMemo(() => {
    const map: Record<string, Evento[]> = {};
    eventos.forEach((e) => {
      const date = new Date(e.fecha);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [eventos]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentMonth]);

  function formatDate(fecha: string) {
    try {
      return new Date(fecha).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" });
    } catch { return fecha; }
  }

  function formatTime(fecha: string) {
    try {
      return new Date(fecha).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }

  function getEventosDelDia(date: Date): Evento[] {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventosPorDia[key] || [];
  }

  function getEventosDelDiaSeleccionado(): Evento[] {
    if (!selectedDate) return [];
    return getEventosDelDia(selectedDate).sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }

  function prevMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); }

  const now = new Date();
  const proximos = eventos.filter((e) => new Date(e.fecha) >= now).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const pasados = eventos.filter((e) => new Date(e.fecha) < now).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

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
        label="Agenda"
        title={<>Calendario <span className="text-amber-400">académico</span></>}
        description="Eventos, charlas, defensas de tesis y actividades de la asociación. Navega por el calendario o explora la lista completa."
      />

      {/* Vista de calendario mensual */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendario grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <h2 className="text-2xl font-light text-neutral-900">
                  {meses[currentMonth.getMonth()]} <span className="text-neutral-400">{currentMonth.getFullYear()}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-amber-600 hover:bg-amber-50 transition-colors rounded-sm" aria-label="Mes anterior">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date())} className="px-4 h-10 text-xs text-neutral-600 hover:text-amber-600 hover:bg-amber-50 transition-colors rounded-sm uppercase tracking-wider font-light">
                    Hoy
                  </button>
                  <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-amber-600 hover:bg-amber-50 transition-colors rounded-sm" aria-label="Mes siguiente">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-xs text-neutral-500 uppercase tracking-wider font-light py-2">{dia}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-neutral-200">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={i} className="bg-neutral-50 min-h-[80px] lg:min-h-[100px]" />;
                  const dayEvents = getEventosDelDia(date);
                  const isSelected = selectedDate && date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
                  const today = isToday(date);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`bg-white min-h-[80px] lg:min-h-[100px] p-2 text-left hover:bg-amber-50 transition-colors relative ${isSelected ? "ring-2 ring-amber-400 ring-inset" : ""}`}
                    >
                      <span className={`text-sm font-light block mb-1 ${today ? "bg-amber-400 text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center font-normal" : "text-neutral-700"}`}>
                        {date.getDate()}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dayEvents.slice(0, 3).map((e, j) => (
                          <span key={j} className={`w-1.5 h-1.5 rounded-full ${tipoColors[e.tipo] || "bg-neutral-400"}`} />
                        ))}
                        {dayEvents.length > 3 && <span className="text-[10px] text-neutral-400 font-light">+{dayEvents.length - 3}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 flex flex-wrap gap-4">
                {Object.entries(tipoLabels).map(([tipo, label]) => (
                  <div key={tipo} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${tipoColors[tipo] || "bg-neutral-400"}`} />
                    <span className="text-xs text-neutral-500 font-light">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel lateral: eventos del día seleccionado */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="border-t-2 border-amber-400 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                    <h3 className="text-sm font-normal text-neutral-900 uppercase tracking-wider">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })
                        : "Selecciona un día"}
                    </h3>
                  </div>
                  {!selectedDate && <p className="text-sm text-neutral-500 font-light">Haz clic en cualquier fecha del calendario para ver los eventos programados.</p>}
                  {selectedDate && getEventosDelDiaSeleccionado().length === 0 && <p className="text-sm text-neutral-500 font-light">No hay eventos programados para este día.</p>}
                  <div className="space-y-4">
                    {getEventosDelDiaSeleccionado().map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-l-2 border-amber-400 pl-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${tipoColors[e.tipo] || "bg-neutral-400"}`} />
                          <span className="text-xs text-amber-600 uppercase tracking-wider font-light">{tipoLabels[e.tipo] || e.tipo}</span>
                        </div>
                        <h4 className="font-normal text-neutral-900 text-sm leading-snug mb-1">{e.titulo}</h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 font-light">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(e.fecha)}</span>
                          {e.ubicacion && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.ubicacion}</span>}
                        </div>
                        {e.descripcion && <p className="text-xs text-neutral-600 font-light mt-1.5 leading-relaxed">{e.descripcion}</p>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de próximos eventos */}
      {proximos.length > 0 && (
        <section className="bg-neutral-950 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">Próximos eventos</p>
              <h2 className="text-3xl sm:text-4xl font-light text-white">Agenda próxima</h2>
            </div>
            <div className="space-y-px bg-neutral-800">
              {proximos.map((e, i) => (
                <motion.div
                  key={e.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex items-start gap-6 bg-neutral-950 p-6 hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex-shrink-0 text-center w-16">
                    <div className="text-3xl font-light text-amber-400">{new Date(e.fecha).getDate()}</div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-light">{new Date(e.fecha).toLocaleDateString("es-EC", { month: "short" })}</div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs uppercase tracking-wider font-light text-amber-400">{tipoLabels[e.tipo] || e.tipo}</span>
                      {e.estado === "finalizado" && <span className="text-xs text-neutral-600 font-light">· Finalizado</span>}
                    </div>
                    <h3 className="font-normal text-white text-lg mb-1">{e.titulo}</h3>
                    {e.descripcion && <p className="text-sm text-neutral-400 font-light leading-relaxed mb-2">{e.descripcion}</p>}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-light">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(e.fecha)} · {formatTime(e.fecha)}</span>
                      {e.ubicacion && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.ubicacion}</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Eventos pasados */}
      {pasados.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-amber-600 text-sm font-light tracking-widest uppercase mb-3">Historial</p>
              <h2 className="text-3xl sm:text-4xl font-light text-neutral-900">Eventos anteriores</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pasados.slice(0, 12).map((e, i) => (
                <motion.div
                  key={e.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="border-t-2 border-neutral-200 pt-4 opacity-70"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${tipoColors[e.tipo] || "bg-neutral-400"}`} />
                    <span className="text-xs text-neutral-500 uppercase tracking-wider font-light">{tipoLabels[e.tipo] || e.tipo}</span>
                  </div>
                  <h3 className="font-normal text-neutral-900 text-base mb-1">{e.titulo}</h3>
                  <p className="text-xs text-neutral-500 font-light">{formatDate(e.fecha)}</p>
                  {e.ubicacion && <p className="text-xs text-neutral-400 font-light flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{e.ubicacion}</p>}
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
