import { db } from "@/app/db";
import { experiencias, experienciasPosiciones } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { PosicionData, TipoExperiencia } from "@/lib/experiencias-utils";
import { eq } from "drizzle-orm";
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
  const expId = parseInt(id, 10);

  if (isNaN(expId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json();

  const tiposValidos: TipoExperiencia[] = ["laboral", "academica", "curso"];
  if (!body.tipo || !tiposValidos.includes(body.tipo)) {
    return NextResponse.json(
      { error: "El tipo debe ser 'laboral', 'academica' o 'curso'." },
      { status: 400 }
    );
  }

  if (!body.titulo || typeof body.titulo !== "string" || !body.titulo.trim()) {
    return NextResponse.json(
      { error: "El título es requerido." },
      { status: 400 }
    );
  }

  if (
    !body.fechaInicio ||
    typeof body.fechaInicio !== "string" ||
    !body.fechaInicio.trim()
  ) {
    return NextResponse.json(
      { error: "La fecha de inicio es requerida." },
      { status: 400 }
    );
  }

  // Validar posiciones si se proporcionaron
  if (body.posiciones && Array.isArray(body.posiciones)) {
    for (const pos of body.posiciones) {
      if (!pos.titulo || typeof pos.titulo !== "string" || !pos.titulo.trim()) {
        return NextResponse.json(
          { error: "Cada posición debe tener un título." },
          { status: 400 }
        );
      }
      if (
        !pos.fechaInicio ||
        typeof pos.fechaInicio !== "string" ||
        !pos.fechaInicio.trim()
      ) {
        return NextResponse.json(
          { error: "Cada posición debe tener una fecha de inicio." },
          { status: 400 }
        );
      }
    }
  }

  const ahora = new Date().toISOString();
  const actualmente = Boolean(body.actualmente);
  const fechaFin = actualmente
    ? null
    : body.fechaFin && typeof body.fechaFin === "string" && body.fechaFin.trim()
    ? body.fechaFin.trim()
    : null;

  const actualizada = await db
    .update(experiencias)
    .set({
      tipo: body.tipo,
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() || null,
      fechaInicio: body.fechaInicio.trim(),
      fechaFin,
      actualmente,
      actualizadoEn: ahora,
    })
    .where(eq(experiencias.id, expId))
    .returning();

  if (actualizada.length === 0) {
    return NextResponse.json(
      { error: "Experiencia no encontrada." },
      { status: 404 }
    );
  }

  // Sincronizar posiciones: eliminar anteriores e insertar actualizadas
  await db
    .delete(experienciasPosiciones)
    .where(eq(experienciasPosiciones.experienciaId, expId));

  if (
    body.posiciones &&
    Array.isArray(body.posiciones) &&
    body.posiciones.length > 0
  ) {
    const posicionesAInsertar = (body.posiciones as PosicionData[]).map((pos) => ({
      experienciaId: expId,
      titulo: pos.titulo.trim(),
      fechaInicio: pos.fechaInicio.trim(),
      fechaFin: pos.actualmente
        ? null
        : pos.fechaFin && typeof pos.fechaFin === "string" && pos.fechaFin.trim()
        ? pos.fechaFin.trim()
        : null,
      actualmente: Boolean(pos.actualmente),
      creadoEn: ahora,
    }));

    await db.insert(experienciasPosiciones).values(posicionesAInsertar);
  }

  const actualizadaConPosiciones = await db.query.experiencias.findFirst({
    where: eq(experiencias.id, expId),
    with: {
      posiciones: true,
    },
  });

  return NextResponse.json(actualizadaConPosiciones);
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
  const expId = parseInt(id, 10);

  if (isNaN(expId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const eliminada = await db
    .delete(experiencias)
    .where(eq(experiencias.id, expId))
    .returning();

  if (eliminada.length === 0) {
    return NextResponse.json(
      { error: "Experiencia no encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

