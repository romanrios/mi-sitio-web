import { db } from "@/app/db";
import { configuracion, type TemaDefault } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const TEMAS_VALIDOS: TemaDefault[] = ["dark", "light", "system"];

export async function GET() {
  try {
    const registro = await db.query.configuracion.findFirst();
    const temaDefault: TemaDefault =
      registro && TEMAS_VALIDOS.includes(registro.temaDefault as TemaDefault)
        ? (registro.temaDefault as TemaDefault)
        : "dark";

    return NextResponse.json({ temaDefault });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json({ temaDefault: "dark" });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const temaDefault = body?.temaDefault as TemaDefault;

    if (!temaDefault || !TEMAS_VALIDOS.includes(temaDefault)) {
      return NextResponse.json(
        { error: "Tema no válido. Debe ser 'dark', 'light' o 'system'." },
        { status: 400 }
      );
    }

    const ahora = new Date().toISOString();
    const existente = await db.query.configuracion.findFirst();

    if (existente) {
      const [actualizado] = await db
        .update(configuracion)
        .set({
          temaDefault,
          actualizadoEn: ahora,
        })
        .where(eq(configuracion.id, existente.id))
        .returning();

      revalidatePath("/", "layout");
      return NextResponse.json({ success: true, ...actualizado });
    }

    const [creado] = await db
      .insert(configuracion)
      .values({
        temaDefault,
        actualizadoEn: ahora,
      })
      .returning();

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, ...creado }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
