import Container from "@/components/ui/Container";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CardsSection from "@/features/cards/CardsSection";
import MensajesApp from "@/features/mensajes/MensajesApp";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <Container>
      <Header session={session} />
      <CardsSection />
      <MensajesApp estaLogueado={!!session?.user} />
      <Footer />
    </Container>
  );
}
