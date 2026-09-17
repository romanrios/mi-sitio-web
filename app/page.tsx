import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ContactoSection from "@/features/contacto/ContactoSection";
import ExperienciaSection from "@/features/experiencia/ExperienciaSection";
import HabilidadesSection from "@/features/habilidades/HabilidadesSection";
import HeroSection from "@/features/hero/HeroSection";
import ProyectosSection from "@/features/proyectos/ProyectosSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <HeroSection />

        <div className="w-full flex justify-center px-4 py-16 sm:py-20">
          <ExperienciaSection />
        </div>

        <HabilidadesSection />

        <div className="w-full flex flex-col items-center px-4 py-16 sm:py-20">
          <ProyectosSection />
        </div>

        <ContactoSection />
      </main>
      <Footer />
    </div>
  );
}

