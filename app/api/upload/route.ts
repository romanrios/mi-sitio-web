import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth-utils";
import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

// Carpetas válidas dentro de Cloudinary, para mantener todo organizado
// (mi-sitio-web/hero, mi-sitio-web/proyectos, etc.)
const CARPETAS_VALIDAS = ["hero", "proyectos", "galeria", "general"];

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const carpetaSolicitada = formData.get("carpeta");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se envió ningún archivo." },
      { status: 400 }
    );
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato de imagen no soportado (usá JPG, PNG, WEBP o GIF)." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el tamaño máximo permitido (8MB)." },
      { status: 400 }
    );
  }

  const carpeta =
    typeof carpetaSolicitada === "string" && CARPETAS_VALIDAS.includes(carpetaSolicitada)
      ? carpetaSolicitada
      : "general";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const resultado = await cloudinary.uploader.upload(base64, {
      folder: `mi-sitio-web/${carpeta}`,
      resource_type: "image",
    });

    return NextResponse.json({
      url: resultado.secure_url,
      publicId: resultado.public_id,
      width: resultado.width,
      height: resultado.height,
    });
  } catch (err) {
    console.error("Error al subir imagen a Cloudinary:", err);
    return NextResponse.json(
      { error: "Error inesperado al subir la imagen." },
      { status: 500 }
    );
  }
}
