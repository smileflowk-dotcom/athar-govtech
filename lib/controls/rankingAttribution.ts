import type { RestrictiveClauseResult } from "./restrictiveClause";

export type RankingAttributionIndicator = "ranking-attribution-mismatch";

export type BidderScore = {
  soumissionnaire: string;
  note_totale: number;
};

export type RankingAttributionInput = {
  grille_notation: BidderScore[];
  soumissionnaire_attributaire: string;
  source_grille?: string;
  source_pv?: string;
};

export type RecalculatedRank = {
  rang: number;
  soumissionnaire: string;
  note_totale: number;
};

export type RankingAttributionResult = Omit<RestrictiveClauseResult, "indicators"> & {
  indicators: RankingAttributionIndicator[];
  ruleReference: string;
  expected: string;
  observed: string;
  gap: string;
  ranking: RecalculatedRank[];
  declaredAwardee: string;
  topBidders: string[];
  topScore: number;
  tieAtTop: boolean;
};

/**
 * Erreur de qualité / complétude des données d'entrée.
 * Une donnée manquante ne doit jamais être convertie en alerte métier :
 * ATHAR demande d'abord la pièce ou la donnée nécessaire.
 */
export class RankingDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RankingDataError";
  }
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
}

function validateInput(input: RankingAttributionInput): void {
  if (!Array.isArray(input.grille_notation) || input.grille_notation.length === 0) {
    throw new RankingDataError("La grille de notation est absente ou vide.");
  }

  if (!input.soumissionnaire_attributaire?.trim()) {
    throw new RankingDataError("Le soumissionnaire attributaire déclaré est manquant.");
  }

  const names = new Set<string>();

  input.grille_notation.forEach((entry, index) => {
    if (!entry?.soumissionnaire?.trim()) {
      throw new RankingDataError(
        `Soumissionnaire manquant à la ligne ${index + 1} de la grille de notation.`,
      );
    }

    if (typeof entry.note_totale !== "number" || !Number.isFinite(entry.note_totale)) {
      throw new RankingDataError(
        `Note totale manquante ou invalide pour ${entry.soumissionnaire}.`,
      );
    }

    const normalized = normalizeName(entry.soumissionnaire);
    if (names.has(normalized)) {
      throw new RankingDataError(
        `Soumissionnaire dupliqué dans la grille : ${entry.soumissionnaire}.`,
      );
    }
    names.add(normalized);
  });
}

function buildRanking(scores: BidderScore[]): RecalculatedRank[] {
  const sorted = [...scores].sort((a, b) => {
    const noteDifference = b.note_totale - a.note_totale;
    if (noteDifference !== 0) return noteDifference;
    return a.soumissionnaire.localeCompare(b.soumissionnaire, "fr");
  });

  let previousScore: number | undefined;
  let currentRank = 0;

  return sorted.map((entry, index) => {
    if (previousScore === undefined || entry.note_totale !== previousScore) {
      currentRank = index + 1;
    }
    previousScore = entry.note_totale;

    return {
      rang: currentRank,
      soumissionnaire: entry.soumissionnaire.trim(),
      note_totale: entry.note_totale,
    };
  });
}

function formatRanking(ranking: RecalculatedRank[]): string {
  return ranking
    .map((entry) => `${entry.rang}. ${entry.soumissionnaire} (${entry.note_totale})`)
    .join(" ; ");
}

/**
 * Contrôle PoC de cohérence entre une grille finale de notation et l'attribution déclarée.
 *
 * Hypothèse de périmètre : `note_totale` représente le score FINAL réellement utilisé
 * pour classer les offres après les étapes d'admissibilité et les pondérations applicables.
 * Si la grille fournie n'est qu'une sous-note (technique, financière, etc.), ce contrôle
 * ne doit pas être appliqué comme tel.
 *
 * Cas d'égalité assumé : si plusieurs soumissionnaires partagent la meilleure note et que
 * l'attributaire déclaré appartient à ce groupe de tête, ATHAR ne déclenche PAS d'alerte.
 * Le départage éventuel relève alors d'une règle/document complémentaire à vérifier.
 * Si l'attributaire est en dehors du groupe ex aequo de tête, l'écart reste signalé.
 */
export function detectRankingAttributionInconsistency(
  input: RankingAttributionInput,
): RankingAttributionResult {
  validateInput(input);

  const ranking = buildRanking(input.grille_notation);
  const topScore = ranking[0].note_totale;
  const topBidders = ranking
    .filter((entry) => entry.note_totale === topScore)
    .map((entry) => entry.soumissionnaire);
  const tieAtTop = topBidders.length > 1;
  const normalizedAwardee = normalizeName(input.soumissionnaire_attributaire);
  const awardeeIsTop = topBidders.some(
    (bidder) => normalizeName(bidder) === normalizedAwardee,
  );
  const triggered = !awardeeIsTop;

  const ruleReference =
    "Décret n° 2-22-431 relatif aux marchés publics — principes d’égalité de traitement, de transparence des choix et de sélection de l’offre économiquement la plus avantageuse. [À CONFIRMER avec le guide d’audit CDC pour la règle opérationnelle de classement applicable au dossier]";
  const expected =
    "L’attributaire déclaré doit correspondre au soumissionnaire le mieux classé selon la grille finale applicable ; en cas d’égalité en tête, un départage documenté peut être nécessaire.";
  const rankingText = formatRanking(ranking);
  const observed = `Classement recalculé : ${rankingText}. Attributaire déclaré : ${input.soumissionnaire_attributaire.trim()}.`;

  let gap: string;
  let explanation: string;
  let recommendation: string;

  if (triggered) {
    gap = `Écart factuel : l’attributaire déclaré ne figure pas parmi le${topBidders.length > 1 ? "s" : ""} mieux classé${topBidders.length > 1 ? "s" : ""} selon les notes fournies (${topBidders.join(", ")}).`;
    explanation = `${gap} Le contrôle signale une incohérence documentaire à vérifier ; il ne conclut pas automatiquement à une irrégularité d’attribution.`;
    recommendation =
      "Vérifier la grille finale, les règles de pondération et de départage, les éventuelles exclusions et l’extrait du PV avant validation humaine.";
  } else if (tieAtTop) {
    gap =
      "Aucune alerte automatique : plusieurs soumissionnaires sont ex aequo à la meilleure note et l’attributaire déclaré appartient à ce groupe de tête.";
    explanation =
      "Une égalité en tête est détectée. ATHAR n’infère pas la règle de départage : le contrôleur doit vérifier le critère de départage et sa trace documentaire.";
    recommendation =
      "Vérifier dans le règlement et le PV la règle de départage appliquée entre les soumissionnaires ex aequo.";
  } else {
    gap = "Aucun écart détecté entre le classement recalculé et l’attributaire déclaré.";
    explanation =
      "L’attributaire déclaré correspond au soumissionnaire classé premier selon les notes finales fournies.";
    recommendation =
      "Conserver la grille recalculée et l’extrait du PV dans la piste d’audit.";
  }

  const sourceGrille = input.source_grille?.trim() || "Grille de notation";
  const sourcePv = input.source_pv?.trim() || "Extrait du PV de commission";

  return {
    triggered,
    level: triggered ? "Élevé" : tieAtTop ? "Moyen" : "Faible",
    indicators: triggered ? ["ranking-attribution-mismatch"] : [],
    evidence: `${sourceGrille} + ${sourcePv} — ${observed}`,
    explanation,
    recommendation,
    ruleReference,
    expected,
    observed,
    gap,
    ranking,
    declaredAwardee: input.soumissionnaire_attributaire.trim(),
    topBidders,
    topScore,
    tieAtTop,
  };
}
