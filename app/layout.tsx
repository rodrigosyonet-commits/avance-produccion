
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avance de Producción",
  description:
    "Consulta de avances de producción por empresa mediante integración con SiNube.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
