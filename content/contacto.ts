export type TipoContacto =
  | "ubicacion"
  | "whatsapp"
  | "correo"
  | "telefono"
  | "linkedin"
  | "github"
  | "sitio"
  | "instagram"
  | "x"
  | "youtube"
  | "telegram"
  | "otro";

export type ContactoItem = {
  id: number;
  tipo: TipoContacto | string;
  titulo?: string | null;
  valor: string;
  url?: string | null;
  orden: number;
  creadoEn?: string;
};

export const TIPOS_CONTACTO: {
  tipo: TipoContacto;
  label: string;
  placeholderValor: string;
  placeholderUrl: string;
}[] = [
  {
    tipo: "whatsapp",
    label: "WhatsApp",
    placeholderValor: "+54 9 342 432-4907",
    placeholderUrl: "https://wa.me/5493424324907 (opcional)",
  },
  {
    tipo: "correo",
    label: "Correo electrónico",
    placeholderValor: "romanrios@live.com",
    placeholderUrl: "mailto:romanrios@live.com (opcional)",
  },
  {
    tipo: "ubicacion",
    label: "Ubicación",
    placeholderValor: "Santa Fe, Argentina",
    placeholderUrl: "https://maps.google.com/?q=... (opcional)",
  },
  {
    tipo: "telefono",
    label: "Teléfono",
    placeholderValor: "+54 9 342 432-4907",
    placeholderUrl: "tel:+5493424324907 (opcional)",
  },
  {
    tipo: "linkedin",
    label: "LinkedIn",
    placeholderValor: "linkedin.com/in/romanrios",
    placeholderUrl: "https://linkedin.com/in/romanrios",
  },
  {
    tipo: "github",
    label: "GitHub",
    placeholderValor: "github.com/romanrios",
    placeholderUrl: "https://github.com/romanrios",
  },
  {
    tipo: "sitio",
    label: "Sitio Web",
    placeholderValor: "romanrios.dev",
    placeholderUrl: "https://romanrios.dev",
  },
  {
    tipo: "instagram",
    label: "Instagram",
    placeholderValor: "@romanrios",
    placeholderUrl: "https://instagram.com/romanrios",
  },
  {
    tipo: "x",
    label: "X (Twitter)",
    placeholderValor: "@romanrios",
    placeholderUrl: "https://x.com/romanrios",
  },
  {
    tipo: "youtube",
    label: "YouTube",
    placeholderValor: "youtube.com/@romanrios",
    placeholderUrl: "https://youtube.com/@romanrios",
  },
  {
    tipo: "telegram",
    label: "Telegram",
    placeholderValor: "t.me/romanrios",
    placeholderUrl: "https://t.me/romanrios",
  },
  {
    tipo: "otro",
    label: "Otro enlace",
    placeholderValor: "Mi enlace",
    placeholderUrl: "https://ejemplo.com",
  },
];

export function resolverUrlContacto(
  tipo: string,
  valor: string,
  urlPersonalizada?: string | null
): string {
  if (urlPersonalizada && urlPersonalizada.trim()) {
    const url = urlPersonalizada.trim();
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    ) {
      return url;
    }
    return `https://${url}`;
  }

  const v = valor.trim();
  switch (tipo.toLowerCase()) {
    case "whatsapp":
      return `https://wa.me/${v.replace(/\D/g, "")}`;
    case "correo":
      return `mailto:${v}`;
    case "ubicacion":
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
    case "telefono":
      return `tel:${v.replace(/\s+/g, "")}`;
    case "instagram": {
      const handle = v
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
      return `https://instagram.com/${handle}`;
    }
    case "x": {
      const handle = v
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "");
      return `https://x.com/${handle}`;
    }
    case "telegram": {
      const handle = v
        .replace(/^@/, "")
        .replace(/^https?:\/\/(www\.)?t\.me\//, "");
      return `https://t.me/${handle}`;
    }
    case "youtube": {
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      return `https://${v.replace(/^https?:\/\//, "")}`;
    }
    case "linkedin":
    case "github":
    case "sitio":
    case "otro":
    default:
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      return `https://${v}`;
  }
}

export const contactoItemsDefault: ContactoItem[] = [
  {
    id: 1,
    tipo: "ubicacion",
    titulo: "Ubicación",
    valor: "Santa Fe, Argentina",
    url: "https://www.google.com/maps/search/?api=1&query=Santa+Fe%2C+Argentina",
    orden: 1,
  },
  {
    id: 2,
    tipo: "whatsapp",
    titulo: "WhatsApp",
    valor: "+54 9 342 432-4907",
    url: "https://wa.me/5493424324907",
    orden: 2,
  },
  {
    id: 3,
    tipo: "correo",
    titulo: "Correo electrónico",
    valor: "romanrios@live.com",
    url: "mailto:romanrios@live.com",
    orden: 3,
  },
  {
    id: 4,
    tipo: "linkedin",
    titulo: "LinkedIn",
    valor: "linkedin.com/in/romanrios",
    url: "https://linkedin.com/in/romanrios",
    orden: 4,
  },
  {
    id: 5,
    tipo: "github",
    titulo: "GitHub",
    valor: "github.com/romanrios",
    url: "https://github.com/romanrios",
    orden: 5,
  },
];
