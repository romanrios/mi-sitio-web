"use client";

import Card from "@/components/ui/Card";
import { CATEGORIA_POR_DEFECTO, CATEGORIAS } from "@/lib/categorias";
import { useEffect, useState } from "react";

type CardData = {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
  orden: number;
  creadoEn: string;
};

export default function AdminCardsApp() {
  const [cardsList, setCardsList] = useState<CardData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIA_POR_DEFECTO);
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
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        setCardsList(data);
        setCargando(false);
      });
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setImagenUrl("");
    setCategoria(CATEGORIA_POR_DEFECTO);
    setOrden(0);
    setError("");
  }

  function cargarEnFormulario(card: CardData) {
    setEditandoId(card.id);
    setTitulo(card.titulo);
    setDescripcion(card.descripcion);
    setImagenUrl(card.imagenUrl);
    setCategoria(card.categoria || CATEGORIA_POR_DEFECTO);
    setOrden(card.orden);
    setError("");
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const payload = { titulo, descripcion, imagenUrl, categoria, orden };
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
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {editandoId ? `Editando card #${editandoId}` : "Nueva card"}
      </h2>

      <form onSubmit={guardar}>
        <Card className="p-4 mb-8 space-y-3">
        <div>
          <label className="block text-sm text-muted mb-1">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={3}
            className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">
            URL de imagen
          </label>
          <input
            type="url"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            required
            placeholder="https://..."
            className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">
            Orden (menor número aparece primero)
          </label>
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
            className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground"
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50"
          >
            {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Crear"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="text-muted px-4 py-2 rounded-md hover:bg-surface-hover"
            >
              Cancelar
            </button>
          )}
        </div>
        </Card>
      </form>

      <h2 className="text-lg font-semibold text-foreground mb-4">
        Cards existentes
      </h2>

      {cargando && <p className="text-muted-subtle">Cargando...</p>}
      {!cargando && cardsList.length === 0 && (
        <p className="text-muted-subtle">No hay cards creadas aún.</p>
      )}

      <div className="space-y-2">
        {cardsList.map((card) => (
          <Card
            key={card.id}
            className="rounded-md p-3 flex items-center gap-3"
          >
            <img
              src={card.imagenUrl}
              alt={card.titulo}
              className="w-16 h-16 object-cover rounded-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-foreground truncate">
                  {card.titulo}
                </p>
                <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-muted border border-border shrink-0">
                  {card.categoria}
                </span>
              </div>
              <p className="text-sm text-muted-subtle truncate">
                {card.descripcion}
              </p>
              <p className="text-xs text-muted-faint">Orden: {card.orden}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => cargarEnFormulario(card)}
                className="text-sm text-accent hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => borrar(card.id)}
                className="text-sm text-error hover:underline"
              >
                Borrar
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

