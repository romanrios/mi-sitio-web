import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const experiencias = sqliteTable("experiencias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo").notNull(), // 'laboral' | 'academica' | 'curso'
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  fechaInicio: text("fecha_inicio").notNull(), // Formato ISO "YYYY-MM"
  fechaFin: text("fecha_fin"), // Formato ISO "YYYY-MM" o null
  actualmente: integer("actualmente", { mode: "boolean" }).notNull().default(false),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
  actualizadoEn: text("actualizado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const experienciasPosiciones = sqliteTable("experiencias_posiciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  experienciaId: integer("experiencia_id")
    .notNull()
    .references(() => experiencias.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  fechaInicio: text("fecha_inicio").notNull(), // Formato ISO "YYYY-MM"
  fechaFin: text("fecha_fin"), // Formato ISO "YYYY-MM" o null
  actualmente: integer("actualmente", { mode: "boolean" }).notNull().default(false),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const experienciasRelations = relations(experiencias, ({ many }) => ({
  posiciones: many(experienciasPosiciones),
}));

export const experienciasPosicionesRelations = relations(
  experienciasPosiciones,
  ({ one }) => ({
    experiencia: one(experiencias, {
      fields: [experienciasPosiciones.experienciaId],
      references: [experiencias.id],
    }),
  })
);

