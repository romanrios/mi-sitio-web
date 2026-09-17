import { db } from "@/app/db";
import { heroDefault, HeroData } from "@/content/hero";

export default async function HeroSection() {
  let heroData: HeroData = heroDefault;

  try {
    const registro = await db.query.hero.findFirst();
    if (registro) {
      heroData = registro;
    }
  } catch (error) {
    console.error("Error al cargar Hero de la base de datos:", error);
  }

  return (
    <section className="w-full max-w-2xl mt-2 mb-12 sm:mb-16">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 text-center sm:text-left">
        {/* Foto de perfil enmarcada en círculo */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-border shadow-md ring-4 ring-accent/10 bg-surface">
            <img
              src={heroData.imagenUrl}
              alt={heroData.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Título principal y Subtítulo */}
        <div className="flex flex-col justify-center flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-pretty">
            {heroData.titulo}
          </h1>
          <p className="mt-2 text-base sm:text-lg font-medium text-muted whitespace-pre-line text-pretty">
            {heroData.subtitulo}
          </p>
        </div>
      </div>

      {/* Texto de párrafo principal */}
      <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line text-pretty">
        {heroData.descripcion}
      </p>
    </section>
  );
}
