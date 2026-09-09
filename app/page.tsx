import CardsSection from "@/features/cards/CardsSection";
import MensajesApp from "@/features/mensajes/MensajesApp";
import Header from "@/components/layout/Header";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <Header session={session} />

      <CardsSection />

      <MensajesApp estaLogueado={!!session?.user} />
    </main>
  );
}
