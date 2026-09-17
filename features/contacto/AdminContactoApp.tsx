"use client";

import Card from "@/components/ui/Card";
import { ContactoData, contactoDefault } from "@/content/contacto";
import { useEffect, useState } from "react";

export default function AdminContactoApp() {
  const [ubicacion, setUbicacion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [correo, setCorreo] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorDatos, setErrorDatos] = useState("");

  async function cargarContacto() {
    try {
      const res = await fetch("/api/contacto");
      const data: ContactoData = await res.json();
      setUbicacion(data.ubicacion || contactoDefault.ubicacion);
      setWhatsapp(data.whatsapp || contactoDefault.whatsapp);
      setCorreo(data.correo || contactoDefault.correo);
      setLinkedin(data.linkedin || contactoDefault.linkedin);
      setGithub(data.github || contactoDefault.github);
    } catch (err) {
      console.error(err);
      setErrorDatos("No se pudieron cargar los datos de contacto.");
    } finally {
      setCargandoDatos(false);
    }
  }

  useEffect(() => {
    cargarContacto();
  }, []);

  async function handleGuardarContacto(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrorDatos("");
    setMensajeExito("");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ubicacion, whatsapp, correo, linkedin, github }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar los datos.");
      }

      setMensajeExito("¡Datos de contacto actualizados correctamente!");
      setTimeout(() => setMensajeExito(""), 4000);
    } catch (err: any) {
      setErrorDatos(err.message || "Error al actualizar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Datos de contacto
        </h2>
        <p className="text-sm text-muted mb-6">
          Modificá la información de contacto pública mostrada en el sitio web. Los mensajes enviados por los visitantes desde el formulario se envían directamente a tu casilla de correo electrónico.
        </p>

        {cargandoDatos ? (
          <p className="text-sm text-muted">Cargando datos de contacto...</p>
        ) : (
          <form onSubmit={handleGuardarContacto}>
            <Card className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  required
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="ej. Santa Fe, Argentina"
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="ej. +54 9 342 432-4907"
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Correo electrónico (para enlaces y recepción de mensajes)
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ej. romanrios@live.com"
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  required
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="ej. linkedin.com/in/romanrios"
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  GitHub
                </label>
                <input
                  type="text"
                  required
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="ej. github.com/romanrios"
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {mensajeExito && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {mensajeExito}
                </p>
              )}

              {errorDatos && (
                <p className="text-xs text-error font-medium">{errorDatos}</p>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="bg-accent text-accent-foreground px-5 py-2.5 rounded-md hover:bg-accent-hover font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </Card>
          </form>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-4 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground">💡 Envío de mensajes por correo</p>
        <p>
          Los mensajes enviados a través del formulario de la web son entregados directamente por correo electrónico usando <strong>Resend</strong> hacia tu casilla ({correo || "romanrios@live.com"}), sin almacenarse en la base de datos.
        </p>
      </div>
    </div>
  );
}
