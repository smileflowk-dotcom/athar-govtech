import type { RestrictiveClauseResult } from "./restrictiveClause";

export type PublicationProcedureType =
  | "appel_offres_simplifie_ouvert"
  | "appel_offres_ouvert_travaux"
  | "appel_offres_ouvert_fournitures_services_etat"
  | "appel_offres_ouvert_fournitures_services_collectivite"
  | "appel_offres_ouvert_fournitures_services_etablissement_public";

export type PublicationDelayIndicator = "insufficient-publication-delay";

export type PublicationDelayInput = {
  /**
   * Date ISO YYYY-MM-DD de la parution dans le dernier support de publication applicable.
   * Le décret fait courir le délai à partir du lendemain de cette date.
   */
  date_publication: string;
  /** Date ISO YYYY-MM-DD fixée pour la remise / ouverture des plis. */
  date_limite_depot: string;
  /** Montant estimé en dirhams. Les seuils de l'appel d'offres ouvert sont exprimés HT. */
  montant_estime: number;
  type_procedure: PublicationProcedureType;
};

export type PublicationDelayResult = Omit<RestrictiveClauseResult, "indicators"> & {
  indicators: PublicationDelayIndicator[];
  ruleReference: string;
  expected: string;
  observed: string;
  gap: string;
  observedDays: number;
  minimumDays: number;
  thresholdAmount?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const PUBLICATION_DELAY_RULES = {
  simplifiedOpen: {
    minimumDays: 10,
  },
  open: {
    defaultMinimumDays: 21,
    highValueMinimumDays: 40,
    // [À CONFIRMER avec le guide d'audit CDC] : seuils opérationnels à valider
    // avec la Cour avant constitution du catalogue de règles du PoC.
    thresholdsDhHt: {
      works: 75_550_000,
      suppliesServicesState: 1_964_300,
      suppliesServicesCollectivity: 5_364_050,
      suppliesServicesPublicBody: 8_700_000,
    },
  },
} as const;

function parseIsoDate(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Date invalide : ${value}. Format attendu YYYY-MM-DD.`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Date invalide : ${value}.`);
  }

  return timestamp;
}

export function calculateObservedDelayDays(
  datePublication: string,
  dateLimiteDepot: string,
): number {
  const publication = parseIsoDate(datePublication);
  const deadline = parseIsoDate(dateLimiteDepot);
  const days = Math.round((deadline - publication) / DAY_MS);

  if (days < 0) {
    throw new Error("La date limite de dépôt ne peut pas précéder la date de publication.");
  }

  return days;
}

export function determineMinimumPublicationDelay(
  typeProcedure: PublicationProcedureType,
  montantEstime: number,
): { minimumDays: number; thresholdAmount?: number } {
  if (!Number.isFinite(montantEstime) || montantEstime < 0) {
    throw new Error("Le montant estimé doit être un nombre positif ou nul.");
  }

  if (typeProcedure === "appel_offres_simplifie_ouvert") {
    return { minimumDays: PUBLICATION_DELAY_RULES.simplifiedOpen.minimumDays };
  }

  const thresholds = PUBLICATION_DELAY_RULES.open.thresholdsDhHt;
  let thresholdAmount: number;

  switch (typeProcedure) {
    case "appel_offres_ouvert_travaux":
      thresholdAmount = thresholds.works;
      break;
    case "appel_offres_ouvert_fournitures_services_etat":
      thresholdAmount = thresholds.suppliesServicesState;
      break;
    case "appel_offres_ouvert_fournitures_services_collectivite":
      thresholdAmount = thresholds.suppliesServicesCollectivity;
      break;
    case "appel_offres_ouvert_fournitures_services_etablissement_public":
      thresholdAmount = thresholds.suppliesServicesPublicBody;
      break;
  }

  return {
    minimumDays:
      montantEstime >= thresholdAmount
        ? PUBLICATION_DELAY_RULES.open.highValueMinimumDays
        : PUBLICATION_DELAY_RULES.open.defaultMinimumDays,
    thresholdAmount,
  };
}

export function detectPublicationDelay(
  input: PublicationDelayInput,
): PublicationDelayResult {
  const observedDays = calculateObservedDelayDays(
    input.date_publication,
    input.date_limite_depot,
  );
  const { minimumDays, thresholdAmount } = determineMinimumPublicationDelay(
    input.type_procedure,
    input.montant_estime,
  );
  const gapDays = Math.max(0, minimumDays - observedDays);
  const triggered = observedDays < minimumDays;

  const expected = `Délai minimal applicable : ${minimumDays} jours.`;
  const observed = `Publication : ${input.date_publication} ; date limite : ${input.date_limite_depot} ; délai observé : ${observedDays} jours.`;
  const gap = triggered
    ? `Écart factuel : ${gapDays} jour${gapDays > 1 ? "s" : ""} sous le minimum applicable.`
    : "Aucun écart de délai détecté par cette règle.";

  return {
    triggered,
    level: triggered ? "Élevé" : "Faible",
    indicators: triggered ? ["insufficient-publication-delay"] : [],
    ruleReference: "Décret n° 2-22-431 du 8 mars 2023 relatif aux marchés publics — article 23 (et régime simplifié prévu par le décret).",
    expected,
    observed,
    gap,
    observedDays,
    minimumDays,
    thresholdAmount,
    evidence: `Avis d'appel d'offres — ${observed}`,
    explanation: triggered
      ? `${gap} Le contrôle signale un délai de publication potentiellement insuffisant ; aucune irrégularité n'est conclue automatiquement.`
      : `Le délai observé (${observedDays} jours) atteint ou dépasse le minimum calculé (${minimumDays} jours).`,
    recommendation: triggered
      ? "Vérifier la date du dernier support de publication applicable, le type de procédure, le montant estimé et toute rectification ou prorogation avant validation humaine."
      : "Conserver les dates et la règle appliquée dans la piste d'audit.",
  };
}
