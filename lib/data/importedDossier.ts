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
  processing:
    | "local-server"
    | "local-native-pdf"
    | "local-native-pdf-degraded"
    | "local-enhanced-document";
  externalApiUsed: false;
};

function candidatePassages(text: string): string[] {
  // Un PDF coupe souvent une même phrase sur plusieurs lignes visuelles.
  // On reconstruit donc des segments de phrase avant d'exécuter le contrôle,
  // afin d'éviter qu'un fragment comme « ... marque X, ou » ne déclenche
  // une fausse alerte alors que « équivalent » se trouve sur la ligne suivante.
  const normalizedText = text
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/[•]/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const segments = normalizedText
    .split(/\n+|(?<=[.!?;])\s+/u)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 20 && segment.length <= 1800);

  const passages = new Set<string>(segments);

  // Certaines exigences sont réparties sur deux phrases courtes : on conserve
  // une fenêtre locale sans élargir au reste de la page.
  for (let index = 0; index < segments.length - 1; index += 1) {
    const passage = `${segments[index]} ${segments[index + 1]}`.trim();
    if (passage.length >= 30 && passage.length <= 1800) passages.add(passage);
  }

  if (normalizedText.length <= 1800) passages.add(normalizedText);

  return [...passages];
}

export function buildImportedDossier(pdf: ExtractedPdf): Dossier {
  const importId = `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
        id: `${importId}-restrictive-clause`,
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
        controlId: "CTRL-ACC-01",
        controlVersion: "1.0",
        evidenceState: "retrieved",
        evidenceItems: [
          {
            id: `${importId}-source`,
            source: pdf.filename,
            location: `Page ${page.page} · passage extrait localement`,
            excerpt: result.evidence,
            role: "observé",
            state: "retrieved",
          },
        ],
      };
      break outer;
    }
  }

  const cleanTitle = pdf.filename.replace(/\.pdf$/i, "");

  return {
    id: importId,
    title: cleanTitle,
    score: alert ? 85 : 12,
    excerpt: selectedExcerpt,
    alerts: alert ? [alert] : [],
    sourceLabel: `${pdf.filename} — PDF local`,
    totalPages: pdf.totalPages,
    activePage: selectedPage.page,
    realDocument: true,
    buyer: "Non renseigné",
    procedure: "À identifier",
    deadline: "À qualifier",
    documentCount: 1,
  };
}

export function mergeImportedDossiers(importedSources: Dossier[]): Dossier {
  if (importedSources.length === 0) throw new Error("Aucune source exploitable à regrouper.");
  if (importedSources.length === 1) return importedSources[0];

  const preferredContext = importedSources.find((source) =>
    source.buyer !== "Non renseigné" || source.procedure !== "À identifier",
  ) ?? importedSources[0];
  const alerts = importedSources.flatMap((source) => source.alerts);
  const primaryEvidence = importedSources.find((source) => source.alerts.length > 0) ?? preferredContext;

  return {
    id: `sources-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: preferredContext.title,
    score: Math.max(...importedSources.map((source) => source.score)),
    excerpt: primaryEvidence.excerpt,
    alerts,
    sourceLabel: importedSources.map((source) => source.sourceLabel).join(" · "),
    totalPages: importedSources.reduce((sum, source) => sum + Math.max(1, source.totalPages), 0),
    activePage: primaryEvidence.activePage,
    realDocument: true,
    buyer: preferredContext.buyer,
    procedure: preferredContext.procedure,
    deadline: preferredContext.deadline,
    documentCount: importedSources.reduce((sum, source) => sum + (source.documentCount ?? 1), 0),
  };
}
