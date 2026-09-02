import { db } from "@/app/db";
import { cards } from "@/app/db/schema";
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
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col"
          >
            <img
              src={card.imagenUrl}
              alt={card.titulo}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-1">
                {card.titulo}
              </h3>
              <p className="text-sm text-gray-600 flex-1">
                {card.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}