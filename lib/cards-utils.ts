export type TipoGaleria = "imagen" | "youtube" | "vimeo";

export type CardGaleriaItem = {
  id?: number;
  cardId?: number;
  tipo: TipoGaleria;
  url: string;
  orden?: number;
};

export type CardTagItem = {
  id?: number;
  cardId?: number;
  nombre: string;
  orden?: number;
};

export type CardEnlaceItem = {
  id?: number;
  cardId?: number;
  etiqueta: string;
  url: string;
  orden?: number;
};

export type CardData = {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  orden: number;
  creadoEn?: string;
  galeria?: CardGaleriaItem[];
  tags?: CardTagItem[];
  enlaces?: CardEnlaceItem[];
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
  return `https://player.vimeo.com/video/${videoIdWithParams}`;
}
