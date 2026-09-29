"use client";

import { useEffect, useRef } from "react";

type Point = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phase: number;
  energy: number;
  clearance: number; // 0 (dentro del margen limpio de elementos) a 1 (completamente libre)
};

type Obstacle = {
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  r: number;
  margin: number;
};

// Función de distancia con signo (SDF) para cajas con esquinas redondeadas o círculos
function sdRoundedBox(
  px: number,
  py: number,
  cx: number,
  cy: number,
  hx: number,
  hy: number,
  r: number
): number {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const outsideDist = Math.hypot(ox, oy);
  const insideDist = Math.min(Math.max(qx, qy), 0);
  return outsideDist + insideDist - r;
}

type SpontaneousChain = {
  nodes: number[]; // Secuencia de índices de puntos encadenados
  life: number; // 0 a 1 progreso general de vida
  speed: number;
  maxAlpha: number;
};

export default function HeroOrganismBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isVisible = true;
    let lastTime = performance.now();
    let width = 0;
    let height = 0;

    // Detección reactiva de tema (dark / light)
    let isDark = document.documentElement.classList.contains("dark");
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Elemento de sección raíz
    const sectionElement = container.closest("section") || container;

    // Matriz de puntos y obstáculos
    let points: Point[] = [];
    let cols = 0;
    let rows = 0;
    let obstacles: Obstacle[] = [];

    // Conexiones encadenadas espontáneas que forman patrones más largos por la matriz
    let chains: SpontaneousChain[] = [];
    let nextChainSpawn = 0;

    // Actualiza el factor de despeje (clearance) de cada punto respecto a los obstáculos
    const updatePointsClearance = () => {
      const feather = 14; // Suavizado de 14px en el límite exterior del margen limpio

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (obstacles.length === 0) {
          p.clearance = 1;
          continue;
        }

        let minSignedDistToMargin = Infinity;

        for (let j = 0; j < obstacles.length; j++) {
          const obs = obstacles[j];
          const sd = sdRoundedBox(
            p.baseX,
            p.baseY,
            obs.cx,
            obs.cy,
            obs.hx,
            obs.hy,
            obs.r
          );
          const distToMargin = sd - obs.margin;
          if (distToMargin < minSignedDistToMargin) {
            minSignedDistToMargin = distToMargin;
          }
        }

        if (minSignedDistToMargin <= 0) {
          p.clearance = 0; // Dentro del elemento o su margen: 100% limpio
        } else if (minSignedDistToMargin >= feather) {
          p.clearance = 1; // Fuera de la zona de influencia: 100% visible
        } else {
          const t = minSignedDistToMargin / feather;
          p.clearance = t * t * (3 - 2 * t);
        }
      }
    };

    // Detecta las cajas de los elementos frontales superpuestos y calcula su margen limpio
    const updateObstacles = () => {
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      const isMobile = containerRect.width < 640;
      const defaultMargin = isMobile ? 18 : 28;

      const elements = sectionElement.querySelectorAll<HTMLElement>(
        "[data-hero-clearance]"
      );

      const targets: HTMLElement[] =
        elements.length > 0
          ? Array.from(elements)
          : Array.from(
              sectionElement.querySelectorAll<HTMLElement>(".relative.z-10 > *")
            );

      const newObstacles: Obstacle[] = [];

      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const w = rect.width;
        const h = rect.height;

        const type = el.getAttribute("data-hero-clearance");
        const isCircle = type === "circle";
        const customMarginAttr = el.getAttribute("data-hero-margin");
        const margin = customMarginAttr
          ? parseInt(customMarginAttr, 10)
          : isCircle
          ? defaultMargin + 4
          : defaultMargin;

        const hx = w / 2;
        const hy = h / 2;
        const cx = x + hx;
        const cy = y + hy;
        const r = isCircle ? Math.min(hx, hy) : Math.min(16, hx, hy);

        newObstacles.push({
          cx,
          cy,
          hx,
          hy,
          r,
          margin,
        });
      }

      obstacles = newObstacles;
      updatePointsClearance();
    };

    const initGrid = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Separación regular de la matriz adaptada a la densidad de pantalla
      const isMobile = width < 640;
      const spacing = isMobile ? 26 : width > 1600 ? 36 : 32;

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = offsetX + c * spacing;
          const by = offsetY + r * spacing;

          points.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            phase: (c * 0.28 + r * 0.32) % (Math.PI * 2),
            energy: 0,
            clearance: 1,
          });
        }
      }

      chains = [];
      updateObstacles();
    };

    initGrid();

    const resizeObserver = new ResizeObserver(() => {
      initGrid();
      updateObstacles();
    });
    resizeObserver.observe(container);
    resizeObserver.observe(sectionElement);

    // Observar elementos individuales de despeje para reaccionar a cambios de layout/fuentes
    const clearanceElements = sectionElement.querySelectorAll<HTMLElement>(
      "[data-hero-clearance]"
    );
    clearanceElements.forEach((el) => resizeObserver.observe(el));

    // Si las fuentes tardan en cargar y modifican el layout del texto
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        updateObstacles();
      });
    }

    const onWindowResize = () => {
      updateObstacles();
    };
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("orientationchange", onWindowResize);

    // Generador de cadenas conectadas formando constelaciones o filamentos extendidos
    const createChain = (): SpontaneousChain | null => {
      if (cols < 4 || rows < 4 || points.length === 0) return null;

      // Elegir punto de partida aleatorio en áreas libres (con clearance alto)
      let startIdx = -1;
      for (let attempt = 0; attempt < 15; attempt++) {
        const r = 1 + Math.floor(Math.random() * (rows - 2));
        const c = 1 + Math.floor(Math.random() * (cols - 2));
        const idx = r * cols + c;
        if (points[idx] && points[idx].clearance >= 0.75) {
          startIdx = idx;
          break;
        }
      }
      if (startIdx === -1) return null;

      const startR = Math.floor(startIdx / cols);
      const startC = startIdx % cols;

      // Longitud del patrón: 4 a 7 nodos encadenados (3 a 6 segmentos lineales continuos)
      const targetLen = 4 + Math.floor(Math.random() * 4);
      const nodes: number[] = [startIdx];
      const visited = new Set<number>([startIdx]);

      let curR = startR;
      let curC = startC;
      let lastDr = 0;
      let lastDc = 0;

      for (let step = 0; step < targetLen - 1; step++) {
        const validMoves: { dr: number; dc: number; idx: number; weight: number }[] = [];

        // Vecinos adyacentes ortogonales y diagonales
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const nIdx = nr * cols + nc;
              const np = points[nIdx];
              // Solo considerar puntos fuera del margen de los elementos
              if (!visited.has(nIdx) && np && np.clearance >= 0.75) {
                // Verificar además que el punto medio del segmento no corte ningún margen
                const curP = points[curR * cols + curC];
                const midX = (curP.baseX + np.baseX) / 2;
                const midY = (curP.baseY + np.baseY) / 2;
                let midBlocked = false;
                for (let j = 0; j < obstacles.length; j++) {
                  const obs = obstacles[j];
                  const sd = sdRoundedBox(
                    midX,
                    midY,
                    obs.cx,
                    obs.cy,
                    obs.hx,
                    obs.hy,
                    obs.r
                  );
                  if (sd < obs.margin) {
                    midBlocked = true;
                    break;
                  }
                }
                if (midBlocked) continue;

                // Inercia direccional: favorecer continuar en la misma dirección o curva suave
                let weight = 1;
                if (lastDr !== 0 || lastDc !== 0) {
                  const dot = dr * lastDr + dc * lastDc;
                  if (dot > 0) weight = 3.6; // Seguir avanzando
                  else if (dot === 0) weight = 1.3; // Giro suave
                  else weight = 0.3; // Desincentivar retroceso
                }
                validMoves.push({ dr, dc, idx: nIdx, weight });
              }
            }
          }
        }

        if (validMoves.length === 0) break;

        // Selección probabilística ponderada
        const totalWeight = validMoves.reduce((acc, m) => acc + m.weight, 0);
        let rnd = Math.random() * totalWeight;
        let chosen = validMoves[0];
        for (const move of validMoves) {
          rnd -= move.weight;
          if (rnd <= 0) {
            chosen = move;
            break;
          }
        }

        curR += chosen.dr;
        curC += chosen.dc;
        lastDr = chosen.dr;
        lastDc = chosen.dc;
        visited.add(chosen.idx);
        nodes.push(chosen.idx);
      }

      if (nodes.length < 3) return null; // Al menos 2 conexiones lineales

      return {
        nodes,
        life: 0,
        speed: 0.35 + Math.random() * 0.2, // ~2.2 a 2.8 segundos de duración
        maxAlpha: isDark ? 0.32 : 0.25,
      };
    };

    // Bucle de renderizado a 60fps
    const render = (time: number) => {
      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Paleta adaptada al tema activo
      const ambientDotColor = isDark
        ? "rgba(34, 211, 238, 0.22)" // Cian sutil en oscuro
        : "rgba(0, 144, 173, 0.24)"; // Acento azul/verde en claro

      const activeDotColor = isDark
        ? "rgba(103, 232, 249, " // Cian bioluminiscente brillante
        : "rgba(0, 144, 173, "; // Acento vivo

      const lineColorPrefix = isDark
        ? "rgba(34, 211, 238, "
        : "rgba(0, 144, 173, ";

      const t = time * 0.0016;

      // 1. GENERACIÓN ESPONTÁNEA DE PATRONES ENCADENADOS ALEATORIOS
      if (time > nextChainSpawn && points.length > cols * 2) {
        nextChainSpawn = time + 450 + Math.random() * 450; // Cada ~450-900ms

        // Mantener entre 2 y 4 cadenas concurrentes
        if (chains.length < 4) {
          const newChain = createChain();
          if (newChain) {
            chains.push(newChain);
          }
        }
      }

      // 1. ACTUALIZAR Y DIBUJAR CONEXIONES ENCADENADAS ESPONTÁNEAS
      for (let i = chains.length - 1; i >= 0; i--) {
        const chain = chains[i];
        chain.life += delta * chain.speed;

        if (chain.life >= 1) {
          chains.splice(i, 1);
          continue;
        }

        const segCount = chain.nodes.length - 1;
        if (segCount < 1) continue;

        // Progresión de trazado: en el primer 42% del ciclo se traza progresivamente el patrón
        const drawProgress = Math.min(1, chain.life / 0.42);
        const currentHead = drawProgress * segCount;

        // Envolvente sinusoidal suave para entrada, permanencia y desvanecimiento
        const overallFade = Math.sin(chain.life * Math.PI);
        const alpha = overallFade * chain.maxAlpha;

        if (alpha > 0.01) {
          const p0 = points[chain.nodes[0]];
          if (!p0) continue;

          ctx.beginPath();
          ctx.strokeStyle = `${lineColorPrefix}${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.9;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.moveTo(p0.x, p0.y);

          // Iluminación sutil del punto de inicio
          p0.energy = Math.max(p0.energy, overallFade * 0.7);

          for (let s = 0; s < segCount; s++) {
            if (currentHead <= s) break;

            const pA = points[chain.nodes[s]];
            const pB = points[chain.nodes[s + 1]];
            if (!pA || !pB) continue;

            const frac = Math.min(1, currentHead - s);
            const endX = pA.x + (pB.x - pA.x) * frac;
            const endY = pA.y + (pB.y - pA.y) * frac;

            ctx.lineTo(endX, endY);

            // Los puntos conectados se iluminan gradualmente al encadenarse
            pB.energy = Math.max(pB.energy, overallFade * frac * 0.7);
          }

          ctx.stroke();
        }
      }

      // 2. ACTUALIZACIÓN Y RENDERIZADO EN UN SOLO PASO (ALTO RENDIMIENTO)
      // Agrupa todos los puntos basales en un único batch y recolecta los puntos iluminados
      ctx.beginPath();
      ctx.fillStyle = ambientDotColor;
      const baseRadius = width < 640 ? 1.05 : 1.25;
      const energyDecay = Math.pow(0.92, delta * 60); // Consistente en pantallas de 60Hz, 120Hz y 144Hz
      const excitedIndices: number[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.clearance <= 0) continue; // Descartar puntos dentro del margen limpio

        // Oscilación armónica sutil optimizada
        const breath = Math.sin(t + p.phase);
        if (!prefersReducedMotion) {
          p.x = p.baseX + breath * 1.5;
          p.y = p.baseY + Math.cos(t * 0.8 + p.phase) * 1.5;
        }

        // Decaimiento temporal de energía
        p.energy *= energyDecay;

        if (p.energy <= 0.03) {
          if (p.energy < 0.005) p.energy = 0;
          const breathR = (baseRadius + breath * 0.18) * p.clearance;
          ctx.moveTo(p.x + breathR, p.y);
          ctx.arc(p.x, p.y, Math.max(0.4, breathR), 0, Math.PI * 2);
        } else {
          excitedIndices.push(i);
        }
      }
      ctx.fill();

      // 3. DIBUJAR PUNTOS ILUMINADOS (SOLO LOS ACTIVOS EN CADENAS, ~10-15 NODOS)
      for (let i = 0; i < excitedIndices.length; i++) {
        const p = points[excitedIndices[i]];
        const r = (baseRadius + p.energy * 0.6) * p.clearance;
        const alpha = Math.min(0.35 + p.energy * 0.65, 0.95) * p.clearance;

        // Halo exterior
        if (p.energy > 0.35) {
          ctx.beginPath();
          ctx.fillStyle = isDark
            ? `rgba(6, 182, 212, ${(p.energy * 0.15 * p.clearance).toFixed(3)})`
            : `rgba(0, 144, 173, ${(p.energy * 0.12 * p.clearance).toFixed(3)})`;
          ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Núcleo iluminado
        ctx.beginPath();
        ctx.fillStyle = `${activeDotColor}${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pausar simulación cuando no esté visible en pantalla (ahorro de GPU / CPU)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              lastTime = performance.now();
              animationFrameId = requestAnimationFrame(render);
            }
          } else {
            isVisible = false;
            if (animationFrameId !== null) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      },
      { rootMargin: "150px" }
    );

    observer.observe(container);
    animationFrameId = requestAnimationFrame(render);

    // Pausar inmediatamente si la pestaña pasa a segundo plano
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (isVisible && animationFrameId === null) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      themeObserver.disconnect();
      resizeObserver.disconnect();
      observer.disconnect();

      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("orientationchange", onWindowResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      {/* Máscara radial suave para proteger legibilidad central */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_55%,var(--hero-bg)_100%] opacity-40 pointer-events-none" />
      {/* Transición inferior suave hacia la siguiente sección */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-hero-bg to-transparent pointer-events-none" />
    </div>
  );
}
