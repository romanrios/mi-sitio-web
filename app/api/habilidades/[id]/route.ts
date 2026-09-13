import { db } from "@/app/db";
import {
  habilidadesSecciones,
  habilidadesSubsecciones,
  habilidadesTags,
} from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { asc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const seccionId = parseInt(id, 10);

  if (isNaN(seccionId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json();

  if (!body.nombre || typeof body.nombre !== "string" || !body.nombre.trim()) {
    return NextResponse.json(
      { error: "El nombre de la sección es requerido." },
      { status: 400 }
    );
  }

  // Validar subsecciones si existen
  if (body.subsecciones && Array.isArray(body.subsecciones)) {
    for (let i = 0; i < body.subsecciones.length; i++) {
      const sub = body.subsecciones[i];
      if (!sub.nombre || typeof sub.nombre !== "string" || !sub.nombre.trim()) {
        return NextResponse.json(
          { error: `La subsección #${i + 1} debe tener un nombre.` },
          { status: 400 }
        );
      }
      if (sub.tags && Array.isArray(sub.tags)) {
        for (let j = 0; j < sub.tags.length; j++) {
          const tag = sub.tags[j];
          if (
            !tag.nombre ||
            typeof tag.nombre !== "string" ||
            !tag.nombre.trim()
          ) {
            return NextResponse.json(
              {
                error: `El tag #${j + 1} en la subsección "${sub.nombre}" debe tener un nombre.`,
              },
              { status: 400 }
            );
          }
        }
      }
    }
  }

  const ahora = new Date().toISOString();
  const ordenSeccion = typeof body.orden === "number" ? body.orden : 0;

  // Actualizar sección
  const actualizada = await db
    .update(habilidadesSecciones)
    .set({
      nombre: body.nombre.trim(),
      orden: ordenSeccion,
    })
    .where(eq(habilidadesSecciones.id, seccionId))
    .returning();

  if (actualizada.length === 0) {
    return NextResponse.json(
      { error: "Sección no encontrada." },
      { status: 404 }
    );
  }

  // Sincronizar: eliminar subsecciones y tags anteriores
  const subseccionesExistentes = await db.query.habilidadesSubsecciones.findMany({
    where: eq(habilidadesSubsecciones.seccionId, seccionId),
    columns: { id: true },
  });

  if (subseccionesExistentes.length > 0) {
    const subIds = subseccionesExistentes.map((s) => s.id);
    await db
      .delete(habilidadesTags)
      .where(inArray(habilidadesTags.subseccionId, subIds));

    await db
      .delete(habilidadesSubsecciones)
      .where(eq(habilidadesSubsecciones.seccionId, seccionId));
  }

  // Re-insertar subsecciones y tags
  if (body.subsecciones && Array.isArray(body.subsecciones)) {
    for (let i = 0; i < body.subsecciones.length; i++) {
      const sub = body.subsecciones[i];
      const ordenSub = typeof sub.orden === "number" ? sub.orden : i;

      const [nuevaSubseccion] = await db
        .insert(habilidadesSubsecciones)
        .values({
          seccionId,
          nombre: sub.nombre.trim(),
          orden: ordenSub,
          creadoEn: ahora,
        })
        .returning();

      if (sub.tags && Array.isArray(sub.tags) && sub.tags.length > 0) {
        const tagsAInsertar = sub.tags.map(
          (tag: { nombre: string; destacada?: boolean; orden?: number }, j: number) => ({
            subseccionId: nuevaSubseccion.id,
            nombre: tag.nombre.trim(),
            destacada:
              typeof tag.destacada === "boolean" ? tag.destacada : true,
            orden: typeof tag.orden === "number" ? tag.orden : j,
            creadoEn: ahora,
          })
        );

        await db.insert(habilidadesTags).values(tagsAInsertar);
      }
    }
  }

  const actualizadaConRelaciones = await db.query.habilidadesSecciones.findFirst({
    where: eq(habilidadesSecciones.id, seccionId),
    with: {
      subsecciones: {
        orderBy: [
          asc(habilidadesSubsecciones.orden),
          asc(habilidadesSubsecciones.id),
        ],
        with: {
          tags: {
            orderBy: [asc(habilidadesTags.orden), asc(habilidadesTags.id)],
          },
        },
      },
    },
  });

  return NextResponse.json(actualizadaConRelaciones);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const seccionId = parseInt(id, 10);

  if (isNaN(seccionId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const eliminada = await db
    .delete(habilidadesSecciones)
    .where(eq(habilidadesSecciones.id, seccionId))
    .returning();

  if (eliminada.length === 0) {
    return NextResponse.json(
      { error: "Sección no encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
