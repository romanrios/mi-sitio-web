import { db } from "@/app/db";
import { mensajes } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const todos = await db.select().from(mensajes).orderBy(desc(mensajes.id));
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
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
      creadoEn: new Date().toISOString(),
    })
    .returning();

  return NextResponse.json(nuevoMensaje[0], { status: 201 });
}