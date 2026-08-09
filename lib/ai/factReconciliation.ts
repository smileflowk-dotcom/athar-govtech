import type { LocalModelClient } from "./localModel";
import type {
  ExtractedFact,
  FactReconciliationResult,
  FactRelation,
} from "./types";

export const FACT_RECONCILIATION_PROMPT_VERSION = "athar-fact-reconciliation-v3";

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

const SYSTEM_PROMPT = "Rapprochement factuel prudent. Aucune conclusion juridique. Ambigu = insuffisant.";

function compactFact(fact: ExtractedFact): string {
  const detail =
    fact.type_fait === "classement"
      ? `rang=${fact.rang}`
      : fact.type_fait === "note_soumissionnaire"
        ? `note=${fact.note}`
        : "attributaire déclaré";
  return `${fact.type_fait}|${fact.valeur}|${detail}|${fact.document_source}|p${fact.page}`;
}

export function buildFactReconciliationPrompt(
  left: ExtractedFact,
  right: ExtractedFact,
): string {
  return [
    `V=${FACT_RECONCILIATION_PROMPT_VERSION}`,
    "Compare A et B. Rang 1 = gagnant attendu. Attributaire = gagnant déclaré.",
    "confirme=même identité; contredit=identités différentes; insuffisant=identité incertaine.",
    `A=${compactFact(left)}`,
    `B=${compactFact(right)}`,
  ].join("\n");
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
    maxTokens: 96,
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
