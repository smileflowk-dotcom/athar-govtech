import { detectRestrictiveClause } from "./restrictiveClause";

export const restrictiveClauseExamples = {
  alertTriggered: detectRestrictiveClause(
    "Le soumissionnaire doit être un partenaire certifié agréé Dell Technologies ou Hewlett Packard Enterprise (HPE).",
  ),
  noAlert: detectRestrictiveClause(
    "Le soumissionnaire doit démontrer une capacité de maintenance constructeur ou équivalente, selon des critères de performance documentés.",
  ),
};

export function validateRestrictiveClauseExamples() {
  const { alertTriggered, noAlert } = restrictiveClauseExamples;

  if (!alertTriggered.triggered || alertTriggered.level !== "Élevé") {
    throw new Error("Le scénario restrictif doit produire une alerte de niveau élevé.");
  }

  if (noAlert.triggered) {
    throw new Error("Le scénario ouvert à l’équivalence ne doit pas produire d’alerte.");
  }

  return true;
}
