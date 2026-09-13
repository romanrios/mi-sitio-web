export type HabilidadTagData = {
  id?: number;
  subseccionId?: number;
  nombre: string;
  destacada: boolean;
  orden?: number;
  creadoEn?: string;
};

export type HabilidadSubseccionData = {
  id?: number;
  seccionId?: number;
  nombre: string;
  orden?: number;
  creadoEn?: string;
  tags: HabilidadTagData[];
};

export type HabilidadSeccionData = {
  id: number;
  nombre: string;
  orden: number;
  creadoEn: string;
  subsecciones: HabilidadSubseccionData[];
};
