"use client";

import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { useEffect, useState } from "react";

type TemaOption = "dark" | "light" | "system";

interface OptionConfig {
  id: TemaOption;
  titulo: string;
  subtitulo: string;
  badge?: string;
  icon: (active: boolean) => React.ReactNode;
  previewClass: string;
}

const OPCIONES: OptionConfig[] = [
  {
    id: "dark",
    titulo: "Modo Oscuro",
    subtitulo:
      "Fondo oscuro (#111827) con texto claro. El modo inicial por defecto para nuevos visitantes.",
    badge: "Recomendado",
    previewClass: "bg-[#111827] text-gray-100 border-gray-700",
    icon: (active) => (
      <svg
        className={`size-6 ${active ? "text-cyan-400" : "text-muted"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
  {
    id: "light",
    titulo: "Modo Claro",
    subtitulo:
      "Fondo claro (#f3f4f6) con texto oscuro. Experiencia luminosa tradicional.",
    previewClass: "bg-[#f3f4f6] text-gray-900 border-gray-300",
    icon: (active) => (
      <svg
        className={`size-6 ${active ? "text-amber-500" : "text-muted"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
        />
      </svg>
    ),
  },
  {
    id: "system",
    titulo: "Según sistema del usuario",
    subtitulo:
      "Detecta automáticamente si el dispositivo o navegador del visitante está configurado en modo oscuro o claro.",
    badge: "Automático",
    previewClass: "bg-gradient-to-r from-[#111827] to-[#f3f4f6] border-gray-500",
    icon: (active) => (
      <svg
        className={`size-6 ${active ? "text-accent" : "text-muted"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="3"
          width="20"
          height="14"
          rx="2"
          strokeWidth={1.8}
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 21h8m-4-4v4"
        />
      </svg>
    ),
  },
];

export default function AdminConfiguracionApp() {
  const [temaActual, setTemaActual] = useState<TemaOption>("dark");
  const [temaSeleccionado, setTemaSeleccionado] = useState<TemaOption>("dark");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const res = await fetch("/api/configuracion");
        if (res.ok) {
          const data = await res.json();
          if (data.temaDefault) {
            setTemaActual(data.temaDefault);
            setTemaSeleccionado(data.temaDefault);
          }
        }
      } catch (err) {
        console.error("Error al cargar configuración:", err);
      } finally {
        setCargando(false);
      }
    }

    cargarConfiguracion();
  }, []);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito(false);
    setGuardando(true);

    try {
      const res = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temaDefault: temaSeleccionado }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar la configuración.");
      }

      setTemaActual(temaSeleccionado);
      setExito(true);
      setTimeout(() => setExito(false), 4000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error inesperado al guardar."
      );
    } finally {
      setGuardando(false);
    }
  }

  const tieneCambiosPendientes = temaSeleccionado !== temaActual;

  if (cargando) {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <div className="h-7 w-48 bg-surface-hover rounded-md mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-surface-hover rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-surface border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Configuración General
        </h2>
        <p className="text-sm text-muted">
          Ajusta los parámetros globales de la aplicación y la experiencia de los
          visitantes.
        </p>
      </div>

      {exito && (
        <div className="mb-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
          <svg
            className="size-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>La configuración del tema se guardó exitosamente.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <svg
            className="size-5 shrink-0"
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
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* Sección de Tema por Defecto */}
        <Card className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Tema por defecto del sitio
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Define la apariencia inicial con la que se mostrará la web para
                los nuevos usuarios.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-surface-hover text-muted self-start sm:self-auto font-mono">
              <span
                className={`size-2 rounded-full ${
                  temaActual === "dark"
                    ? "bg-cyan-400"
                    : temaActual === "light"
                    ? "bg-amber-400"
                    : "bg-purple-400"
                }`}
              />
              Activo: {temaActual === "dark" ? "Oscuro" : temaActual === "light" ? "Claro" : "Sistema"}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Seleccionar tema por defecto"
            className="space-y-3"
          >
            {OPCIONES.map((opcion) => {
              const isSelected = temaSeleccionado === opcion.id;
              const isCurrentlySaved = temaActual === opcion.id;

              return (
                <div
                  key={opcion.id}
                  onClick={() => setTemaSeleccionado(opcion.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setTemaSeleccionado(opcion.id);
                    }
                  }}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs"
                      : "border-border hover:border-border-strong hover:bg-surface-hover/50"
                  }`}
                >
                  {/* Selector circular */}
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-accent bg-accent"
                          : "border-border-strong bg-surface"
                      }`}
                    >
                      {isSelected && (
                        <div className="size-2 rounded-full bg-accent-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Icono de la opción */}
                  <div className="pt-0.5 shrink-0">
                    {opcion.icon(isSelected)}
                  </div>

                  {/* Textos descriptivos */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {opcion.titulo}
                      </span>
                      {opcion.badge && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          {opcion.badge}
                        </span>
                      )}
                      {isCurrentlySaved && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-muted-subtle border border-border">
                          Guardado actualmente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {opcion.subtitulo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tarjeta explicativa sobre la preferencia del visitante */}
          <div className="p-4 rounded-lg bg-surface-hover/40 border border-border text-xs text-muted space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <svg
                className="size-4 text-accent shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>¿Cómo interactúa esto con la elección de cada usuario?</span>
            </div>
            <p className="leading-relaxed pl-6">
              Esta configuración establece el tema con el que cargará el sitio web
              para personas que lo visitan por primera vez o que no tienen una
              preferencia guardada.
            </p>
            <p className="leading-relaxed pl-6">
              Cualquier usuario puede alternar entre modo claro y oscuro cuando
              quiera usando el botón en la cabecera del sitio; su preferencia individual
              se guardará en su navegador y tendrá prioridad sobre este valor por
              defecto.
            </p>
          </div>
        </Card>

        {/* Barra de acciones */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {tieneCambiosPendientes ? (
              <span className="text-xs font-medium text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                Tienes cambios sin guardar
              </span>
            ) : (
              <span className="text-xs text-muted-subtle">
                Todos los cambios están guardados
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {tieneCambiosPendientes && (
              <button
                type="button"
                onClick={() => setTemaSeleccionado(temaActual)}
                disabled={guardando}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Descartar
              </button>
            )}

            <button
              type="submit"
              disabled={guardando || !tieneCambiosPendientes}
              className="bg-accent text-accent-foreground px-5 py-2 rounded-md hover:bg-accent-hover font-medium transition-colors disabled:opacity-50 text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {guardando && <Spinner size="sm" color="current" />}
              <span>{guardando ? "Guardando..." : "Guardar cambios"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
