"use client";

import Card from "@/components/ui/Card";
import ProyectoModal from "@/features/proyectos/ProyectoModal";
import {
  ProyectoEnlaceItem,
  ProyectoGaleriaItem,
  ProyectoTagItem,
} from "@/lib/proyectos-utils";
import { useState } from "react";

type ProyectoItemProps = {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  galeria?: ProyectoGaleriaItem[];
  tags?: ProyectoTagItem[];
  enlaces?: ProyectoEnlaceItem[];
};

export default function ProyectoItem({
  titulo,
  descripcion,
  imagenUrl,
  galeria = [],
  tags = [],
  enlaces = [],
}: ProyectoItemProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <Card className="overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-md border-border hover:border-border-strong">
        <div className="relative overflow-hidden w-full h-44 bg-surface-hover">
          <img
            src={imagenUrl}
            alt={titulo}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
            {titulo}
          </h3>
          <p className="text-sm text-muted flex-1 line-clamp-3 mb-4">
            {descripcion}
          </p>

          {/* Chips de tags en la card */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id || tag.nombre}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-hover text-muted border border-border"
                >
                  {tag.nombre}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-surface-hover text-muted-subtle border border-border">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="pt-2 mt-auto border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              <span>Ver proyecto</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card>

      <ProyectoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        titulo={titulo}
        descripcion={descripcion}
        imagenUrl={imagenUrl}
        galeria={galeria}
        tags={tags}
        enlaces={enlaces}
      />
    </>
  );
}
