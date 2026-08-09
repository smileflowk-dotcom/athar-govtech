import type { LocalModelClient } from "./localModel";
import type {
  AiFactType,
  ExtractedFact,
  FactExtractionResult,
  SourceDocumentText,
} from "./types";

export const FACT_EXTRACTION_PROMPT_VERSION = "athar-fact-extraction-v3";

const FACT_TYPES: AiFactType[] = [
  "note_soumissionnaire",
  "classement",
  "attributaire_declare",
];

function extractionSchema(allowedTypes: AiFactType[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      facts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type_fait: { type: "string", enum: allowedTypes },
            valeur: { type: "string" },
            note: { anyOf: [{ type: "number" }, { type: "null" }] },
            rang: { anyOf: [{ type: "integer" }, { type: "null" }] },
            source_anchor: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          required: [
            "type_fait",
            "valeur",
            "note",
            "rang",
            "source_anchor",
            "confidence",
          ],
        },
      },
      uncertainty: { anyOf: [{ type: "string" }, { type: "null" }] },
    },
    required: ["facts", "uncertainty"],
  } satisfies Record<string, unknown>;
}

const SYSTEM_PROMPT = "Extraction factuelle stricte. Aucun ajout. Aucune conclusion juridique.";

type SourceAnchor = {
  anchor: string;
  page: number;
  passage: string;
};

function buildSourceAnchors(document: SourceDocumentText): SourceAnchor[] {
  const anchors: SourceAnchor[] = [];

  for (const page of document.pages) {
    page.text.split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      anchors.push({
        anchor: `P${page.page}-L${index + 1}`,
        page: page.page,
        passage: line,
      });
    });
  }

  return anchors;
}

function typeInstruction(type: AiFactType): string {
  if (type === "note_soumissionnaire") return "note: valeur=nom, note=note finale, rang=null";
  if (type === "classement") return "classement: valeur=nom, rang=rang explicite, note=null";
  return "attributaire: valeur=nom explicitement déclaré, note=null, rang=null";
}

export function buildFactExtractionPrompt(
  document: SourceDocumentText,
  allowedTypes: AiFactType[] = FACT_TYPES,
): string {
  const anchors = buildSourceAnchors(document);
  const sourceLines = anchors.map((item) => `[${item.anchor}] ${item.passage}`).join("\n");
  const tasks = allowedTypes.map(typeInstruction).join("; ");

  return [
    `V=${FACT_EXTRACTION_PROMPT_VERSION}`,
    `DOC=${document.document_source}`,
    `Extrais seulement les faits explicites suivants: ${tasks}.`,
    "Chaque fait cite une ancre [P?-L?] existante. Ambigu = omettre le fait et renseigner uncertainty. Ne déduis rien.",
    "SOURCES:",
    sourceLines,
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function validateRawFact(
  raw: unknown,
  document: SourceDocumentText,
  anchors: Map<string, SourceAnchor>,
  allowedTypes: AiFactType[],
  index: number,
): { fact?: ExtractedFact; reason?: string } {
  if (!isRecord(raw)) return { reason: "Fait IA non structuré." };

  const type = raw.type_fait;
  if (typeof type !== "string" || !allowedTypes.includes(type as AiFactType)) {
    return { reason: "Type de fait IA non autorisé pour ce document." };
  }

  const sourceAnchor = raw.source_anchor;
  if (typeof sourceAnchor !== "string" || !sourceAnchor.trim()) {
    return { reason: "Ancre source IA manquante." };
  }

  const source = anchors.get(sourceAnchor.trim());
  if (!source) {
    return {
      reason: `Ancre IA rejetée : ${sourceAnchor} n'existe pas dans le document source.`,
    };
  }

  const valeur = typeof raw.valeur === "string" ? raw.valeur.trim() : "";
  if (!valeur) return { reason: "Valeur factuelle IA manquante." };

  const note = raw.note === null ? null : raw.note;
  const rang = raw.rang === null ? null : raw.rang;

  if (type === "note_soumissionnaire") {
    if (typeof note !== "number" || !Number.isFinite(note)) {
      return { reason: "Note IA absente ou invalide." };
    }
    if (rang !== null) return { reason: "Un fait note ne doit pas contenir de rang." };
  }

  if (type === "classement") {
    if (typeof rang !== "number" || !Number.isInteger(rang) || rang < 1) {
      return { reason: "Rang IA absent ou invalide." };
    }
    if (note !== null) return { reason: "Un fait classement ne doit pas contenir de note." };
  }

  if (type === "attributaire_declare" && (note !== null || rang !== null)) {
    return { reason: "Un fait attributaire ne doit pas contenir de note ou de rang." };
  }

  return {
    fact: {
      id: `${document.document_source}:${source.page}:${type}:${index + 1}`,
      type_fait: type as AiFactType,
      valeur,
      note: typeof note === "number" ? note : null,
      rang: typeof rang === "number" ? rang : null,
      // La preuve n'est jamais reprise du texte généré : ATHAR la reconstruit depuis l'ancre.
      document_source: document.document_source,
      page: source.page,
      passage_exact: source.passage,
      confidence: clampConfidence(raw.confidence),
      origin: "ia_extraction",
      prompt_version: FACT_EXTRACTION_PROMPT_VERSION,
    },
  };
}

export async function extractFactsWithLocalAi(
  document: SourceDocumentText,
  client: LocalModelClient,
  allowedTypes: AiFactType[] = FACT_TYPES,
): Promise<FactExtractionResult> {
  if (!document.document_source.trim()) {
    throw new Error("Le nom du document source est obligatoire.");
  }
  if (!Array.isArray(document.pages) || document.pages.length === 0) {
    throw new Error("Le document doit contenir au moins une page de texte.");
  }
  if (allowedTypes.length === 0 || allowedTypes.some((type) => !FACT_TYPES.includes(type))) {
    throw new Error("Au moins un type de fait autorisé est requis.");
  }

  const sourceAnchors = buildSourceAnchors(document);
  if (sourceAnchors.length === 0) {
    throw new Error("Le document ne contient aucune ligne de texte exploitable.");
  }

  const anchorMap = new Map(sourceAnchors.map((item) => [item.anchor, item]));
  const prompt = buildFactExtractionPrompt(document, allowedTypes);
  const completion = await client.completeJson({
    prompt,
    schema: extractionSchema(allowedTypes),
    system: SYSTEM_PROMPT,
  });

  const payload = isRecord(completion.json) ? completion.json : {};
  const rawFacts = Array.isArray(payload.facts) ? payload.facts : [];
  const rejected_facts: FactExtractionResult["rejected_facts"] = [];
  const facts: ExtractedFact[] = [];

  rawFacts.forEach((raw, index) => {
    const validation = validateRawFact(raw, document, anchorMap, allowedTypes, index);
    if (validation.fact) facts.push(validation.fact);
    else rejected_facts.push({ reason: validation.reason ?? "Fait IA rejeté.", raw });
  });

  const uncertainty =
    typeof payload.uncertainty === "string" && payload.uncertainty.trim()
      ? payload.uncertainty.trim()
      : rejected_facts.length
        ? "Un ou plusieurs faits proposés par le modèle ont été rejetés faute d'ancre source valide."
        : null;

  return {
    facts,
    uncertainty,
    rejected_facts,
    trace: {
      provider: completion.provider,
      model: completion.model,
      prompt_version: FACT_EXTRACTION_PROMPT_VERSION,
      prompt,
    },
  };
}
