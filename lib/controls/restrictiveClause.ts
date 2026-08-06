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

const CERTIFICATION_PATTERN =
  /\b(?:partenaire|revendeur|distributeur|intégrateur)\s+(?:certifié|agréé|autorisé)\b/i;

const EQUIVALENCE_PATTERN =
  /\b(?:ou\s+équivalent(?:e)?|équivalence|solution(?:s)?\s+équivalente(?:s)?)\b/i;

export function detectRestrictiveClause(
  text: string,
): RestrictiveClauseResult {
  const normalizedText = text.trim();
  const indicators: RestrictiveClauseIndicator[] = [];

  const hasNamedBrand = BRAND_PATTERNS.some((pattern) => pattern.test(normalizedText));
  const hasBrandCertification = CERTIFICATION_PATTERN.test(normalizedText);
  const hasEquivalence = EQUIVALENCE_PATTERN.test(normalizedText);

  if (hasNamedBrand) indicators.push("named-brand");
  if (hasBrandCertification) indicators.push("brand-certification");
  if ((hasNamedBrand || hasBrandCertification) && !hasEquivalence) {
    indicators.push("missing-equivalence");
  }

  const triggered = indicators.length >= 2;
  const level = indicators.length === 3 ? "Élevé" : triggered ? "Moyen" : "Faible";

  return {
    triggered,
    level,
    indicators,
    evidence: normalizedText,
    explanation: triggered
      ? "Le passage associe une exigence de certification à une ou plusieurs marques nommément désignées, sans mention explicite d’une solution équivalente. Ce signal nécessite une vérification humaine de la justification et de la proportionnalité de l’exigence."
      : "Aucune combinaison suffisante d’indicateurs restrictifs n’a été détectée dans cet extrait.",
    recommendation: triggered
      ? "Vérifier la justification technique, l’ouverture aux solutions équivalentes et l’effet potentiel de l’exigence sur l’accès à la concurrence."
      : "Aucune action prioritaire ; conserver l’extrait dans la piste d’audit.",
  };
}
