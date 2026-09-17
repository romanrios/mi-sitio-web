import { db } from "@/app/db";
import { contacto } from "@/app/db/schema";
import { auth } from "@/auth";
import { resolverUrlContacto } from "@/content/contacto";
import { isAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await request.json();

  const tipo = typeof body.tipo === "string" ? body.tipo.trim() : "otro";
  const valor = typeof body.valor === "string" ? body.valor.trim() : "";
  const titulo = typeof body.titulo === "string" && body.titulo.trim() ? body.titulo.trim() : null;
  const urlPersonalizada = typeof body.url === "string" && body.url.trim() ? body.url.trim() : null;
  const orden = typeof body.orden === "number" ? body.orden : undefined;

  if (!valor) {
    return NextResponse.json(
      { error: "El valor o texto del contacto es requerido." },
      { status: 400 }
    );
  }

  const urlFinal = resolverUrlContacto(tipo, valor, urlPersonalizada);

  const datosAActualizar: Record<string, any> = {
    tipo,
    titulo,
    valor,
    url: urlFinal,
  };

  if (orden !== undefined) {
    datosAActualizar.orden = orden;
  }

  const actualizado = await db
    .update(contacto)
    .set(datosAActualizar)
    .where(eq(contacto.id, itemId))
    .returning();

  if (actualizado.length === 0) {
    return NextResponse.json(
      { error: "Elemento de contacto no encontrado." },
      { status: 404 }
    );
  }

  revalidatePath("/");
  return NextResponse.json(actualizado[0]);
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
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const eliminado = await db
    .delete(contacto)
    .where(eq(contacto.id, itemId))
    .returning();

  if (eliminado.length === 0) {
    return NextResponse.json(
      { error: "Elemento de contacto no encontrado." },
      { status: 404 }
    );
  }

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
