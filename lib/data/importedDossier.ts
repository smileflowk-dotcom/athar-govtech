import { detectRestrictiveClause } from "../controls/restrictiveClause";
import type { Dossier, ProcurementAlert } from "./demoDossiers";

export type ExtractedPdfPage = {
  page: number;
  text: string;
};

export type ExtractedPdf = {
  filename: string;
  totalPages: number;
  pages: ExtractedPdfPage[];
  processing: "local-server";
  externalApiUsed: false;
};

function candidatePassages(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 8);

  const passages = new Set<string>();

  for (const line of lines) passages.add(line);

  for (let index = 0; index < lines.length; index += 1) {
    for (let size = 2; size <= 5; size += 1) {
      const passage = lines.slice(index, index + size).join(" ").trim();
      if (passage.length >= 30 && passage.length <= 1800) passages.add(passage);
    }
  }

  if (text.length <= 1800) passages.add(text.trim());

  return [...passages].sort((a, b) => a.length - b.length);
}

export function buildImportedDossier(pdf: ExtractedPdf): Dossier {
  let alert: ProcurementAlert | undefined;
  let selectedPage = pdf.pages.find((page) => page.text.trim()) ?? {
    page: 1,
    text: "Aucun texte extractible trouvé dans ce PDF.",
  };
  let selectedExcerpt = selectedPage.text.slice(0, 5000);

  outer: for (const page of pdf.pages) {
    for (const passage of candidatePassages(page.text)) {
      const result = detectRestrictiveClause(passage);
      if (!result.triggered) continue;

      selectedPage = page;
      selectedExcerpt = passage;
      alert = {
        id: `pdf-${Date.now()}-restrictive-clause`,
        type: "Clause potentiellement restrictive",
        level: result.level,
        rule: "Principe d’accès équitable à la commande publique",
        expected:
          "Une exigence technique doit rester objective, proportionnée et ouverte aux solutions équivalentes.",
        observed: result.explanation,
        evidence: `${pdf.filename} — page ${page.page}`,
        action: result.recommendation,
        page: page.page,
        highlight: result.evidence,
        status: "pending",
        indicators: result.indicators,
        generatedByControl: true,
      };
      break outer;
    }
  }

  const cleanTitle = pdf.filename.replace(/\.pdf$/i, "");

  return {
    id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: cleanTitle,
    score: alert ? 85 : 12,
    excerpt: selectedExcerpt,
    alerts: alert ? [alert] : [],
    sourceLabel: `${pdf.filename} — PDF local`,
    totalPages: pdf.totalPages,
    activePage: selectedPage.page,
    realDocument: true,
  };
}
