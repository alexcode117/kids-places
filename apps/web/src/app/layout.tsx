import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const brownist = localFont({
  variable: "--font-brownist",
  src: "./fonts/Brownist.otf",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kids·Place · Sitios kids-friendly en Venezuela",
    template: "%s · Kids·Place",
  },
  description:
    "Encuentra parques, restaurantes, museos y más lugares para ir con niños en Venezuela. Mira fotos, detalles y la puntuación de otras familias.",
  openGraph: {
    siteName: "Kids·Place",
    locale: "es_VE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#182a2f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} ${brownist.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
