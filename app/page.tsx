import { auth } from "@/auth";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import CardsSection from "@/features/cards/CardsSection";
import ExperienciaSection from "@/features/experiencia/ExperienciaSection";
import HabilidadesSection from "@/features/habilidades/HabilidadesSection";
import HeroSection from "@/features/hero/HeroSection";
import MensajesApp from "@/features/mensajes/MensajesApp";

export default async function Home() {
  const session = await auth();

  return (
    <Container>
      <Header session={session} />
      <HeroSection />
      <CardsSection />
      <ExperienciaSection />
      <HabilidadesSection />
      <MensajesApp estaLogueado={!!session?.user} />
      <Footer />
    </Container>
  );
}

