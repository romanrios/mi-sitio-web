/**
 * Script de migración automática de imágenes existentes a Cloudinary.
 *
 * Lee las imágenes de las tablas `hero`, `proyectos` y `proyecto_galeria`,
 * las descarga y sube a Cloudinary dentro de las carpetas organizadas,
 * y actualiza las URLs en la base de datos Turso.
 *
 * Uso:
 *   node scripts/migrate-images-to-cloudinary.mjs           (ejecuta la migración)
 *   node scripts/migrate-images-to-cloudinary.mjs --dry-run (solo simula la detección)
 */

import { createClient } from "@libsql/client";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const isDryRun = process.argv.includes("--dry-run");

// Validar variables requeridas
const {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error("❌ Error: Faltan variables de Turso (TURSO_DATABASE_URL o TURSO_AUTH_TOKEN) en .env.local");
  process.exit(1);
}

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("❌ Error: Faltan credenciales de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) en .env.local");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

function esCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

async function subirACloudinary(url, carpeta) {
  const res = await cloudinary.uploader.upload(url, {
    folder: `mi-sitio-web/${carpeta}`,
    resource_type: "image",
  });
  return res.secure_url;
}

async function main() {
  console.log("\n🚀 Iniciando script de migración a Cloudinary...");
  if (isDryRun) {
    console.log("⚠️  MODO DRY-RUN ACTIVADO: No se modificarán datos ni se subirá nada.");
  }

  let totalMigrados = 0;
  let totalOmitidos = 0;
  let totalErrores = 0;

  // 1. Migrar tabla Hero
  console.log("\n--- Verificando tabla Hero ---");
  try {
    const heroRows = await client.execute("SELECT id, imagen_url, titulo FROM hero;");
    for (const row of heroRows.rows) {
      const { id, imagen_url: url, titulo } = row;
      if (!url) continue;

      if (esCloudinaryUrl(url)) {
        console.log(`✓ [HERO] "${titulo}" ya usa Cloudinary.`);
        totalOmitidos++;
        continue;
      }

      console.log(`⏳ [HERO] Migrando imagen de "${titulo}" (${url})...`);
      if (isDryRun) {
        console.log(`   [DRY-RUN] Se subiría a mi-sitio-web/hero y actualizaría registro #${id}`);
        totalMigrados++;
        continue;
      }

      try {
        const nuevaUrl = await subirACloudinary(url, "hero");
        await client.execute({
          sql: "UPDATE hero SET imagen_url = ? WHERE id = ?;",
          args: [nuevaUrl, id],
        });
        console.log(`   ✓ [MIGRADO] Nueva URL: ${nuevaUrl}`);
        totalMigrados++;
      } catch (err) {
        console.error(`   ✕ [ERROR] Falló migración para Hero id #${id}:`, err.message || err);
        totalErrores++;
      }
    }
  } catch (err) {
    console.error("Error al consultar tabla hero:", err);
  }

  // 2. Migrar tabla Proyectos
  console.log("\n--- Verificando tabla Proyectos ---");
  try {
    const proyectosRows = await client.execute("SELECT id, titulo, imagen_url FROM proyectos;");
    for (const row of proyectosRows.rows) {
      const { id, titulo, imagen_url: url } = row;
      if (!url) continue;

      if (esCloudinaryUrl(url)) {
        console.log(`✓ [PROYECTO #${id}] "${titulo}" ya usa Cloudinary.`);
        totalOmitidos++;
        continue;
      }

      console.log(`⏳ [PROYECTO #${id}] Migrando "${titulo}" (${url})...`);
      if (isDryRun) {
        console.log(`   [DRY-RUN] Se subiría a mi-sitio-web/proyectos y actualizaría proyecto #${id}`);
        totalMigrados++;
        continue;
      }

      try {
        const nuevaUrl = await subirACloudinary(url, "proyectos");
        await client.execute({
          sql: "UPDATE proyectos SET imagen_url = ? WHERE id = ?;",
          args: [nuevaUrl, id],
        });
        console.log(`   ✓ [MIGRADO] Nueva URL: ${nuevaUrl}`);
        totalMigrados++;
      } catch (err) {
        console.error(`   ✕ [ERROR] Falló migración para proyecto #${id} (${titulo}):`, err.message || err);
        totalErrores++;
      }
    }
  } catch (err) {
    console.error("Error al consultar tabla proyectos:", err);
  }

  // 3. Migrar tabla Galería de Proyectos
  console.log("\n--- Verificando tabla Proyecto Galería ---");
  try {
    const galeriaRows = await client.execute(
      "SELECT id, proyecto_id, tipo, url FROM proyecto_galeria WHERE tipo = 'imagen';"
    );
    for (const row of galeriaRows.rows) {
      const { id, proyecto_id, url } = row;
      if (!url) continue;

      if (esCloudinaryUrl(url)) {
        console.log(`✓ [GALERIA #${id}] Ítem de proyecto #${proyecto_id} ya usa Cloudinary.`);
        totalOmitidos++;
        continue;
      }

      console.log(`⏳ [GALERIA #${id}] Migrando imagen de proyecto #${proyecto_id} (${url})...`);
      if (isDryRun) {
        console.log(`   [DRY-RUN] Se subiría a mi-sitio-web/proyectos y actualizaría galería #${id}`);
        totalMigrados++;
        continue;
      }

      try {
        const nuevaUrl = await subirACloudinary(url, "proyectos");
        await client.execute({
          sql: "UPDATE proyecto_galeria SET url = ? WHERE id = ?;",
          args: [nuevaUrl, id],
        });
        console.log(`   ✓ [MIGRADO] Nueva URL: ${nuevaUrl}`);
        totalMigrados++;
      } catch (err) {
        console.error(`   ✕ [ERROR] Falló migración para galería #${id}:`, err.message || err);
        totalErrores++;
      }
    }
  } catch (err) {
    console.error("Error al consultar tabla proyecto_galeria:", err);
  }

  // Resumen final
  console.log("\n==========================================");
  console.log("📊 Resumen de la migración:");
  console.log(`   - Imágenes migradas a Cloudinary: ${totalMigrados}`);
  console.log(`   - Ya se encontraban en Cloudinary: ${totalOmitidos}`);
  console.log(`   - Errores encontrados:            ${totalErrores}`);
  console.log("==========================================\n");
}

main().catch(console.error);
