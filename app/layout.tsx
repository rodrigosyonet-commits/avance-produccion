import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avance de Producción",
  description: "Consulta de producción mediante SiNube",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
