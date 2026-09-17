import { db } from "@/app/db";
import {
  habilidadesSecciones,
  habilidadesSubsecciones,
  habilidadesTags,
} from "@/app/db/schema";
import { asc } from "drizzle-orm";

export default async function HabilidadesSection() {
  const secciones = await db.query.habilidadesSecciones.findMany({
    orderBy: [asc(habilidadesSecciones.orden), asc(habilidadesSecciones.id)],
    with: {
      subsecciones: {
        orderBy: (subsecciones, { asc }) => [
          asc(subsecciones.orden),
          asc(subsecciones.id),
        ],
        with: {
          tags: {
            orderBy: (tags, { asc }) => [asc(tags.orden), asc(tags.id)],
          },
        },
      },
    },
  });

  if (secciones.length === 0) {
    return null;
  }

  return (
    <section
      id="habilidades"
      className="w-full bg-hero-bg border-y border-border py-16 sm:py-20 px-4 scroll-mt-16 flex justify-center"
    >
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-6">Habilidades</h2>

        <div className="space-y-8">
          {secciones.map((seccion) => (
            <div key={seccion.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                {seccion.nombre}
              </h3>

              {seccion.subsecciones && seccion.subsecciones.length > 0 ? (
                <div className="space-y-5 pl-1">
                  {seccion.subsecciones.map((sub) => (
                    <div key={sub.id} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-subtle">
                        {sub.nombre}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2">
                        {sub.tags && sub.tags.length > 0
                          ? sub.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className={`inline-flex items-center rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-foreground hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-accent transition-colors ${tag.destacada
                                ? "px-3 py-1 text-sm"
                                : "px-2.5 py-0.5 text-[10px]"
                                }`}
                            >
                              {tag.nombre}
                            </span>
                          ))
                          : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
