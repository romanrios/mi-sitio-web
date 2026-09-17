"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/hero", label: "Hero" },
    { href: "/admin", label: "Proyectos", exact: true },
    { href: "/admin/experiencia", label: "Experiencia" },
    { href: "/admin/habilidades", label: "Habilidades" },
  ];

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Panel de administración
        </h1>
        <Link
          href="/"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Volver al sitio
        </Link>
      </div>

      <nav className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
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

