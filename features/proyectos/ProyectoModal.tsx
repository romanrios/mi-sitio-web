"use client";

import {
  obtenerVimeoEmbedUrl,
  obtenerYoutubeEmbedUrl,
  ProyectoEnlaceItem,
  ProyectoGaleriaItem,
  ProyectoTagItem,
} from "@/lib/proyectos-utils";
import { useEffect, useState } from "react";

type ProyectoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  galeria?: ProyectoGaleriaItem[];
  tags?: ProyectoTagItem[];
  enlaces?: ProyectoEnlaceItem[];
};

export default function ProyectoModal({
  isOpen,
  onClose,
  titulo,
  descripcion,
  imagenUrl,
  galeria = [],
  tags = [],
  enlaces = [],
}: ProyectoModalProps) {
  const [indiceActivo, setIndiceActivo] = useState(0);

  // Si la galería está vacía, usamos la imagen principal como único elemento
  const itemsGaleria: ProyectoGaleriaItem[] =
    galeria.length > 0
      ? galeria
      : [{ tipo: "imagen", url: imagenUrl, orden: 0 }];

  // Reiniciar el índice al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setIndiceActivo(0);
    }
  }, [isOpen]);

  // Manejo de teclado (Escape para cerrar, flechas para navegar galería)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setIndiceActivo((prev) =>
          prev === 0 ? itemsGaleria.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setIndiceActivo((prev) =>
          prev === itemsGaleria.length - 1 ? 0 : prev + 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, itemsGaleria.length]);

  if (!isOpen) return null;

  const elementoActual = itemsGaleria[indiceActivo] || itemsGaleria[0];
  const tieneVariosMedios = itemsGaleria.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-proyecto-titulo"
    >
      <div className="bg-surface border border-border text-foreground rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-3 py-4 sm:px-6 border-b border-border">
          <h3
            id="modal-proyecto-titulo"
            className="text-xl font-bold text-foreground truncate pr-4"
          >
            {titulo}
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-lg p-1.5 hover:bg-surface-hover transition-colors"
            aria-label="Cerrar modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-3 py-6 sm:p-6 space-y-6">
          {/* Visor de Galería */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
            {elementoActual.tipo === "imagen" ? (
              <img
                src={elementoActual.url}
                alt={`${titulo} - elemento ${indiceActivo + 1}`}
                className="w-full h-full object-contain"
              />
            ) : elementoActual.tipo === "youtube" ? (
              <iframe
                src={obtenerYoutubeEmbedUrl(elementoActual.url)}
                title={`${titulo} - Video YouTube ${indiceActivo + 1}`}
                className="w-full h-full border-0 bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : elementoActual.tipo === "vimeo" ? (
              <iframe
                src={obtenerVimeoEmbedUrl(elementoActual.url)}
                title={`${titulo} - Video Vimeo ${indiceActivo + 1}`}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : null}

            {/* Controles de navegación en galería si hay más de 1 */}
            {tieneVariosMedios && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setIndiceActivo((prev) =>
                      prev === 0 ? itemsGaleria.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                  aria-label="Elemento anterior"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIndiceActivo((prev) =>
                      prev === itemsGaleria.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                  aria-label="Siguiente elemento"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Badge de contador (ej. 1/4) */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/70 text-white text-xs font-medium">
                  {indiceActivo + 1} / {itemsGaleria.length}
                </div>
              </>
            )}
          </div>

          {/* Dots / Paginador de la galería */}
          {tieneVariosMedios && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {itemsGaleria.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIndiceActivo(idx)}
                  className={`transition-all rounded-full ${idx === indiceActivo
                    ? "w-6 h-2 bg-accent"
                    : "w-2 h-2 bg-border-strong hover:bg-muted"
                    }`}
                  aria-label={`Ir a multimedia ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Descripción del proyecto */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wider text-muted-subtle">
              Acerca del proyecto
            </h4>
            <p className="text-muted leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {descripcion}
            </p>
          </div>

          {/* Tags / Tecnologías usadas */}
          {tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider text-muted-subtle">
                Tecnologías utilizadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id || tag.nombre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface-hover text-foreground border border-border shadow-xs"
                  >
                    {tag.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enlaces del proyecto */}
          {enlaces.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider text-muted-subtle">
                Enlaces del proyecto
              </h4>
              <div className="flex flex-wrap gap-3">
                {enlaces.map((enlace) => (
                  <a
                    key={enlace.id || `${enlace.etiqueta}-${enlace.url}`}
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-hover transition-colors shadow-xs"
                  >
                    <span>{enlace.etiqueta}</span>
                    <svg
                      className="w-4 h-4 opacity-85"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
