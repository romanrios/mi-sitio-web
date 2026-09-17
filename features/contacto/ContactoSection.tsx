import { db } from "@/app/db";
import { contacto } from "@/app/db/schema";
import {
  ContactoItem,
  contactoItemsDefault,
  resolverUrlContacto,
} from "@/content/contacto";
import ContactoForm from "@/features/contacto/ContactoForm";
import ContactoIcon from "@/features/contacto/ContactoIcon";
import { asc } from "drizzle-orm";

export default async function ContactoSection() {
  let items: ContactoItem[] = contactoItemsDefault;

  try {
    const dbItems = await db.query.contacto.findMany({
      orderBy: [asc(contacto.orden), asc(contacto.id)],
    });
    if (dbItems && dbItems.length > 0) {
      items = dbItems;
    }
  } catch (err) {
    console.error("Error al cargar enlaces de contacto:", err);
  }

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
          {/* Columna Izquierda: Información de contacto y enlaces directos dinámicos */}
          <div className="md:col-span-5 space-y-3">
            {items.map((item) => {
              const href = resolverUrlContacto(item.tipo, item.valor, item.url);
              const esCorreo =
                item.tipo.toLowerCase() === "correo" ||
                item.tipo.toLowerCase() === "email";

              return (
                <a
                  key={item.id}
                  href={href}
                  target={!esCorreo ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-surface border border-border hover:border-accent/50 hover:shadow-xs transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-hover text-accent group-hover:bg-accent group-hover:text-accent-foreground flex items-center justify-center shrink-0 transition-colors">
                    <ContactoIcon tipo={item.tipo} />
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
              );
            })}
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
