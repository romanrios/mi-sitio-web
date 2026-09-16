export type HeroData = {
  id?: number;
  imagenUrl: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  actualizadoEn?: string;
};

export const heroDefault: HeroData = {
  imagenUrl: "https://romanrios.github.io/assets/images/perfil.png",
  titulo: "Román Ríos",
  subtitulo: "Desarrollador de Software /\nDiseñador de Comunicación Visual",
  descripcion:
    "Desarrollador de Software y Diseñador de Comunicación Visual, con foco en desarrollo web y diseño multimedia.\nActualmente me desempeño como Asistente Técnico en el Ministerio de Trabajo de Santa Fe, creando piezas gráficas, digitales y audiovisuales para proyectos institucionales.\nProfesional colaborativo y adaptable, enfocado en el aprendizaje continuo y en aportar valor a cada proyecto.",
};
