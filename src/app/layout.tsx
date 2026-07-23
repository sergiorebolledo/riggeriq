import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
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

export const metadata: Metadata = {
  title: "Rigging Pro AI",
  description: "Calculadora de ingeniería de izaje: ángulos, tensiones y factores de seguridad.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
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
        {children}
      </body>
    </html>
  );

  // Ver src/lib/clerk-status.ts: sin credenciales reales, <ClerkProvider>
  // intenta cargar el SDK de Clerk desde un dominio inexistente y rompe
  // toda la app (no solo las páginas con login). Se omite hasta que haya
  // keys reales en .env.local.
  return isClerkConfigured ? <ClerkProvider>{body}</ClerkProvider> : body;
}
