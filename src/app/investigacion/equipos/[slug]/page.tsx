import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Microscope } from "lucide-react";
import equiposData from "../../../../../public/data/equipos-lab.json";

/**
 * Página pública /investigacion/equipos/[slug] — Equipo de laboratorio individual
 * ===========================================
 * Replica el comportamiento del sitio de la ECFN (yachaytech.edu.ec):
 * desde el catálogo de equipos se hace clic y se despliega una página
 * con la información completa del equipo.
 *
 * 📚 Concepto: generateStaticParams + generateMetadata
 * - Los 16 equipos se pre-renderizan en build time (páginas rápidas, SEO y
 *   Open Graph para compartir por WhatsApp).
 * - Los datos viven en public/data/equipos-lab.json (misma fuente que usa
 *   el catálogo de la sección /investigación).
 */

interface EquipoLab {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  origen?: string;
}

const equipos = equiposData as EquipoLab[];

/** URL pública del sitio (WhatsApp exige URLs absolutas en og:image) */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aefn.vercel.app";

export async function generateStaticParams() {
  return equipos.map((eq) => ({ slug: eq.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const equipo = equipos.find((e) => e.slug === slug);
  if (!equipo) return { title: "Equipo - AEFN" };
  return {
    title: `${equipo.nombre} - AEFN`,
    description: equipo.descripcion,
    alternates: { canonical: `${SITE_URL}/investigacion/equipos/${equipo.slug}` },
    openGraph: {
      title: equipo.nombre,
      description: equipo.descripcion,
      url: `${SITE_URL}/investigacion/equipos/${equipo.slug}`,
      type: "website",
      siteName: "AEFN",
      images: [{ url: `${SITE_URL}${equipo.imagen}`, alt: equipo.nombre }],
    },
    twitter: {
      card: "summary_large_image",
      title: equipo.nombre,
      description: equipo.descripcion,
      images: [`${SITE_URL}${equipo.imagen}`],
    },
  };
}

export default async function EquipoLabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const equipo = equipos.find((e) => e.slug === slug);
  if (!equipo) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHeaderEquipo nombre={equipo.nombre} />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Enlace volver */}
        <Link
          href="/investigacion"
          className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1.5 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a investigación
        </Link>

        {/* Categoría */}
        <div className="mb-4 flex items-center gap-3">
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
            <Microscope className="w-3 h-3 mr-1" />
            Equipo de Laboratorio
          </Badge>
          <span className="text-xs text-neutral-400 uppercase tracking-wider">
            ECFN · Yachay Tech
          </span>
        </div>

        {/* Imagen del equipo */}
        {equipo.imagen && (
          <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={equipo.imagen}
              alt={equipo.nombre}
              className="max-h-80 object-contain"
              loading="eager"
            />
          </div>
        )}

        {/* Descripción */}
        <div className="text-neutral-700 font-light leading-relaxed text-lg">
          {equipo.descripcion}
        </div>

        {/* Enlace a la fuente oficial */}
        {equipo.origen && (
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <a
              href={equipo.origen}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition-colors font-normal"
            >
              Ver ficha oficial en el sitio de la ECFN
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-xs text-neutral-400 mt-2 font-light">
              Información de referencia tomada del sitio oficial de la Escuela de
              Ciencias Físicas y Nanotecnología de Yachay Tech.
            </p>
          </div>
        )}

        {/* Otros equipos */}
        <div className="mt-10 pt-8 border-t border-neutral-200">
          <h2 className="text-xs text-neutral-500 uppercase tracking-widest font-light mb-4">
            Otros equipos de laboratorio
          </h2>
          <div className="flex flex-wrap gap-2">
            {equipos
              .filter((e) => e.slug !== equipo.slug)
              .slice(0, 6)
              .map((e) => (
                <Link
                  key={e.slug}
                  href={`/investigacion/equipos/${e.slug}`}
                  className="text-xs text-neutral-600 hover:text-amber-600 border border-neutral-200 hover:border-amber-300 rounded-full px-3 py-1.5 transition-colors"
                >
                  {e.nombre.length > 34 ? `${e.nombre.slice(0, 34)}…` : e.nombre}
                </Link>
              ))}
            <Link
              href="/investigacion"
              className="text-xs text-amber-600 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-50 transition-colors"
            >
              Ver los 16 equipos →
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

/**
 * Cabecera de la página del equipo.
 * No usa PageHeader genérico para mantener el nombre del equipo como título
 * principal dentro del artículo (mejor jerarquía para SEO).
 */
function PageHeaderEquipo({ nombre }: { nombre: string }) {
  return (
    <section className="bg-neutral-950 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-amber-400 text-sm font-light tracking-widest uppercase mb-3">
          Investigación · Equipos
        </p>
        <h1 className="text-3xl sm:text-4xl font-light text-white leading-tight">
          {nombre}
        </h1>
      </div>
    </section>
  );
}
