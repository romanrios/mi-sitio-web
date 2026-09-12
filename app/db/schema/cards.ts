import { CATEGORIA_POR_DEFECTO } from "@/lib/categorias";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
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

export const cardGaleria = sqliteTable("card_galeria", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  tipo: text("tipo", { enum: ["imagen", "youtube", "vimeo"] }).notNull(),
  url: text("url").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const cardTags = sqliteTable("card_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const cardEnlaces = sqliteTable("card_enlaces", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  etiqueta: text("etiqueta").notNull(),
  url: text("url").notNull(),
  orden: integer("orden").notNull().default(0),
});

export const cardsRelations = relations(cards, ({ many }) => ({
  galeria: many(cardGaleria),
  tags: many(cardTags),
  enlaces: many(cardEnlaces),
}));

export const cardGaleriaRelations = relations(cardGaleria, ({ one }) => ({
  card: one(cards, {
    fields: [cardGaleria.cardId],
    references: [cards.id],
  }),
}));

export const cardTagsRelations = relations(cardTags, ({ one }) => ({
  card: one(cards, {
    fields: [cardTags.cardId],
    references: [cards.id],
  }),
}));

export const cardEnlacesRelations = relations(cardEnlaces, ({ one }) => ({
  card: one(cards, {
    fields: [cardEnlaces.cardId],
    references: [cards.id],
  }),
}));
