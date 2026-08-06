import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATHAR — Public Procurement Control",
  description: "PoC explicable de contrôle des marchés publics",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
