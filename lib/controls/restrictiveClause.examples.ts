import { detectRestrictiveClause } from "./restrictiveClause";

export const restrictiveClauseExamples = {
  alertTriggered: detectRestrictiveClause(
    "Le soumissionnaire doit être un partenaire certifié agréé Dell Technologies ou Hewlett Packard Enterprise (HPE).",
  ),
  noAlert: detectRestrictiveClause(
    "Le soumissionnaire doit démontrer une capacité de maintenance constructeur ou équivalente, selon des critères de performance documentés.",
  ),
  explicitBrandWithoutEquivalence: detectRestrictiveClause(
    "Le matériel devra être de marque Atlas Copco et respecter les performances minimales indiquées.",
  ),
  explicitBrandWithTechnicalEquivalence: detectRestrictiveClause(
    "Le matériel sera de marque Atlas Copco ou techniquement équivalent.",
  ),
  genericBrandWording: detectRestrictiveClause(
    "Les matériaux devront être de première qualité, de marque reconnue et agréée par le maître d’œuvre.",
  ),
};

export function validateRestrictiveClauseExamples() {
  const {
    alertTriggered,
    noAlert,
    explicitBrandWithoutEquivalence,
    explicitBrandWithTechnicalEquivalence,
    genericBrandWording,
  } = restrictiveClauseExamples;

  if (!alertTriggered.triggered || alertTriggered.level !== "Élevé") {
    throw new Error("Le scénario restrictif doit produire une alerte de niveau élevé.");
  }

  if (noAlert.triggered) {
    throw new Error("Le scénario ouvert à l’équivalence ne doit pas produire d’alerte.");
  }

  if (!explicitBrandWithoutEquivalence.triggered) {
    throw new Error("Une marque explicitement imposée sans équivalence doit produire une alerte.");
  }

  if (explicitBrandWithTechnicalEquivalence.triggered) {
    throw new Error("Une marque ouverte à un équivalent technique ne doit pas produire d’alerte.");
  }

  if (genericBrandWording.triggered) {
    throw new Error("Une formulation générique sur une marque reconnue ne doit pas créer de faux positif.");
  }

  return true;
}
