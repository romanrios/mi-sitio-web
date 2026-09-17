"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import { useEffect, useState } from "react";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuAbierto(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Inicio", href: "inicio" },
    { label: "Experiencia", href: "experiencia" },
    { label: "Habilidades", href: "habilidades" },
    { label: "Proyectos", href: "proyectos" },
    { label: "Contacto", href: "contacto" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMenuAbierto(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/85 backdrop-blur-md border-b border-border shadow-xs transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Nombre a la izquierda en Montserrat gruesa */}
        <a
          href="#inicio"
          onClick={(e) => handleNavClick(e, "inicio")}
          className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          Román Ríos
        </a>

        {/* Navegación Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="h-4 w-px bg-border" />

          <ThemeToggle />
        </div>

        {/* Controles Mobile: ThemeToggle + Botón Hamburguesa */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú de navegación"}
            aria-expanded={menuAbierto}
            className="p-2 rounded-md border border-border text-foreground hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {menuAbierto ? (
              // Icono X
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Icono Hamburguesa
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Mobile */}
      {menuAbierto && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2.5 rounded-md text-base font-medium text-foreground hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
