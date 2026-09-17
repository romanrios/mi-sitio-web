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
  const proyectoId = parseInt(id, 10);

  if (isNaN(proyectoId)) {
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

  const actualizada = await db
    .update(proyectos)
    .set({
      titulo: body.titulo?.trim(),
      descripcion: body.descripcion?.trim(),
      imagenUrl: body.imagenUrl?.trim(),
      ...(body.categoria ? { categoria: body.categoria } : {}),
      orden: typeof body.orden === "number" ? body.orden : 0,
    })
    .where(eq(proyectos.id, proyectoId))
    .returning();

  if (actualizada.length === 0) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  // Reemplazar galería
  await db.delete(proyectoGaleria).where(eq(proyectoGaleria.proyectoId, proyectoId));
  if (body.galeria && Array.isArray(body.galeria) && body.galeria.length > 0) {
    const galeriaAInsertar = body.galeria.map((item: any, index: number) => ({
      proyectoId,
      tipo: item.tipo,
      url: item.url.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoGaleria).values(galeriaAInsertar);
  }

  // Reemplazar tags
  await db.delete(proyectoTags).where(eq(proyectoTags.proyectoId, proyectoId));
  if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
    const tagsAInsertar = body.tags.map((item: any, index: number) => ({
      proyectoId,
      nombre: item.nombre.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoTags).values(tagsAInsertar);
  }

  // Reemplazar enlaces
  await db.delete(proyectoEnlaces).where(eq(proyectoEnlaces.proyectoId, proyectoId));
  if (body.enlaces && Array.isArray(body.enlaces) && body.enlaces.length > 0) {
    const enlacesAInsertar = body.enlaces.map((item: any, index: number) => ({
      proyectoId,
      etiqueta: item.etiqueta.trim(),
      url: item.url.trim(),
      orden: typeof item.orden === "number" ? item.orden : index,
    }));
    await db.insert(proyectoEnlaces).values(enlacesAInsertar);
  }

  const actualizadaConRelaciones = await db.query.proyectos.findFirst({
    where: eq(proyectos.id, proyectoId),
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
  return NextResponse.json(actualizadaConRelaciones);
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
  const proyectoId = parseInt(id, 10);

  if (isNaN(proyectoId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const eliminada = await db
    .delete(proyectos)
    .where(eq(proyectos.id, proyectoId))
    .returning();

  if (eliminada.length === 0) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  revalidatePath("/");
  return NextResponse.json({ success: true });
}
