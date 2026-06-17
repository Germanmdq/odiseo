import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter } from "@/lib/fonts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Odiseo — Universidad de la Imaginación",
  description: "Tu espacio de práctica diaria basado en las enseñanzas de Neville Goddard.",
  icons: { icon: "/logo-odiseo.png", apple: "/logo-odiseo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
