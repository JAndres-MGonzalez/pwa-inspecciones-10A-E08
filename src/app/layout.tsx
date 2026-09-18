import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { RegisterSw } from "@/components/register-sw";

export const metadata: Metadata = {
  title: "Inspecciones de laboratorio",
  description:
    "Registro de inspecciones de mantenimiento de laboratorios de la UTT con datos sintéticos.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Inspecciones",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/icons/icon-maskable-512.png", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#3156d3",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>
        <AppShell>{children}</AppShell>
        <RegisterSw />
      </body>
    </html>
  );
}