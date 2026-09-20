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
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.author.name, url: site.author.url }],
  creator: site.author.name,
  publisher: site.author.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    creator: "@romanrios",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
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