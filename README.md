<div align="center">

# romanrios.com.ar

Sitio web personal y plataforma para exhibir proyectos, trayectoria y habilidades técnicas.

<br />

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Turso](https://img.shields.io/badge/Turso_LibSQL-00E599?style=for-the-badge&logo=sqlite&logoColor=black)](https://turso.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Auth.js](https://img.shields.io/badge/Auth.js_v5-000000?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br />
<br />

<img src="public/screenshot_01.webp" alt="Captura del sitio web" width="100%" />

</div>

---

## Descripción

Portafolio profesional de Román Ríos. La aplicación combina una sección pública para la presentación de trabajos y trayectoria con un panel de administración privado (CMS) para gestionar los contenidos de forma dinámica.

---

## Funcionalidades

- **Modo oscuro y claro**: Selector de tema con detección de preferencias del sistema y persistencia local.
- **Catálogo de proyectos**: Listado dinámico de proyectos con etiquetas de tecnologías y enlaces a repositorios y aplicaciones en producción.
- **Línea de tiempo**: Visualización cronológica de experiencia laboral y formación académica con filtros por área.
- **Habilidades técnicas**: Listado estructurado de tecnologías y competencias por categoría.
- **Formulario de contacto**: Envío de mensajes vía Resend con protección anti-spam (*honeypot*) y límite de peticiones (*rate limiting*) por IP.
- **Panel de administración (`/admin`)**: CMS protegido por Google OAuth para crear, editar y eliminar información del perfil, proyectos, experiencias, habilidades, imágenes y configuración general.
- **Gestión multimedia**: Subida, visualización y eliminación de imágenes integradas con Cloudinary.
- **SEO y accesibilidad**: Metadatos OpenGraph, sitemap, robots y datos estructurados Schema.org (JSON-LD).

---

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Base de datos y ORM** | Turso (LibSQL), Drizzle ORM |
| **Autenticación** | Auth.js v5 (Google OAuth) |
| **Servicios externos** | Cloudinary (imágenes), Resend (emails transaccionales) |
| **Despliegue** | Vercel |

---

## Estructura del Proyecto

```text
mi-sitio-web/
├── app/          # Rutas, páginas y endpoints de la API (App Router)
├── components/   # Componentes visuales reutilizables (layout, tema, UI)
├── content/      # Textos base y configuración editorial
├── features/     # Módulos por dominio (proyectos, experiencia, contacto, admin)
└── lib/          # Utilidades y configuración de clientes
```

---

## Desarrollo Local

1. **Instalación:**
   ```bash
   git clone https://github.com/romanrios/mi-sitio-web.git
   cd mi-sitio-web
   npm install
   ```

2. **Variables de entorno (`.env.local`):**
   ```env
   TURSO_DATABASE_URL=
   TURSO_AUTH_TOKEN=
   AUTH_SECRET=
   AUTH_GOOGLE_ID=
   AUTH_GOOGLE_SECRET=
   ADMIN_EMAILS="correo@ejemplo.com"
   RESEND_API_KEY=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. **Ejecución:**
   ```bash
   npx drizzle-kit push   # sincronizar esquema
   npm run dev            # iniciar en http://localhost:3000 (panel en /admin)
   ```

---

## Contacto

- **Sitio Web:** [romanrios.com.ar](https://romanrios.com.ar)
- **LinkedIn:** [linkedin.com/in/romanrios](https://linkedin.com/in/romanrios)
- **GitHub:** [github.com/romanrios](https://github.com/romanrios)
- **Email:** [romanrios@live.com](mailto:romanrios@live.com)
