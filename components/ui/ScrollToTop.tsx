"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Muestra el botón una vez que el usuario ha bajado 300px
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    // Comprobación inicial por si la página carga ya con scroll
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center justify-center size-10 sm:size-11 rounded-full bg-surface/85 backdrop-blur-md border border-border text-muted hover:text-accent hover:border-accent/50 hover:bg-surface-hover shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-3 scale-90 pointer-events-none"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
