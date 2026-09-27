import { db } from "@/app/db";
import { proyectoCategorias } from "@/app/db/schema";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import { CATEGORIAS_POR_DEFECTO } from "@/lib/categorias";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    let cats = await db.query.proyectoCategorias.findMany({
      orderBy: [asc(proyectoCategorias.orden), asc(proyectoCategorias.id)],
    });

    // Si la tabla estuviese vacía, sembrar las categorías por defecto
    if (cats.length === 0) {
      const inserts = CATEGORIAS_POR_DEFECTO.map((nombre, idx) => ({
        nombre,
        orden: idx,
        creadoEn: new Date().toISOString(),
      }));
      await db.insert(proyectoCategorias).values(inserts);
      cats = await db.query.proyectoCategorias.findMany({
        orderBy: [asc(proyectoCategorias.orden), asc(proyectoCategorias.id)],
      });
    }

    // Obtener todos los proyectos para contar cuántos tiene cada categoría
    const todosLosProyectos = await db.query.proyectos.findMany({
      columns: { id: true, categoria: true },
    });

    const conteoPorCategoria: Record<string, number> = {};
    for (const p of todosLosProyectos) {
      if (p.categoria) {
        conteoPorCategoria[p.categoria] = (conteoPorCategoria[p.categoria] || 0) + 1;
      }
    }

    const resultado = cats.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      orden: cat.orden,
      creadoEn: cat.creadoEn,
      totalProyectos: conteoPorCategoria[cat.nombre] || 0,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener categorías de proyectos:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

    if (!nombre || nombre.length < 2 || nombre.length > 80) {
      return NextResponse.json(
        { error: "El nombre de la categoría debe tener entre 2 y 80 caracteres." },
        { status: 400 }
      );
    }

    // Verificar si ya existe una categoría con ese nombre (case insensitive)
    const todas = await db.query.proyectoCategorias.findMany();
    const existe = todas.some(
      (c) => c.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
      return NextResponse.json(
        { error: `Ya existe una categoría con el nombre "${nombre}".` },
        { status: 400 }
      );
    }

    // Calcular el siguiente orden
    const maxOrden = todas.reduce((max, c) => Math.max(max, c.orden ?? 0), -1);
    const nuevoOrden = maxOrden + 1;

    const [nueva] = await db
      .insert(proyectoCategorias)
      .values({
        nombre,
        orden: nuevoOrden,
        creadoEn: new Date().toISOString(),
      })
      .returning();

    revalidatePath("/");
    return NextResponse.json(
      { ...nueva, totalProyectos: 0 },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear categoría de proyectos:", error);
    return NextResponse.json(
      { error: "Error al crear la categoría." },
      { status: 500 }
    );
  }
}

type ItemReordenar = {
  id: number;
  orden: number;
};

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "items debe ser un arreglo con { id, orden }." },
        { status: 400 }
      );
    }

    const itemsValidos = (body.items as unknown[]).filter(
      (item): item is ItemReordenar =>
        item !== null &&
        typeof item === "object" &&
        "id" in item &&
        typeof (item as ItemReordenar).id === "number" &&
        "orden" in item &&
        typeof (item as ItemReordenar).orden === "number"
    );

    const updates = itemsValidos.map((item) =>
      db
        .update(proyectoCategorias)
        .set({ orden: item.orden })
        .where(eq(proyectoCategorias.id, item.id))
    );

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al reordenar categorías:", error);
    return NextResponse.json(
      { error: "Error al reordenar categorías." },
      { status: 500 }
    );
  }
}
