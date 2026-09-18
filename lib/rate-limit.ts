import { client } from "@/app/db";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number; // en segundos
};

// Fallback en memoria en caso de fallo de conexión a Turso
const memoryStore = new Map<string, { count: number; resetAt: number }>();

let tableInitialized = false;
let tableInitPromise: Promise<void> | null = null;

async function ensureRateLimitsTable(): Promise<void> {
  if (tableInitialized) return;
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT PRIMARY KEY,
            count INTEGER NOT NULL,
            reset_at INTEGER NOT NULL
          );
        `);
        tableInitialized = true;
      } catch (err) {
        console.error("Error al inicializar tabla rate_limits en Turso:", err);
      } finally {
        tableInitPromise = null;
      }
    })();
  }
  return tableInitPromise;
}

/**
 * Obtiene la dirección IP del cliente de forma segura en Vercel / Next.js.
 * Prioriza x-forwarded-for (primer elemento asignado por el proxy de Vercel) y x-real-ip.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Aplica rate limiting persistente en Turso con consulta atómica (upsert).
 * Compatible con múltiples instancias serverless en Vercel.
 *
 * @param key Identificador único (ej: "contacto:1.2.3.4")
 * @param limit Número máximo de solicitudes permitidas en la ventana
 * @param windowMs Duración de la ventana en milisegundos (por defecto 10 minutos)
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + windowMs;

  try {
    await ensureRateLimitsTable();

    // Consulta atómica con RETURNING:
    // Si la clave no existe, inserta count=1 con reset_at=now+windowMs.
    // Si existe pero reset_at expiró, resetea count=1 y actualiza reset_at.
    // Si existe y no expiró, incrementa count y mantiene reset_at.
    const result = await client.execute({
      sql: `
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET
          count = CASE WHEN rate_limits.reset_at < ? THEN 1 ELSE rate_limits.count + 1 END,
          reset_at = CASE WHEN rate_limits.reset_at < ? THEN excluded.reset_at ELSE rate_limits.reset_at END
        RETURNING count, reset_at;
      `,
      args: [key, resetAt, now, now],
    });

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      const count = Number(row.count);
      const rowResetAt = Number(row.reset_at);
      const remaining = Math.max(0, limit - count);
      const retryAfter = Math.max(1, Math.ceil((rowResetAt - now) / 1000));

      // Limpieza probabilística de registros expirados (10% de las peticiones)
      if (Math.random() < 0.1) {
        client
          .execute({
            sql: "DELETE FROM rate_limits WHERE reset_at < ?",
            args: [now],
          })
          .catch(() => {});
      }

      return {
        success: count <= limit,
        limit,
        remaining,
        resetAt: rowResetAt,
        retryAfter,
      };
    }
  } catch (err) {
    console.error("Error al verificar rate limit en Turso, aplicando fallback en memoria:", err);
  }

  // Fallback seguro en memoria si Turso no está disponible
  const current = memoryStore.get(key);
  if (!current || now > current.resetAt) {
    memoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  current.count += 1;
  const remaining = Math.max(0, limit - current.count);
  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

  return {
    success: current.count <= limit,
    limit,
    remaining,
    resetAt: current.resetAt,
    retryAfter,
  };
}
