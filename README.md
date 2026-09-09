# Mi Sitio Web

Sitio personal con Next.js (App Router), TypeScript, Tailwind, Auth.js (Google) y Turso/Drizzle.

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El panel de administración está en `/admin`.

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| `app/` | Rutas, páginas y APIs de Next.js |
| `features/` | Secciones concretas (cards, mensajes, …) |
| `components/` | UI reutilizable (`layout/`, `ui/`) |
| `content/` | Textos estáticos/editoriales |
| `lib/` | Utilidades compartidas |
| `app/db/` | Schema y acceso a datos |

`app/page.tsx` solo compone secciones. Para agregar una sección nueva: crear `features/nombre/NombreSection.tsx`, opcionalmente `content/*.ts`, e importarla en la home.

## Variables de entorno

`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`
