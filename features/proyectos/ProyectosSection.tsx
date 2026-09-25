import { db } from "@/app/db";
import { proyectos } from "@/app/db/schema";
import ProyectoItem from "@/features/proyectos/ProyectoItem";
import { CATEGORIAS } from "@/lib/categorias";
import { asc } from "drizzle-orm";

export default async function ProyectosSection() {
  const todosLosProyectos = await db.query.proyectos.findMany({
    orderBy: [asc(proyectos.orden)],
    with: {
      galeria: {
        orderBy: (galeria, { asc }) => [asc(galeria.orden)],
      },
      tags: {
        orderBy: (tags, { asc }) => [asc(tags.orden)],
      },
      enlaces: {
        orderBy: (enlaces, { asc }) => [asc(enlaces.orden)],
      },
    },
  });

  if (todosLosProyectos.length === 0) {
    return null;
  }

  const categoriasConProyectos = CATEGORIAS.map((cat) => ({
    categoria: cat,
    items: todosLosProyectos.filter((proyecto) => proyecto.categoria === cat),
  })).filter((grupo) => grupo.items.length > 0);

  if (categoriasConProyectos.length === 0) {
    return null;
  }

  return (
    <section id="proyectos" className="w-full max-w-4xl space-y-10 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground">Proyectos</h2>

      <div className="space-y-12">
        {categoriasConProyectos.map(({ categoria, items }) => (
          <div key={categoria} className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 uppercase mt-15">
              {categoria}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((proyecto) => (
                <ProyectoItem
                  key={proyecto.id}
                  titulo={proyecto.titulo}
                  descripcion={proyecto.descripcion}
                  imagenUrl={proyecto.imagenUrl}
                  galeria={proyecto.galeria}
                  tags={proyecto.tags}
                  enlaces={proyecto.enlaces}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
