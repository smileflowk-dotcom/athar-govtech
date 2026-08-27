import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import "./audit-improvements.css";

export const metadata: Metadata = {
  title: "ATHAR — Chaque alerte mène à sa preuve",
  description: "Solution GovTech pour des contrôles publics plus crédibles, traçables et validés par l’humain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
