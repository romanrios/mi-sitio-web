export const CATEGORIAS = [
  "Desarrollo de web y software",
  "Desarrollo de videojuegos",
  "Diseño y comunicación",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORIA_POR_DEFECTO: Categoria = "Desarrollo de web y software";

export function esCategoriaValida(valor: unknown): valor is Categoria {
  return typeof valor === "string" && (CATEGORIAS as readonly string[]).includes(valor);
}
