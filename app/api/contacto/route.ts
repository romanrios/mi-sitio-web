import { db } from "@/app/db";
import { contacto } from "@/app/db/schema";
import { auth } from "@/auth";
import { contactoItemsDefault, resolverUrlContacto } from "@/content/contacto";
import { isAdmin } from "@/lib/auth-utils";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await db.query.contacto.findMany({
      orderBy: [asc(contacto.orden), asc(contacto.id)],
    });

    if (items.length === 0) {
      return NextResponse.json(contactoItemsDefault);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("Error al obtener contactos:", err);
    return NextResponse.json(contactoItemsDefault);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json();

  // Reordenamiento masivo si el body es un array de { id, orden }
  if (Array.isArray(body)) {
    for (const item of body) {
      if (typeof item.id === "number" && typeof item.orden === "number") {
        await db
          .update(contacto)
          .set({ orden: item.orden })
          .where(eq(contacto.id, item.id));
      }
    }
    const actualizados = await db.query.contacto.findMany({
      orderBy: [asc(contacto.orden), asc(contacto.id)],
    });
    revalidatePath("/");
    return NextResponse.json(actualizados);
  }

  const tipo = typeof body.tipo === "string" ? body.tipo.trim() : "otro";
  const valor = typeof body.valor === "string" ? body.valor.trim() : "";
  const titulo = typeof body.titulo === "string" && body.titulo.trim() ? body.titulo.trim() : null;
  const urlPersonalizada = typeof body.url === "string" && body.url.trim() ? body.url.trim() : null;

  if (!valor) {
    return NextResponse.json(
      { error: "El valor o texto del contacto es requerido." },
      { status: 400 }
    );
  }

  const urlFinal = resolverUrlContacto(tipo, valor, urlPersonalizada);

  // Obtener último orden si no se especificó
  let ordenFinal = typeof body.orden === "number" ? body.orden : 0;
  if (ordenFinal === 0) {
    const todos = await db.query.contacto.findMany({
      orderBy: [asc(contacto.orden)],
    });
    const maxOrden = todos.reduce((max, i) => Math.max(max, i.orden), 0);
    ordenFinal = maxOrden + 1;
  }

  const [nuevo] = await db
    .insert(contacto)
    .values({
      tipo,
      titulo,
      valor,
      url: urlFinal,
      orden: ordenFinal,
      creadoEn: new Date().toISOString(),
    })
    .returning();

  revalidatePath("/");
  return NextResponse.json(nuevo, { status: 201 });
}
