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

## Dónde va cada cosa
- `app/` → rutas, páginas y endpoints
- `features/` → secciones o funcionalidades concretas
- `components/` → UI reutilizable (`layout/` y `ui/`)
- `content/` → textos editoriales/estáticos (nombre del sitio, etc.)
- `lib/` → utilidades compartidas
- `app/db/` → schema y acceso a datos
- `app/api/` → endpoints

## Estructura clave
- `app/page.tsx` → compositor de la home (sesión + secciones)
- `app/admin/layout.tsx` → gate de autenticación/admin para `/admin` y futuras subrutas
- `app/admin/page.tsx` → panel actual (CRUD de cards)
- `features/cards/CardsSection.tsx` → grilla pública de cards (DB)
- `features/cards/AdminCardsApp.tsx` → formulario y lista de administración
- `features/mensajes/MensajesApp.tsx` → formulario + lista de mensajes
- `app/api/cards/` → GET público / POST-PUT-DELETE admin
- `app/api/mensajes/` → GET público / POST con sesión
- `app/db/schema/` → tablas `cards` y `mensajes`
- `content/site.ts` → nombre y descripción del sitio
- `auth.ts` → configuración de Auth.js

## Cómo agregar una sección nueva
1. Crear `features/nombre/NombreSection.tsx`.
2. Si el contenido es editorial/estático, agregarlo en `content/` (por ejemplo `content/about.ts`) e importarlo en la sección.
3. Si necesita CRUD o persistencia, seguir el patrón de `cards`/`mensajes` (schema + `app/api/` + UI en la feature).
4. Importar la sección en `app/page.tsx` y colocarla en el compositor.
5. Reutilizar `components/ui/` solo cuando el elemento se repita o fije un patrón visual.

No crear carpetas vacías (`hero/`, `about/`, etc.) hasta que la sección exista.

## Admin a futuro
El gate vive en `app/admin/layout.tsx`. Nuevas áreas pueden ser `app/admin/proyectos/page.tsx`, `app/admin/experiencia/page.tsx`, etc., sin reimplementar el login.

## Variables de entorno (en .env.local y en Vercel)
TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ADMIN_EMAILS

## Pendientes / ideas futuras
- Filtrar mensajes por usuario
- Editar/borrar mensajes propios
- Rate limiting en POST
- Dominio propio
