import type { LocalModelClient } from "./localModel";
import type {
  ExtractedFact,
  FactReconciliationResult,
  FactRelation,
} from "./types";

export const FACT_RECONCILIATION_PROMPT_VERSION = "athar-fact-reconciliation-v2";

const RECONCILIATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    relation: {
      type: "string",
      enum: ["confirme", "contredit", "insuffisant"],
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: "string" },
  },
  required: ["relation", "confidence", "reason"],
} satisfies Record<string, unknown>;

const SYSTEM_PROMPT = [
  "Tu rapproches deux faits documentaires pour ATHAR.",
  "Tu ne conclus jamais à une irrégularité.",
  "Si les deux faits ne permettent pas de conclure prudemment qu'ils décrivent la même réalité, retourne insuffisant.",
].join(" ");

export function buildFactReconciliationPrompt(
  left: ExtractedFact,
  right: ExtractedFact,
): string {
  return `PROMPT_VERSION=${FACT_RECONCILIATION_PROMPT_VERSION}\n\n` +
    "Compare les deux faits ci-dessous.\n\n" +
    "Relation autorisée :\n" +
    "- confirme : les deux faits décrivent probablement la même réalité et leurs valeurs sont compatibles ;\n" +
    "- contredit : les deux faits décrivent probablement la même réalité mais leurs valeurs sont incompatibles ;\n" +
    "- insuffisant : identité de la réalité, portée ou données trop ambiguës pour conclure.\n\n" +
    "Règles impératives :\n" +
    "1. Ne transforme jamais une similarité lexicale en certitude.\n" +
    "2. Deux mentions d'attributaire peuvent être rapprochées entre documents.\n" +
    "3. Un fait classement avec rang = 1 peut être rapproché d'un attributaire déclaré : ils décrivent alors le candidat gagnant attendu et le candidat effectivement déclaré.\n" +
    "4. Pour ce couple rang 1 / attributaire, compare l'identité du soumissionnaire : même identité = confirme ; identité différente = contredit ; identité incertaine = insuffisant.\n" +
    "5. Pour tout autre couple dont les types, acteurs ou contextes ne permettent pas un rapprochement fiable, retourne insuffisant.\n" +
    "6. confidence mesure uniquement la confiance dans le rapprochement documentaire, pas un risque métier.\n" +
    "7. La réponse ne doit contenir aucune qualification juridique.\n\n" +
    `FAIT A\n${JSON.stringify(left, null, 2)}\n\n` +
    `FAIT B\n${JSON.stringify(right, null, 2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export async function reconcileFactsWithLocalAi(
  left: ExtractedFact,
  right: ExtractedFact,
  client: LocalModelClient,
): Promise<FactReconciliationResult> {
  const prompt = buildFactReconciliationPrompt(left, right);
  const completion = await client.completeJson({
    prompt,
    schema: RECONCILIATION_SCHEMA,
    system: SYSTEM_PROMPT,
  });

  const payload = isRecord(completion.json) ? completion.json : {};
  const rawRelation = payload.relation;
  const confidence = clampConfidence(payload.confidence);
  const reason =
    typeof payload.reason === "string" && payload.reason.trim()
      ? payload.reason.trim()
      : "Le modèle local n'a pas fourni de justification exploitable.";

  const validRelations: FactRelation[] = ["confirme", "contredit", "insuffisant"];
  let relation: FactRelation =
    typeof rawRelation === "string" && validRelations.includes(rawRelation as FactRelation)
      ? (rawRelation as FactRelation)
      : "insuffisant";

  // Garde-fou PoC : une relation IA faiblement confiante ne devient jamais un
  // confirme/contredit métier. Elle reste explicitement insuffisante.
  if (confidence < 0.7) relation = "insuffisant";

  return {
    left_fact_id: left.id,
    right_fact_id: right.id,
    relation,
    confidence,
    reason,
    origin: "ia_rapprochement",
    trace: {
      provider: completion.provider,
      model: completion.model,
      prompt_version: FACT_RECONCILIATION_PROMPT_VERSION,
      prompt,
    },
  };
}
