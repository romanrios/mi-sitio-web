import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import path from "path";
import { CvData } from "./cv-types";

// Registro de fuentes locales Montserrat e Inter
const fontsDir = path.join(process.cwd(), "public", "fonts");

try {
  Font.register({
    family: "Montserrat",
    fonts: [
      {
        src: path.join(fontsDir, "montserrat-latin-700-normal.woff"),
        fontWeight: 700,
      },
      {
        src: path.join(fontsDir, "montserrat-latin-600-normal.woff"),
        fontWeight: 600,
      },
      {
        src: path.join(fontsDir, "montserrat-latin-400-normal.woff"),
        fontWeight: 400,
      },
    ],
  });

  Font.register({
    family: "Inter",
    fonts: [
      {
        src: path.join(fontsDir, "inter-latin-600-normal.woff"),
        fontWeight: 600,
      },
      {
        src: path.join(fontsDir, "inter-latin-500-normal.woff"),
        fontWeight: 500,
      },
      {
        src: path.join(fontsDir, "inter-latin-400-normal.woff"),
        fontWeight: 400,
      },
    ],
  });

  // Desactivar corte de palabras con guiones en saltos de línea
  Font.registerHyphenationCallback((word) => [word]);
} catch (e) {
  // Ignorar si ya están registradas
}

// Iconos vectoriales nítidos para el PDF
function IconLocation() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconMail() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        stroke="#0090ad"
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

function IconPhone() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        stroke="#0090ad"
        strokeWidth={1.75}
        fill="none"
      />
    </Svg>
  );
}

function IconWhatsApp() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.66 20.15 9.32 19.8 8.14 19.14L7.86 18.97L4.74 19.79L5.57 16.75L5.38 16.45C4.64 15.28 4.25 13.91 4.25 11.91C4.25 7.37 7.94 3.67 12.05 3.67M9.27 7.02C9.07 7.02 8.74 7.1 8.46 7.4C8.18 7.71 7.39 8.45 7.39 9.94C7.39 11.43 8.48 12.87 8.63 13.07C8.78 13.27 10.74 16.45 13.82 17.65C16.38 18.65 16.9 18.45 17.45 18.4C18 18.35 19.23 17.67 19.48 16.96C19.74 16.25 19.74 15.65 19.66 15.52C19.58 15.39 19.38 15.32 19.08 15.17C18.77 15.02 17.27 14.28 16.99 14.18C16.71 14.08 16.51 14.03 16.31 14.33C16.1 14.64 15.52 15.32 15.34 15.52C15.17 15.73 14.99 15.75 14.69 15.6C14.38 15.45 13.41 15.13 12.26 14.11C11.37 13.31 10.77 12.33 10.6 12.03C10.42 11.72 10.58 11.56 10.73 11.41C10.87 11.28 11.04 11.05 11.19 10.87C11.34 10.7 11.39 10.57 11.49 10.37C11.59 10.16 11.54 9.99 11.47 9.84C11.39 9.69 10.83 8.32 10.6 7.76C10.38 7.22 10.15 7.29 9.98 7.28C9.82 7.28 9.62 7.27 9.42 7.27C9.22 7.27 9.27 7.02 9.27 7.02Z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconLinkedIn() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconGitHub() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconGlobe() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24" style={{ marginRight: 5, flexShrink: 0 }}>
      <Path
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.92 9h-3.69a15.42 15.42 0 0 0-1.25-5.18A8.04 8.04 0 0 1 18.92 11zM12 4.07a13.3 13.3 0 0 1 1.85 6.93H10.15A13.3 13.3 0 0 1 12 4.07zM4.08 13h3.69a15.42 15.42 0 0 0 1.25 5.18A8.04 8.04 0 0 1 4.08 13zm3.69-2H4.08a8.04 8.04 0 0 1 4.94-5.18A15.42 15.42 0 0 0 7.77 11zm4.23 8.93a13.3 13.3 0 0 1-1.85-6.93h3.7a13.3 13.3 0 0 1-1.85 6.93zm2.94-1.75a15.42 15.42 0 0 0 1.25-5.18h3.69a8.04 8.04 0 0 1-4.94 5.18z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function ContactIcon({ tipo }: { tipo: string }) {
  switch (tipo.toLowerCase()) {
    case "ubicacion":
      return <IconLocation />;
    case "whatsapp":
      return <IconWhatsApp />;
    case "telefono":
      return <IconPhone />;
    case "correo":
    case "email":
      return <IconMail />;
    case "linkedin":
      return <IconLinkedIn />;
    case "github":
      return <IconGitHub />;
    default:
      return <IconGlobe />;
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.35,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  // Columna Izquierda (Angosta / Sidebar)
  sidebar: {
    width: "34%",
    backgroundColor: "#f8fafc",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 20,
    paddingRight: 16,
    minHeight: 841.89,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#0090ad",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  name: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 20.5,
    lineHeight: 1.15,
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 5,
  },
  role: {
    fontFamily: "Montserrat",
    fontWeight: 600,
    fontSize: 9.8,
    lineHeight: 1.25,
    color: "#0090ad",
    marginBottom: 9.5,
  },
  bio: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8.3,
    lineHeight: 1.44,
    color: "#475569",
    marginBottom: 18,
  },
  sidebarSectionTitle: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 9.5,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingBottom: 2.8,
    borderBottomWidth: 1.3,
    borderBottomColor: "#0090ad",
  },
  contactList: {
    flexDirection: "column",
    gap: 7.5,
    marginBottom: 18,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8.2,
    color: "#334155",
    flexShrink: 1,
  },
  contactLink: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8.2,
    color: "#0090ad",
    textDecoration: "none",
    flexShrink: 1,
  },
  skillsSection: {
    marginBottom: 9,
  },
  skillsSectionTitle: {
    fontFamily: "Montserrat",
    fontWeight: 600,
    fontSize: 8.8,
    color: "#0090ad",
    marginBottom: 4.5,
  },
  skillsLine: {
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.42,
    marginBottom: 5.5,
  },
  skillsSubLabel: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 7.7,
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  skillsList: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    color: "#475569",
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  languageName: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8.2,
    color: "#0f172a",
  },
  languageLevel: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: "#0090ad",
  },

  // Columna Derecha (Amplia / Contenido Principal)
  main: {
    width: "66%",
    backgroundColor: "#ffffff",
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 22,
    paddingRight: 24,
    minHeight: 841.89,
  },
  mainSectionTitle: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 10.6,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8.5,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0090ad",
  },
  expItem: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  expCompany: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 9.4,
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  expDate: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: "#64748b",
  },
  expPosition: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8.6,
    color: "#0090ad",
    marginTop: 1.5,
  },
  expSubPos: {
    marginLeft: 7,
    marginTop: 2.5,
    borderLeftWidth: 1.5,
    borderLeftColor: "#7dd3fc",
    paddingLeft: 7,
  },
  expDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8.2,
    color: "#475569",
    marginTop: 2.5,
    lineHeight: 1.36,
  },
  eduItem: {
    marginBottom: 8.5,
  },
  eduTitle: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 9.2,
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  eduDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8.2,
    color: "#475569",
    marginTop: 1.8,
    lineHeight: 1.34,
  },
  courseItem: {
    marginBottom: 7,
  },
  courseTitle: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8.5,
    color: "#0f172a",
    flex: 1,
    marginRight: 4,
  },
  courseDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7.8,
    color: "#475569",
    marginTop: 1.4,
    lineHeight: 1.32,
  },
});

export default function CvDocument({ data }: { data: CvData }) {
  return (
    <Document
      title={`CV - ${data.nombre}`}
      author={data.nombre}
      subject="Currículum Vitae"
      keywords="CV, Desarrollador de Software, Diseñador Visual, Fullstack"
    >
      <Page size="A4" style={styles.page}>
        {/* Columna Izquierda Angosta: Hero + Contacto + Habilidades */}
        <View style={styles.sidebar}>
          {/* Hero */}
          {data.imagenUrl ? (
            <Image src={data.imagenUrl} style={styles.avatar} />
          ) : null}
          <Text style={styles.name}>{data.nombre}</Text>
          <Text style={styles.role}>{data.rol}</Text>
          {data.descripcion ? (
            <Text style={styles.bio}>{data.descripcion}</Text>
          ) : null}

          {/* Contacto */}
          <Text style={styles.sidebarSectionTitle}>Contacto</Text>
          <View style={styles.contactList}>
            {data.contactos.map((item, idx) => (
              <View key={idx} style={styles.contactItem}>
                <ContactIcon tipo={item.tipo} />
                {item.tipo.toLowerCase() === "ubicacion" ? (
                  <Text style={styles.contactText}>{item.valor}</Text>
                ) : (
                  <Link src={item.url} style={styles.contactLink}>
                    <Text>{item.valor}</Text>
                  </Link>
                )}
              </View>
            ))}
          </View>

          {/* Habilidades */}
          <Text style={styles.sidebarSectionTitle}>Habilidades</Text>
          {data.habilidades.map((sec) => (
            <View key={sec.id} style={styles.skillsSection}>
              <Text style={styles.skillsSectionTitle}>{sec.nombre}</Text>
              {sec.subsecciones?.map((sub) => (
                <Text key={sub.id} style={styles.skillsLine}>
                  <Text style={styles.skillsSubLabel}>
                    {sub.nombre.toUpperCase()}:{" "}
                  </Text>
                  <Text style={styles.skillsList}>
                    {sub.tags?.map((t) => t.nombre).join(", ")}
                  </Text>
                </Text>
              ))}
            </View>
          ))}

          {/* Idiomas */}
          {data.idiomas && data.idiomas.length > 0 ? (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.sidebarSectionTitle}>Idiomas</Text>
              {data.idiomas.map((item, idx) => (
                <View key={idx} style={styles.languageRow}>
                  <Text style={styles.languageName}>{item.idioma}</Text>
                  <Text style={styles.languageLevel}>{item.nivel}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Columna Derecha Amplia: Experiencia Laboral + Educación + Cursos y Certificaciones */}
        <View style={styles.main}>
          {/* Experiencia Laboral */}
          <Text style={styles.mainSectionTitle}>Experiencia Laboral</Text>
          {data.laborales.map((exp) => (
            <View key={exp.id} style={styles.expItem}>
              <View style={styles.expHeader}>
                <Text style={styles.expCompany}>{exp.titulo}</Text>
                <Text style={styles.expDate}>{exp.periodo}</Text>
              </View>

              {exp.posiciones && exp.posiciones.length > 0
                ? exp.posiciones.map((pos) => (
                    <View key={pos.id} style={styles.expSubPos}>
                      <View style={styles.expHeader}>
                        <Text style={styles.expPosition}>{pos.titulo}</Text>
                        <Text style={styles.expDate}>{pos.periodo}</Text>
                      </View>
                    </View>
                  ))
                : null}

              {exp.descripcion ? (
                <Text style={styles.expDesc}>{exp.descripcion}</Text>
              ) : null}
            </View>
          ))}

          {/* Formación académica */}
          <Text style={[styles.mainSectionTitle, { marginTop: 13 }]}>
            Formación académica
          </Text>
          {data.academicas.map((exp) => (
            <View key={exp.id} style={styles.eduItem}>
              <View style={styles.expHeader}>
                <Text style={styles.eduTitle}>{exp.titulo}</Text>
                <Text style={styles.expDate}>{exp.periodo}</Text>
              </View>
              {exp.descripcion ? (
                <Text style={styles.eduDesc}>{exp.descripcion}</Text>
              ) : null}
            </View>
          ))}

          {/* Cursos y Certificaciones */}
          <Text style={[styles.mainSectionTitle, { marginTop: 13 }]}>
            Cursos y Certificaciones
          </Text>
          {data.cursos.map((c) => (
            <View key={c.id} style={styles.courseItem}>
              <View style={styles.expHeader}>
                <Text style={styles.courseTitle}>{c.titulo}</Text>
                <Text style={styles.expDate}>{c.periodo}</Text>
              </View>
              {c.descripcion ? (
                <Text style={styles.courseDesc}>{c.descripcion}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
