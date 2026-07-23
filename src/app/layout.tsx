import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { isClerkConfigured } from "@/lib/clerk-status";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SITE_NAME = "Rigging Pro AI";
const SITE_DESCRIPTION =
  "Calculadora de ingeniería de izaje: ángulos, tensiones, factores de seguridad, peso de cargas y centro de gravedad. Cumple ASME B30.9/B30.26, EN 1492/13889 y NCh/DS 594.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "calculadora de izaje",
    "rigging calculator",
    "eslingas",
    "grilletes",
    "factor de seguridad izaje",
    "ASME B30.9",
    "plan de izaje seguro",
    "centro de gravedad carga",
    "calculadora de peso de carga",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: APP_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegistration />
        <SiteHeader />
        <div className="flex flex-1 flex-col md:flex-row">
          <AppSidebar />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );

  // Ver src/lib/clerk-status.ts: sin credenciales reales, <ClerkProvider>
  // intenta cargar el SDK de Clerk desde un dominio inexistente y rompe
  // toda la app (no solo las páginas con login). Se omite hasta que haya
  // keys reales en .env.local.
  return isClerkConfigured ? <ClerkProvider>{body}</ClerkProvider> : body;
}
