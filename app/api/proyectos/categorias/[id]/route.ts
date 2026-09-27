import { db } from "@/app/db";
import { proyectoCategorias, proyectos } from "@/app/db/schema";
import { auth } from "@/auth";
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
  const categoriaId = parseInt(id, 10);

  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const nuevoNombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

    if (!nuevoNombre || nuevoNombre.length < 2 || nuevoNombre.length > 80) {
      return NextResponse.json(
        { error: "El nombre de la categoría debe tener entre 2 y 80 caracteres." },
        { status: 400 }
      );
    }

    // Buscar categoría actual
    const categoriaActual = await db.query.proyectoCategorias.findFirst({
      where: eq(proyectoCategorias.id, categoriaId),
    });

    if (!categoriaActual) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya lo usa OTRA categoría
    const todas = await db.query.proyectoCategorias.findMany();
    const nombreEnUso = todas.some(
      (c) =>
        c.id !== categoriaId &&
        c.nombre.trim().toLowerCase() === nuevoNombre.toLowerCase()
    );

    if (nombreEnUso) {
      return NextResponse.json(
        { error: `Ya existe otra categoría llamada "${nuevoNombre}".` },
        { status: 400 }
      );
    }

    const viejoNombre = categoriaActual.nombre;

    // Actualizar nombre en proyectoCategorias
    const [actualizada] = await db
      .update(proyectoCategorias)
      .set({ nombre: nuevoNombre })
      .where(eq(proyectoCategorias.id, categoriaId))
      .returning();

    // Si cambió el nombre, actualizar en cascada todos los proyectos que tenían el viejoNombre
    if (viejoNombre !== nuevoNombre) {
      await db
        .update(proyectos)
        .set({ categoria: nuevoNombre })
        .where(eq(proyectos.categoria, viejoNombre));
    }

    revalidatePath("/");
    return NextResponse.json(actualizada);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return NextResponse.json(
      { error: "Error al actualizar la categoría." },
      { status: 500 }
    );
  }
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
  const categoriaId = parseInt(id, 10);

  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const categoria = await db.query.proyectoCategorias.findFirst({
      where: eq(proyectoCategorias.id, categoriaId),
    });

    if (!categoria) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    // Verificar si existen proyectos asignados a esta categoría
    const proyectosConEstaCategoria = await db.query.proyectos.findMany({
      where: eq(proyectos.categoria, categoria.nombre),
      columns: { id: true },
    });

    if (proyectosConEstaCategoria.length > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${proyectosConEstaCategoria.length} proyecto(s) asignado(s). Reasigna o elimina los proyectos antes de eliminarla.`,
        },
        { status: 400 }
      );
    }

    await db
      .delete(proyectoCategorias)
      .where(eq(proyectoCategorias.id, categoriaId));

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json(
      { error: "Error al eliminar la categoría." },
      { status: 500 }
    );
  }
}
