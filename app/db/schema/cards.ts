import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  imagenUrl: text("imagen_url").notNull(),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});
