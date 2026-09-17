import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contacto = sqliteTable("contacto", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ubicacion: text("ubicacion").notNull(),
  whatsapp: text("whatsapp").notNull(),
  correo: text("correo").notNull(),
  linkedin: text("linkedin").notNull(),
  github: text("github").notNull(),
  actualizadoEn: text("actualizado_en")
    .notNull()
    .default(new Date().toISOString()),
});
