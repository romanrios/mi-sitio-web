"use client";

import Card from "@/components/ui/Card";
import { heroDefault, HeroData } from "@/content/hero";
import { useEffect, useState } from "react";

export default function AdminHeroApp() {
  const [imagenUrl, setImagenUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    async function cargarHero() {
      try {
        const res = await fetch("/api/hero");
        if (res.ok) {
          const data: HeroData = await res.json();
          setImagenUrl(data.imagenUrl || heroDefault.imagenUrl);
          setTitulo(data.titulo || heroDefault.titulo);
          setSubtitulo(data.subtitulo || heroDefault.subtitulo);
          setDescripcion(data.descripcion || heroDefault.descripcion);
        } else {
          setImagenUrl(heroDefault.imagenUrl);
          setTitulo(heroDefault.titulo);
          setSubtitulo(heroDefault.subtitulo);
          setDescripcion(heroDefault.descripcion);
        }
      } catch (err) {
        console.error("Error al cargar Hero:", err);
        setImagenUrl(heroDefault.imagenUrl);
        setTitulo(heroDefault.titulo);
        setSubtitulo(heroDefault.subtitulo);
        setDescripcion(heroDefault.descripcion);
      } finally {
        setCargando(false);
      }
    }

    cargarHero();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito(false);

    if (!imagenUrl.trim()) {
      setError("La URL de la imagen es requerida.");
      return;
    }
    if (!titulo.trim()) {
      setError("El título es requerido.");
      return;
    }
    if (!subtitulo.trim()) {
      setError("El subtítulo es requerido.");
      return;
    }
    if (!descripcion.trim()) {
      setError("La descripción es requerida.");
      return;
    }

    setGuardando(true);

    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagenUrl: imagenUrl.trim(),
          titulo: titulo.trim(),
          subtitulo: subtitulo.trim(),
          descripcion: descripcion.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar los datos.");
      }

      setExito(true);
      setTimeout(() => setExito(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="w-full max-w-2xl text-center py-12">
        <p className="text-muted text-sm">Cargando datos del Hero...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Editar Hero</h2>
        <p className="text-sm text-muted">
          Configura la información y foto de perfil que se muestra al inicio del sitio.
        </p>
      </div>

      {exito && (
        <div className="mb-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          ✓ Los datos del Hero se guardaron correctamente.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          ✕ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Previsualización en vivo */}
        <Card className="p-5 sm:p-6 bg-surface/50 border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-subtle block mb-4">
            Vista previa
          </span>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-border shadow-md ring-4 ring-accent/10 bg-surface shrink-0">
              <img
                src={imagenUrl || heroDefault.imagenUrl}
                alt={titulo || "Foto de perfil"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback visual si la URL es inválida
                  (e.target as HTMLImageElement).src = heroDefault.imagenUrl;
                }}
              />
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {titulo || "Nombre y Apellido"}
              </h3>
              <p className="mt-1 text-sm sm:text-base font-medium text-accent whitespace-pre-line">
                {subtitulo || "Título profesional"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-line border-t border-border/60 pt-4">
            {descripcion || "Descripción profesional..."}
          </p>
        </Card>

        {/* Campos del formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              URL de la imagen de perfil
            </label>
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://ejemplo.com/perfil.png"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              required
            />
            <p className="text-[11px] text-muted-subtle mt-1">
              Se mostrará enmarcada dentro de un círculo con borde y sombra suave.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Título principal
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Román Ríos"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Subtítulo
            </label>
            <textarea
              rows={2}
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder={"Desarrollador de Software /\nDiseñador de Comunicación Visual"}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm font-sans"
              required
            />
            <p className="text-[11px] text-muted-subtle mt-1">
              Puedes presionar Enter para separar líneas si lo deseas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Texto de párrafo (descripción)
            </label>
            <textarea
              rows={6}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe la descripción profesional..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm font-sans leading-relaxed"
              required
            />
            <p className="text-[11px] text-muted-subtle mt-1">
              Respeta los saltos de línea y párrafos ingresados.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-accent text-accent-foreground px-6 py-2.5 rounded-md hover:bg-accent-hover font-medium transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {guardando ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
