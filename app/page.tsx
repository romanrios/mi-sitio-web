import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollToTop from "@/components/ui/ScrollToTop";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ContactoSection from "@/features/contacto/ContactoSection";
import ExperienciaSection from "@/features/experiencia/ExperienciaSection";
import HabilidadesSection from "@/features/habilidades/HabilidadesSection";
import HeroSection from "@/features/hero/HeroSection";
import ProyectosSection from "@/features/proyectos/ProyectosSection";
import { Suspense } from "react";

export const revalidate = 60;

function ExperienciaSkeleton() {
  return (
    <section className="w-full max-w-2xl scroll-mt-24">
      {/* Título de sección */}
      <div className="h-8 w-36 bg-surface-hover rounded-md mb-6 animate-pulse" />

      {/* Filtros skeleton */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {["w-16", "w-20", "w-24", "w-20"].map((w, i) => (
          <div
            key={i}
            className={`h-8 ${w} rounded-full bg-surface border border-border animate-pulse shrink-0`}
          />
        ))}
      </div>

      {/* Línea de tiempo y tarjetas */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-border space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            {/* Nodo sobre la línea */}
            <div className="absolute -left-7.75 sm:-left-9.75 top-4 w-3.5 h-3.5 rounded-full border-2 border-background bg-surface-hover animate-pulse" />
            <SkeletonCard variant="default" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProyectosSkeleton() {
  return (
    <section className="w-full max-w-4xl space-y-10 scroll-mt-24">
      {/* Título de sección */}
      <div className="h-8 w-36 bg-surface-hover rounded-md animate-pulse" />

      {/* Categoría y grilla de proyectos */}
      <div className="space-y-6">
        <div className="h-6 w-32 bg-surface-hover rounded-md border-b border-border pb-2 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} variant="project" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />

        <div className="w-full flex justify-center px-4 py-16 sm:py-20">
          <Suspense fallback={<ExperienciaSkeleton />}>
            <ExperienciaSection />
          </Suspense>
        </div>

        <HabilidadesSection />

        <div className="w-full flex flex-col items-center px-4 py-16 sm:py-20">
          <Suspense fallback={<ProyectosSkeleton />}>
            <ProyectosSection />
          </Suspense>
        </div>

        <ContactoSection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
