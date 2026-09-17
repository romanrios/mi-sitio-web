import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contacto = sqliteTable("contacto", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo").notNull(),
  titulo: text("titulo"),
  valor: text("valor").notNull(),
  url: text("url"),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export type ContactoItemDB = typeof contacto.$inferSelect;
export type ContactoItemInsert = typeof contacto.$inferInsert;
