export type TipoGaleria = "imagen" | "youtube" | "vimeo";

export type ProyectoGaleriaItem = {
  id?: number;
  proyectoId?: number;
  tipo: TipoGaleria;
  url: string;
  orden?: number;
};

export type ProyectoTagItem = {
  id?: number;
  proyectoId?: number;
  nombre: string;
  orden?: number;
};

export type ProyectoEnlaceItem = {
  id?: number;
  proyectoId?: number;
  etiqueta: string;
  url: string;
  orden?: number;
};

export type ProyectoData = {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  orden: number;
  creadoEn?: string;
  galeria?: ProyectoGaleriaItem[];
  tags?: ProyectoTagItem[];
  enlaces?: ProyectoEnlaceItem[];
};

export function extraerYoutubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export function obtenerYoutubeEmbedUrl(urlOrId: string): string {
  const videoId = extraerYoutubeId(urlOrId);
  return `https://www.youtube.com/embed/${videoId}`;
}

export function extraerVimeoId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  const regExp =
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)(?:\/([a-zA-Z0-9]+))?)/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[2] ? `${match[1]}?h=${match[2]}` : match[1];
  }
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export function obtenerVimeoEmbedUrl(urlOrId: string): string {
  const videoIdWithParams = extraerVimeoId(urlOrId);
  if (videoIdWithParams.includes("transparent=")) {
    return `https://player.vimeo.com/video/${videoIdWithParams}`;
  }
  const separator = videoIdWithParams.includes("?") ? "&" : "?";
  return `https://player.vimeo.com/video/${videoIdWithParams}${separator}transparent=0`;
}
