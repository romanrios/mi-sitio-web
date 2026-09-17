import { db } from "@/app/db";
import ExperienciaTimeline from "@/features/experiencia/ExperienciaTimeline";
import {
  ExperienciaData,
  ordenarExperienciasCronologicamente,
} from "@/lib/experiencias-utils";

export default async function ExperienciaSection() {
  const todas = await db.query.experiencias.findMany({
    with: {
      posiciones: true,
    },
  });

  if (todas.length === 0) {
    return null;
  }

  const ordenadas = ordenarExperienciasCronologicamente(
    todas as unknown as ExperienciaData[]
  );

  return (
    <section id="experiencia" className="w-full max-w-2xl scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground mb-6">Experiencia</h2>
      <ExperienciaTimeline experiencias={ordenadas} />
    </section>
  );
}

