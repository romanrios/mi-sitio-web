<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Mi Sitio Web — Contexto del proyecto

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Vercel (hosting)
- Turso (DB, libSQL) + Drizzle ORM
- Auth.js v5 con Google OAuth

## Estructura clave
- app/page.tsx → Server Component, maneja sesión y login/logout
- app/mensajes-app.tsx → Client Component, formulario + lista de mensajes
- app/api/mensajes/route.ts → GET (público) / POST (requiere sesión)
- app/db/schema.ts → tabla `mensajes` (id, contenido, autor, creado_en)
- auth.ts → configuración de Auth.js

## Variables de entorno (en .env.local y en Vercel)
TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

## Pendientes / ideas futuras
- Filtrar mensajes por usuario
- Editar/borrar mensajes propios
- Rate limiting en POST
- Dominio propio
