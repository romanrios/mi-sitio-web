import { db } from "@/app/db";
import { site } from "@/content/site";
import { getThemeInitScript, type DefaultThemeSetting } from "@/lib/theme";
import type { Metadata } from "next";
import { Fira_Code, Inter, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let defaultTheme: DefaultThemeSetting = "dark";

  try {
    const registro = await db.query.configuracion.findFirst();
    if (
      registro?.temaDefault &&
      ["dark", "light", "system"].includes(registro.temaDefault)
    ) {
      defaultTheme = registro.temaDefault as DefaultThemeSetting;
    }
  } catch (error) {
    console.error("Error al obtener tema por defecto en RootLayout:", error);
  }

  const isDarkDefault = defaultTheme === "dark";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${isDarkDefault ? "dark " : ""}${montserrat.variable} ${inter.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitScript(defaultTheme),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}