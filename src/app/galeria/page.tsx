"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar, Footer, PageHeader, fadeUp } from "@/components/site-layout";

interface Photo {
  id: string;
  title: string;
  image: string;
  description: string;
}
interface Album {
  id: string;
  album: string;
  category: string;
  date: string;
  description: string;
  photos: Photo[];
}

export default function GaleriaPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{ photo: Photo; album: Album } | null>(null);

  useEffect(() => {
    fetch("/data/gallery.json")
      .then((r) => r.json())
      .then((data) => {
        setAlbums(data);
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
        label="Galería"
        title={<>Galería de <span className="text-amber-400">fotos</span></>}
        description="Momentos de la vida estudiantil: eventos, observaciones, congresos y actividades científicas."
      />

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="mb-6 pb-4 border-b border-neutral-200">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h2 className="text-2xl font-light text-neutral-900">{album.album}</h2>
                  <span className="text-xs text-amber-600 uppercase tracking-widest font-light">
                    {album.category}
                  </span>
                </div>
                {album.description && (
                  <p className="text-sm text-neutral-500 font-light mt-2">{album.description}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {album.photos.map((photo, j) => (
                  <motion.button
                    key={photo.id}
                    custom={j}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    onClick={() => setSelectedPhoto({ photo, album })}
                    className="group block text-left"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 overflow-hidden mb-3">
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-sm font-normal text-neutral-900 group-hover:text-amber-700 transition-colors">
                      {photo.title}
                    </h3>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-amber-400 transition-colors text-2xl z-10"
            >
              ✕
            </button>
            <img
              src={selectedPhoto.photo.image}
              alt={selectedPhoto.photo.title}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-white">
              <h3 className="text-lg font-normal mb-1">{selectedPhoto.photo.title}</h3>
              <p className="text-xs text-amber-400/70 uppercase tracking-wider font-light mb-2">
                {selectedPhoto.album.album}
              </p>
              {selectedPhoto.photo.description && (
                <p className="text-sm text-neutral-300 font-light leading-relaxed">
                  {selectedPhoto.photo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
