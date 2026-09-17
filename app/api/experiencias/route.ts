import { db } from "@/app/db";
import { experiencias, experienciasPosiciones } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import {
  ExperienciaData,
  ordenarExperienciasCronologicamente,
  PosicionData,
  TipoExperiencia,
} from "@/lib/experiencias-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const todas = await db.query.experiencias.findMany({
    with: {
      posiciones: true,
    },
  });

  const ordenadas = ordenarExperienciasCronologicamente(
    todas as unknown as ExperienciaData[]
  );
  return NextResponse.json(ordenadas);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
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

  const [nuevaExp] = await db
    .insert(experiencias)
    .values({
      tipo: body.tipo,
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() || null,
      fechaInicio: body.fechaInicio.trim(),
      fechaFin,
      actualmente,
      creadoEn: ahora,
      actualizadoEn: ahora,
    })
    .returning();

  if (
    body.posiciones &&
    Array.isArray(body.posiciones) &&
    body.posiciones.length > 0
  ) {
    const posicionesAInsertar = (body.posiciones as PosicionData[]).map((pos) => ({
      experienciaId: nuevaExp.id,
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

  const creadaConPosiciones = await db.query.experiencias.findFirst({
    where: eq(experiencias.id, nuevaExp.id),
    with: {
      posiciones: true,
    },
  });

  revalidatePath("/");
  return NextResponse.json(creadaConPosiciones, { status: 201 });
}
