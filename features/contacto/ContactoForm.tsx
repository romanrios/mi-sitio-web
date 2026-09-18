"use client";

import Spinner from "@/components/ui/Spinner";
import { useState } from "react";

export default function ContactoForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) return;

    setEnviando(true);
    setError("");

    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          mensaje,
          sitio_web: sitioWeb,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(
            "Has enviado varios mensajes recientemente. Por favor, espera unos minutos antes de intentar de nuevo."
          );
        }
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ocurrió un error al enviar el mensaje.");
      }

      setEnviado(true);
      setNombre("");
      setEmail("");
      setMensaje("");
      setSitioWeb("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo enviar el mensaje.";
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      {enviado ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl p-5 text-center space-y-3 animate-in fade-in duration-300">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="font-semibold text-base">¡Mensaje enviado con éxito!</p>
          <p className="text-xs text-muted">
            Gracias por escribir. Te responderé al correo proporcionado lo antes posible.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="text-xs font-medium text-accent hover:underline pt-2 inline-block cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Honeypot para mitigación de spam automatizado (oculto visualmente y para lectores de pantalla) */}
          <div
            className="absolute opacity-0 -z-50 pointer-events-none w-0 h-0 overflow-hidden"
            style={{ position: "absolute", left: "-9999px" }}
            aria-hidden="true"
          >
            <label htmlFor="sitio_web">No completar este campo</label>
            <input
              id="sitio_web"
              name="sitio_web"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={sitioWeb}
              onChange={(e) => setSitioWeb(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="nombre"
              className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5"
            >
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              maxLength={100}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-subtle"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-subtle"
            />
          </div>

          <div>
            <label
              htmlFor="mensaje"
              className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5"
            >
              Mensaje
            </label>
            <textarea
              id="mensaje"
              required
              maxLength={5000}
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="¿En qué te puedo ayudar o qué proyecto tenés en mente?"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-subtle resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-error font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-accent text-accent-foreground font-medium text-sm py-2.5 px-4 rounded-lg hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {enviando ? (
              <>
                <Spinner size="sm" color="current" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <span>Enviar mensaje</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
