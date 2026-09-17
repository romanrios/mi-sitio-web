export type ContactoData = {
  id?: number;
  ubicacion: string;
  whatsapp: string;
  correo: string;
  linkedin: string;
  github: string;
  actualizadoEn?: string;
};

export const contactoDefault: ContactoData = {
  ubicacion: "Santa Fe, Argentina",
  whatsapp: "+54 9 342 432-4907",
  correo: "romanrios@live.com",
  linkedin: "linkedin.com/in/romanrios",
  github: "github.com/romanrios",
};
