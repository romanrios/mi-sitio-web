"use client";

import Card from "@/components/ui/Card";
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
    cargarSecciones();
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
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Subsección #{sIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarSubseccion(sIdx)}
                      className="text-xs text-error hover:underline"
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
                        Sin tags. Haz clic en "+ Agregar habilidad" para añadir uno.
                      </p>
                    )}

                    <div className="space-y-2">
                      {sub.tags.map((tag, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center gap-2 bg-surface-hover/50 p-2 rounded-md border border-border"
                        >
                          <input
                            type="text"
                            value={tag.nombre}
                            onChange={(e) =>
                              actualizarTagNombre(sIdx, tIdx, e.target.value)
                            }
                            placeholder="Ej: TypeScript, React, Docker"
                            required
                            className="flex-1 border border-border-strong bg-surface rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                            className="text-muted hover:text-error p-1 rounded transition-colors text-sm"
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
              className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {guardando
                ? "Guardando..."
                : editandoId
                  ? "Actualizar sección"
                  : "Crear sección"}
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

      {cargando && <p className="text-muted-subtle text-sm">Cargando...</p>}
      {!cargando && secciones.length === 0 && (
        <p className="text-muted-subtle text-sm">
          No hay secciones de habilidades creadas aún. Podés crear la primera utilizando el formulario superior.
        </p>
      )}

      <div className="space-y-4">
        {secciones.map((sec) => (
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

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => cargarEnFormulario(sec)}
                  className="text-sm text-accent hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrar(sec.id, sec.nombre)}
                  className="text-sm text-error hover:underline"
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
    </div>
  );
}
