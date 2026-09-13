import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const habilidadesSecciones = sqliteTable("habilidades_secciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const habilidadesSubsecciones = sqliteTable("habilidades_subsecciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seccionId: integer("seccion_id")
    .notNull()
    .references(() => habilidadesSecciones.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const habilidadesTags = sqliteTable("habilidades_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subseccionId: integer("subseccion_id")
    .notNull()
    .references(() => habilidadesSubsecciones.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  destacada: integer("destacada", { mode: "boolean" }).notNull().default(true),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const habilidadesSeccionesRelations = relations(
  habilidadesSecciones,
  ({ many }) => ({
    subsecciones: many(habilidadesSubsecciones),
  })
);

export const habilidadesSubseccionesRelations = relations(
  habilidadesSubsecciones,
  ({ one, many }) => ({
    seccion: one(habilidadesSecciones, {
      fields: [habilidadesSubsecciones.seccionId],
      references: [habilidadesSecciones.id],
    }),
    tags: many(habilidadesTags),
  })
);

export const habilidadesTagsRelations = relations(
  habilidadesTags,
  ({ one }) => ({
    subseccion: one(habilidadesSubsecciones, {
      fields: [habilidadesTags.subseccionId],
      references: [habilidadesSubsecciones.id],
    }),
  })
);
