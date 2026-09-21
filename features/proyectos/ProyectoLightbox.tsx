"use client";

import {
  obtenerVimeoEmbedUrl,
  obtenerYoutubeEmbedUrl,
  ProyectoGaleriaItem,
} from "@/lib/proyectos-utils";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type ProyectoLightboxProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  items: ProyectoGaleriaItem[];
  indiceActivo: number;
  onCambiarIndice: (nuevoIndice: number) => void;
};

export default function ProyectoLightbox({
  isOpen,
  onClose,
  titulo,
  items,
  indiceActivo,
  onCambiarIndice,
}: ProyectoLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [prevIndice, setPrevIndice] = useState(indiceActivo);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reiniciar zoom durante render al cambiar de imagen o al abrir/cerrar
  if (prevIndice !== indiceActivo || prevIsOpen !== isOpen) {
    setPrevIndice(indiceActivo);
    setPrevIsOpen(isOpen);
    setIsZoomed(false);
  }

  const itemActual = items[indiceActivo] || items[0];
  const esImagen = itemActual?.tipo === "imagen";
  const tieneVariosMedios = items.length > 1;

  const irAnterior = useCallback(() => {
    onCambiarIndice(indiceActivo === 0 ? items.length - 1 : indiceActivo - 1);
  }, [indiceActivo, items.length, onCambiarIndice]);

  const irSiguiente = useCallback(() => {
    onCambiarIndice(indiceActivo === items.length - 1 ? 0 : indiceActivo + 1);
  }, [indiceActivo, items.length, onCambiarIndice]);

  // Manejador de teclado para el visor ampliado
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft" && tieneVariosMedios) {
        e.stopPropagation();
        irAnterior();
      } else if (e.key === "ArrowRight" && tieneVariosMedios) {
        e.stopPropagation();
        irSiguiente();
      } else if (e.key.toLowerCase() === "z" && esImagen) {
        e.stopPropagation();
        setIsZoomed((prev) => !prev);
      }
    }

    // Capturar evento antes de que lo reciba el modal de fondo
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, onClose, tieneVariosMedios, irAnterior, irSiguiente, esImagen]);

  if (!isOpen || !itemActual) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${titulo}`}
      onClick={(e) => {
        // Cerrar al hacer clic en el backdrop fuera de la imagen
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Barra superior de controles */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10 z-10">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
            {titulo}
          </span>
          {tieneVariosMedios && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/80 shrink-0">
              {indiceActivo + 1} / {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón de alternar Zoom (solo para imágenes) */}
          {esImagen && (
            <button
              type="button"
              onClick={() => setIsZoomed((prev) => !prev)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isZoomed ? "Ajustar a la pantalla (Z)" : "Ampliar detalle (Z)"}
              aria-label={isZoomed ? "Ajustar a la pantalla" : "Ampliar detalle"}
            >
              {isZoomed ? (
                // Icono Zoom Out (reducir)
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                  />
                </svg>
              ) : (
                // Icono Zoom In (ampliar)
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Abrir imagen en pestaña nueva */}
          {esImagen && (
            <a
              href={itemActual.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Abrir imagen original"
              aria-label="Abrir imagen original en nueva pestaña"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}

          {/* Botón cerrar visor */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            title="Cerrar visor ampliado (Esc)"
            aria-label="Cerrar visor ampliado"
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
      </div>

      {/* Área central con el contenido */}
      <div
        className={`flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-auto ${
          isZoomed ? "cursor-zoom-out" : esImagen ? "cursor-zoom-in" : ""
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {esImagen ? (
          <div
            className={`relative transition-transform duration-200 ease-out flex items-center justify-center ${
              isZoomed
                ? "scale-150 sm:scale-175 m-auto cursor-zoom-out max-w-none"
                : "w-full h-full max-w-[94vw] max-h-[84vh] cursor-zoom-in"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((prev) => !prev);
            }}
          >
            <Image
              src={itemActual.url}
              alt={`${titulo} - imagen ampliada ${indiceActivo + 1}`}
              fill={!isZoomed}
              width={isZoomed ? 1200 : undefined}
              height={isZoomed ? 800 : undefined}
              sizes="100vw"
              className={
                isZoomed
                  ? "w-auto h-auto max-w-[85vw] max-h-[80vh] object-contain rounded-md shadow-2xl"
                  : "object-contain rounded-md shadow-2xl"
              }
              priority
            />
          </div>
        ) : itemActual.tipo === "youtube" ? (
          <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={obtenerYoutubeEmbedUrl(itemActual.url)}
              title={`${titulo} - Video YouTube ${indiceActivo + 1}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : itemActual.tipo === "vimeo" ? (
          <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={obtenerVimeoEmbedUrl(itemActual.url)}
              title={`${titulo} - Video Vimeo ${indiceActivo + 1}`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}

        {/* Flechas de navegación para galería */}
        {tieneVariosMedios && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                irAnterior();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/10 transition-all hover:scale-105 cursor-pointer shadow-lg"
              title="Elemento anterior (Flecha izquierda)"
              aria-label="Elemento anterior"
            >
              <svg
                className="w-6 h-6"
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
              onClick={(e) => {
                e.stopPropagation();
                irSiguiente();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/10 transition-all hover:scale-105 cursor-pointer shadow-lg"
              title="Siguiente elemento (Flecha derecha)"
              aria-label="Siguiente elemento"
            >
              <svg
                className="w-6 h-6"
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
          </>
        )}
      </div>

      {/* Barra inferior con miniaturas o dots indicativos */}
      {tieneVariosMedios && (
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto z-10">
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onCambiarIndice(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                idx === indiceActivo
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
              title={`Ir a elemento ${idx + 1}`}
              aria-label={`Ir a elemento ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
