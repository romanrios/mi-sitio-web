"use client";

import { useEffect, useState } from "react";

type Card = {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  orden: number;
  creadoEn: string;
};

export default function AdminCardsApp() {
  const [cardsList, setCardsList] = useState<Card[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [orden, setOrden] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargarCards() {
    const res = await fetch("/api/cards");
    const data = await res.json();
    setCardsList(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarCards();
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setImagenUrl("");
    setOrden(0);
    setError("");
  }

  function cargarEnFormulario(card: Card) {
    setEditandoId(card.id);
    setTitulo(card.titulo);
    setDescripcion(card.descripcion);
    setImagenUrl(card.imagenUrl);
    setOrden(card.orden);
    setError("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const payload = { titulo, descripcion, imagenUrl, orden };
    const url = editandoId ? `/api/cards/${editandoId}` : "/api/cards";
    const method = editandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar.");
      setGuardando(false);
      return;
    }

    limpiarFormulario();
    await cargarCards();
    setGuardando(false);
  }

  async function borrar(id: number) {
    if (!confirm("¿Seguro que quieres borrar esta card?")) return;

    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    await cargarCards();
    if (editandoId === id) limpiarFormulario();
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {editandoId ? `Editando card #${editandoId}` : "Nueva card"}
      </h2>

      <form
        onSubmit={guardar}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-8 space-y-3"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            URL de imagen
          </label>
          <input
            type="url"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            required
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Orden (menor número aparece primero)
          </label>
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Cards existentes
      </h2>

      {cargando && <p className="text-gray-500">Cargando...</p>}
      {!cargando && cardsList.length === 0 && (
        <p className="text-gray-500">No hay cards creadas aún.</p>
      )}

      <div className="space-y-2">
        {cardsList.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-md p-3 flex items-center gap-3"
          >
            <img
              src={card.imagenUrl}
              alt={card.titulo}
              className="w-16 h-16 object-cover rounded-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {card.titulo}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {card.descripcion}
              </p>
              <p className="text-xs text-gray-400">Orden: {card.orden}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => cargarEnFormulario(card)}
                className="text-sm text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => borrar(card.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}