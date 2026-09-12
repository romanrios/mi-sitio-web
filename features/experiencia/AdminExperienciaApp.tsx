"use client";

import Card from "@/components/ui/Card";
import {
  ExperienciaData,
  formatearPeriodo,
  TIPO_LABELS,
  TipoExperiencia,
  TIPOS_EXPERIENCIA,
} from "@/lib/experiencias-utils";
import { useEffect, useState } from "react";

type PosicionFormItem = {
  id?: number;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  actualmente: boolean;
  soloAnioInicio?: boolean;
  soloAnioFin?: boolean;
};

function esSoloAnio(fecha: string | null | undefined): boolean {
  return Boolean(fecha && /^\d{4}$/.test(fecha.trim()));
}

export default function AdminExperienciaApp() {
  const [experiencias, setExperiencias] = useState<ExperienciaData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Formulario principal
  const [tipo, setTipo] = useState<TipoExperiencia>("laboral");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [actualmente, setActualmente] = useState(false);
  const [soloAnioInicio, setSoloAnioInicio] = useState(false);
  const [soloAnioFin, setSoloAnioFin] = useState(false);

  // Cargos / Posiciones
  const [posiciones, setPosiciones] = useState<PosicionFormItem[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargarExperiencias() {
    try {
      const res = await fetch("/api/experiencias");
      if (res.ok) {
        const data = await res.json();
        setExperiencias(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    fetch("/api/experiencias")
      .then((res) => res.json())
      .then((data) => {
        setExperiencias(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setCargando(false);
      });
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTipo("laboral");
    setTitulo("");
    setDescripcion("");
    setFechaInicio("");
    setFechaFin("");
    setActualmente(false);
    setSoloAnioInicio(false);
    setSoloAnioFin(false);
    setPosiciones([]);
    setError("");
  }

  function cargarEnFormulario(exp: ExperienciaData) {
    setEditandoId(exp.id);
    setTipo(exp.tipo);
    setTitulo(exp.titulo);
    setDescripcion(exp.descripcion ?? "");
    setFechaInicio(exp.fechaInicio);
    setFechaFin(exp.fechaFin ?? "");
    setActualmente(exp.actualmente);
    setSoloAnioInicio(esSoloAnio(exp.fechaInicio));
    setSoloAnioFin(esSoloAnio(exp.fechaFin));
    setPosiciones(
      (exp.posiciones ?? []).map((p) => ({
        id: p.id,
        titulo: p.titulo,
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin ?? "",
        actualmente: p.actualmente,
        soloAnioInicio: esSoloAnio(p.fechaInicio),
        soloAnioFin: esSoloAnio(p.fechaFin),
      }))
    );
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function agregarPosicion() {
    setPosiciones((prev) => [
      ...prev,
      {
        titulo: "",
        fechaInicio: "",
        fechaFin: "",
        actualmente: false,
        soloAnioInicio: false,
        soloAnioFin: false,
      },
    ]);
  }

  function actualizarPosicion<K extends keyof PosicionFormItem>(
    index: number,
    campo: K,
    valor: PosicionFormItem[K]
  ) {
    setPosiciones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      if (campo === "actualmente" && valor === true) {
        copy[index].fechaFin = "";
      }
      return copy;
    });
  }

  function eliminarPosicion(index: number) {
    setPosiciones((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    if (!titulo.trim()) {
      setError("El título es requerido.");
      setGuardando(false);
      return;
    }

    if (!fechaInicio) {
      setError("La fecha de inicio es requerida.");
      setGuardando(false);
      return;
    }

    if (soloAnioInicio && !/^\d{4}$/.test(fechaInicio)) {
      setError("El año de inicio debe tener 4 dígitos (ej: 2023).");
      setGuardando(false);
      return;
    }

    if (!actualmente && fechaFin && soloAnioFin && !/^\d{4}$/.test(fechaFin)) {
      setError("El año de finalización debe tener 4 dígitos (ej: 2024).");
      setGuardando(false);
      return;
    }

    // Validar cargos si existen
    for (let i = 0; i < posiciones.length; i++) {
      const pos = posiciones[i];
      if (!pos.titulo.trim()) {
        setError(`El cargo #${i + 1} necesita un título.`);
        setGuardando(false);
        return;
      }
      if (!pos.fechaInicio) {
        setError(`El cargo #${i + 1} necesita una fecha de inicio.`);
        setGuardando(false);
        return;
      }
      if (pos.soloAnioInicio && !/^\d{4}$/.test(pos.fechaInicio)) {
        setError(
          `El año de inicio del cargo #${i + 1} debe tener 4 dígitos (ej: 2023).`
        );
        setGuardando(false);
        return;
      }
      if (
        !pos.actualmente &&
        pos.fechaFin &&
        pos.soloAnioFin &&
        !/^\d{4}$/.test(pos.fechaFin)
      ) {
        setError(
          `El año de fin del cargo #${i + 1} debe tener 4 dígitos (ej: 2024).`
        );
        setGuardando(false);
        return;
      }
    }

    const payload = {
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      fechaInicio,
      fechaFin: actualmente ? null : fechaFin || null,
      actualmente,
      posiciones: posiciones.map((p) => ({
        titulo: p.titulo.trim(),
        fechaInicio: p.fechaInicio,
        fechaFin: p.actualmente ? null : p.fechaFin || null,
        actualmente: p.actualmente,
      })),
    };

    const url = editandoId
      ? `/api/experiencias/${editandoId}`
      : "/api/experiencias";
    const method = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ocurrió un error al guardar.");
        setGuardando(false);
        return;
      }

      limpiarFormulario();
      await cargarExperiencias();
    } catch {
      setError("Error de red al guardar la experiencia.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id: number) {
    if (
      !confirm(
        "¿Seguro que quieres borrar esta experiencia? Se eliminarán también sus cargos asociados."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/experiencias/${id}`, { method: "DELETE" });
      if (res.ok) {
        await cargarExperiencias();
        if (editandoId === id) limpiarFormulario();
      } else {
        const data = await res.json();
        alert(data.error ?? "Error al borrar la experiencia.");
      }
    } catch {
      alert("Error de conexión al intentar borrar.");
    }
  }

  function renderBadge(t: TipoExperiencia) {
    const styles: Record<TipoExperiencia, string> = {
      laboral:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      academica:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      curso:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs rounded border font-medium ${styles[t]}`}
      >
        {TIPO_LABELS[t]}
      </span>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {editandoId
          ? `Editando experiencia #${editandoId}`
          : "Nueva experiencia"}
      </h2>

      <form onSubmit={guardar}>
        <Card className="p-4 mb-8 space-y-4">
          {/* Tipo de experiencia */}
          <div>
            <label className="block text-sm text-muted mb-1.5 font-medium">
              Tipo de experiencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS_EXPERIENCIA.map((item) => {
                const isSelected = tipo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipo(item.id)}
                    className={`py-2 px-3 text-sm font-medium rounded-md border text-center transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-surface text-muted border-border-strong hover:bg-surface-hover"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">
              Título o Institución / Empresa
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Ministerio de Trabajo, Universidad de Buenos Aires, etc."
              required
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalles sobre las tareas, responsabilidades o contenidos aprendidos..."
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Período general */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-muted font-medium">
                  Fecha de inicio
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soloAnioInicio}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSoloAnioInicio(checked);
                      if (checked && fechaInicio.includes("-")) {
                        setFechaInicio(fechaInicio.slice(0, 4));
                      } else if (!checked && /^\d{4}$/.test(fechaInicio)) {
                        setFechaInicio(`${fechaInicio}-01`);
                      }
                    }}
                    className="rounded border-border-strong text-accent focus:ring-ring"
                  />
                  Solo año
                </label>
              </div>
              {soloAnioInicio ? (
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  placeholder="AAAA (ej: 2023)"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value.slice(0, 4))}
                  required
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <input
                  type="month"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-muted font-medium">
                  Fecha de finalización
                </label>
                <div className="flex items-center gap-3">
                  {!actualmente && (
                    <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={soloAnioFin}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSoloAnioFin(checked);
                          if (checked && fechaFin.includes("-")) {
                            setFechaFin(fechaFin.slice(0, 4));
                          } else if (!checked && /^\d{4}$/.test(fechaFin)) {
                            setFechaFin(`${fechaFin}-01`);
                          }
                        }}
                        className="rounded border-border-strong text-accent focus:ring-ring"
                      />
                      Solo año
                    </label>
                  )}
                  <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={actualmente}
                      onChange={(e) => {
                        setActualmente(e.target.checked);
                        if (e.target.checked) setFechaFin("");
                      }}
                      className="rounded border-border-strong text-accent focus:ring-ring"
                    />
                    Actualmente en curso
                  </label>
                </div>
              </div>
              {soloAnioFin ? (
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  placeholder="AAAA (ej: 2024)"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value.slice(0, 4))}
                  disabled={actualmente}
                  className={`w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    actualmente ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              ) : (
                <input
                  type="month"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={actualmente}
                  className={`w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    actualmente ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              )}
            </div>
          </div>

          {/* Gestión de Posiciones / Cargos */}
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Cargos o posiciones específicas (opcional)
                </h3>
                <p className="text-xs text-muted-subtle">
                  Permite desglosar diferentes roles o ascensos dentro de la misma
                  experiencia.
                </p>
              </div>
              <button
                type="button"
                onClick={agregarPosicion}
                className="text-xs bg-surface border border-border-strong text-accent hover:bg-surface-hover px-2.5 py-1.5 rounded-md font-medium transition-colors"
              >
                + Agregar cargo
              </button>
            </div>

            {posiciones.length > 0 && (
              <div className="space-y-3 mt-3">
                {posiciones.map((pos, index) => (
                  <div
                    key={index}
                    className="p-3 bg-surface-hover rounded-md border border-border space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted">
                        Cargo #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarPosicion(index)}
                        className="text-xs text-error hover:underline"
                      >
                        Eliminar cargo
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={pos.titulo}
                        onChange={(e) =>
                          actualizarPosicion(index, "titulo", e.target.value)
                        }
                        placeholder="Ej: Asistente Técnico - Diseño"
                        required
                        className="w-full border border-border-strong bg-surface rounded-md px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs text-muted">
                            Inicio
                          </label>
                          <label className="flex items-center gap-1 text-[11px] text-muted cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={pos.soloAnioInicio ?? false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                actualizarPosicion(index, "soloAnioInicio", checked);
                                if (checked && pos.fechaInicio.includes("-")) {
                                  actualizarPosicion(
                                    index,
                                    "fechaInicio",
                                    pos.fechaInicio.slice(0, 4)
                                  );
                                } else if (!checked && /^\d{4}$/.test(pos.fechaInicio)) {
                                  actualizarPosicion(
                                    index,
                                    "fechaInicio",
                                    `${pos.fechaInicio}-01`
                                  );
                                }
                              }}
                              className="rounded border-border-strong text-accent focus:ring-ring"
                            />
                            Solo año
                          </label>
                        </div>
                        {pos.soloAnioInicio ? (
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            placeholder="AAAA (ej: 2023)"
                            value={pos.fechaInicio}
                            onChange={(e) =>
                              actualizarPosicion(
                                index,
                                "fechaInicio",
                                e.target.value.slice(0, 4)
                              )
                            }
                            required
                            className="w-full border border-border-strong bg-surface rounded-md px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <input
                            type="month"
                            value={pos.fechaInicio}
                            onChange={(e) =>
                              actualizarPosicion(
                                index,
                                "fechaInicio",
                                e.target.value
                              )
                            }
                            required
                            className="w-full border border-border-strong bg-surface rounded-md px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-muted">Fin</label>
                          <div className="flex items-center gap-2">
                            {!pos.actualmente && (
                              <label className="flex items-center gap-1 text-[11px] text-muted cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={pos.soloAnioFin ?? false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    actualizarPosicion(index, "soloAnioFin", checked);
                                    if (checked && pos.fechaFin.includes("-")) {
                                      actualizarPosicion(
                                        index,
                                        "fechaFin",
                                        pos.fechaFin.slice(0, 4)
                                      );
                                    } else if (!checked && /^\d{4}$/.test(pos.fechaFin)) {
                                      actualizarPosicion(
                                        index,
                                        "fechaFin",
                                        `${pos.fechaFin}-01`
                                      );
                                    }
                                  }}
                                  className="rounded border-border-strong text-accent focus:ring-ring"
                                />
                                Solo año
                              </label>
                            )}
                            <label className="flex items-center gap-1 text-[11px] text-muted cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={pos.actualmente}
                                onChange={(e) =>
                                  actualizarPosicion(
                                    index,
                                    "actualmente",
                                    e.target.checked
                                  )
                                }
                                className="rounded border-border-strong text-accent focus:ring-ring"
                              />
                              En curso
                            </label>
                          </div>
                        </div>
                        {pos.soloAnioFin ? (
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            placeholder="AAAA (ej: 2024)"
                            value={pos.fechaFin}
                            onChange={(e) =>
                              actualizarPosicion(
                                index,
                                "fechaFin",
                                e.target.value.slice(0, 4)
                              )
                            }
                            disabled={pos.actualmente}
                            className={`w-full border border-border-strong bg-surface rounded-md px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                              pos.actualmente ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          />
                        ) : (
                          <input
                            type="month"
                            value={pos.fechaFin}
                            onChange={(e) =>
                              actualizarPosicion(
                                index,
                                "fechaFin",
                                e.target.value
                              )
                            }
                            disabled={pos.actualmente}
                            className={`w-full border border-border-strong bg-surface rounded-md px-2.5 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                              pos.actualmente ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {guardando
                ? "Guardando..."
                : editandoId
                ? "Actualizar experiencia"
                : "Crear experiencia"}
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

      {/* Listado de experiencias */}
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Experiencias registradas
      </h2>

      {cargando && <p className="text-muted-subtle text-sm">Cargando...</p>}
      {!cargando && experiencias.length === 0 && (
        <p className="text-muted-subtle text-sm">
          No hay experiencias creadas aún. Podés crear la primera utilizando el
          formulario superior.
        </p>
      )}

      <div className="space-y-3">
        {experiencias.map((exp) => (
          <Card key={exp.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderBadge(exp.tipo)}
                  <span className="text-xs text-muted font-medium">
                    {formatearPeriodo(
                      exp.fechaInicio,
                      exp.fechaFin,
                      exp.actualmente
                    )}
                  </span>
                  {exp.actualmente && (
                    <span className="inline-block px-1.5 py-0.2 text-[10px] rounded bg-green-500/10 text-green-700 dark:text-green-300 font-medium">
                      En curso
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  {exp.titulo}
                </h3>
              </div>

              <div className="flex gap-2 shrink-0 pt-0.5">
                <button
                  onClick={() => cargarEnFormulario(exp)}
                  className="text-sm text-accent hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrar(exp.id)}
                  className="text-sm text-error hover:underline"
                >
                  Borrar
                </button>
              </div>
            </div>

            {exp.descripcion && (
              <p className="text-sm text-muted line-clamp-2">
                {exp.descripcion}
              </p>
            )}

            {exp.posiciones && exp.posiciones.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <p className="text-xs font-semibold text-muted-subtle">
                  Cargos asociados ({exp.posiciones.length}):
                </p>
                <ul className="space-y-1 pl-2">
                  {exp.posiciones.map((pos, i) => (
                    <li
                      key={pos.id ?? i}
                      className="text-xs text-muted flex items-center justify-between"
                    >
                      <span className="font-medium">• {pos.titulo}</span>
                      <span className="text-muted-faint text-[11px]">
                        {formatearPeriodo(
                          pos.fechaInicio,
                          pos.fechaFin,
                          pos.actualmente
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

