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
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconMail() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
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
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
      <Path
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        stroke="#0090ad"
        strokeWidth={1.75}
        fill="none"
      />
    </Svg>
  );
}

function IconLinkedIn() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
      <Path
        d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconGitHub() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
      <Path
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
        fill="#0090ad"
      />
    </Svg>
  );
}

function IconGlobe() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24" style={{ marginRight: 3 }}>
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
    case "correo":
    case "email":
      return <IconMail />;
    case "whatsapp":
    case "telefono":
      return <IconPhone />;
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
    paddingTop: 22,
    paddingBottom: 20,
    paddingLeft: 28,
    paddingRight: 28,
    fontFamily: "Inter",
    fontSize: 8,
    lineHeight: 1.35,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 9,
    paddingBottom: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0090ad",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#0090ad",
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  name: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.15,
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  role: {
    fontFamily: "Montserrat",
    fontWeight: 600,
    fontSize: 9.5,
    lineHeight: 1.25,
    color: "#0090ad",
    marginBottom: 2.5,
  },
  bio: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7.8,
    lineHeight: 1.3,
    color: "#475569",
  },
  contactGrid: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.75,
    borderTopColor: "#e2e8f0",
    flexDirection: "column",
    gap: 3,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    textDecoration: "none",
  },
  contactText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7.2,
    color: "#334155",
  },
  contactLink: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7.2,
    color: "#0090ad",
    textDecoration: "none",
  },
  columnsWrap: {
    flexDirection: "row",
    gap: 16,
  },
  leftCol: {
    width: "60%",
  },
  rightCol: {
    width: "40%",
  },
  sectionTitle: {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontSize: 8.8,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingBottom: 2.5,
    borderBottomWidth: 1.2,
    borderBottomColor: "#0090ad",
  },
  expItem: {
    marginBottom: 6.5,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  expCompany: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8.2,
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  expDate: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7,
    color: "#64748b",
  },
  expPosition: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7.5,
    color: "#0090ad",
    marginTop: 1,
  },
  expSubPos: {
    marginLeft: 6,
    marginTop: 2,
    borderLeftWidth: 1.5,
    borderLeftColor: "#7dd3fc",
    paddingLeft: 6,
  },
  expDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7.3,
    color: "#475569",
    marginTop: 1.5,
    lineHeight: 1.25,
  },
  eduItem: {
    marginBottom: 5.5,
  },
  eduTitle: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 8,
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  eduDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7.2,
    color: "#475569",
    marginTop: 1,
    lineHeight: 1.25,
  },
  skillsGroup: {
    marginBottom: 5,
  },
  skillsGroupTitle: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 7.5,
    color: "#0090ad",
    marginBottom: 2.5,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2.8,
  },
  tag: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 6.6,
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    color: "#1e293b",
    borderRadius: 3,
    paddingVertical: 1.2,
    paddingHorizontal: 4,
  },
  tagDestacada: {
    backgroundColor: "#e0f2fe",
    borderColor: "#7dd3fc",
    color: "#0369a1",
  },
  courseItem: {
    marginBottom: 4.5,
  },
  courseTitle: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 7.5,
    color: "#0f172a",
    flex: 1,
    marginRight: 4,
  },
  courseDesc: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 6.8,
    color: "#475569",
    marginTop: 0.8,
    lineHeight: 1.25,
  },
});

export default function CvDocument({ data }: { data: CvData }) {
  // Organizar contactos en dos filas equilibradas
  const ubicacion = data.contactos.find(
    (c) => c.tipo.toLowerCase() === "ubicacion"
  );
  const correo = data.contactos.find(
    (c) =>
      c.tipo.toLowerCase() === "correo" || c.tipo.toLowerCase() === "email"
  );
  const tel = data.contactos.find(
    (c) =>
      c.tipo.toLowerCase() === "whatsapp" || c.tipo.toLowerCase() === "telefono"
  );
  const linkedin = data.contactos.find(
    (c) => c.tipo.toLowerCase() === "linkedin"
  );
  const github = data.contactos.find((c) => c.tipo.toLowerCase() === "github");
  const sitio = data.contactos.find((c) => c.tipo.toLowerCase() === "sitio");

  const row1 = [ubicacion, correo, tel].filter(Boolean);
  const row2 = [linkedin, github, sitio].filter(Boolean);

  return (
    <Document
      title={`CV - ${data.nombre}`}
      author={data.nombre}
      subject="Currículum Vitae"
      keywords="CV, Desarrollador de Software, Diseñador Visual, Fullstack"
    >
      <Page size="A4" style={styles.page}>
        {/* Cabecera / Identidad */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {data.imagenUrl ? (
              <Image src={data.imagenUrl} style={styles.avatar} />
            ) : null}
            <View style={styles.headerTitleWrap}>
              <Text style={styles.name}>{data.nombre}</Text>
              <Text style={styles.role}>{data.rol}</Text>
              <Text style={styles.bio}>{data.descripcion}</Text>
            </View>
          </View>

          {/* Contacto estructurado en dos filas con enlaces directos */}
          <View style={styles.contactGrid}>
            <View style={styles.contactRow}>
              {row1.map((item, idx) =>
                item ? (
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
                ) : null
              )}
            </View>
            <View style={styles.contactRow}>
              {row2.map((item, idx) =>
                item ? (
                  <View key={idx} style={styles.contactItem}>
                    <ContactIcon tipo={item.tipo} />
                    <Link src={item.url} style={styles.contactLink}>
                      <Text>{item.valor}</Text>
                    </Link>
                  </View>
                ) : null
              )}
            </View>
          </View>
        </View>

        {/* Cuerpo en dos columnas (1 hoja A4) */}
        <View style={styles.columnsWrap}>
          {/* Columna Izquierda: Experiencia Laboral + Educación */}
          <View style={styles.leftCol}>
            <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
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

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
              Educación
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
          </View>

          {/* Columna Derecha: Habilidades + Cursos y Certificaciones */}
          <View style={styles.rightCol}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            {data.habilidades.map((sec) => (
              <View key={sec.id} style={styles.skillsGroup}>
                <Text style={styles.skillsGroupTitle}>{sec.nombre}</Text>
                <View style={styles.tagsWrap}>
                  {sec.subsecciones.flatMap((sb) =>
                    sb.tags.map((t) => (
                      <Text
                        key={t.id}
                        style={[
                          styles.tag,
                          ...(t.destacada ? [styles.tagDestacada] : []),
                        ]}
                      >
                        {t.nombre}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
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
        </View>
      </Page>
    </Document>
  );
}
