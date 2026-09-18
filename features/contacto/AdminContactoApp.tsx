"use client";

import Card from "@/components/ui/Card";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Spinner from "@/components/ui/Spinner";
import {
  ContactoItem,
  contactoItemsDefault,
  resolverUrlContacto,
  TipoContacto,
  TIPOS_CONTACTO,
} from "@/content/contacto";
import ContactoIcon from "@/features/contacto/ContactoIcon";
import { useEffect, useState } from "react";

export default function AdminContactoApp() {
  const [items, setItems] = useState<ContactoItem[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del formulario
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoContacto>("whatsapp");
  const [valor, setValor] = useState("");
  const [url, setUrl] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [reordenando, setReordenando] = useState(false);

  // Feedback
  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");

  const tipoActual =
    TIPOS_CONTACTO.find((t) => t.tipo === tipo) || TIPOS_CONTACTO[0];

  async function cargarContactos() {
    try {
      const res = await fetch("/api/contacto");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        setItems(contactoItemsDefault);
      }
    } catch (err) {
      console.error(err);
      setItems(contactoItemsDefault);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarContactos();
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTipo("whatsapp");
    setValor("");
    setUrl("");
    setError("");
  }

  function handleEditar(item: ContactoItem) {
    setEditandoId(item.id);
    setTipo((item.tipo as TipoContacto) || "otro");
    setValor(item.valor);
    setUrl(item.url || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!valor.trim()) {
      setError("El texto o valor a mostrar es obligatorio.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensajeExito("");

    try {
      if (editandoId) {
        // Actualizar item existente
        const res = await fetch(`/api/contacto/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo,
            valor: valor.trim(),
            url: url.trim() || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al actualizar el enlace.");
        }

        const actualizado = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === editandoId ? actualizado : i))
        );
        setMensajeExito("¡Enlace actualizado correctamente!");
      } else {
        // Crear nuevo item
        const res = await fetch("/api/contacto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo,
            valor: valor.trim(),
            url: url.trim() || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al crear el enlace.");
        }

        const nuevo = await res.json();
        setItems((prev) => [...prev, nuevo]);
        setMensajeExito("¡Nuevo enlace de contacto agregado!");
      }

      limpiarFormulario();
      setTimeout(() => setMensajeExito(""), 4000);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Seguro que querés eliminar este enlace de contacto?")) return;

    setEliminandoId(id);
    try {
      const res = await fetch(`/api/contacto/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo eliminar.");
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editandoId === id) {
        limpiarFormulario();
      }
    } catch (err: any) {
      alert(err.message || "Error al eliminar el enlace.");
    } finally {
      setEliminandoId(null);
    }
  }

  async function moverItem(indice: number, direccion: -1 | 1) {
    const nuevoIndice = indice + direccion;
    if (nuevoIndice < 0 || nuevoIndice >= items.length) return;

    const copia = [...items];
    const [movido] = copia.splice(indice, 1);
    copia.splice(nuevoIndice, 0, movido);

    // Reasignar orden
    const conNuevoOrden = copia.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setItems(conNuevoOrden);
    setReordenando(true);

    try {
      await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          conNuevoOrden.map((i) => ({ id: i.id, orden: i.orden }))
        ),
      });
    } catch (err) {
      console.error("Error al persistir reordenamiento:", err);
    } finally {
      setReordenando(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-10">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Enlaces de contacto
        </h2>
        <p className="text-sm text-muted">
          Agregá, modificá o eliminá los medios de contacto que se muestran en
          la sección pública de la web.
        </p>
      </div>

      {/* Formulario Crear / Editar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">
            {editandoId ? "Editar enlace" : "Agregar nuevo enlace"}
          </h3>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="text-xs text-muted hover:text-foreground cursor-pointer"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar}>
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Tipo / Ícono
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md bg-surface-hover border border-border flex items-center justify-center shrink-0 text-accent">
                    <ContactoIcon tipo={tipo} />
                  </div>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoContacto)}
                    className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {TIPOS_CONTACTO.map((t) => (
                      <option key={t.tipo} value={t.tipo}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Texto a mostrar
                </label>
                <input
                  type="text"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={`ej. ${tipoActual.placeholderValor}`}
                  className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Enlace / URL (opcional)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={tipoActual.placeholderUrl}
                className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-[11px] text-muted-subtle mt-1">
                Si lo dejás vacío, el enlace se autogenera según el tipo (ej.
                wa.me, mailto, maps, etc.).
              </p>
            </div>

            {mensajeExito && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {mensajeExito}
              </p>
            )}

            {error && <p className="text-xs text-error font-medium">{error}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={guardando}
                className="bg-accent text-accent-foreground px-5 py-2 rounded-md hover:bg-accent-hover font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
              >
                {guardando && <Spinner size="sm" color="current" />}
                <span>
                  {guardando
                    ? "Guardando..."
                    : editandoId
                    ? "Guardar cambios"
                    : "+ Agregar enlace"}
                </span>
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="px-4 py-2 rounded-md border border-border text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </Card>
        </form>
      </div>

      {/* Lista de enlaces existentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Enlaces actuales ({items.length})
          </h3>
          {reordenando && (
            <span className="text-xs text-muted-subtle flex items-center gap-1.5">
              <Spinner size="sm" color="accent" />
              <span>Guardando orden...</span>
            </span>
          )}
        </div>

        {cargando ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} variant="row" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-subtle italic">
            No hay enlaces configurados. Agregá el primero arriba.
          </p>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const urlResuelta = resolverUrlContacto(
                item.tipo,
                item.valor,
                item.url
              );

              return (
                <Card
                  key={item.id}
                  className={`p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all ${
                    editandoId === item.id
                      ? "ring-2 ring-accent border-transparent"
                      : ""
                  }`}
                >
                  {/* Ícono */}
                  <div className="w-10 h-10 rounded-lg bg-surface-hover text-accent flex items-center justify-center shrink-0 border border-border/50">
                    <ContactoIcon tipo={item.tipo} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.valor}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-surface-hover text-muted border border-border/60 shrink-0">
                        {item.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-subtle truncate font-mono">
                      {urlResuelta}
                    </p>
                  </div>

                  {/* Acciones: Reordenar, Editar, Eliminar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botones orden */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moverItem(index, -1)}
                        aria-label="Mover arriba"
                        className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-xs"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => moverItem(index, 1)}
                        aria-label="Mover abajo"
                        className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-xs"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Botón Editar */}
                    <button
                      type="button"
                      onClick={() => handleEditar(item)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      Editar
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      disabled={eliminandoId === item.id}
                      onClick={() => handleEliminar(item.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-md text-error hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {eliminandoId === item.id ? "..." : "Eliminar"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Nota Resend */}
      <div className="rounded-xl border border-border bg-surface/50 p-4 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground">
          💡 Envíos de formulario por correo
        </p>
        <p>
          Los mensajes enviados a través del formulario de la web son entregados
          directamente por correo electrónico usando <strong>Resend</strong> hacia
          el correo que tengas configurado aquí en tus enlaces (o la variable de
          entorno <code>CONTACT_RECEIVER_EMAIL</code>).
        </p>
      </div>
    </div>
  );
}
