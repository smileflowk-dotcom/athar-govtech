import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";

export const metadata: Metadata = {
  title: "ATHAR — Chaque alerte mène à sa preuve",
  description: "Poste de contrôle explicable des marchés publics : dossier, preuve multisource et décision humaine.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
