import { db } from "@/app/db";
import { cards } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { esCategoriaValida } from "@/lib/categorias";
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
  const cardId = parseInt(id, 10);

  if (isNaN(cardId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json();

  if (body.categoria !== undefined) {
    if (typeof body.categoria !== "string" || !esCategoriaValida(body.categoria)) {
      return NextResponse.json(
        { error: "Categoría inválida o no permitida." },
        { status: 400 }
      );
    }
  }

  const actualizada = await db
    .update(cards)
    .set({
      titulo: body.titulo,
      descripcion: body.descripcion,
      imagenUrl: body.imagenUrl,
      ...(body.categoria ? { categoria: body.categoria } : {}),
      orden: typeof body.orden === "number" ? body.orden : 0,
    })
    .where(eq(cards.id, cardId))
    .returning();

  if (actualizada.length === 0) {
    return NextResponse.json({ error: "Card no encontrada." }, { status: 404 });
  }

  return NextResponse.json(actualizada[0]);
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
  const cardId = parseInt(id, 10);

  if (isNaN(cardId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const eliminada = await db
    .delete(cards)
    .where(eq(cards.id, cardId))
    .returning();

  if (eliminada.length === 0) {
    return NextResponse.json({ error: "Card no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}