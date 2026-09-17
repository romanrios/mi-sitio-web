import { db } from "@/app/db";
import {
  proyectoEnlaces,
  proyectoGaleria,
  proyectos,
  proyectoTags,
} from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { esCategoriaValida } from "@/lib/categorias";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const todosLosProyectos = await db.query.proyectos.findMany({
    orderBy: [asc(proyectos.orden)],
    with: {
      galeria: {
        orderBy: (galeria, { asc }) => [asc(galeria.orden)],
      },
      tags: {
        orderBy: (tags, { asc }) => [asc(tags.orden)],
      },
      enlaces: {
        orderBy: (enlaces, { asc }) => [asc(enlaces.orden)],
      },
    },
  });
  return NextResponse.json(todosLosProyectos);
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

  // Validaciones de galeria
  if (body.galeria !== undefined) {
    if (!Array.isArray(body.galeria)) {
      return NextResponse.json(
        { error: "galeria debe ser un arreglo." },
        { status: 400 }
      );
    }
    for (const item of body.galeria) {
      if (
        !item ||
        (item.tipo !== "imagen" && item.tipo !== "youtube" && item.tipo !== "vimeo") ||
        typeof item.url !== "string" ||
        !item.url.trim()
      ) {
        return NextResponse.json(
          { error: "Cada item de galería debe tener un tipo ('imagen', 'youtube' o 'vimeo') y una url válida." },
          { status: 400 }
        );
      }
    }
  }

  // Validaciones de tags
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return NextResponse.json(
        { error: "tags debe ser un arreglo." },
        { status: 400 }
      );
    }
    for (const item of body.tags) {
      if (
        !item ||
        typeof item.nombre !== "string" ||
        !item.nombre.trim()
      ) {
        return NextResponse.json(
          { error: "Cada tag debe tener un nombre válido." },
          { status: 400 }
        );
      }
    }
  }

  // Validaciones de enlaces
  if (body.enlaces !== undefined) {
    if (!Array.isArray(body.enlaces)) {
      return NextResponse.json(
        { error: "enlaces debe ser un arreglo." },
        { status: 400 }
      );
    }
    for (const item of body.enlaces) {
      if (
        !item ||
        typeof item.etiqueta !== "string" ||
        !item.etiqueta.trim() ||
        typeof item.url !== "string" ||
        !item.url.trim()
      ) {
        return NextResponse.json(
          { error: "Cada enlace debe tener una etiqueta y una url válida." },
          { status: 400 }
        );
      }
    }
  }

  const [nuevoProyecto] = await db
    .insert(proyectos)
    .values({
      titulo: body.titulo.trim(),
      descripcion: body.descripcion.trim(),
      imagenUrl: body.imagenUrl.trim(),
      categoria: body.categoria,
      orden: typeof body.orden === "number" ? body.orden : 0,
      creadoEn: new Date().toISOString(),
    })
    .returning();

  if (body.galeria && Array.isArray(body.galeria) && body.galeria.length > 0) {
    const galeriaAInsertar = body.galeria.map((item: any, index: number) => ({
      proyectoId: nuevoProyecto.id,
      tipo: item.tipo,
      url: item.url.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoGaleria).values(galeriaAInsertar);
  }

  if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
    const tagsAInsertar = body.tags.map((item: any, index: number) => ({
      proyectoId: nuevoProyecto.id,
      nombre: item.nombre.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoTags).values(tagsAInsertar);
  }

  if (body.enlaces && Array.isArray(body.enlaces) && body.enlaces.length > 0) {
    const enlacesAInsertar = body.enlaces.map((item: any, index: number) => ({
      proyectoId: nuevoProyecto.id,
      etiqueta: item.etiqueta.trim(),
      url: item.url.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoEnlaces).values(enlacesAInsertar);
  }

  const creadoConRelaciones = await db.query.proyectos.findFirst({
    where: eq(proyectos.id, nuevoProyecto.id),
    with: {
      galeria: {
        orderBy: (galeria, { asc }) => [asc(galeria.orden)],
      },
      tags: {
        orderBy: (tags, { asc }) => [asc(tags.orden)],
      },
      enlaces: {
        orderBy: (enlaces, { asc }) => [asc(enlaces.orden)],
      },
    },
  });

  revalidatePath("/");
  return NextResponse.json(creadoConRelaciones, { status: 201 });
}
