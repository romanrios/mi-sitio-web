import { db } from "@/app/db";
import { contacto } from "@/app/db/schema";
import { auth } from "@/auth";
import { contactoDefault } from "@/content/contacto";
import { isAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const registro = await db.query.contacto.findFirst();
  if (!registro) {
    return NextResponse.json(contactoDefault);
  }
  return NextResponse.json(registro);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json();

  if (!body.ubicacion || typeof body.ubicacion !== "string" || !body.ubicacion.trim()) {
    return NextResponse.json({ error: "La ubicación es requerida." }, { status: 400 });
  }

  if (!body.whatsapp || typeof body.whatsapp !== "string" || !body.whatsapp.trim()) {
    return NextResponse.json({ error: "El WhatsApp es requerido." }, { status: 400 });
  }

  if (!body.correo || typeof body.correo !== "string" || !body.correo.trim()) {
    return NextResponse.json({ error: "El correo es requerido." }, { status: 400 });
  }

  if (!body.linkedin || typeof body.linkedin !== "string" || !body.linkedin.trim()) {
    return NextResponse.json({ error: "El enlace a LinkedIn es requerido." }, { status: 400 });
  }

  if (!body.github || typeof body.github !== "string" || !body.github.trim()) {
    return NextResponse.json({ error: "El enlace a GitHub es requerido." }, { status: 400 });
  }

  const datos = {
    ubicacion: body.ubicacion.trim(),
    whatsapp: body.whatsapp.trim(),
    correo: body.correo.trim(),
    linkedin: body.linkedin.trim(),
    github: body.github.trim(),
    actualizadoEn: new Date().toISOString(),
  };

  const existente = await db.query.contacto.findFirst();

  let resultado;
  if (existente) {
    const [actualizado] = await db
      .update(contacto)
      .set(datos)
      .where(eq(contacto.id, existente.id))
      .returning();
    resultado = actualizado;
  } else {
    const [nuevo] = await db.insert(contacto).values(datos).returning();
    resultado = nuevo;
  }

  return NextResponse.json(resultado);
}
