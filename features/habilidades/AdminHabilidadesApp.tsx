"use client";

import Card from "@/components/ui/Card";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Spinner from "@/components/ui/Spinner";
import { HabilidadSeccionData } from "@/lib/habilidades-utils";
import { useEffect, useState } from "react";

type TagFormItem = {
  id?: number;
  nombre: string;
  destacada: boolean;
};

type SubseccionFormItem = {
  id?: number;
  nombre: string;
  tags: TagFormItem[];
};

export default function AdminHabilidadesApp() {
  const [secciones, setSecciones] = useState<HabilidadSeccionData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Campos de formulario
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
  const [subsecciones, setSubsecciones] = useState<SubseccionFormItem[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargarSecciones() {
    try {
      const res = await fetch("/api/habilidades");
      if (res.ok) {
        const data = await res.json();
        setSecciones(data);
      }
    } catch (err) {
      console.error("Error al cargar habilidades:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let ignorar = false;
    async function inicializar() {
      try {
        const res = await fetch("/api/habilidades");
        if (res.ok) {
          const data = await res.json();
          if (!ignorar) setSecciones(data);
        }
      } catch (err) {
        console.error("Error al cargar habilidades:", err);
      } finally {
        if (!ignorar) setCargando(false);
      }
    }
    inicializar();
    return () => {
      ignorar = true;
    };
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre("");
    setOrden(0);
    setSubsecciones([]);
    setError("");
  }

  function cargarEnFormulario(sec: HabilidadSeccionData) {
    setEditandoId(sec.id);
    setNombre(sec.nombre);
    setOrden(sec.orden);
    setSubsecciones(
      (sec.subsecciones ?? []).map((sub) => ({
        id: sub.id,
        nombre: sub.nombre,
        tags: (sub.tags ?? []).map((tag) => ({
          id: tag.id,
          nombre: tag.nombre,
          destacada: tag.destacada,
        })),
      }))
    );
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Manejo de Subsecciones
  function agregarSubseccion() {
    setSubsecciones((prev) => [
      ...prev,
      {
        nombre: "",
        tags: [],
      },
    ]);
  }

  function eliminarSubseccion(subIdx: number) {
    setSubsecciones((prev) => prev.filter((_, i) => i !== subIdx));
  }

  function actualizarSubseccionNombre(subIdx: number, valor: string) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      copy[subIdx] = { ...copy[subIdx], nombre: valor };
      return copy;
    });
  }

  // Reordenamiento de Subsecciones
  function moverSubseccion(origenIdx: number, destinoIdx: number) {
    setSubsecciones((prev) => {
      if (
        destinoIdx < 0 ||
        destinoIdx >= prev.length ||
        origenIdx === destinoIdx
      ) {
        return prev;
      }
      const copy = [...prev];
      const [itemRemovido] = copy.splice(origenIdx, 1);
      copy.splice(destinoIdx, 0, itemRemovido);
      return copy;
    });
  }

  function moverSubseccionPaso(subIdx: number, delta: -1 | 1) {
    moverSubseccion(subIdx, subIdx + delta);
  }

  // Manejo de Tags
  function agregarTag(subIdx: number) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      const tags = [...copy[subIdx].tags, { nombre: "", destacada: true }];
      copy[subIdx] = { ...copy[subIdx], tags };
      return copy;
    });
  }

  function eliminarTag(subIdx: number, tagIdx: number) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      const tags = copy[subIdx].tags.filter((_, i) => i !== tagIdx);
      copy[subIdx] = { ...copy[subIdx], tags };
      return copy;
    });
  }

  function actualizarTagNombre(subIdx: number, tagIdx: number, valor: string) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      const tags = [...copy[subIdx].tags];
      tags[tagIdx] = { ...tags[tagIdx], nombre: valor };
      copy[subIdx] = { ...copy[subIdx], tags };
      return copy;
    });
  }

  function toggleTagDestacada(subIdx: number, tagIdx: number) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      const tags = [...copy[subIdx].tags];
      tags[tagIdx] = { ...tags[tagIdx], destacada: !tags[tagIdx].destacada };
      copy[subIdx] = { ...copy[subIdx], tags };
      return copy;
    });
  }

  // Reordenamiento de Tags / Habilidades
  const [arrastrandoTag, setArrastrandoTag] = useState<{
    subIdx: number;
    tagIdx: number;
  } | null>(null);
  const [posicionSobreTag, setPosicionSobreTag] = useState<{
    subIdx: number;
    tagIdx: number;
  } | null>(null);

  function moverTag(subIdx: number, origenIdx: number, destinoIdx: number) {
    setSubsecciones((prev) => {
      const copy = [...prev];
      const tags = [...copy[subIdx].tags];
      if (
        destinoIdx < 0 ||
        destinoIdx >= tags.length ||
        origenIdx === destinoIdx
      ) {
        return prev;
      }
      const [itemRemovido] = tags.splice(origenIdx, 1);
      tags.splice(destinoIdx, 0, itemRemovido);
      copy[subIdx] = { ...copy[subIdx], tags };
      return copy;
    });
  }

  function moverTagPaso(subIdx: number, tagIdx: number, delta: -1 | 1) {
    moverTag(subIdx, tagIdx, tagIdx + delta);
  }

  function handleTagDragStart(e: React.DragEvent, subIdx: number, tagIdx: number) {
    setArrastrandoTag({ subIdx, tagIdx });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${subIdx}:${tagIdx}`);
  }

  function handleTagDragOver(e: React.DragEvent, subIdx: number, tagIdx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      !posicionSobreTag ||
      posicionSobreTag.subIdx !== subIdx ||
      posicionSobreTag.tagIdx !== tagIdx
    ) {
      setPosicionSobreTag({ subIdx, tagIdx });
    }
  }

  function handleTagDrop(e: React.DragEvent, subIdx: number, destinoIdx: number) {
    e.preventDefault();
    if (
      arrastrandoTag &&
      arrastrandoTag.subIdx === subIdx &&
      arrastrandoTag.tagIdx !== destinoIdx
    ) {
      moverTag(subIdx, arrastrandoTag.tagIdx, destinoIdx);
    }
    setArrastrandoTag(null);
    setPosicionSobreTag(null);
  }

  function handleTagDragEnd() {
    setArrastrandoTag(null);
    setPosicionSobreTag(null);
  }

  // Reordenamiento de Secciones registradas
  const [reordenandoSeccionId, setReordenandoSeccionId] = useState<number | null>(null);

  async function moverSeccion(secIdx: number, delta: -1 | 1) {
    const targetIdx = secIdx + delta;
    if (targetIdx < 0 || targetIdx >= secciones.length) return;

    const secActual = secciones[secIdx];
    const secVecina = secciones[targetIdx];
    setReordenandoSeccionId(secActual.id);

    try {
      let nuevoOrdenActual = secVecina.orden;
      const nuevoOrdenVecina = secActual.orden;
      if (nuevoOrdenActual === nuevoOrdenVecina) {
        nuevoOrdenActual = delta === -1 ? secVecina.orden - 1 : secVecina.orden + 1;
      }

      await Promise.all([
        fetch(`/api/habilidades/${secActual.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: secActual.nombre,
            orden: nuevoOrdenActual,
            subsecciones: (secActual.subsecciones ?? []).map((sub, sIdx) => ({
              nombre: sub.nombre,
              orden: sIdx,
              tags: (sub.tags ?? []).map((t, tIdx) => ({
                nombre: t.nombre,
                destacada: t.destacada,
                orden: tIdx,
              })),
            })),
          }),
        }),
        fetch(`/api/habilidades/${secVecina.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: secVecina.nombre,
            orden: nuevoOrdenVecina,
            subsecciones: (secVecina.subsecciones ?? []).map((sub, sIdx) => ({
              nombre: sub.nombre,
              orden: sIdx,
              tags: (sub.tags ?? []).map((t, tIdx) => ({
                nombre: t.nombre,
                destacada: t.destacada,
                orden: tIdx,
              })),
            })),
          }),
        }),
      ]);

      await cargarSecciones();
    } catch (err) {
      console.error("Error al reordenar secciones:", err);
    } finally {
      setReordenandoSeccionId(null);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    if (!nombre.trim()) {
      setError("El nombre de la sección es obligatorio.");
      setGuardando(false);
      return;
    }

    // Validar subsecciones
    for (let i = 0; i < subsecciones.length; i++) {
      const sub = subsecciones[i];
      if (!sub.nombre.trim()) {
        setError(`La subsección #${i + 1} no puede tener un nombre vacío.`);
        setGuardando(false);
        return;
      }
      for (let j = 0; j < sub.tags.length; j++) {
        const tag = sub.tags[j];
        if (!tag.nombre.trim()) {
          setError(
            `El tag #${j + 1} en "${sub.nombre}" no puede tener un nombre vacío.`
          );
          setGuardando(false);
          return;
        }
      }
    }

    const payload = {
      nombre: nombre.trim(),
      orden: Number(orden) || 0,
      subsecciones: subsecciones.map((sub, sIdx) => ({
        nombre: sub.nombre.trim(),
        orden: sIdx,
        tags: sub.tags.map((tag, tIdx) => ({
          nombre: tag.nombre.trim(),
          destacada: tag.destacada,
          orden: tIdx,
        })),
      })),
    };

    const url = editandoId
      ? `/api/habilidades/${editandoId}`
      : "/api/habilidades";
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ocurrió un error al guardar la sección.");
        setGuardando(false);
        return;
      }

      limpiarFormulario();
      await cargarSecciones();
    } catch {
      setError("Error de conexión al intentar guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id: number, nombreSec: string) {
    if (
      !confirm(
        `¿Seguro que deseas eliminar la sección "${nombreSec}"? Se borrarán también todas sus subsecciones y habilidades asociadas.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/habilidades/${id}`, { method: "DELETE" });
      if (res.ok) {
        await cargarSecciones();
        if (editandoId === id) limpiarFormulario();
      } else {
        const data = await res.json();
        alert(data.error ?? "Error al eliminar la sección.");
      }
    } catch {
      alert("Error de conexión al eliminar la sección.");
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {editandoId ? `Editando sección #${editandoId}` : "Nueva sección de habilidades"}
      </h2>

      {/* Formulario Principal */}
      <form onSubmit={guardar}>
        <Card className="p-5 mb-8 space-y-5">
          {/* Nombre de la sección */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-sm text-muted mb-1 font-medium">
                Nombre de la Sección
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Desarrollo, Diseño, Habilidades Transversales"
                required
                className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1 font-medium">
                Orden
              </label>
              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Subsecciones */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Subsecciones
                </h3>
                <p className="text-xs text-muted-subtle">
                  Agrupa las habilidades por categorías internas (ej: Frontend, Backend).
                </p>
              </div>
              <button
                type="button"
                onClick={agregarSubseccion}
                className="text-xs bg-surface hover:bg-surface-hover text-accent font-medium px-3 py-1.5 rounded-md border border-border transition-colors flex items-center gap-1"
              >
                + Agregar subsección
              </button>
            </div>

            {subsecciones.length === 0 && (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-muted-subtle bg-surface-hover/30">
                Aún no agregaste subsecciones a esta categoría.
              </div>
            )}

            <div className="space-y-4">
              {subsecciones.map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 rounded-lg bg-surface border border-border-strong space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => moverSubseccionPaso(sIdx, -1)}
                          className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Subir subsección"
                          aria-label={`Subir subsección ${sIdx + 1}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === subsecciones.length - 1}
                          onClick={() => moverSubseccionPaso(sIdx, 1)}
                          className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Bajar subsección"
                          aria-label={`Bajar subsección ${sIdx + 1}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Subsección #{sIdx + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarSubseccion(sIdx)}
                      className="text-xs text-error hover:underline cursor-pointer"
                    >
                      Quitar subsección
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={sub.nombre}
                      onChange={(e) =>
                        actualizarSubseccionNombre(sIdx, e.target.value)
                      }
                      placeholder="Ej: Frontend, Backend, UI/UX, Metodologías"
                      required
                      className="w-full border border-border-strong bg-surface rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Tags dentro de la subsección */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted">
                        Habilidades / Tags ({sub.tags.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => agregarTag(sIdx)}
                        className="text-[11px] text-accent font-medium hover:underline"
                      >
                        + Agregar habilidad
                      </button>
                    </div>

                    {sub.tags.length === 0 && (
                      <p className="text-[11px] text-muted-subtle italic">
                        Sin tags. Haz clic en &quot;+ Agregar habilidad&quot; para añadir uno.
                      </p>
                    )}

                    <div className="space-y-2">
                      {sub.tags.map((tag, tIdx) => (
                        <div
                          key={tIdx}
                          draggable
                          onDragStart={(e) => handleTagDragStart(e, sIdx, tIdx)}
                          onDragOver={(e) => handleTagDragOver(e, sIdx, tIdx)}
                          onDrop={(e) => handleTagDrop(e, sIdx, tIdx)}
                          onDragEnd={handleTagDragEnd}
                          className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                            arrastrandoTag?.subIdx === sIdx && arrastrandoTag?.tagIdx === tIdx
                              ? "opacity-40 border-dashed border-accent bg-accent/5"
                              : posicionSobreTag?.subIdx === sIdx &&
                                posicionSobreTag?.tagIdx === tIdx &&
                                arrastrandoTag?.tagIdx !== tIdx
                              ? "border-accent bg-surface-hover shadow-xs"
                              : "bg-surface-hover/50 border-border hover:border-border-strong"
                          }`}
                        >
                          {/* Controles de orden */}
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={tIdx === 0}
                              onClick={() => moverTagPaso(sIdx, tIdx, -1)}
                              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Subir habilidad"
                              aria-label={`Subir habilidad ${tIdx + 1}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>

                            <span
                              className="text-[10px] font-mono font-semibold text-muted-subtle cursor-grab active:cursor-grabbing select-none px-1 py-0.5 rounded hover:bg-surface"
                              title="Arrastrar para reordenar"
                            >
                              #{tIdx + 1}
                            </span>

                            <button
                              type="button"
                              disabled={tIdx === sub.tags.length - 1}
                              onClick={() => moverTagPaso(sIdx, tIdx, 1)}
                              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Bajar habilidad"
                              aria-label={`Bajar habilidad ${tIdx + 1}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {/* Manija de arrastre */}
                          <div
                            className="text-muted-faint hover:text-muted cursor-grab active:cursor-grabbing select-none hidden sm:block shrink-0"
                            title="Arrastrar para reordenar"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm6-16a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>

                          <input
                            type="text"
                            value={tag.nombre}
                            onChange={(e) =>
                              actualizarTagNombre(sIdx, tIdx, e.target.value)
                            }
                            placeholder="Ej: TypeScript, React, Docker"
                            required
                            className="flex-1 min-w-0 border border-border-strong bg-surface rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />

                          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none px-2 py-1 rounded bg-surface border border-border shrink-0 hover:bg-surface-hover transition-colors">
                            <input
                              type="checkbox"
                              checked={tag.destacada}
                              onChange={() => toggleTagDestacada(sIdx, tIdx)}
                              className="rounded border-border-strong text-accent focus:ring-ring"
                            />
                            <span className={tag.destacada ? "font-medium text-foreground" : "text-muted-subtle"}>
                              Destacada
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => eliminarTag(sIdx, tIdx)}
                            className="text-muted hover:text-error p-1 rounded transition-colors text-sm shrink-0 cursor-pointer"
                            title="Eliminar habilidad"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-error font-medium">{error}</p>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 text-sm font-medium transition-colors flex items-center gap-2"
            >
              {guardando && <Spinner size="sm" color="current" />}
              <span>
                {guardando
                  ? "Guardando..."
                  : editandoId
                    ? "Actualizar sección"
                    : "Crear sección"}
              </span>
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="text-muted px-4 py-2 rounded-md hover:bg-surface-hover text-sm transition-colors"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </Card>
      </form>

      {/* Listado de Secciones Creadas */}
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Secciones registradas
      </h2>

      {cargando && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} variant="default" />
          ))}
        </div>
      )}

      {!cargando && secciones.length === 0 && (
        <p className="text-muted-subtle text-sm">
          No hay secciones de habilidades creadas aún. Podés crear la primera utilizando el formulario superior.
        </p>
      )}

      {!cargando && secciones.length > 0 && (
        <div className="space-y-4">
          {secciones.map((sec, secIdx) => (
          <Card key={sec.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-base">
                    {sec.nombre}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-hover text-muted-subtle font-medium border border-border">
                    Orden: {sec.orden}
                  </span>
                </div>
                <span className="text-xs text-muted-subtle">
                  {sec.subsecciones?.length || 0} subsecciones
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 mr-1">
                  <button
                    type="button"
                    disabled={secIdx === 0 || reordenandoSeccionId !== null}
                    onClick={() => moverSeccion(secIdx, -1)}
                    className="p-1.5 rounded hover:bg-surface-hover text-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-border transition-colors"
                    title="Subir sección"
                    aria-label={`Subir sección ${sec.nombre}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    disabled={secIdx === secciones.length - 1 || reordenandoSeccionId !== null}
                    onClick={() => moverSeccion(secIdx, 1)}
                    className="p-1.5 rounded hover:bg-surface-hover text-muted hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-border transition-colors"
                    title="Bajar sección"
                    aria-label={`Bajar sección ${sec.nombre}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => cargarEnFormulario(sec)}
                  className="text-sm text-accent hover:underline cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrar(sec.id, sec.nombre)}
                  className="text-sm text-error hover:underline cursor-pointer"
                >
                  Borrar
                </button>
              </div>
            </div>

            {/* Vista jerárquica de subsecciones y tags */}
            {sec.subsecciones && sec.subsecciones.length > 0 ? (
              <div className="space-y-3 pt-1">
                {sec.subsecciones.map((sub) => (
                  <div key={sub.id || sub.nombre} className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      {sub.nombre}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sub.tags && sub.tags.length > 0 ? (
                        sub.tags.map((tag) => (
                          <span
                            key={tag.id || tag.nombre}
                            className={`inline-flex items-center rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-foreground transition-all ${tag.destacada
                                ? "px-2.5 py-0.5 text-xs"
                                : "px-2 py-0.5 text-[9px]"
                              }`}
                          >
                            {tag.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-subtle italic">
                          Sin habilidades
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-subtle italic">
                Sin subsecciones asociadas.
              </p>
            )}
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}
