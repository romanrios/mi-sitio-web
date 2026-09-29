"use client";

import { useEffect, useRef } from "react";

type UseModalHistoryOptions = {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
};

/**
 * Hook para permitir que los modales se cierren con el botón "Atrás" del navegador
 * (y gestos de retroceso en móviles/tablets), restaurando el historial limpiamente
 * si el modal se cierra mediante la interfaz de usuario (botón X, backdrop, Escape).
 */
export function useModalHistory({
  isOpen,
  onClose,
  id = "modal",
}: UseModalHistoryOptions) {
  const onCloseRef = useRef(onClose);
  const pushedKeyRef = useRef<string | null>(null);
  const closedByPopstateRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isOpen) {
      // Si el modal se cerró por la interfaz de usuario (no por el evento popstate del navegador)
      // y aún tenemos la entrada activa en el historial, la revertimos con history.back()
      if (pushedKeyRef.current && !closedByPopstateRef.current) {
        pushedKeyRef.current = null;
        try {
          window.history.back();
        } catch {
          // Ignorar silenciosamente si history.back() no está disponible
        }
      }
      closedByPopstateRef.current = false;
      return;
    }

    // Modal abierto: creamos un identificador único en el historial de sesión
    const stateKey = `modal_${id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    pushedKeyRef.current = stateKey;
    closedByPopstateRef.current = false;

    try {
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      window.history.pushState(
        { ...currentState, [stateKey]: true },
        "",
        window.location.href
      );
    } catch {
      // Ignorar si pushState falla (ej. en sandboxes restringidos)
    }

    function handlePopState(e: PopStateEvent) {
      // Si nuestra clave fue insertada pero ya no está en el nuevo e.state,
      // significa que el usuario navegó hacia atrás en el navegador
      if (
        pushedKeyRef.current &&
        (!e.state || !e.state[pushedKeyRef.current])
      ) {
        pushedKeyRef.current = null;
        closedByPopstateRef.current = true;
        onCloseRef.current();
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Limpieza en desmontaje si el modal sigue abierto sin haber sido cerrado por popstate
      if (pushedKeyRef.current && !closedByPopstateRef.current) {
        pushedKeyRef.current = null;
        try {
          window.history.back();
        } catch {
          // Ignorar silenciosamente
        }
      }
    };
  }, [isOpen, id]);
}
