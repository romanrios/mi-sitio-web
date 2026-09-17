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
    <section
      id="inicio"
      className="relative w-full min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] bg-hero-bg border-b border-border flex flex-col justify-center items-center px-4 py-16 sm:py-24 scroll-mt-16 overflow-hidden"
    >
      {/* Fondo suave con curvas orgánicas difuminadas en paleta cyan */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      >
        {/* Curva orgánica superior derecha con desenfoque profundo */}
        <div className="absolute -top-20 -right-16 sm:-right-8 w-[420px] sm:w-[650px] h-[280px] sm:h-[420px] rounded-[45%_55%_65%_35%/50%_35%_65%_50%] bg-gradient-to-br from-cyan-400/30 via-accent/25 to-transparent blur-3xl sm:blur-[110px] opacity-75 dark:opacity-45 transform -rotate-12" />

        {/* Curva orgánica central / inferior izquierda que fluye con el fondo */}
        <div className="absolute top-1/3 -left-20 sm:-left-12 w-[380px] sm:w-[580px] h-[260px] sm:h-[380px] rounded-[55%_45%_35%_65%/40%_60%_40%_60%] bg-gradient-to-tr from-accent/25 via-cyan-500/20 to-transparent blur-3xl sm:blur-[110px] opacity-70 dark:opacity-40 transform rotate-6" />

        {/* Resplandor sutil de apoyo detrás del área principal */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[480px] h-[200px] sm:h-[280px] rounded-full bg-cyan-400/15 dark:bg-accent/15 blur-3xl sm:blur-[100px] opacity-60 dark:opacity-35" />

        {/* Transición suave hacia el borde inferior */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-hero-bg to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
          {/* Foto de perfil enmarcada en círculo */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-border-strong shadow-lg ring-4 ring-accent/15 bg-surface">
              <img
                src={heroData.imagenUrl}
                alt={heroData.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Título principal y Subtítulo */}
          <div className="flex flex-col justify-center flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight text-pretty">
              {heroData.titulo}
            </h1>
            <p className="mt-3 text-base sm:text-lg md:text-xl font-medium text-accent whitespace-pre-line text-pretty">
              {heroData.subtitulo}
            </p>
          </div>
        </div>

        {/* Texto de párrafo principal */}
        <p className="text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-line text-pretty">
          {heroData.descripcion}
        </p>
      </div>

      {/* Indicador de scroll para explorar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <a
          href="#experiencia"
          className="text-xs font-medium text-muted hover:text-foreground flex flex-col items-center gap-1.5 transition-colors group cursor-pointer"
          aria-label="Ir a la siguiente sección"
        >
          <span className="text-[11px] uppercase tracking-wider opacity-70 group-hover:opacity-100">
            Explorar
          </span>
          <svg
            className="w-4 h-4 animate-bounce text-muted group-hover:text-accent transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
