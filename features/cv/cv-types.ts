export type CvContacto = {
  tipo: string;
  valor: string;
  url: string;
};

export type CvPosicion = {
  id: number;
  titulo: string;
  periodo: string;
  actualmente: boolean;
};

export type CvExperiencia = {
  id: number;
  titulo: string;
  descripcion: string | null;
  periodo: string;
  actualmente: boolean;
  posiciones?: CvPosicion[];
};

export type CvHabilidadTag = {
  id: number;
  nombre: string;
  destacada: boolean;
};

export type CvHabilidadSubseccion = {
  id: number;
  nombre: string;
  tags: CvHabilidadTag[];
};

export type CvHabilidadSeccion = {
  id: number;
  nombre: string;
  subsecciones: CvHabilidadSubseccion[];
};

export type CvCurso = {
  id: number;
  titulo: string;
  descripcion: string | null;
  periodo: string;
};

export type CvIdioma = {
  idioma: string;
  nivel: string;
};

export type CvData = {
  nombre: string;
  rol: string;
  descripcion: string;
  imagenUrl: string;
  contactos: CvContacto[];
  laborales: CvExperiencia[];
  academicas: CvExperiencia[];
  habilidades: CvHabilidadSeccion[];
  cursos: CvCurso[];
  idiomas: CvIdioma[];
};
