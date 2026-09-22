import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import cloudinary from "@/lib/cloudinary";
import { db } from "@/app/db";
import { hero } from "@/app/db/schema/hero";
import { proyectos, proyectoGaleria } from "@/app/db/schema/proyectos";
import { eq } from "drizzle-orm";
import { extractPublicIdFromUrl, ImagenItem } from "@/lib/imagenes-utils";
import { NextRequest, NextResponse } from "next/server";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
  folder?: string;
  asset_folder?: string;
}

interface CloudinaryResourcesResponse {
  resources?: CloudinaryResource[];
  next_cursor?: string;
}

interface CloudinaryDeleteResponse {
  deleted?: Record<string, string>;
  not_found?: string[];
}

export async function GET() {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    // 1. Extraer todas las imágenes de Cloudinary paginando con next_cursor
    const todosLosRecursos: CloudinaryResource[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const respuesta: CloudinaryResourcesResponse = await cloudinary.api.resources({
        type: "upload",
        prefix: "mi-sitio-web/",
        max_results: 500,
        next_cursor: nextCursor,
      });

      if (respuesta.resources && Array.isArray(respuesta.resources)) {
        todosLosRecursos.push(...respuesta.resources);
      }

      nextCursor = respuesta.next_cursor;
    } while (nextCursor);

    // 2. Extraer todas las URLs de imágenes registradas en la Base de Datos
    const [heroRegistros, proyectosRegistros, galeriaRegistros] = await Promise.all([
      db.select({ imagenUrl: hero.imagenUrl }).from(hero),
      db.select({ imagenUrl: proyectos.imagenUrl }).from(proyectos),
      db
        .select({ url: proyectoGaleria.url })
        .from(proyectoGaleria)
        .where(eq(proyectoGaleria.tipo, "imagen")),
    ]);

    // Consolidar todos los identificadores en uso
    const idsEnUso = new Set<string>();
    const urlsEnUso = new Set<string>();

    function registrarEnUso(url: string | null | undefined) {
      if (!url) return;
      urlsEnUso.add(url.trim());
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        idsEnUso.add(publicId);
      }
    }

    heroRegistros.forEach((h) => registrarEnUso(h.imagenUrl));
    proyectosRegistros.forEach((p) => registrarEnUso(p.imagenUrl));
    galeriaRegistros.forEach((g) => registrarEnUso(g.url));

    // 3. Procesar y cruzar datos (Diferencia de conjuntos)
    const imagenesConsolidadas: ImagenItem[] = todosLosRecursos.map((recurso) => {
      const publicId = recurso.public_id;
      const secureUrl = recurso.secure_url;

      // Verificar si coincide por public_id o por URL exacta
      const enUso = idsEnUso.has(publicId) || urlsEnUso.has(secureUrl);

      // Extraer nombre de la carpeta (ej. 'mi-sitio-web/proyectos' -> 'proyectos')
      let folder = "general";
      if (recurso.asset_folder) {
        folder = recurso.asset_folder.replace(/^mi-sitio-web\/?/, "") || "general";
      } else if (recurso.folder) {
        folder = recurso.folder.replace(/^mi-sitio-web\/?/, "") || "general";
      } else {
        const partes = publicId.split("/");
        if (partes.length > 2) {
          folder = partes[partes.length - 2];
        } else if (partes.length === 2) {
          folder = partes[0] === "mi-sitio-web" ? "general" : partes[0];
        }
      }

      return {
        public_id: publicId,
        secure_url: secureUrl,
        enUso,
        folder,
        bytes: recurso.bytes,
        format: recurso.format,
        width: recurso.width,
        height: recurso.height,
        created_at: recurso.created_at,
      };
    });

    return NextResponse.json(imagenesConsolidadas);
  } catch (error) {
    console.error("Error al obtener y cruzar imágenes:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al consultar las imágenes de Cloudinary y la base de datos." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const publicIds: unknown = body.public_ids;

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array 'public_ids' con al menos un elemento." },
        { status: 400 }
      );
    }

    const idsValidos: string[] = publicIds.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );

    if (idsValidos.length === 0) {
      return NextResponse.json(
        { error: "Ninguno de los IDs enviados es válido." },
        { status: 400 }
      );
    }

    // Segmentación en lotes de máximo 100 recursos por iteración (Rate Limiting de Cloudinary)
    const BATCH_SIZE = 100;
    const eliminados: string[] = [];
    const errores: { id: string; error: string }[] = [];

    for (let i = 0; i < idsValidos.length; i += BATCH_SIZE) {
      const lote = idsValidos.slice(i, i + BATCH_SIZE);

      try {
        const respuesta: CloudinaryDeleteResponse = await cloudinary.api.delete_resources(
          lote
        );

        if (respuesta.deleted) {
          for (const [id, estado] of Object.entries(respuesta.deleted)) {
            if (estado === "deleted" || estado === "not_found") {
              eliminados.push(id);
            } else {
              errores.push({ id, error: estado });
            }
          }
        }
      } catch (loteError) {
        console.error("Error al eliminar lote en Cloudinary:", loteError);
        lote.forEach((id) =>
          errores.push({
            id,
            error: loteError instanceof Error ? loteError.message : "Error en Cloudinary",
          })
        );
      }
    }

    return NextResponse.json({
      success: true,
      deleted: eliminados,
      errors: errores,
      totalDeleted: eliminados.length,
    });
  } catch (error) {
    console.error("Error en endpoint DELETE de imágenes:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar la eliminación." },
      { status: 500 }
    );
  }
}
