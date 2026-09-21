"use client";

import { useEffect, useState } from "react";
import {
  TipoGaleria,
  extraerYoutubeId,
  extraerVimeoId,
} from "@/lib/proyectos-utils";

interface GaleriaMiniaturaProps {
  tipo: TipoGaleria;
  url: string;
  className?: string;
}

// Caché en memoria para miniaturas de Vimeo ya consultadas
const vimeoThumbnailCache = new Map<string, string>();

function ImagenMiniatura({
  url,
  className,
}: {
  url: string;
  className: string;
}) {
  const [imgError, setImgError] = useState(false);
  const urlLimpia = url.trim();

  if (!urlLimpia) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface-hover/80 text-muted-subtle border border-border/60 rounded select-none p-1 text-center ${className}`}
      >
        <svg
          className="w-5 h-5 mb-0.5 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-[10px] leading-tight font-medium">Sin imagen</span>
      </div>
    );
  }

  if (imgError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-red-500/10 text-red-500 border border-red-500/30 rounded p-1 text-center ${className}`}
        title="No se pudo cargar la imagen desde la URL proporcionada"
      >
        <svg
          className="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-[9px] leading-tight">Error URL</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded bg-black/5 border border-border group ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlLimpia}
        alt="Miniatura de imagen"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        onError={() => setImgError(true)}
        loading="lazy"
      />
      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.2 rounded font-medium backdrop-blur-xs">
        IMG
      </span>
    </div>
  );
}

function YoutubeMiniatura({
  url,
  className,
}: {
  url: string;
  className: string;
}) {
  const urlLimpia = url.trim();
  const youtubeId = extraerYoutubeId(urlLimpia);

  if (!urlLimpia || !youtubeId) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-red-600/10 text-red-500 border border-red-500/20 rounded select-none p-1 text-center ${className}`}
      >
        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
        <span className="text-[10px] leading-tight font-medium">YouTube</span>
      </div>
    );
  }

  const thumbUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  return (
    <div
      className={`relative overflow-hidden rounded bg-black border border-border group ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbUrl}
        alt={`Miniatura YouTube ${youtubeId}`}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none group-hover:bg-black/10 transition-colors">
        <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
          <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <span className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] px-1 py-0.2 rounded font-semibold shadow-xs">
        YT
      </span>
    </div>
  );
}

function VimeoMiniatura({
  url,
  className,
}: {
  url: string;
  className: string;
}) {
  const urlLimpia = url.trim();
  const vimeoId = extraerVimeoId(urlLimpia);
  const [vimeoThumbnail, setVimeoThumbnail] = useState<string | null>(() => {
    return vimeoId && vimeoThumbnailCache.has(vimeoId)
      ? vimeoThumbnailCache.get(vimeoId) || null
      : null;
  });
  const [vimeoCargando, setVimeoCargando] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!vimeoId || vimeoThumbnailCache.has(vimeoId)) {
      return;
    }

    let isMounted = true;
    const cleanId = vimeoId.split("?")[0];
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${cleanId}`;

    const controller = new AbortController();

    fetch(oembedUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("No encontrada");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.thumbnail_url) {
          vimeoThumbnailCache.set(vimeoId, data.thumbnail_url);
          setVimeoThumbnail(data.thumbnail_url);
        }
      })
      .catch(() => {
        // En caso de error, el fallback se encargará
      })
      .finally(() => {
        if (isMounted) setVimeoCargando(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [vimeoId]);

  if (!urlLimpia || !vimeoId) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded select-none p-1 text-center ${className}`}
      >
        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.396 7.164c-.093 2.026-1.507 4.799-4.245 8.32-2.841 3.684-5.247 5.525-7.22 5.525-1.229 0-2.271-1.135-3.125-3.404-.619-2.271-1.236-4.542-1.854-6.812-.68-2.483-1.413-3.725-2.2-3.725-.175 0-.785.367-1.83 1.101l-1.096-1.413c1.173-1.029 2.327-2.057 3.461-3.086 1.571-1.353 2.723-2.062 3.46-2.132 1.74-.176 2.81 1.01 3.208 3.559.477 3.064.811 4.978 1.002 5.742.57 2.368 1.196 3.552 1.88 3.552.535 0 1.258-.809 2.167-2.428.91-1.62 1.396-2.859 1.458-3.719.108-1.423-.404-2.134-1.536-2.134-.54 0-1.099.124-1.677.371 1.112-3.649 3.232-5.419 6.36-5.311 2.316.079 3.42 1.579 3.307 4.5z" />
        </svg>
        <span className="text-[10px] leading-tight font-medium">Vimeo</span>
      </div>
    );
  }

  if (vimeoCargando) {
    return (
      <div
        className={`flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded ${className}`}
      >
        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (vimeoThumbnail && !imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded bg-black border border-border group ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vimeoThumbnail}
          alt={`Miniatura Vimeo ${vimeoId}`}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none group-hover:bg-black/10 transition-colors">
          <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
            <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <span className="absolute bottom-1 right-1 bg-sky-500 text-white text-[9px] px-1 py-0.2 rounded font-semibold shadow-xs">
          VIMEO
        </span>
      </div>
    );
  }

  // Fallback si no hay miniatura de oEmbed (ej. video privado o sin thumbnail)
  return (
    <div
      className={`flex flex-col items-center justify-center bg-sky-500/15 text-sky-500 border border-sky-500/30 rounded select-none p-1 text-center relative ${className}`}
    >
      <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.396 7.164c-.093 2.026-1.507 4.799-4.245 8.32-2.841 3.684-5.247 5.525-7.22 5.525-1.229 0-2.271-1.135-3.125-3.404-.619-2.271-1.236-4.542-1.854-6.812-.68-2.483-1.413-3.725-2.2-3.725-.175 0-.785.367-1.83 1.101l-1.096-1.413c1.173-1.029 2.327-2.057 3.461-3.086 1.571-1.353 2.723-2.062 3.46-2.132 1.74-.176 2.81 1.01 3.208 3.559.477 3.064.811 4.978 1.002 5.742.57 2.368 1.196 3.552 1.88 3.552.535 0 1.258-.809 2.167-2.428.91-1.62 1.396-2.859 1.458-3.719.108-1.423-.404-2.134-1.536-2.134-.54 0-1.099.124-1.677.371 1.112-3.649 3.232-5.419 6.36-5.311 2.316.079 3.42 1.579 3.307 4.5z" />
      </svg>
      <span className="text-[9px] font-mono leading-tight truncate max-w-full">
        #{vimeoId.split("?")[0]}
      </span>
      <span className="absolute bottom-1 right-1 bg-sky-500 text-white text-[9px] px-1 py-0.2 rounded font-semibold shadow-xs">
        VIMEO
      </span>
    </div>
  );
}

export default function GaleriaMiniatura({
  tipo,
  url,
  className = "",
}: GaleriaMiniaturaProps) {
  if (tipo === "imagen") {
    return <ImagenMiniatura key={url} url={url} className={className} />;
  }
  if (tipo === "youtube") {
    return <YoutubeMiniatura key={url} url={url} className={className} />;
  }
  if (tipo === "vimeo") {
    return <VimeoMiniatura key={url} url={url} className={className} />;
  }
  return null;
}
