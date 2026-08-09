import {
  detectRankingAttributionInconsistency,
  type BidderScore,
  type RankingAttributionInput,
  type RankingAttributionResult,
} from "../controls/rankingAttribution";
import { extractFactsWithLocalAi } from "./factExtraction";
import { reconcileFactsWithLocalAi } from "./factReconciliation";
import type { LocalModelClient } from "./localModel";
import type {
  ExtractedFact,
  FactExtractionResult,
  FactReconciliationResult,
  SourceDocumentText,
} from "./types";

const MIN_FACT_CONFIDENCE_FOR_CONTROL = 0.7;
const MAX_RECONCILIATIONS = 4;

export type AiRankingAttributionAnalysis = {
  status: "ok" | "insuffisant";
  reason: string | null;
  extraction: {
    grille: FactExtractionResult;
    pv: FactExtractionResult;
  };
  rapprochements: FactReconciliationResult[];
  deterministic_input: RankingAttributionInput | null;
  deterministic_result: RankingAttributionResult | null;
};

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
}

function sourceLabel(fact: ExtractedFact): string {
  return `${fact.document_source} — page ${fact.page}`;
}

function buildRankingInputFromFacts(
  gridFacts: ExtractedFact[],
  pvFacts: ExtractedFact[],
): { input?: RankingAttributionInput; reason?: string } {
  const noteFacts = gridFacts.filter(
    (fact) =>
      fact.type_fait === "note_soumissionnaire" &&
      fact.confidence >= MIN_FACT_CONFIDENCE_FOR_CONTROL,
  );
  const awardeeFacts = pvFacts.filter(
    (fact) =>
      fact.type_fait === "attributaire_declare" &&
      fact.confidence >= MIN_FACT_CONFIDENCE_FOR_CONTROL,
  );

  if (noteFacts.length === 0) {
    return {
      reason:
        "Aucune note finale suffisamment fiable n'a été extraite de la grille pour alimenter le contrôle.",
    };
  }

  if (awardeeFacts.length === 0) {
    return {
      reason:
        "Aucun attributaire déclaré suffisamment fiable n'a été extrait du PV pour alimenter le contrôle.",
    };
  }

  const scoresByBidder = new Map<string, BidderScore>();
  for (const fact of noteFacts) {
    if (fact.note === null) continue;
    const key = normalizeName(fact.valeur);
    const existing = scoresByBidder.get(key);
    if (existing && existing.note_totale !== fact.note) {
      return {
        reason: `Notes contradictoires extraites pour ${fact.valeur}; ATHAR refuse de lancer le contrôle déterministe sans clarification.`,
      };
    }
    scoresByBidder.set(key, {
      soumissionnaire: fact.valeur,
      note_totale: fact.note,
    });
  }

  if (scoresByBidder.size === 0) {
    return { reason: "Les faits de note extraits ne contiennent aucune note exploitable." };
  }

  const normalizedAwardees = new Map<string, ExtractedFact>();
  for (const fact of awardeeFacts) {
    normalizedAwardees.set(normalizeName(fact.valeur), fact);
  }
  if (normalizedAwardees.size !== 1) {
    return {
      reason:
        "Plusieurs attributaires incompatibles ont été extraits du PV; ATHAR classe les données comme insuffisantes plutôt que de produire une alerte.",
    };
  }

  const awardeeFact = [...normalizedAwardees.values()][0];
  const gridSources = [...new Set(noteFacts.map(sourceLabel))].join(" ; ");

  return {
    input: {
      grille_notation: [...scoresByBidder.values()],
      soumissionnaire_attributaire: awardeeFact.valeur,
      source_grille: `Extraction IA vérifiée — ${gridSources}`,
      source_pv: `Extraction IA vérifiée — ${sourceLabel(awardeeFact)}`,
    },
  };
}

function candidatePairs(
  gridFacts: ExtractedFact[],
  pvFacts: ExtractedFact[],
): Array<[ExtractedFact, ExtractedFact]> {
  const pairs: Array<[ExtractedFact, ExtractedFact]> = [];
  const pvAwardees = pvFacts.filter((fact) => fact.type_fait === "attributaire_declare");

  const gridWinners = gridFacts.filter(
    (fact) => fact.type_fait === "classement" && fact.rang === 1,
  );
  for (const winner of gridWinners) {
    for (const awardee of pvAwardees) {
      pairs.push([winner, awardee]);
      if (pairs.length >= MAX_RECONCILIATIONS) return pairs;
    }
  }

  return pairs;
}

/**
 * Tranche verticale PoC : texte grille + texte PV -> faits sourcés par IA locale ->
 * rapprochement IA ciblé -> alimentation du contrôle déterministe existant.
 */
export async function analyzeRankingAttributionWithLocalAi(input: {
  grille: SourceDocumentText;
  pv: SourceDocumentText;
  client: LocalModelClient;
}): Promise<AiRankingAttributionAnalysis> {
  // Les prompts sont spécialisés par document pour réduire fortement le coût CPU :
  // la grille ne cherche que notes/rangs ; le PV ne cherche que l'attributaire déclaré.
  const gridExtraction = await extractFactsWithLocalAi(
    input.grille,
    input.client,
    ["note_soumissionnaire", "classement"],
  );
  const pvExtraction = await extractFactsWithLocalAi(
    input.pv,
    input.client,
    ["attributaire_declare"],
  );

  const rapprochements: FactReconciliationResult[] = [];
  for (const [left, right] of candidatePairs(gridExtraction.facts, pvExtraction.facts)) {
    rapprochements.push(await reconcileFactsWithLocalAi(left, right, input.client));
  }

  const rankingInput = buildRankingInputFromFacts(
    gridExtraction.facts,
    pvExtraction.facts,
  );

  if (!rankingInput.input) {
    return {
      status: "insuffisant",
      reason: rankingInput.reason ?? "Données insuffisantes pour lancer le contrôle.",
      extraction: { grille: gridExtraction, pv: pvExtraction },
      rapprochements,
      deterministic_input: null,
      deterministic_result: null,
    };
  }

  const deterministicResult = detectRankingAttributionInconsistency(rankingInput.input);

  return {
    status: "ok",
    reason: null,
    extraction: { grille: gridExtraction, pv: pvExtraction },
    rapprochements,
    deterministic_input: rankingInput.input,
    deterministic_result: deterministicResult,
  };
}
