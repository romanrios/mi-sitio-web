import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type TemaDefault = "dark" | "light" | "system";

export const configuracion = sqliteTable("configuracion", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  temaDefault: text("tema_default").notNull().default("dark"),
  actualizadoEn: text("actualizado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export type ConfiguracionDB = typeof configuracion.$inferSelect;
export type ConfiguracionInsert = typeof configuracion.$inferInsert;
