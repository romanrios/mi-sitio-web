"use client";

import { logoutAction } from "@/lib/auth-actions";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/hero", label: "Hero" },
    { href: "/admin/experiencia", label: "Experiencia" },
    { href: "/admin/habilidades", label: "Habilidades" },
    { href: "/admin", label: "Proyectos", exact: true },
    { href: "/admin/contacto", label: "Contacto" },
    { href: "/admin/configuracion", label: "Configuración" },
  ];

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Panel de administración
        </h1>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <Link
            href="/"
            className="text-muted hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← Volver al sitio
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-error hover:underline cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-border pb-3">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${isActive
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

