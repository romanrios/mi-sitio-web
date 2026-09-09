import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mensajes = sqliteTable("mensajes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contenido: text("contenido").notNull(),
  autor: text("autor"),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});
