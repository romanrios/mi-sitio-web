import { db } from "@/app/db";
import { contactoItemsDefault, resolverUrlContacto } from "@/content/contacto";
import { heroDefault } from "@/content/hero";
import {
  ExperienciaData,
  formatearFecha,
  formatearPeriodo,
  ordenarExperienciasCronologicamente,
} from "@/lib/experiencias-utils";
import {
  CvContacto,
  CvCurso,
  CvData,
  CvExperiencia,
  CvHabilidadSeccion,
} from "./cv-types";

function formatearDescripcionCurso(desc?: string | null): string | null {
  if (!desc) return null;
  const trimmed = desc.trim();
  if (!trimmed) return null;
  if (trimmed.includes("■") || trimmed.includes("•") || trimmed.includes("\n")) {
    const lineas = trimmed
      .split("\n")
      .map((l) => l.replace(/^[■•-]\s*/, "").trim())
      .filter(Boolean);
    return lineas.slice(0, 3).join(" · ");
  }
  return trimmed;
}

function optimizarImagenUrl(url: string): string {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace(
      "/upload/",
      "/upload/w_200,h_200,c_fill,g_face,q_auto,f_jpg/"
    );
  }
  return url;
}

export async function getCvData(): Promise<CvData> {
  // 1. Hero
  let heroData = heroDefault;
  try {
    const registro = await db.query.hero.findFirst();
    if (registro) {
      heroData = registro;
    }
  } catch (error) {
    console.error("Error al cargar hero para CV:", error);
  }

  // 2. Contacto
  let contactosRaw = contactoItemsDefault;
  try {
    const dbContactos = await db.query.contacto.findMany();
    if (dbContactos && dbContactos.length > 0) {
      contactosRaw = dbContactos;
    }
  } catch (error) {
    console.error("Error al cargar contacto para CV:", error);
  }

  const contactos: CvContacto[] = contactosRaw
    .sort((a, b) => a.orden - b.orden)
    .map((c) => ({
      tipo: c.tipo,
      valor: c.valor,
      url: resolverUrlContacto(c.tipo, c.valor, c.url),
    }));

  // Asegurar enlace directo al sitio web y github si no están
  if (!contactos.some((c) => c.tipo.toLowerCase() === "sitio")) {
    contactos.push({
      tipo: "sitio",
      valor: "romanrios.com.ar",
      url: "https://romanrios.com.ar",
    });
  }

  // 3. Experiencias
  let todasExp: ExperienciaData[] = [];
  try {
    const dbExp = await db.query.experiencias.findMany({
      with: {
        posiciones: true,
      },
    });
    if (dbExp && dbExp.length > 0) {
      todasExp = dbExp as unknown as ExperienciaData[];
    }
  } catch (error) {
    console.error("Error al cargar experiencias para CV:", error);
  }

  const ordenadas = ordenarExperienciasCronologicamente(todasExp);

  const laborales: CvExperiencia[] = ordenadas
    .filter((e) => e.tipo === "laboral")
    .map((e) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      periodo: formatearPeriodo(e.fechaInicio, e.fechaFin, e.actualmente),
      actualmente: e.actualmente,
      posiciones: e.posiciones?.map((p) => ({
        id: p.id ?? 0,
        titulo: p.titulo,
        periodo: formatearPeriodo(p.fechaInicio, p.fechaFin, p.actualmente),
        actualmente: p.actualmente,
      })),
    }));

  const academicas: CvExperiencia[] = ordenadas
    .filter((e) => e.tipo === "academica")
    .map((e) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      periodo: formatearPeriodo(e.fechaInicio, e.fechaFin, e.actualmente),
      actualmente: e.actualmente,
    }));

  const cursos: CvCurso[] = ordenadas
    .filter((e) => e.tipo === "curso")
    .map((c) => ({
      id: c.id,
      titulo: c.titulo,
      descripcion: formatearDescripcionCurso(c.descripcion),
      periodo: formatearPeriodo(c.fechaInicio, c.fechaFin, c.actualmente),
    }));

  // 4. Habilidades
  let habilidadesSecciones: CvHabilidadSeccion[] = [];
  try {
    const dbHabs = await db.query.habilidadesSecciones.findMany({
      with: {
        subsecciones: {
          with: {
            tags: true,
          },
        },
      },
    });

    if (dbHabs && dbHabs.length > 0) {
      habilidadesSecciones = dbHabs
        .sort((a, b) => a.orden - b.orden)
        .map((s) => ({
          id: s.id,
          nombre: s.nombre,
          subsecciones: (s.subsecciones || [])
            .sort((a, b) => a.orden - b.orden)
            .map((sub) => ({
              id: sub.id,
              nombre: sub.nombre,
              tags: (sub.tags || [])
                .sort((a, b) => a.orden - b.orden)
                .map((t) => ({
                  id: t.id,
                  nombre: t.nombre,
                  destacada: Boolean(t.destacada),
                })),
            })),
        }));
    }
  } catch (error) {
    console.error("Error al cargar habilidades para CV:", error);
  }

  // Fallback para habilidades si la base de datos estaba vacía
  if (habilidadesSecciones.length === 0) {
    habilidadesSecciones = [
      {
        id: 1,
        nombre: "Desarrollo",
        subsecciones: [
          {
            id: 1,
            nombre: "Tecnologías",
            tags: [
              { id: 1, nombre: "HTML5", destacada: true },
              { id: 2, nombre: "CSS3", destacada: true },
              { id: 3, nombre: "JavaScript", destacada: true },
              { id: 4, nombre: "React", destacada: true },
              { id: 5, nombre: "TypeScript", destacada: true },
              { id: 6, nombre: "Tailwind CSS", destacada: true },
              { id: 7, nombre: "Node.js", destacada: true },
              { id: 8, nombre: "Express.js", destacada: true },
              { id: 9, nombre: "MySQL", destacada: true },
              { id: 10, nombre: "Git / GitHub", destacada: true },
            ],
          },
        ],
      },
      {
        id: 2,
        nombre: "Diseño",
        subsecciones: [
          {
            id: 2,
            nombre: "Áreas y Herramientas",
            tags: [
              { id: 11, nombre: "Diseño UX/UI", destacada: true },
              { id: 12, nombre: "Sistemas de Diseño", destacada: true },
              { id: 13, nombre: "Identidad Visual", destacada: true },
              { id: 14, nombre: "Figma", destacada: true },
              { id: 15, nombre: "Adobe Illustrator", destacada: true },
            ],
          },
        ],
      },
    ];
  }

  const rol = heroData.subtitulo
    ? heroData.subtitulo
        .replace(/[\/\n\r]+/g, " & ")
        .replace(/\s*&\s*(&\s*)+/g, " & ")
        .replace(/\s+/g, " ")
        .trim()
    : "Desarrollador de Software & Diseñador de Comunicación Visual";

  return {
    nombre: heroData.titulo || "Román Ríos",
    rol,
    descripcion:
      heroData.descripcion ||
      "Soluciones y experiencias digitales desde la intersección entre tecnología, diseño y comunicación.",
    imagenUrl: optimizarImagenUrl(heroData.imagenUrl),
    contactos,
    laborales,
    academicas,
    habilidades: habilidadesSecciones,
    cursos,
  };
}
