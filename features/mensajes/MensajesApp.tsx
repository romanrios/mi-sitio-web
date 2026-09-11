"use client";

import Card from "@/components/ui/Card";
import { useEffect, useState } from "react";

type Mensaje = {
  id: number;
  contenido: string;
  autor: string | null;
  creadoEn: string;
};

export default function MensajesApp({
  estaLogueado,
}: {
  estaLogueado: boolean;
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function cargarMensajes() {
    const res = await fetch("/api/mensajes");
    const data = await res.json();
    setMensajes(data);
    setCargando(false);
  }

  useEffect(() => {
    fetch("/api/mensajes")
      .then((res) => res.json())
      .then((data) => {
        setMensajes(data);
        setCargando(false);
      });
  }, []);

  async function enviarMensaje(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    setError("");

    const res = await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: texto }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Ocurrió un error al enviar el mensaje.");
      setEnviando(false);
      return;
    }

    setTexto("");
    await cargarMensajes();
    setEnviando(false);
  }

  return (
    <div className="w-full max-w-md">
      {estaLogueado ? (
        <form onSubmit={enviarMensaje} className="flex gap-2 mb-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground placeholder:text-muted-faint focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={enviando}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50"
          >
            {enviando ? "..." : "Enviar"}
          </button>
        </form>
      ) : (
        <p className="text-muted-subtle text-center mb-2 text-sm">
          Inicia sesión para publicar un mensaje.
        </p>
      )}

      {error && (
        <p className="text-error text-sm mb-4 text-center">{error}</p>
      )}

      <div className="space-y-2 mt-6">
        {cargando && <p className="text-muted-subtle text-center">Cargando...</p>}
        {!cargando && mensajes.length === 0 && (
          <p className="text-muted-subtle text-center">No hay mensajes aún.</p>
        )}
        {mensajes.map((m) => (
          <Card key={m.id} className="rounded-md px-4 py-3">
            <p className="text-foreground">{m.contenido}</p>
            <p className="text-xs text-muted-faint mt-1">
              {m.autor ?? "Anónimo"} ·{" "}
              {new Date(m.creadoEn).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
