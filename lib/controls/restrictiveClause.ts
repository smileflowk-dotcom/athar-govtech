export type RestrictiveClauseIndicator =
  | "named-brand"
  | "brand-certification"
  | "missing-equivalence";

export type RestrictiveClauseResult = {
  triggered: boolean;
  level: "Élevé" | "Moyen" | "Faible";
  indicators: RestrictiveClauseIndicator[];
  evidence: string;
  explanation: string;
  recommendation: string;
};

const BRAND_PATTERNS = [
  /\bDell(?: Technologies)?\b/i,
  /\bHewlett[ -]?Packard(?: Enterprise)?\b/i,
  /\bHPE\b/i,
  /\bCisco\b/i,
  /\bMicrosoft\b/i,
  /\bOracle\b/i,
  /\bIBM\b/i,
  /\bLenovo\b/i,
];

// Détecte aussi une marque inconnue du catalogue lorsqu'elle est explicitement
// introduite comme telle dans le document : « marque X » / « de marque X ».
// Les formulations génériques (« marque reconnue », « marque du fabricant »...)
// sont volontairement exclues pour limiter les faux positifs.
const EXPLICIT_BRAND_PATTERN =
  /\b(?:de\s+)?marque\s+(?!reconnue\b|d['’]identification\b|du\b|de\b|commerciale\b|fabricant\b|constructeur\b|agréée\b)([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’&.+/-]*(?:\s+[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’&.+/-]*){0,3})/i;

// Ne pas utiliser \b après « certifié / agréé / autorisé » : en JavaScript,
// la frontière de mot est ASCII et ne reconnaît pas « é » comme caractère de mot.
const CERTIFICATION_PATTERN =
  /\b(?:partenaire|revendeur|distributeur|intégrateur)\s+(?:certifié|agréé|autorisé)(?=\s|[.,;:!?)]|$)/i;

const EQUIVALENCE_PATTERN =
  /\b(?:ou\s+(?:techniquement\s+)?équivalent(?:e)?s?|équivalence|solution(?:s)?\s+(?:techniquement\s+)?équivalente(?:s)?)\b/i;

export function detectRestrictiveClause(
  text: string,
): RestrictiveClauseResult {
  const normalizedText = text.trim();
  const indicators: RestrictiveClauseIndicator[] = [];

  const hasKnownBrand = BRAND_PATTERNS.some((pattern) => pattern.test(normalizedText));
  const hasExplicitBrand = EXPLICIT_BRAND_PATTERN.test(normalizedText);
  const hasNamedBrand = hasKnownBrand || hasExplicitBrand;
  const hasBrandCertification = CERTIFICATION_PATTERN.test(normalizedText);
  const hasEquivalence = EQUIVALENCE_PATTERN.test(normalizedText);

  if (hasNamedBrand) indicators.push("named-brand");
  if (hasBrandCertification) indicators.push("brand-certification");
  if ((hasNamedBrand || hasBrandCertification) && !hasEquivalence) {
    indicators.push("missing-equivalence");
  }

  const triggered = indicators.length >= 2;
  const level = indicators.length === 3 ? "Élevé" : triggered ? "Moyen" : "Faible";

  let explanation =
    "Aucune combinaison suffisante d’indicateurs restrictifs n’a été détectée dans cet extrait.";

  if (triggered && hasNamedBrand && hasBrandCertification) {
    explanation =
      "Le passage associe une exigence de certification à une ou plusieurs marques nommément désignées, sans mention explicite d’une solution équivalente. Ce signal nécessite une vérification humaine de la justification et de la proportionnalité de l’exigence.";
  } else if (triggered && hasNamedBrand) {
    explanation =
      "Le passage désigne explicitement une marque sans mention d’équivalence détectée. Ce signal nécessite une vérification humaine de la justification fonctionnelle et de l’ouverture à la concurrence.";
  } else if (triggered && hasBrandCertification) {
    explanation =
      "Le passage contient une exigence de certification ou d’agrément sans mention d’équivalence détectée. Ce signal nécessite une vérification humaine de sa justification et de sa proportionnalité.";
  }

  return {
    triggered,
    level,
    indicators,
    evidence: normalizedText,
    explanation,
    recommendation: triggered
      ? "Vérifier la justification technique, l’ouverture aux solutions équivalentes et l’effet potentiel de l’exigence sur l’accès à la concurrence."
      : "Aucune action prioritaire ; conserver l’extrait dans la piste d’audit.",
  };
}
