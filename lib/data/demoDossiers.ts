import { detectRestrictiveClause } from "../controls/restrictiveClause";

export type AlertStatus = "pending" | "confirmed" | "dismissed" | "requested";

export type ProcurementAlert = {
  id: string;
  type: string;
  level: "Élevé" | "Moyen" | "Faible";
  rule: string;
  expected: string;
  observed: string;
  evidence: string;
  action: string;
  page: number;
  highlight: string;
  status: AlertStatus;
  indicators: string[];
  generatedByControl: boolean;
};

export type Dossier = {
  id: string;
  title: string;
  score: number;
  excerpt: string;
  alerts: ProcurementAlert[];
  sourceLabel: string;
  totalPages: number;
  activePage: number;
  realDocument: boolean;
};

const restrictiveExcerpt =
  "Le Soumissionnaire doit être un partenaire certifié agréé du fabricant suivant : Dell Technologies ou Hewlett Packard Enterprise (HPE). La preuve de cette certification doit être fournie à l’appui de la soumission.";

const compliantExcerpt =
  "Le soumissionnaire fournit une solution répondant aux performances minimales décrites, ou toute solution techniquement équivalente dûment justifiée.";

function buildDossier(id: string, title: string, excerpt: string, page: number): Dossier {
  const result = detectRestrictiveClause(excerpt);

  return {
    id,
    title,
    score: result.triggered ? 85 : 12,
    excerpt,
    sourceLabel: "CPS fictif — extrait analysé",
    totalPages: 34,
    activePage: page,
    realDocument: false,
    alerts: result.triggered
      ? [
          {
            id: `${id}-restrictive-clause`,
            type: "Clause potentiellement restrictive",
            level: result.level,
            rule: "Principe d’accès équitable à la commande publique",
            expected:
              "Une exigence technique doit rester objective, proportionnée et ouverte aux solutions équivalentes.",
            observed: result.explanation,
            evidence: `CPS fictif — page ${page}`,
            action: result.recommendation,
            page,
            highlight: result.evidence,
            status: "pending",
            indicators: result.indicators,
            generatedByControl: true,
          },
        ]
      : [],
  };
}

export const demoDossiers: Dossier[] = [
  buildDossier(
    "equipment",
    "Acquisition de 500 équipements informatiques",
    restrictiveExcerpt,
    12,
  ),
  buildDossier(
    "compliant-equipment",
    "Acquisition d’équipements — clause ouverte",
    compliantExcerpt,
    8,
  ),
];
