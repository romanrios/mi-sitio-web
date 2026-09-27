"use client";

import Spinner from "@/components/ui/Spinner";
import { ProyectoCategoria } from "@/lib/categorias";
import { useState } from "react";

type ModalCategoriasProps = {
  isOpen: boolean;
  onClose: () => void;
  categorias: ProyectoCategoria[];
  onCategoriasChange: (nuevas: ProyectoCategoria[]) => void;
  onCategoriaRenombrada: (viejoNombre: string, nuevoNombre: string) => void;
  onCategoriaEliminada: (id: number) => void;
};

export default function ModalCategorias({
  isOpen,
  onClose,
  categorias,
  onCategoriasChange,
  onCategoriaRenombrada,
  onCategoriaEliminada,
}: ModalCategoriasProps) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEditar, setErrorEditar] = useState("");

  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardandoOrden, setGuardandoOrden] = useState(false);

  // Drag & drop de categorías dentro del modal
  const [arrastrandoIndex, setArrastrandoIndex] = useState<number | null>(null);
  const [posicionSobreIndex, setPosicionSobreIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  async function persistirOrdenCategorias(lista: ProyectoCategoria[]) {
    setGuardandoOrden(true);
    setErrorGeneral("");
    try {
      const res = await fetch("/api/proyectos/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lista.map((c, idx) => ({ id: c.id, orden: idx })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorGeneral(err.error || "Error al guardar orden de categorías.");
      }
    } catch (err) {
      console.error("Error al persistir orden:", err);
      setErrorGeneral("Error de red al guardar orden.");
    } finally {
      setGuardandoOrden(false);
    }
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const limpio = nuevoNombre.trim();
    if (!limpio) return;

    setCreando(true);
    setErrorCrear("");
    setErrorGeneral("");

    try {
      const res = await fetch("/api/proyectos/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: limpio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorCrear(data.error || "Error al crear categoría.");
        return;
      }

      const nuevaLista = [...categorias, data];
      onCategoriasChange(nuevaLista);
      setNuevoNombre("");
    } catch (err) {
      console.error("Error al crear categoría:", err);
      setErrorCrear("Error de conexión al crear categoría.");
    } finally {
      setCreando(false);
    }
  }

  function comenzarEdicion(cat: ProyectoCategoria) {
    setEditandoId(cat.id);
    setNombreEditado(cat.nombre);
    setErrorEditar("");
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombreEditado("");
    setErrorEditar("");
  }

  async function guardarEdicion(id: number, viejoNombre: string) {
    const limpio = nombreEditado.trim();
    if (!limpio) {
      setErrorEditar("El nombre no puede estar vacío.");
      return;
    }

    if (limpio === viejoNombre) {
      cancelarEdicion();
      return;
    }

    setGuardandoEdicion(true);
    setErrorEditar("");
    try {
      const res = await fetch(`/api/proyectos/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: limpio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorEditar(data.error || "Error al actualizar categoría.");
        return;
      }

      const listaActualizada = categorias.map((c) =>
        c.id === id ? { ...c, nombre: limpio } : c
      );
      onCategoriasChange(listaActualizada);
      onCategoriaRenombrada(viejoNombre, limpio);
      cancelarEdicion();
    } catch (err) {
      console.error("Error al guardar edición:", err);
      setErrorEditar("Error de conexión al guardar.");
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function handleEliminar(cat: ProyectoCategoria) {
    if (cat.totalProyectos && cat.totalProyectos > 0) {
      alert(
        `No se puede eliminar la categoría "${cat.nombre}" porque tiene ${cat.totalProyectos} proyecto(s) asignado(s). Reasigna o elimina los proyectos antes de eliminarla.`
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`
    );
    if (!confirmar) return;

    setEliminandoId(cat.id);
    setErrorGeneral("");
    try {
      const res = await fetch(`/api/proyectos/categorias/${cat.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorGeneral(data.error || "Error al eliminar categoría.");
        return;
      }

      const listaActualizada = categorias.filter((c) => c.id !== cat.id);
      onCategoriasChange(listaActualizada);
      onCategoriaEliminada(cat.id);
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      setErrorGeneral("Error de conexión al eliminar.");
    } finally {
      setEliminandoId(null);
    }
  }

  function moverPaso(index: number, delta: -1 | 1) {
    const nuevoIndex = index + delta;
    if (nuevoIndex < 0 || nuevoIndex >= categorias.length) return;

    const copia = [...categorias];
    const [removido] = copia.splice(index, 1);
    copia.splice(nuevoIndex, 0, removido);

    const reordenadas = copia.map((c, idx) => ({ ...c, orden: idx }));
    onCategoriasChange(reordenadas);
    persistirOrdenCategorias(reordenadas);
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setArrastrandoIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (posicionSobreIndex !== index) {
      setPosicionSobreIndex(index);
    }
  }

  function handleDrop(e: React.DragEvent, destinoIndex: number) {
    e.preventDefault();
    const origenIndex = arrastrandoIndex;
    setArrastrandoIndex(null);
    setPosicionSobreIndex(null);

    if (origenIndex === null || origenIndex === destinoIndex) return;

    const copia = [...categorias];
    const [removido] = copia.splice(origenIndex, 1);
    copia.splice(destinoIndex, 0, removido);

    const reordenadas = copia.map((c, idx) => ({ ...c, orden: idx }));
    onCategoriasChange(reordenadas);
    persistirOrdenCategorias(reordenadas);
  }

  function handleDragEnd() {
    setArrastrandoIndex(null);
    setPosicionSobreIndex(null);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-categorias-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-hover/40">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📁</span>
            <div>
              <h2
                id="modal-categorias-title"
                className="text-base sm:text-lg font-bold text-foreground leading-tight"
              >
                Gestionar categorías de proyectos
              </h2>
              <p className="text-xs text-muted-subtle mt-0.5">
                Crea, renombra y ordena cómo se muestran en el sitio web.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-muted hover:text-foreground p-1.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Formulario para agregar nueva categoría */}
          <form onSubmit={handleCrear} className="space-y-2">
            <label
              htmlFor="nueva-categoria-input"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Nueva categoría
            </label>
            <div className="flex gap-2">
              <input
                id="nueva-categoria-input"
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="ej. Inteligencia Artificial, Aplicaciones Móviles..."
                disabled={creando}
                className="flex-1 text-sm border border-border-strong bg-surface rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-faint"
              />
              <button
                type="submit"
                disabled={creando || !nuevoNombre.trim()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {creando ? (
                  <>
                    <Spinner size="sm" color="current" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <span>+</span>
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </div>
            {errorCrear && (
              <p className="text-xs text-error font-medium">{errorCrear}</p>
            )}
          </form>

          {/* Estado general / avisos */}
          {guardandoOrden && (
            <div className="flex items-center gap-2 text-xs text-muted font-medium bg-surface-hover/80 px-3 py-1.5 rounded-md border border-border">
              <Spinner size="sm" color="current" />
              <span>Guardando nuevo orden en tiempo real...</span>
            </div>
          )}

          {errorGeneral && (
            <div className="p-2.5 rounded-lg bg-error/10 border border-error/20 text-xs text-error">
              {errorGeneral}
            </div>
          )}

          {/* Lista de categorías ordenables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Categorías ({categorias.length})
              </span>
              <span className="text-xs text-muted-subtle">
                Arrastra o usa las flechas para ordenar
              </span>
            </div>

            {categorias.length === 0 ? (
              <p className="text-sm text-muted-faint italic py-4 text-center">
                No hay categorías registradas.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {categorias.map((cat, index) => {
                  const estaEditando = editandoId === cat.id;
                  const estaEliminando = eliminandoId === cat.id;
                  const tieneProyectos = (cat.totalProyectos ?? 0) > 0;

                  return (
                    <div
                      key={cat.id}
                      draggable={!estaEditando}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                        arrastrandoIndex === index
                          ? "opacity-30 border-dashed border-accent bg-accent/5"
                          : posicionSobreIndex === index && arrastrandoIndex !== index
                          ? "border-accent bg-surface-hover shadow-sm"
                          : "bg-surface border-border hover:border-border-strong hover:bg-surface-hover/30"
                      }`}
                    >
                      {/* Lado izquierdo: Handle / Flechas de orden */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Indicador de posición */}
                        <span className="text-xs font-mono font-bold text-muted-subtle w-5 text-center">
                          {index + 1}
                        </span>

                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => moverPaso(index, -1)}
                            disabled={index === 0 || guardandoOrden}
                            aria-label={`Mover ${cat.nombre} arriba`}
                            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moverPaso(index, 1)}
                            disabled={index === categorias.length - 1 || guardandoOrden}
                            aria-label={`Mover ${cat.nombre} abajo`}
                            className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Centro: Nombre o formulario de edición */}
                      <div className="flex-1 min-w-0">
                        {estaEditando ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={nombreEditado}
                                onChange={(e) => setNombreEditado(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    guardarEdicion(cat.id, cat.nombre);
                                  } else if (e.key === "Escape") {
                                    cancelarEdicion();
                                  }
                                }}
                                className="w-full text-sm font-medium border border-accent bg-surface rounded px-2.5 py-1 text-foreground focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => guardarEdicion(cat.id, cat.nombre)}
                                disabled={guardandoEdicion}
                                className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded font-medium hover:bg-accent-hover transition-colors cursor-pointer shrink-0"
                              >
                                {guardandoEdicion ? "..." : "Guardar"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={guardandoEdicion}
                                className="text-xs text-muted hover:text-foreground px-2 py-1 rounded hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
                              >
                                Cancelar
                              </button>
                            </div>
                            {errorEditar && (
                              <p className="text-xs text-error font-medium">
                                {errorEditar}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {cat.nombre}
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                tieneProyectos
                                  ? "bg-accent/10 border-accent/20 text-accent font-semibold"
                                  : "bg-surface-hover border-border text-muted"
                              }`}
                            >
                              {cat.totalProyectos ?? 0}{" "}
                              {cat.totalProyectos === 1 ? "proyecto" : "proyectos"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lado derecho: Acciones (Editar / Eliminar) */}
                      {!estaEditando && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => comenzarEdicion(cat)}
                            title="Renombrar categoría"
                            aria-label={`Renombrar ${cat.nombre}`}
                            className="p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminar(cat)}
                            disabled={estaEliminando || tieneProyectos}
                            title={
                              tieneProyectos
                                ? `No se puede eliminar porque contiene ${cat.totalProyectos} proyecto(s).`
                                : "Eliminar categoría"
                            }
                            aria-label={`Eliminar ${cat.nombre}`}
                            className="p-1.5 rounded text-muted hover:text-error hover:bg-error/10 disabled:opacity-30 disabled:hover:text-muted disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            {estaEliminando ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-surface-hover/20">
          <p className="text-xs text-muted-subtle">
            Los cambios de orden y nombres se aplican automáticamente en la web.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="bg-accent text-accent-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
