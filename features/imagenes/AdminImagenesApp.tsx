"use client";

import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { formatearBytes, ImagenItem } from "@/lib/imagenes-utils";
import { useEffect, useMemo, useState } from "react";

export default function AdminImagenesApp() {
  const [imagenes, setImagenes] = useState<ImagenItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "huerfanas" | "en_uso">("todas");
  const [filtroCarpeta, setFiltroCarpeta] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState<string>("");

  // Selección múltiple
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [eliminando, setEliminando] = useState(false);

  // Carga de imágenes
  async function cargarImagenes() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/imagenes");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al obtener las imágenes.");
      }
      const data: ImagenItem[] = await res.json();
      setImagenes(data);
      // Limpiar selección de imágenes que ya no existan
      setSeleccionados(new Set());
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Error inesperado al conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let ignorar = false;
    async function inicializar() {
      try {
        const res = await fetch("/api/imagenes");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al obtener las imágenes.");
        }
        const data: ImagenItem[] = await res.json();
        if (!ignorar) {
          setImagenes(data);
          setError(null);
        }
      } catch (err) {
        if (!ignorar) {
          console.error(err);
          setError(
            err instanceof Error
              ? err.message
              : "Error inesperado al conectar con el servidor."
          );
        }
      } finally {
        if (!ignorar) {
          setCargando(false);
        }
      }
    }
    inicializar();
    return () => {
      ignorar = true;
    };
  }, []);

  // Carpetas disponibles
  const carpetasDisponibles = useMemo(() => {
    const set = new Set<string>();
    imagenes.forEach((img) => {
      if (img.folder) set.add(img.folder);
    });
    return Array.from(set).sort();
  }, [imagenes]);

  // Filtrado de imágenes
  const imagenesFiltradas = useMemo(() => {
    return imagenes.filter((img) => {
      // Filtro por estado
      if (filtroEstado === "huerfanas" && img.enUso) return false;
      if (filtroEstado === "en_uso" && !img.enUso) return false;

      // Filtro por carpeta
      if (filtroCarpeta !== "todas" && img.folder !== filtroCarpeta) return false;

      // Búsqueda por texto
      if (busqueda.trim()) {
        const query = busqueda.trim().toLowerCase();
        const coincideId = img.public_id.toLowerCase().includes(query);
        const coincideUrl = img.secure_url.toLowerCase().includes(query);
        if (!coincideId && !coincideUrl) return false;
      }

      return true;
    });
  }, [imagenes, filtroEstado, filtroCarpeta, busqueda]);

  // Contadores y métricas
  const totalImagenes = imagenes.length;
  const totalEnUso = imagenes.filter((img) => img.enUso).length;
  const totalHuerfanas = imagenes.filter((img) => !img.enUso).length;
  const bytesTotales = imagenes.reduce((acc, img) => acc + (img.bytes || 0), 0);

  // Manejo de selección
  function alternarSeleccion(publicId: string) {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(publicId)) {
        nuevo.delete(publicId);
      } else {
        nuevo.add(publicId);
      }
      return nuevo;
    });
  }

  function seleccionarTodasHuerfanas() {
    const huerfanas = imagenes.filter((img) => !img.enUso).map((img) => img.public_id);
    setSeleccionados(new Set(huerfanas));
  }

  function deseleccionarTodas() {
    setSeleccionados(new Set());
  }

  // Eliminación masiva o individual
  async function ejecutarEliminacion(idsAEliminar: string[]) {
    if (idsAEliminar.length === 0) return;

    // Verificar si alguna de las seleccionadas está en uso
    const imagenesEnUsoSeleccionadas = imagenes.filter(
      (img) => idsAEliminar.includes(img.public_id) && img.enUso
    );

    let mensajeConfirmacion = `¿Seguro que deseas eliminar ${idsAEliminar.length} ${
      idsAEliminar.length === 1 ? "imagen" : "imágenes"
    } de Cloudinary?`;

    if (imagenesEnUsoSeleccionadas.length > 0) {
      mensajeConfirmacion = `¡ATENCIÓN!\n${imagenesEnUsoSeleccionadas.length} de las imágenes seleccionadas ESTÁN EN USO en el sitio web (Hero o Proyectos).\n\nSi las eliminas, dejarán de verse en la página pública.\n\n¿Estás completamente seguro de continuar con la eliminación de ${idsAEliminar.length} imágenes?`;
    }

    const confirmado = window.confirm(mensajeConfirmacion);
    if (!confirmado) return;

    setEliminando(true);
    try {
      const res = await fetch("/api/imagenes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids: idsAEliminar }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al eliminar las imágenes.");
      }

      const totalBorradas = data.totalDeleted ?? 0;
      if (data.errors && data.errors.length > 0) {
        alert(
          `Se eliminaron ${totalBorradas} imágenes, pero ${data.errors.length} presentaron errores.`
        );
      }

      await cargarImagenes();
    } catch (err) {
      console.error("Error al eliminar imágenes:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Error inesperado al intentar eliminar las imágenes."
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Encabezado y Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Gestor de Imágenes de Cloudinary
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Cruce automático entre archivos alojados en Cloudinary y registros en la base de datos.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarImagenes}
          disabled={cargando || eliminando}
          className="self-start sm:self-auto px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-surface hover:bg-surface-hover text-foreground transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {cargando ? <Spinner size="sm" color="current" /> : "↻"}
          <span>Actualizar lista</span>
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="p-3">
          <p className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Total en bucket
          </p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {cargando ? "—" : totalImagenes}
          </p>
          <p className="text-[10px] text-muted-subtle mt-0.5">
            {cargando ? "Calculando..." : formatearBytes(bytesTotales)}
          </p>
        </Card>

        <Card className="p-3 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            En uso en la web
          </p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {cargando ? "—" : totalEnUso}
          </p>
          <p className="text-[10px] text-muted-subtle mt-0.5">
            En Hero y Proyectos
          </p>
        </Card>

        <Card className="p-3 border-rose-500/20 bg-rose-500/5">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Sin uso (Huérfanas)
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {cargando ? "—" : totalHuerfanas}
          </p>
          <p className="text-[10px] text-muted-subtle mt-0.5">
            Candidatas a limpiar
          </p>
        </Card>

        <Card className="p-3">
          <p className="text-[11px] font-medium text-muted uppercase tracking-wider">
            Seleccionadas
          </p>
          <p className="text-xl font-bold text-accent mt-0.5">
            {seleccionados.size}
          </p>
          <p className="text-[10px] text-muted-subtle mt-0.5">
            Para acción en lote
          </p>
        </Card>
      </div>

      {/* Barra de Filtros, Búsqueda y Acciones */}
      <Card className="p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filtros por Estado */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroEstado("todas")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroEstado === "todas"
                  ? "bg-accent text-accent-foreground shadow-xs"
                  : "bg-surface text-muted hover:bg-surface-hover border border-border"
              }`}
            >
              Todas ({totalImagenes})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("huerfanas")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroEstado === "huerfanas"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-surface text-rose-500 dark:text-rose-400 hover:bg-surface-hover border border-border"
              }`}
            >
              Sin uso ({totalHuerfanas})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("en_uso")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroEstado === "en_uso"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface text-emerald-600 dark:text-emerald-400 hover:bg-surface-hover border border-border"
              }`}
            >
              En uso ({totalEnUso})
            </button>
          </div>

          {/* Filtro por Carpeta y Búsqueda */}
          <div className="flex items-center gap-2 flex-1 md:justify-end">
            {carpetasDisponibles.length > 0 && (
              <select
                value={filtroCarpeta}
                onChange={(e) => setFiltroCarpeta(e.target.value)}
                className="text-xs border border-border-strong bg-surface rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="todas">Todas las carpetas</option>
                {carpetasDisponibles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre..."
              className="text-xs border border-border-strong bg-surface rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-faint focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-[200px]"
            />
          </div>
        </div>

        {/* Acciones de Selección Rápida y Eliminación */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={seleccionarTodasHuerfanas}
              disabled={totalHuerfanas === 0 || cargando || eliminando}
              className="text-xs text-accent hover:underline font-medium cursor-pointer disabled:opacity-40 disabled:no-underline"
            >
              Seleccionar todas las huérfanas ({totalHuerfanas})
            </button>
            {seleccionados.size > 0 && (
              <>
                <span className="text-muted-faint">•</span>
                <button
                  type="button"
                  onClick={deseleccionarTodas}
                  disabled={eliminando}
                  className="text-xs text-muted hover:text-foreground cursor-pointer"
                >
                  Deseleccionar
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => ejecutarEliminacion(Array.from(seleccionados))}
              disabled={seleccionados.size === 0 || eliminando || cargando}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              {eliminando && <Spinner size="sm" color="current" />}
              <span>
                {eliminando
                  ? "Eliminando..."
                  : `Eliminar seleccionadas (${seleccionados.size})`}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Mensaje de Error */}
      {error && (
        <Card className="p-4 mb-6 border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={cargarImagenes}
            className="underline font-medium hover:text-foreground ml-2 text-xs"
          >
            Reintentar
          </button>
        </Card>
      )}

      {/* Estado Cargando */}
      {cargando && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
          <Spinner size="lg" color="accent" />
          <p className="text-sm font-medium text-foreground">
            Consultando Cloudinary y cruzando datos con la base de datos...
          </p>
          <p className="text-xs text-muted">
            Esto puede demorar unos segundos mientras se extrae el bucket completo.
          </p>
        </div>
      )}

      {/* Estado Vacío */}
      {!cargando && imagenesFiltradas.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            No se encontraron imágenes.
          </p>
          <p className="text-xs text-muted">
            {imagenes.length === 0
              ? "No hay imágenes alojadas en Cloudinary bajo el prefijo 'mi-sitio-web/'."
              : "No hay imágenes que coincidan con los filtros aplicados."}
          </p>
        </Card>
      )}

      {/* Grilla Responsive de Imágenes (CSS Grid) */}
      {!cargando && imagenesFiltradas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {imagenesFiltradas.map((img) => {
            const estaSeleccionada = seleccionados.has(img.public_id);
            const nombreArchivo = img.public_id.split("/").pop() || img.public_id;

            return (
              <div
                key={img.public_id}
                onClick={() => alternarSeleccion(img.public_id)}
                className={`group relative rounded-lg border bg-surface overflow-hidden flex flex-col cursor-pointer transition-all ${
                  estaSeleccionada
                    ? "border-accent ring-2 ring-accent/30 shadow-sm"
                    : "border-border hover:border-border-strong hover:shadow-xs"
                }`}
              >
                {/* Contenedor de la miniatura */}
                <div className="relative aspect-square w-full bg-black/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.secure_url}
                    alt={nombreArchivo}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Checkbox superpuesto en la esquina superior izquierda */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={estaSeleccionada}
                      onChange={() => alternarSeleccion(img.public_id)}
                      className="w-4 h-4 rounded border-border-strong text-accent focus:ring-accent cursor-pointer bg-surface/90 shadow-xs"
                    />
                  </div>

                  {/* Badge absoluto de estado en la esquina superior derecha */}
                  <div className="absolute top-2 right-2 z-10">
                    {img.enUso ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block"></span>
                        En uso
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-200 inline-block"></span>
                        Sin uso
                      </span>
                    )}
                  </div>

                  {/* Botón rápido para abrir imagen completa en nueva pestaña */}
                  <a
                    href={img.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                    title="Ver imagen en tamaño completo"
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
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>

                {/* Información inferior de la tarjeta */}
                <div className="p-2.5 flex-1 flex flex-col justify-between gap-1 text-xs">
                  <div>
                    <p
                      className="font-medium text-foreground truncate text-[11px]"
                      title={img.public_id}
                    >
                      {nombreArchivo}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-subtle mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-surface-hover border border-border">
                        {img.folder}
                      </span>
                      <span>{formatearBytes(img.bytes)}</span>
                    </div>
                  </div>

                  {/* Acción individual de eliminación */}
                  <div
                    className="pt-1.5 mt-1 border-t border-border flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-muted-faint uppercase font-mono">
                      {img.format || "img"}
                    </span>
                    <button
                      type="button"
                      onClick={() => ejecutarEliminacion([img.public_id])}
                      disabled={eliminando}
                      className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer flex items-center gap-0.5"
                      title="Eliminar esta imagen de Cloudinary"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
