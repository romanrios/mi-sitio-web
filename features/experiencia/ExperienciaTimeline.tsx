"use client";

import Card from "@/components/ui/Card";
import {
  ExperienciaData,
  formatearPeriodo,
  TIPO_LABELS,
  TipoExperiencia,
} from "@/lib/experiencias-utils";
import { useState } from "react";

type FiltroTipo = "todas" | TipoExperiencia;

const FILTROS: { id: FiltroTipo; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "laboral", label: "Laboral" },
  { id: "academica", label: "Académica" },
  { id: "curso", label: "Cursos" },
];

export default function ExperienciaTimeline({
  experiencias,
}: {
  experiencias: ExperienciaData[];
}) {
  const [filtro, setFiltro] = useState<FiltroTipo>("todas");

  const experienciasFiltradas = experiencias.filter((exp) => {
    if (filtro === "todas") return true;
    return exp.tipo === filtro;
  });

  function getBadgeClasses(tipo: TipoExperiencia) {
    switch (tipo) {
      case "laboral":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "academica":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "curso":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  }

  function getDotColor(tipo: TipoExperiencia) {
    switch (tipo) {
      case "laboral":
        return "bg-accent";
      case "academica":
        return "bg-emerald-500";
      case "curso":
        return "bg-amber-500";
    }
  }

  return (
    <div className="w-full">
      {/* Filtros simples */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 text-sm scrollbar-none">
        {FILTROS.map((f) => {
          const isSelected = filtro === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                isSelected
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Lista vacía por filtro */}
      {experienciasFiltradas.length === 0 && (
        <p className="text-muted-subtle text-center py-8 text-sm">
          No hay experiencias registradas en esta categoría.
        </p>
      )}

      {/* Timeline unificada */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-border space-y-8">
        {experienciasFiltradas.map((exp) => {
          const esActiva =
            exp.actualmente ||
            (exp.posiciones && exp.posiciones.some((p) => p.actualmente));

          return (
            <div key={exp.id} className="relative group">
              {/* Nodo sobre la línea de tiempo */}
              <div
                className={`absolute -left-7.75 sm:-left-9.75 top-4 w-3.5 h-3.5 rounded-full border-2 border-background transition-transform group-hover:scale-125 ${getDotColor(
                  exp.tipo
                )} ${esActiva ? "ring-4 ring-accent/20" : ""}`}
                title={esActiva ? "Actualmente en curso" : undefined}
              />

              {/* Contenido de la experiencia */}
              <Card className="p-5 sm:p-6 transition-shadow hover:shadow-md">
                {/* Encabezado: Tipo, Período y Estado */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs rounded border font-medium ${getBadgeClasses(
                        exp.tipo
                      )}`}
                    >
                      {TIPO_LABELS[exp.tipo]}
                    </span>
                    {esActiva && (
                      <span className="inline-block px-2 py-0.5 text-[11px] rounded bg-green-500/10 text-green-700 dark:text-green-300 font-medium">
                        En curso
                      </span>
                    )}
                  </div>

                  <span className="text-xs sm:text-sm text-muted-subtle font-medium">
                    {formatearPeriodo(
                      exp.fechaInicio,
                      exp.fechaFin,
                      exp.actualmente
                    )}
                  </span>
                </div>

                {/* Título principal */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {exp.titulo}
                </h3>

                {/* Descripción general */}
                {exp.descripcion && (
                  <p className="text-sm text-muted mt-2.5 leading-relaxed whitespace-pre-line">
                    {exp.descripcion}
                  </p>
                )}

                {/* Cargos / Posiciones agrupadas */}
                {exp.posiciones && exp.posiciones.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border space-y-3">
                    <h4 className="text-xs font-semibold text-muted-subtle uppercase tracking-wider">
                      Cargos y trayectorias
                    </h4>

                    <div className="relative pl-3.5 border-l border-border-strong space-y-3">
                      {exp.posiciones.map((pos, idx) => (
                        <div key={pos.id ?? idx} className="relative">
                          {/* Pequeño punto conector para cada cargo */}
                          <div className="absolute -left-4.5 top-1.5 w-1.5 h-1.5 rounded-full bg-muted-faint" />

                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                            <span className="font-semibold text-foreground text-sm">
                              {pos.titulo}
                            </span>
                            <span className="text-xs text-muted-subtle font-medium shrink-0">
                              {formatearPeriodo(
                                pos.fechaInicio,
                                pos.fechaFin,
                                pos.actualmente
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

