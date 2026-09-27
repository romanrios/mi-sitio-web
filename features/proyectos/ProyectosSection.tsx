import { db } from "@/app/db";
import { proyectoCategorias, proyectos } from "@/app/db/schema";
import ProyectoItem from "@/features/proyectos/ProyectoItem";
import { CATEGORIAS_POR_DEFECTO } from "@/lib/categorias";
import { asc } from "drizzle-orm";

export default async function ProyectosSection() {
  const [todosLosProyectos, categoriasDB] = await Promise.all([
    db.query.proyectos.findMany({
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
    }),
    db.query.proyectoCategorias
      .findMany({
        orderBy: [asc(proyectoCategorias.orden), asc(proyectoCategorias.id)],
      })
      .catch(() => []),
  ]);

  if (todosLosProyectos.length === 0) {
    return null;
  }

  // Lista de nombres de categorías en el orden definido en admin
  const nombresCategorias =
    categoriasDB && categoriasDB.length > 0
      ? categoriasDB.map((c) => c.nombre)
      : [...CATEGORIAS_POR_DEFECTO];

  // Si hay proyectos con categorías que no están en la lista ordenada, añadirlos al final por seguridad
  const categoriasDeProyectos = Array.from(
    new Set(todosLosProyectos.map((p) => p.categoria))
  );
  for (const cat of categoriasDeProyectos) {
    if (cat && !nombresCategorias.includes(cat)) {
      nombresCategorias.push(cat);
    }
  }

  const categoriasConProyectos = nombresCategorias
    .map((cat) => ({
      categoria: cat,
      items: todosLosProyectos.filter((proyecto) => proyecto.categoria === cat),
    }))
    .filter((grupo) => grupo.items.length > 0);

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
