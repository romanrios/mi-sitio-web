import { db } from "@/app/db";
import { cards } from "@/app/db/schema";
import CardItem from "@/features/cards/CardItem";
import { CATEGORIAS } from "@/lib/categorias";
import { asc } from "drizzle-orm";

export default async function CardsSection() {
  const todasLasCards = await db.select().from(cards).orderBy(asc(cards.orden));

  if (todasLasCards.length === 0) {
    return null;
  }

  const categoriasConCards = CATEGORIAS.map((cat) => ({
    categoria: cat,
    items: todasLasCards.filter((card) => card.categoria === cat),
  })).filter((grupo) => grupo.items.length > 0);

  if (categoriasConCards.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl mt-4 mb-16 space-y-12">
      {categoriasConCards.map(({ categoria, items }) => (
        <div key={categoria}>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {categoria}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((card) => (
              <CardItem
                key={card.id}
                titulo={card.titulo}
                descripcion={card.descripcion}
                imagenUrl={card.imagenUrl}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

