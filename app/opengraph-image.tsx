import { ImageResponse } from "next/og";


export const alt = "Román Ríos — Desarrollo de Software & Diseño Visual";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const avatarUrl =
    "https://res.cloudinary.com/dzriqyi6d/image/upload/v1789746908/mi-sitio-web/hero/pivgn8t7n6ro4touhkvx.png";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d1520",
          backgroundImage:
            "radial-gradient(circle at 90% 10%, rgba(0, 180, 216, 0.22) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Borde sutil superior con acento */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #00b4d8 0%, #22d3ee 50%, #06b6d4 100%)",
          }}
        />

        {/* Barra superior: Dominio y etiqueta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "8px 20px",
              borderRadius: "9999px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#22d3ee",
              }}
            />
            <span
              style={{
                color: "#e2e8f0",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              romanrios.com.ar
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(0, 180, 216, 0.15)",
              border: "1px solid rgba(0, 180, 216, 0.35)",
              padding: "8px 18px",
              borderRadius: "9999px",
              color: "#22d3ee",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            <span>Santa Fe, Argentina</span>
          </div>
        </div>

        {/* Contenido principal: Foto y títulos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Foto circular con marco cian */}
          <div
            style={{
              display: "flex",
              width: "180px",
              height: "180px",
              borderRadius: "9999px",
              border: "4px solid #00b4d8",
              boxShadow: "0 0 35px rgba(0, 180, 216, 0.35)",
              overflow: "hidden",
              backgroundColor: "#1e293b",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Román Ríos"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Título y subtítulo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1px",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Román Ríos
            </h1>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 600,
                color: "#22d3ee",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Desarrollo de Software & Diseño Visual
            </p>
            <p
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Desarrollo Web moderno, interfaces interactivas y comunicación multimedia.
            </p>
          </div>
        </div>

        {/* Barra inferior: Tags de tecnologías / áreas */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {["Next.js", "React", "TypeScript", "Tailwind CSS", "UI / UX", "Diseño Multimedia"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  color: "#cbd5e1",
                  fontSize: "17px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
