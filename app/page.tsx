"use client";

import { useEffect, useState } from "react";

type Mensaje = {
  id: number;
  contenido: string;
  creadoEn: string;
};

export default function Home() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargarMensajes() {
    const res = await fetch("/api/mensajes");
    const data = await res.json();
    setMensajes(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarMensajes();
  }, []);

  async function enviarMensaje(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: texto }),
    });
    setTexto("");
    await cargarMensajes();
    setEnviando(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Mi Sitio Web
        </h1>

        <form onSubmit={enviarMensaje} className="flex gap-2 mb-8">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={enviando}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {enviando ? "..." : "Enviar"}
          </button>
        </form>

        <div className="space-y-2">
          {cargando && <p className="text-gray-500 text-center">Cargando...</p>}
          {!cargando && mensajes.length === 0 && (
            <p className="text-gray-500 text-center">No hay mensajes aún.</p>
          )}
          {mensajes.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-md px-4 py-3 shadow-sm"
            >
              <p className="text-gray-800">{m.contenido}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(m.creadoEn).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}