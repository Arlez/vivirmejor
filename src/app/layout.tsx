import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "Vivir Mejor - Seguimiento de Salud",
  description:
    "Seguimiento diario de salud para pacientes con enfermedades crónicas respiratorias y cardiovasculares",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Vivir Mejor",
    description: "Seguimiento de salud respiratoria y cardiovascular",
    images: [{ url: "/og-image.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vivir Mejor",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Top header with logo */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-lg mx-auto px-4 py-2 flex items-center gap-2">
            <Image
              src="/icons/logo-64.png"
              alt="Vivir Mejor"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-blue-600">Vivir</span>{" "}
              <span className="text-green-600">Mejor</span>
            </span>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 pt-5 pb-24">{children}</main>
        <BottomNav />
        <InstallPrompt />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
