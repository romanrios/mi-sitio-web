import { db } from "@/app/db";
import { mensajes } from "@/app/db/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const todos = await db.select().from(mensajes).orderBy(desc(mensajes.id));
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para publicar un mensaje." },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (!body.contenido || typeof body.contenido !== "string") {
    return NextResponse.json(
      { error: "El campo 'contenido' es requerido y debe ser texto." },
      { status: 400 }
    );
  }

  const nuevoMensaje = await db
    .insert(mensajes)
    .values({
      contenido: body.contenido,
      autor: session.user.name ?? session.user.email ?? "Anónimo",
      creadoEn: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(nuevoMensaje[0], { status: 201 });
}