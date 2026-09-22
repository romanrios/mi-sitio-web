"use client";

import Card from "@/components/ui/Card";
import ImageUploader from "@/components/ui/ImageUploader";
import SkeletonCard from "@/components/ui/SkeletonCard";
import Spinner from "@/components/ui/Spinner";
import {
  ProyectoData,
  TipoGaleria,
  extraerYoutubeId,
  extraerVimeoId,
} from "@/lib/proyectos-utils";
import { CATEGORIA_POR_DEFECTO, CATEGORIAS } from "@/lib/categorias";
import { useEffect, useState } from "react";
import GaleriaMiniatura from "./GaleriaMiniatura";

export default function AdminProyectosApp() {
  const [proyectosList, setProyectosList] = useState<ProyectoData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIA_POR_DEFECTO);
  const [orden, setOrden] = useState(0);

  // Estados para las tablas hijas
  const [galeria, setGaleria] = useState<{ tipo: TipoGaleria; url: string }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [nuevoTagInput, setNuevoTagInput] = useState("");
  const [enlaces, setEnlaces] = useState<{ etiqueta: string; url: string }[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cargarProyectos() {
    const res = await fetch("/api/proyectos");
    const data = await res.json();
    setProyectosList(data);
    setCargando(false);
  }

  useEffect(() => {
    let ignorar = false;
    async function inicializar() {
      const res = await fetch("/api/proyectos");
      const data = await res.json();
      if (!ignorar) {
        setProyectosList(data);
        setCargando(false);
      }
    }
    inicializar();
    return () => {
      ignorar = true;
    };
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setImagenUrl("");
    setCategoria(CATEGORIA_POR_DEFECTO);
    setOrden(0);
    setGaleria([]);
    setTags([]);
    setNuevoTagInput("");
    setEnlaces([]);
    setError("");
  }

  function cargarEnFormulario(proyecto: ProyectoData) {
    setEditandoId(proyecto.id);
    setTitulo(proyecto.titulo);
    setDescripcion(proyecto.descripcion);
    setImagenUrl(proyecto.imagenUrl);
    setCategoria(proyecto.categoria || CATEGORIA_POR_DEFECTO);
    setOrden(proyecto.orden);

    setGaleria(
      proyecto.galeria?.map((g) => ({ tipo: g.tipo, url: g.url })) ?? []
    );
    setTags(proyecto.tags?.map((t) => t.nombre) ?? []);
    setNuevoTagInput("");
    setEnlaces(
      proyecto.enlaces?.map((e) => ({ etiqueta: e.etiqueta, url: e.url })) ?? []
    );
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Manejo de Galería
  const [arrastrandoIndex, setArrastrandoIndex] = useState<number | null>(null);
  const [posicionSobreIndex, setPosicionSobreIndex] = useState<number | null>(null);

  function agregarItemGaleria() {
    setGaleria([...galeria, { tipo: "imagen", url: "" }]);
  }

  function actualizarItemGaleria(index: number, campo: "tipo" | "url", valor: string) {
    const nueva = [...galeria];
    nueva[index] = { ...nueva[index], [campo]: valor };
    setGaleria(nueva);
  }

  function eliminarItemGaleria(index: number) {
    setGaleria(galeria.filter((_, i) => i !== index));
  }

  function moverItemGaleria(origenIndex: number, destinoIndex: number) {
    if (
      destinoIndex < 0 ||
      destinoIndex >= galeria.length ||
      origenIndex === destinoIndex
    ) {
      return;
    }
    const nueva = [...galeria];
    const [itemRemovido] = nueva.splice(origenIndex, 1);
    nueva.splice(destinoIndex, 0, itemRemovido);
    setGaleria(nueva);
  }

  function moverItemPaso(index: number, delta: -1 | 1) {
    moverItemGaleria(index, index + delta);
  }

  const [subiendoGaleriaIndex, setSubiendoGaleriaIndex] = useState<number | null>(null);

  async function subirArchivoAGaleria(file: File, index: number) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      alert("Formato no soportado. Usá JPG, PNG, WEBP o GIF.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("carpeta", "proyectos");
    setSubiendoGaleriaIndex(index);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const nueva = [...galeria];
        nueva[index] = { tipo: "imagen", url: data.url };
        setGaleria(nueva);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      alert("Error inesperado al subir la imagen.");
    } finally {
      setSubiendoGaleriaIndex(null);
    }
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setArrastrandoIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }
    if (posicionSobreIndex !== index) {
      setPosicionSobreIndex(index);
    }
  }

  async function handleDrop(e: React.DragEvent, destinoIndex: number) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        await subirArchivoAGaleria(file, destinoIndex);
      }
      setPosicionSobreIndex(null);
      return;
    }
    if (arrastrandoIndex !== null && arrastrandoIndex !== destinoIndex) {
      moverItemGaleria(arrastrandoIndex, destinoIndex);
    }
    setArrastrandoIndex(null);
    setPosicionSobreIndex(null);
  }

  function handleDragEnd() {
    setArrastrandoIndex(null);
    setPosicionSobreIndex(null);
  }

  // Manejo de Tags
  function agregarTag() {
    const limpio = nuevoTagInput.trim();
    if (!limpio) return;
    if (!tags.includes(limpio)) {
      setTags([...tags, limpio]);
    }
    setNuevoTagInput("");
  }

  function eliminarTag(tagAEliminar: string) {
    setTags(tags.filter((t) => t !== tagAEliminar));
  }

  // Manejo de Enlaces
  function agregarEnlace() {
    setEnlaces([...enlaces, { etiqueta: "", url: "" }]);
  }

  function actualizarEnlace(index: number, campo: "etiqueta" | "url", valor: string) {
    const nuevos = [...enlaces];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setEnlaces(nuevos);
  }

  function eliminarEnlace(index: number) {
    setEnlaces(enlaces.filter((_, i) => i !== index));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!imagenUrl.trim()) {
      setError("La imagen principal (portada) es requerida.");
      return;
    }

    setGuardando(true);

    // Validar y limpiar galería
    const galeriaLimpia = galeria
      .filter((item) => item.url.trim().length > 0)
      .map((item, index) => ({
        tipo: item.tipo,
        url: item.url.trim(),
        orden: index,
      }));

    // Validar y limpiar tags
    const tagsLimpios = tags.map((t, index) => ({
      nombre: t.trim(),
      orden: index,
    }));

    // Validar y limpiar enlaces
    const enlacesLimpios = enlaces
      .filter((e) => e.etiqueta.trim().length > 0 && e.url.trim().length > 0)
      .map((e, index) => ({
        etiqueta: e.etiqueta.trim(),
        url: e.url.trim(),
        orden: index,
      }));

    const payload = {
      titulo,
      descripcion,
      imagenUrl,
      categoria,
      orden,
      galeria: galeriaLimpia,
      tags: tagsLimpios,
      enlaces: enlacesLimpios,
    };

    const url = editandoId ? `/api/proyectos/${editandoId}` : "/api/proyectos";
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
    await cargarProyectos();
    setGuardando(false);
  }

  async function borrar(id: number) {
    if (!confirm("¿Seguro que quieres borrar este proyecto?")) return;

    await fetch(`/api/proyectos/${id}`, { method: "DELETE" });
    await cargarProyectos();
    if (editandoId === id) limpiarFormulario();
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {editandoId ? `Editando proyecto #${editandoId}` : "Nuevo proyecto"}
      </h2>

      <form onSubmit={guardar}>
        <Card className="p-4 mb-8 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1 font-medium">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1 font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1 font-medium">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={3}
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <ImageUploader
            value={imagenUrl}
            onChange={setImagenUrl}
            carpeta="proyectos"
            label="Imagen principal (portada)"
            helperText="Se subirá a Cloudinary (carpeta mi-sitio-web/proyectos) y se usará como portada y miniatura."
            aspectRatio="video"
            disabled={guardando}
          />

          <div>
            <label className="block text-sm text-muted mb-1 font-medium">
              Orden (menor número aparece primero)
            </label>
            <input
              type="number"
              value={orden}
              onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
              className="w-full border border-border-strong bg-surface rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {/* Sección Galería */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <label className="text-sm font-semibold text-foreground">
                    Galería multimedia ({galeria.length})
                  </label>
                  <p className="text-xs text-muted-subtle mt-0.5">
                    Imágenes y/o videos de YouTube o Vimeo. Arrastra o usa las flechas para ordenar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={agregarItemGaleria}
                  className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  + Agregar elemento
                </button>
              </div>

              {galeria.length === 0 ? (
                <p className="text-xs text-muted-faint italic py-2">
                  No hay elementos en la galería. Se utilizará únicamente la imagen principal.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  {galeria.map((item, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        if (posicionSobreIndex === index) setPosicionSobreIndex(null);
                      }}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-2.5 rounded-lg border transition-all ${
                        arrastrandoIndex === index
                          ? "opacity-40 border-dashed border-accent bg-accent/5"
                          : posicionSobreIndex === index && arrastrandoIndex !== index
                          ? "border-accent bg-surface-hover shadow-sm"
                          : "bg-surface border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Controles de orden + Miniatura */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Botones de orden y badge */}
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moverItemPaso(index, -1)}
                              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Subir (mover antes)"
                              aria-label={`Subir elemento ${index + 1}`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </button>

                            <span
                              className="text-[10px] font-mono font-bold text-muted-subtle cursor-grab active:cursor-grabbing select-none px-1 py-0.5 rounded hover:bg-surface-hover"
                              title="Arrastrar para reordenar"
                            >
                              #{index + 1}
                            </span>

                            <button
                              type="button"
                              disabled={index === galeria.length - 1}
                              onClick={() => moverItemPaso(index, 1)}
                              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                              title="Bajar (mover después)"
                              aria-label={`Bajar elemento ${index + 1}`}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Manija visual de arrastre */}
                          <div
                            className="text-muted-faint hover:text-muted cursor-grab active:cursor-grabbing select-none hidden sm:block"
                            title="Arrastrar para reordenar"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 5a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm6-16a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>

                          {/* Miniatura visual */}
                          <GaleriaMiniatura
                            tipo={item.tipo}
                            url={item.url}
                            className="w-20 h-14 sm:w-24 sm:h-16 shrink-0"
                          />
                        </div>

                        {/* Inputs y controles de edición */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={item.tipo}
                              onChange={(e) =>
                                actualizarItemGaleria(
                                  index,
                                  "tipo",
                                  e.target.value as TipoGaleria
                                )
                              }
                              className="text-xs border border-border-strong bg-surface rounded px-2 py-1.5 text-foreground font-medium shrink-0"
                            >
                              <option value="imagen">Imagen</option>
                              <option value="youtube">YouTube</option>
                              <option value="vimeo">Vimeo</option>
                            </select>
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) =>
                                actualizarItemGaleria(index, "url", e.target.value)
                              }
                              placeholder={
                                item.tipo === "imagen"
                                  ? "https://ejemplo.com/foto.jpg"
                                  : item.tipo === "youtube"
                                  ? "URL o ID de YouTube (ej. dQw4w9WgXcQ)"
                                  : "URL o ID de Vimeo (ej. 76979871)"
                              }
                              className="flex-1 min-w-0 text-xs border border-border-strong bg-surface rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                          </div>

                          {/* Barra inferior del item: enlace rápido + Subir + Eliminar */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                            <div className="text-[11px] text-muted-subtle truncate flex items-center gap-1.5 min-w-0">
                              {item.url.trim() ? (
                                <a
                                  href={
                                    item.tipo === "youtube"
                                      ? `https://www.youtube.com/watch?v=${extraerYoutubeId(item.url)}`
                                      : item.tipo === "vimeo"
                                      ? `https://vimeo.com/${extraerVimeoId(item.url).split("?")[0]}`
                                      : item.url.trim()
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-accent hover:underline flex items-center gap-1 truncate"
                                  title="Abrir en pestaña nueva"
                                >
                                  <span className="truncate">
                                    {item.tipo === "imagen"
                                      ? item.url.split("/").pop() || item.url
                                      : `${item.tipo.toUpperCase()}: ${item.url}`}
                                  </span>
                                  <svg
                                    className="w-3 h-3 shrink-0 opacity-60"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <span className="italic text-muted-faint">Sin URL definida</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.tipo === "imagen" && (
                                <label
                                  className="text-xs bg-surface-hover hover:bg-surface border border-border-strong px-2.5 py-1 rounded cursor-pointer text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                                  title="Subir archivo o arrastrar imagen encima"
                                >
                                  {subiendoGaleriaIndex === index ? (
                                    <>
                                      <Spinner size="sm" color="current" />
                                      <span>Subiendo...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Subir</span>
                                      <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        disabled={subiendoGaleriaIndex !== null}
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          await subirArchivoAGaleria(file, index);
                                          e.target.value = "";
                                        }}
                                      />
                                    </>
                                  )}
                                </label>
                              )}
                              <button
                                type="button"
                                onClick={() => eliminarItemGaleria(index)}
                                className="text-xs text-error hover:bg-error/10 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                                title="Eliminar elemento de la galería"
                              >
                                ✕ Quitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sección Tags / Tecnologías */}
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-semibold text-foreground mb-1">
                Tecnologías usadas ({tags.length})
              </label>
              <p className="text-xs text-muted-subtle mb-2">
                Escribe una tecnología (ej. React, Unity, Next.js) y presiona Enter o el botón &quot;+&quot;.
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={nuevoTagInput}
                  onChange={(e) => setNuevoTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarTag();
                    }
                  }}
                  placeholder="ej. Next.js"
                  className="flex-1 text-xs border border-border-strong bg-surface rounded px-3 py-2 text-foreground"
                />
                <button
                  type="button"
                  onClick={agregarTag}
                  className="text-xs bg-surface-hover border border-border-strong hover:bg-surface text-foreground font-medium px-3 py-2 rounded cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-surface-hover border border-border">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-surface border border-border-strong text-foreground font-medium"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => eliminarTag(t)}
                        className="text-muted hover:text-error text-xs font-bold leading-none cursor-pointer"
                        title={`Quitar ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sección Enlaces del proyecto */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-foreground">
                  Enlaces del proyecto ({enlaces.length})
                </label>
                <button
                  type="button"
                  onClick={agregarEnlace}
                  className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  + Agregar enlace
                </button>
              </div>
              <p className="text-xs text-muted-subtle mb-3">
                Links externos como &quot;Código&quot;, &quot;Despliegue en vivo&quot;, &quot;Itch.io&quot;, etc.
              </p>

              {enlaces.length === 0 ? (
                <p className="text-xs text-muted-faint italic py-1">
                  No hay enlaces asociados a este proyecto.
                </p>
              ) : (
                <div className="space-y-2">
                  {enlaces.map((enlace, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md bg-surface-hover border border-border"
                    >
                      <input
                        type="text"
                        value={enlace.etiqueta}
                        onChange={(e) =>
                          actualizarEnlace(index, "etiqueta", e.target.value)
                        }
                        placeholder="Etiqueta (ej. Código, Demo)"
                        className="w-1/3 text-xs border border-border-strong bg-surface rounded px-2 py-1.5 text-foreground"
                      />
                      <input
                        type="url"
                        value={enlace.url}
                        onChange={(e) =>
                          actualizarEnlace(index, "url", e.target.value)
                        }
                        placeholder="https://github.com/..."
                        className="flex-1 text-xs border border-border-strong bg-surface rounded px-2 py-1.5 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarEnlace(index)}
                        className="text-xs text-error hover:underline px-2 py-1 cursor-pointer"
                        title="Eliminar enlace"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent-hover disabled:opacity-50 font-medium cursor-pointer flex items-center gap-2"
            >
              {guardando && <Spinner size="sm" color="current" />}
              <span>
                {guardando
                  ? "Guardando..."
                  : editandoId
                  ? "Actualizar proyecto"
                  : "Crear proyecto"}
              </span>
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="text-muted px-4 py-2 rounded-md hover:bg-surface-hover cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </Card>
      </form>

      <h2 className="text-lg font-semibold text-foreground mb-4">
        Proyectos existentes
      </h2>

      {cargando && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} variant="row" />
          ))}
        </div>
      )}

      {!cargando && proyectosList.length === 0 && (
        <p className="text-muted-subtle">No hay proyectos creados aún.</p>
      )}

      {!cargando && proyectosList.length > 0 && (
        <div className="space-y-3">
          {proyectosList.map((proyecto) => {
          const numImagenes = proyecto.galeria?.filter((g) => g.tipo === "imagen").length ?? 0;
          const numVideos = proyecto.galeria?.filter((g) => g.tipo === "youtube" || g.tipo === "vimeo").length ?? 0;
          const numEnlaces = proyecto.enlaces?.length ?? 0;

          return (
            <Card
              key={proyecto.id}
              className="rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proyecto.imagenUrl}
                alt={proyecto.titulo}
                className="w-16 h-16 object-cover rounded-md shrink-0"
              />
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-medium text-foreground truncate">
                    {proyecto.titulo}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-hover text-muted border border-border shrink-0">
                    {proyecto.categoria}
                  </span>
                  <span className="text-xs text-muted-faint shrink-0">
                    Orden: {proyecto.orden}
                  </span>
                </div>
                <p className="text-sm text-muted-subtle truncate mb-2">
                  {proyecto.descripcion}
                </p>

                {/* Resumen de vista extendida */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  {(numImagenes > 0 || numVideos > 0) && (
                    <span className="inline-flex items-center gap-1 bg-surface-hover px-2 py-0.5 rounded border border-border">
                      {numImagenes > 0 && `📷 ${numImagenes}`}
                      {numVideos > 0 && `🎥 ${numVideos}`}
                    </span>
                  )}
                  {numEnlaces > 0 && (
                    <span className="inline-flex items-center gap-1 bg-surface-hover px-2 py-0.5 rounded border border-border">
                      🔗 {numEnlaces} {numEnlaces === 1 ? "enlace" : "enlaces"}
                    </span>
                  )}
                  {proyecto.tags && proyecto.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proyecto.tags.map((t) => (
                        <span
                          key={t.id || t.nombre}
                          className="px-1.5 py-0.5 rounded bg-surface-hover text-foreground border border-border font-mono text-[11px]"
                        >
                          {t.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => cargarEnFormulario(proyecto)}
                  className="text-sm text-accent hover:underline cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrar(proyecto.id)}
                  className="text-sm text-error hover:underline cursor-pointer"
                >
                  Borrar
                </button>
              </div>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
