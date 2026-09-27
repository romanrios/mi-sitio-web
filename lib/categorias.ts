export const CATEGORIAS_POR_DEFECTO = [
  "Desarrollo web y software",
  "Desarrollo de videojuegos",
  "Diseño y comunicación",
] as const;

export const CATEGORIAS = CATEGORIAS_POR_DEFECTO;

export type Categoria = string;

export const CATEGORIA_POR_DEFECTO: string = "Desarrollo web y software";

export type ProyectoCategoria = {
  id: number;
  nombre: string;
  orden: number;
  creadoEn?: string;
  totalProyectos?: number;
};

export function esCategoriaValida(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

