import { CATEGORIA_POR_DEFECTO } from "@/lib/categorias";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const proyectos = sqliteTable("proyectos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  imagenUrl: text("imagen_url").notNull(),
  categoria: text("categoria").notNull().default(CATEGORIA_POR_DEFECTO),
  orden: integer("orden").notNull().default(0),
  creadoEn: text("creado_en")
    .notNull()
    .default(new Date().toISOString()),
});

export const proyectoGaleria = sqliteTable("proyecto_galeria", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proyectoId: integer("proyecto_id")
    .notNull()
    .references(() => proyectos.id, { onDelete: "cascade" }),
  tipo: text("tipo", { enum: ["imagen", "youtube", "vimeo"] }).notNull(),
  url: text("url").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const proyectoTags = sqliteTable("proyecto_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proyectoId: integer("proyecto_id")
    .notNull()
    .references(() => proyectos.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const proyectoEnlaces = sqliteTable("proyecto_enlaces", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proyectoId: integer("proyecto_id")
    .notNull()
    .references(() => proyectos.id, { onDelete: "cascade" }),
  etiqueta: text("etiqueta").notNull(),
  url: text("url").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const proyectosRelations = relations(proyectos, ({ many }) => ({
  galeria: many(proyectoGaleria),
  tags: many(proyectoTags),
  enlaces: many(proyectoEnlaces),
}));

export const proyectoGaleriaRelations = relations(proyectoGaleria, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [proyectoGaleria.proyectoId],
    references: [proyectos.id],
  }),
}));

export const proyectoTagsRelations = relations(proyectoTags, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [proyectoTags.proyectoId],
    references: [proyectos.id],
  }),
}));

export const proyectoEnlacesRelations = relations(proyectoEnlaces, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [proyectoEnlaces.proyectoId],
    references: [proyectos.id],
  }),
}));
