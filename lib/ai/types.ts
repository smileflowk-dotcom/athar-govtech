export type AiFactType =
  | "note_soumissionnaire"
  | "classement"
  | "attributaire_declare";

export type ExtractedFact = {
  id: string;
  type_fait: AiFactType;
  valeur: string;
  note: number | null;
  rang: number | null;
  document_source: string;
  page: number;
  passage_exact: string;
  confidence: number;
  origin: "ia_extraction";
  prompt_version: string;
};

export type SourcePage = {
  page: number;
  text: string;
};

export type SourceDocumentText = {
  document_source: string;
  pages: SourcePage[];
};

export type AiModelMetrics = {
  total_duration_ns?: number;
  load_duration_ns?: number;
  prompt_eval_count?: number;
  prompt_eval_duration_ns?: number;
  eval_count?: number;
  eval_duration_ns?: number;
};

export type AiModelTrace = {
  provider: "ollama-local" | "test-double";
  model: string;
  prompt_version: string;
  prompt: string;
  metrics?: AiModelMetrics;
};

export type FactExtractionResult = {
  facts: ExtractedFact[];
  uncertainty: string | null;
  rejected_facts: Array<{
    reason: string;
    raw: unknown;
  }>;
  trace: AiModelTrace;
};

export type FactRelation = "confirme" | "contredit" | "insuffisant";

export type FactReconciliationResult = {
  left_fact_id: string;
  right_fact_id: string;
  relation: FactRelation;
  confidence: number;
  reason: string;
  origin: "ia_rapprochement";
  trace: AiModelTrace;
};
