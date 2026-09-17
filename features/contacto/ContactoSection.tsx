import { db } from "@/app/db";
import { contactoDefault, ContactoData } from "@/content/contacto";
import ContactoForm from "@/features/contacto/ContactoForm";

export default async function ContactoSection() {
  let datos: ContactoData = contactoDefault;

  try {
    const registro = await db.query.contacto.findFirst();
    if (registro) {
      datos = registro;
    }
  } catch (err) {
    console.error("Error al cargar datos de contacto:", err);
  }

  const items = [
    {
      tipo: "Ubicación",
      valor: datos.ubicacion,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(datos.ubicacion)}`,
      esEnlace: true,
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      tipo: "WhatsApp",
      valor: datos.whatsapp,
      href: `https://wa.me/${datos.whatsapp.replace(/\D/g, "")}`,
      esEnlace: true,
      icono: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      tipo: "Correo electrónico",
      valor: datos.correo,
      href: `mailto:${datos.correo}`,
      esEnlace: true,
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      tipo: "LinkedIn",
      valor: datos.linkedin.replace(/^https?:\/\//, ""),
      href: `https://${datos.linkedin.replace(/^https?:\/\//, "")}`,
      esEnlace: true,
      icono: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.4 9.74v-8.37H5.06v8.37h2.8z" />
        </svg>
      ),
    },
    {
      tipo: "GitHub",
      valor: datos.github.replace(/^https?:\/\//, ""),
      href: `https://${datos.github.replace(/^https?:\/\//, "")}`,
      esEnlace: true,
      icono: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="contacto"
      className="w-full bg-hero-bg border-t border-border py-16 sm:py-24 px-4 scroll-mt-16 flex justify-center"
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Contacto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Información de contacto y enlaces directos */}
          <div className="md:col-span-5 space-y-3">
            {items.map((item) => (
              <a
                key={item.tipo}
                href={item.href}
                target={item.tipo !== "Correo electrónico" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-surface border border-border hover:border-accent/50 hover:shadow-xs transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-hover text-accent group-hover:bg-accent group-hover:text-accent-foreground flex items-center justify-center shrink-0 transition-colors">
                  {item.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                    {item.valor}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-muted-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            ))}
          </div>

          {/* Columna Derecha: Formulario interactivo */}
          <div className="md:col-span-7">
            <ContactoForm />
          </div>
        </div>
      </div>
    </section>
  );
}
