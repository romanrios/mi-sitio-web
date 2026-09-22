"use client";

import Spinner from "@/components/ui/Spinner";
import { useRef, useState } from "react";

type CarpetaCloudinary = "hero" | "proyectos" | "galeria" | "general";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  carpeta?: CarpetaCloudinary;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "auto";
  disabled?: boolean;
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export default function ImageUploader({
  value,
  onChange,
  carpeta = "general",
  label,
  helperText,
  aspectRatio = "auto",
  disabled = false,
}: ImageUploaderProps) {
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modoManual, setModoManual] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function procesarArchivo(file: File) {
    setError(null);

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Formato no soportado. Usá JPG, PNG, WEBP o GIF.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("La imagen supera el límite de 8MB.");
      return;
    }

    setSubiendo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("carpeta", carpeta);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen.");
      }

      onChange(data.url);
    } catch (err) {
      console.error("Error al subir archivo:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al conectar con el servidor."
      );
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      procesarArchivo(file);
    }
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || subiendo) return;
    if (e.dataTransfer.types.includes("Files")) {
      setArrastrando(true);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled || subiendo) return;
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      if (!arrastrando) {
        setArrastrando(true);
      }
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setArrastrando(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastrando(false);
    if (disabled || subiendo) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      procesarArchivo(file);
    }
  }

  const tieneImagen = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-muted">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setModoManual((prev) => !prev)}
            className="text-[11px] text-muted hover:text-accent transition-colors underline cursor-pointer"
          >
            {modoManual ? "Ocultar URL manual" : "Editar URL manualmente"}
          </button>
        </div>
      )}

      {/* Input oculto para selección de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={disabled || subiendo}
        className="hidden"
      />

      {/* Caja de subida o previsualización */}
      {tieneImagen ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`relative p-3 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-hidden ${
            arrastrando
              ? "border-accent bg-accent/10 ring-2 ring-accent/30 shadow-md"
              : "border-border bg-surface/60 hover:border-border-strong"
          }`}
        >
          {/* Overlay cuando se arrastra un archivo encima */}
          {arrastrando && !subiendo && (
            <div className="absolute inset-0 bg-surface/95 backdrop-blur-xs rounded-lg border-2 border-dashed border-accent flex items-center justify-center z-20 pointer-events-none transition-all">
              <div className="flex items-center gap-2 text-accent font-medium text-xs px-3 py-1.5 bg-accent/10 rounded-full shadow-xs">
                <svg
                  className="w-4 h-4 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span>Soltá el archivo aquí para reemplazar la imagen</span>
              </div>
            </div>
          )}

          {/* Overlay cuando está subiendo */}
          {subiendo && (
            <div className="absolute inset-0 bg-surface/90 backdrop-blur-xs rounded-lg flex items-center justify-center z-20 transition-all">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Spinner size="sm" color="accent" />
                <span>Subiendo nueva imagen a Cloudinary...</span>
              </div>
            </div>
          )}

          <div
            className={`relative overflow-hidden rounded-md border border-border bg-black/5 shrink-0 ${
              aspectRatio === "square"
                ? "w-16 h-16 rounded-full"
                : aspectRatio === "video"
                ? "w-24 h-14"
                : "w-16 h-16"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {value.split("/").pop() || "Imagen cargada"}
            </p>
            <p className="text-[11px] text-muted truncate">{value}</p>
            <p className="text-[10px] text-muted-subtle mt-0.5 flex items-center gap-1">
              <svg
                className="w-3 h-3 text-muted-subtle"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Arrastrá y soltá una imagen aquí para reemplazarla</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || subiendo}
              className="px-3 py-1.5 rounded text-xs font-medium bg-surface-hover hover:bg-surface border border-border text-foreground transition-colors cursor-pointer disabled:opacity-50"
              title="Cambiar o arrastrar archivo encima"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled || subiendo}
              className="px-2 py-1.5 rounded text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Quitar imagen"
            >
              ✕ Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!subiendo && !disabled) fileInputRef.current?.click();
          }}
          className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            arrastrando
              ? "border-accent bg-accent/10 scale-[1.01] ring-2 ring-accent/30 shadow-md"
              : "border-border hover:border-border-strong bg-surface/30 hover:bg-surface/60"
          } ${subiendo || disabled ? "pointer-events-none opacity-70" : ""}`}
        >
          {subiendo ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Spinner size="lg" color="accent" />
              <p className="text-xs font-medium text-foreground">
                Subiendo a Cloudinary...
              </p>
              <p className="text-[11px] text-muted">
                Por favor, esperá un momento
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${
                  arrastrando
                    ? "bg-accent text-accent-foreground scale-110 shadow-sm"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${arrastrando ? "animate-bounce" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-foreground">
                {arrastrando ? (
                  <span className="text-accent font-semibold">
                    ¡Soltá el archivo aquí para subirlo!
                  </span>
                ) : (
                  <>
                    <span className="text-accent underline font-semibold">
                      Hacé clic para subir
                    </span>{" "}
                    o arrastrá y soltá una imagen
                  </>
                )}
              </p>
              <p className="text-[11px] text-muted">
                JPG, PNG, WEBP o GIF (hasta 8MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Entrada manual de URL alternativa si el usuario la activa */}
      {modoManual && (
        <div className="pt-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            disabled={disabled || subiendo}
            className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-xs font-mono"
          />
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <span>✕</span> {error}
        </p>
      )}

      {/* Texto de ayuda */}
      {helperText && !error && (
        <p className="text-[11px] text-muted-subtle">{helperText}</p>
      )}
    </div>
  );
}
