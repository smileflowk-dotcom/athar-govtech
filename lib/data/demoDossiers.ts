import { detectRankingAttributionInconsistency } from "../controls/rankingAttribution";
import { detectProbityDeclarationSignals } from "../controls/probityDeclaration";
import { detectPublicationDelay } from "../controls/publicationDelay";
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

function buildPublicationDelayDossier(): Dossier {
  const result = detectPublicationDelay({
    date_publication: "2026-01-01",
    date_limite_depot: "2026-01-31",
    montant_estime: 2_500_000,
    type_procedure: "appel_offres_ouvert_fournitures_services_etat",
  });

  const excerpt =
    "Avis d’appel d’offres — publication : 01/01/2026 — date limite de dépôt : 31/01/2026 — estimation : 2 500 000 DH HT.";

  return {
    id: "publication-delay",
    title: "Marché de services — délai de publication",
    score: result.triggered ? 90 : 12,
    excerpt,
    sourceLabel: "Avis fictif — calendrier de publication",
    totalPages: 1,
    activePage: 1,
    realDocument: false,
    alerts: result.triggered
      ? [
          {
            id: "publication-delay-control",
            type: "Délai de publication potentiellement insuffisant",
            level: result.level,
            rule: result.ruleReference,
            expected: result.expected,
            observed: `${result.observed} ${result.gap}`,
            evidence: `Avis fictif — page 1 — ${result.evidence}`,
            action: result.recommendation,
            page: 1,
            highlight: excerpt,
            status: "pending",
            indicators: result.indicators,
            generatedByControl: true,
          },
        ]
      : [],
  };
}

function buildProbityDossier(): Dossier {
  const members = [
    { name: "Membre A", declaration_probite_presente: true },
    { name: "Membre B", declaration_probite_presente: false },
    { name: "Membre C", declaration_probite_presente: false },
  ];
  const sourceReference = "Liste fictive des membres de la commission — page 1";
  const results = detectProbityDeclarationSignals(members, sourceReference);
  const excerpt = members
    .map(
      (member) =>
        `${member.name} — déclaration de probité : ${member.declaration_probite_presente ? "présente" : "non retrouvée"}`,
    )
    .join("\n");

  return {
    id: "probity-declarations",
    title: "Commission d’appel d’offres — déclarations de probité",
    score: results.length ? 90 : 12,
    excerpt,
    sourceLabel: sourceReference,
    totalPages: 1,
    activePage: 1,
    realDocument: false,
    alerts: results.map((result, index) => ({
      id: `probity-declaration-${index + 1}`,
      type: "Signal simple relatif aux obligations de probité",
      level: result.level,
      rule: result.ruleReference,
      expected: result.expected,
      observed: result.explanation,
      evidence: result.evidence,
      action: result.recommendation,
      page: 1,
      highlight: `${result.memberName} — déclaration de probité : non retrouvée`,
      status: "pending",
      indicators: result.indicators,
      generatedByControl: true,
    })),
  };
}

function buildRankingAttributionDossier(): Dossier {
  const excerpt = [
    "Grille finale de notation :",
    "Atlas Services — 92 points",
    "Rif Solutions — 84 points",
    "Sahara Tech — 79 points",
    "PV de commission : attributaire déclaré — Rif Solutions",
  ].join("\n");

  const result = detectRankingAttributionInconsistency({
    grille_notation: [
      { soumissionnaire: "Atlas Services", note_totale: 92 },
      { soumissionnaire: "Rif Solutions", note_totale: 84 },
      { soumissionnaire: "Sahara Tech", note_totale: 79 },
    ],
    soumissionnaire_attributaire: "Rif Solutions",
    source_grille: "Grille fictive de notation — page 4",
    source_pv: "PV fictif de commission — page 7",
  });

  return {
    id: "ranking-attribution",
    title: "Évaluation des offres — cohérence classement / attribution",
    score: result.triggered ? 95 : 12,
    excerpt,
    sourceLabel: "Grille de notation + PV fictifs",
    totalPages: 7,
    activePage: 7,
    realDocument: false,
    alerts: result.triggered
      ? [
          {
            id: "ranking-attribution-control",
            type: "Incohérence entre notation, classement et attribution",
            level: result.level,
            rule: result.ruleReference,
            expected: result.expected,
            observed: `${result.observed} ${result.gap}`,
            evidence: result.evidence,
            action: result.recommendation,
            page: 7,
            highlight: excerpt,
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
  buildPublicationDelayDossier(),
  buildProbityDossier(),
  buildRankingAttributionDossier(),
];
