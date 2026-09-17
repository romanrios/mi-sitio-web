import { db } from "@/app/db";
import { hero } from "@/app/db/schema";
import { auth } from "@/auth";
import { heroDefault } from "@/content/hero";
import { isAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const registro = await db.query.hero.findFirst();
  if (!registro) {
    return NextResponse.json(heroDefault);
  }
  return NextResponse.json(registro);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json();

  if (
    !body.imagenUrl ||
    typeof body.imagenUrl !== "string" ||
    !body.imagenUrl.trim()
  ) {
    return NextResponse.json(
      { error: "La URL de la imagen es requerida." },
      { status: 400 }
    );
  }

  if (
    !body.titulo ||
    typeof body.titulo !== "string" ||
    !body.titulo.trim()
  ) {
    return NextResponse.json(
      { error: "El título es requerido." },
      { status: 400 }
    );
  }

  if (
    !body.subtitulo ||
    typeof body.subtitulo !== "string" ||
    !body.subtitulo.trim()
  ) {
    return NextResponse.json(
      { error: "El subtítulo es requerido." },
      { status: 400 }
    );
  }

  if (
    !body.descripcion ||
    typeof body.descripcion !== "string" ||
    !body.descripcion.trim()
  ) {
    return NextResponse.json(
      { error: "La descripción es requerida." },
      { status: 400 }
    );
  }

  const ahora = new Date().toISOString();
  const existente = await db.query.hero.findFirst();

  if (existente) {
    const [actualizado] = await db
      .update(hero)
      .set({
        imagenUrl: body.imagenUrl.trim(),
        titulo: body.titulo.trim(),
        subtitulo: body.subtitulo.trim(),
        descripcion: body.descripcion.trim(),
        actualizadoEn: ahora,
      })
      .where(eq(hero.id, existente.id))
      .returning();

    revalidatePath("/");
    return NextResponse.json(actualizado);
  }

  const [creado] = await db
    .insert(hero)
    .values({
      imagenUrl: body.imagenUrl.trim(),
      titulo: body.titulo.trim(),
      subtitulo: body.subtitulo.trim(),
      descripcion: body.descripcion.trim(),
      actualizadoEn: ahora,
    })
    .returning();

  revalidatePath("/");
  return NextResponse.json(creado, { status: 201 });
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
