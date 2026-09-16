import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const hero = sqliteTable("hero", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imagenUrl: text("imagen_url").notNull(),
  titulo: text("titulo").notNull(),
  subtitulo: text("subtitulo").notNull(),
  descripcion: text("descripcion").notNull(),
  actualizadoEn: text("actualizado_en")
    .notNull()
    .default(new Date().toISOString()),
});
