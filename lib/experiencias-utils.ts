export type TipoExperiencia = "laboral" | "academica" | "curso";

export const TIPOS_EXPERIENCIA: { id: TipoExperiencia; label: string }[] = [
  { id: "laboral", label: "Laboral" },
  { id: "academica", label: "Académica" },
  { id: "curso", label: "Curso" },
];

export const TIPO_LABELS: Record<TipoExperiencia, string> = {
  laboral: "Laboral",
  academica: "Académica",
  curso: "Curso",
};

export type PosicionData = {
  id?: number;
  experienciaId?: number;
  titulo: string;
  fechaInicio: string;
  fechaFin: string | null;
  actualmente: boolean;
  creadoEn?: string;
};

export type ExperienciaData = {
  id: number;
  tipo: TipoExperiencia;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  actualmente: boolean;
  creadoEn: string;
  actualizadoEn: string;
  posiciones?: PosicionData[];
};

const MESES_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return "";

  // Espera formato "YYYY-MM" o "YYYY-MM-DD"
  const match = fecha.match(/^(\d{4})-(\d{2})/);
  if (!match) return fecha;

  const anio = match[1];
  const mesIndex = parseInt(match[2], 10) - 1;

  if (mesIndex >= 0 && mesIndex < 12) {
    return `${MESES_ES[mesIndex]} ${anio}`;
  }

  return fecha;
}

export function formatearPeriodo(
  fechaInicio: string,
  fechaFin?: string | null,
  actualmente?: boolean
): string {
  const inicio = formatearFecha(fechaInicio);

  if (actualmente) {
    return `${inicio} – Actualidad`;
  }

  if (fechaFin) {
    const fin = formatearFecha(fechaFin);
    return `${inicio} – ${fin}`;
  }

  return inicio;
}

export function ordenarPosiciones(posiciones: PosicionData[]): PosicionData[] {
  return [...posiciones].sort((a, b) => {
    // 1. Activas primero
    if (a.actualmente && !b.actualmente) return -1;
    if (!a.actualmente && b.actualmente) return 1;

    // 2. Si ambas son activas, la que inició más recientemente primero
    if (a.actualmente && b.actualmente) {
      return b.fechaInicio.localeCompare(a.fechaInicio);
    }

    // 3. Si ninguna es activa, comparar fecha de finalización descendente
    const finA = a.fechaFin ?? a.fechaInicio;
    const finB = b.fechaFin ?? b.fechaInicio;
    const compFin = finB.localeCompare(finA);
    if (compFin !== 0) return compFin;

    // 4. Desempate por fecha de inicio descendente
    return b.fechaInicio.localeCompare(a.fechaInicio);
  });
}

export function ordenarExperienciasCronologicamente(
  experiencias: ExperienciaData[]
): ExperienciaData[] {
  return [...experiencias]
    .map((exp) => ({
      ...exp,
      posiciones: exp.posiciones ? ordenarPosiciones(exp.posiciones) : [],
    }))
    .sort((a, b) => {
      const aEsActiva =
        a.actualmente || (a.posiciones && a.posiciones.some((p) => p.actualmente));
      const bEsActiva =
        b.actualmente || (b.posiciones && b.posiciones.some((p) => p.actualmente));

      // 1. Experiencias activas van primero
      if (aEsActiva && !bEsActiva) return -1;
      if (!aEsActiva && bEsActiva) return 1;

      // 2. Si ambas son activas, la que inició más recientemente va primero
      if (aEsActiva && bEsActiva) {
        // Obtenemos la fecha de inicio más reciente entre la experiencia y sus posiciones
        const maxInicioA = Math.max(
          ...[a.fechaInicio, ...(a.posiciones?.map((p) => p.fechaInicio) ?? [])].map(
            (f) => new Date(`${f.slice(0, 7)}-01`).getTime()
          )
        );
        const maxInicioB = Math.max(
          ...[b.fechaInicio, ...(b.posiciones?.map((p) => p.fechaInicio) ?? [])].map(
            (f) => new Date(`${f.slice(0, 7)}-01`).getTime()
          )
        );
        if (maxInicioB !== maxInicioA) {
          return maxInicioB - maxInicioA;
        }
        return b.fechaInicio.localeCompare(a.fechaInicio);
      }

      // 3. Ambas finalizadas: comparar fecha de fin más tardía descendente
      const fechasFinA = [
        a.fechaFin ?? a.fechaInicio,
        ...(a.posiciones?.map((p) => p.fechaFin ?? p.fechaInicio) ?? []),
      ].filter(Boolean);
      const fechasFinB = [
        b.fechaFin ?? b.fechaInicio,
        ...(b.posiciones?.map((p) => p.fechaFin ?? p.fechaInicio) ?? []),
      ].filter(Boolean);

      const maxFinA = fechasFinA.sort().reverse()[0] ?? a.fechaInicio;
      const maxFinB = fechasFinB.sort().reverse()[0] ?? b.fechaInicio;

      const compFin = maxFinB.localeCompare(maxFinA);
      if (compFin !== 0) return compFin;

      // 4. Desempate por fecha de inicio descendente
      const compInicio = b.fechaInicio.localeCompare(a.fechaInicio);
      if (compInicio !== 0) return compInicio;

      // 5. Fallback por ID descendente
      return b.id - a.id;
    });
}
