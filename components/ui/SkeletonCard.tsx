interface SkeletonCardProps {
  className?: string;
  variant?: "default" | "project" | "row";
  children?: React.ReactNode;
}

export default function SkeletonCard({
  className = "",
  variant = "default",
  children,
}: SkeletonCardProps) {
  const baseCardClasses =
    "bg-surface border border-border rounded-lg shadow-sm animate-pulse overflow-hidden";
  const combinedClasses = [baseCardClasses, className].filter(Boolean).join(" ");

  if (children) {
    return <div className={combinedClasses}>{children}</div>;
  }

  if (variant === "project") {
    return (
      <div className={combinedClasses}>
        {/* Espacio para imagen de portada */}
        <div className="w-full h-44 bg-surface-hover" />

        {/* Contenido de la tarjeta */}
        <div className="p-5 flex-1 flex flex-col space-y-3">
          {/* Título */}
          <div className="h-5 w-3/4 bg-surface-hover rounded" />

          {/* Líneas de descripción */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full bg-surface-hover rounded" />
            <div className="h-3.5 w-5/6 bg-surface-hover rounded" />
            <div className="h-3.5 w-2/3 bg-surface-hover rounded" />
          </div>

          {/* Chips de tags */}
          <div className="flex gap-1.5 pt-2">
            <div className="h-4 w-12 bg-surface-hover rounded-full" />
            <div className="h-4 w-16 bg-surface-hover rounded-full" />
            <div className="h-4 w-14 bg-surface-hover rounded-full" />
          </div>

          {/* Botón inferior / enlace */}
          <div className="pt-3 mt-auto border-t border-border flex items-center justify-between">
            <div className="h-4 w-24 bg-surface-hover rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div
        className={`${combinedClasses} p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3`}
      >
        {/* Miniatura cuadrada */}
        <div className="w-16 h-16 bg-surface-hover rounded-md shrink-0" />

        {/* Información central */}
        <div className="flex-1 min-w-0 w-full space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1/3 bg-surface-hover rounded" />
            <div className="h-4 w-16 bg-surface-hover rounded" />
            <div className="h-3.5 w-12 bg-surface-hover rounded" />
          </div>
          <div className="h-3.5 w-2/3 bg-surface-hover rounded" />
          <div className="flex gap-1.5 pt-0.5">
            <div className="h-3.5 w-12 bg-surface-hover rounded" />
            <div className="h-3.5 w-16 bg-surface-hover rounded" />
          </div>
        </div>

        {/* Acciones de edición */}
        <div className="flex gap-2 shrink-0 self-end sm:self-center">
          <div className="h-4 w-10 bg-surface-hover rounded" />
          <div className="h-4 w-10 bg-surface-hover rounded" />
        </div>
      </div>
    );
  }

  // variant === "default" (estilo Experiencia y general)
  return (
    <div className={`${combinedClasses} p-5 sm:p-6 space-y-3`}>
      {/* Encabezado: Badge y período */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-20 bg-surface-hover rounded" />
        <div className="h-3.5 w-28 bg-surface-hover rounded" />
      </div>

      {/* Título principal */}
      <div className="h-5 w-1/2 bg-surface-hover rounded" />

      {/* Líneas de descripción */}
      <div className="space-y-2 pt-1">
        <div className="h-3.5 w-full bg-surface-hover rounded" />
        <div className="h-3.5 w-4/5 bg-surface-hover rounded" />
      </div>

      {/* Subsección opcional (cargos) */}
      <div className="mt-3 pt-3 border-t border-border space-y-2">
        <div className="h-3.5 w-1/3 bg-surface-hover rounded" />
        <div className="h-3 w-1/4 bg-surface-hover rounded" />
      </div>
    </div>
  );
}
