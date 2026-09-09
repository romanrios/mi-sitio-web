import { db } from "@/app/db";
import { cards } from "@/app/db/schema";
import CardItem from "@/features/cards/CardItem";
import { asc } from "drizzle-orm";

export default async function CardsSection() {
  const todasLasCards = await db.select().from(cards).orderBy(asc(cards.orden));

  if (todasLasCards.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl mt-4 mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {todasLasCards.map((card) => (
          <CardItem
            key={card.id}
            titulo={card.titulo}
            descripcion={card.descripcion}
            imagenUrl={card.imagenUrl}
          />
        ))}
      </div>
    </section>
  );
}
