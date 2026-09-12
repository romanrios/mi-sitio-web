import { db } from "@/app/db";
import { cards } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { esCategoriaValida } from "@/lib/categorias";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const todasLasCards = await db.select().from(cards).orderBy(asc(cards.orden));
  return NextResponse.json(todasLasCards);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 403 }
    );
  }

  const body = await request.json();

  if (
    !body.titulo ||
    !body.descripcion ||
    !body.imagenUrl ||
    typeof body.titulo !== "string" ||
    typeof body.descripcion !== "string" ||
    typeof body.imagenUrl !== "string"
  ) {
    return NextResponse.json(
      { error: "titulo, descripcion e imagenUrl son requeridos." },
      { status: 400 }
    );
  }

  if (!body.categoria || typeof body.categoria !== "string" || !esCategoriaValida(body.categoria)) {
    return NextResponse.json(
      { error: "Categoría inválida o no permitida." },
      { status: 400 }
    );
  }

  const nuevaCard = await db
    .insert(cards)
    .values({
      titulo: body.titulo,
      descripcion: body.descripcion,
      imagenUrl: body.imagenUrl,
      categoria: body.categoria,
      orden: typeof body.orden === "number" ? body.orden : 0,
      creadoEn: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(nuevaCard[0], { status: 201 });
}