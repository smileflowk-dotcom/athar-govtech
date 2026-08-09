import type { LocalModelClient } from "./localModel";
import type {
  AiFactType,
  ExtractedFact,
  FactExtractionResult,
  SourceDocumentText,
} from "./types";

export const FACT_EXTRACTION_PROMPT_VERSION = "athar-fact-extraction-v1";

const FACT_TYPES: AiFactType[] = [
  "note_soumissionnaire",
  "classement",
  "attributaire_declare",
];

const FACT_EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    facts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type_fait: { type: "string", enum: FACT_TYPES },
          valeur: { type: "string" },
          note: { anyOf: [{ type: "number" }, { type: "null" }] },
          rang: { anyOf: [{ type: "integer" }, { type: "null" }] },
          document_source: { type: "string" },
          page: { type: "integer", minimum: 1 },
          passage_exact: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: [
          "type_fait",
          "valeur",
          "note",
          "rang",
          "document_source",
          "page",
          "passage_exact",
          "confidence",
        ],
      },
    },
    uncertainty: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
  required: ["facts", "uncertainty"],
} satisfies Record<string, unknown>;

const SYSTEM_PROMPT = [
  "Tu es un extracteur factuel local pour ATHAR, outil d'assistance au contrôle des marchés publics.",
  "Tu ne qualifies jamais juridiquement une situation et tu n'inventes jamais une donnée absente.",
  "Tu extrais uniquement des faits explicitement présents dans le texte fourni.",
].join(" ");

export function buildFactExtractionPrompt(document: SourceDocumentText): string {
  const pages = document.pages
    .map((page) => `[PAGE ${page.page}]\n${page.text}`)
    .join("\n\n");

  return `PROMPT_VERSION=${FACT_EXTRACTION_PROMPT_VERSION}\n\n` +
    `Document source : ${document.document_source}\n\n` +
    "Objectif : extraire uniquement les faits utiles au scénario PoC grille de notation + PV.\n" +
    "Types autorisés :\n" +
    "- note_soumissionnaire : valeur = nom du soumissionnaire, note = note finale explicitement indiquée ;\n" +
    "- classement : valeur = nom du soumissionnaire, rang = rang explicitement indiqué ;\n" +
    "- attributaire_declare : valeur = nom de l'attributaire explicitement déclaré.\n\n" +
    "Règles impératives :\n" +
    "1. Ne déduis jamais une note, un classement ou un attributaire à partir d'indices incomplets.\n" +
    "2. Si une information est ambiguë, n'émets pas le fait concerné et explique l'incertitude dans uncertainty.\n" +
    "3. passage_exact doit être une copie exacte et contiguë du texte fourni, sans reformulation.\n" +
    "4. page doit correspondre au marqueur [PAGE n] contenant ce passage.\n" +
    "5. document_source doit être exactement le nom fourni ci-dessus.\n" +
    "6. confidence exprime uniquement la confiance d'extraction factuelle, jamais un risque métier.\n" +
    "7. Pour note_soumissionnaire, note doit être renseignée et rang doit être null.\n" +
    "8. Pour classement, rang doit être renseigné et note doit être null.\n" +
    "9. Pour attributaire_declare, note et rang doivent être null.\n\n" +
    "Texte à analyser :\n\n" +
    pages;
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
  index: number,
): { fact?: ExtractedFact; reason?: string } {
  if (!isRecord(raw)) return { reason: "Fait IA non structuré." };

  const type = raw.type_fait;
  if (typeof type !== "string" || !FACT_TYPES.includes(type as AiFactType)) {
    return { reason: "Type de fait IA non autorisé." };
  }

  const page = raw.page;
  if (typeof page !== "number" || !Number.isInteger(page) || page < 1) {
    return { reason: "Page source IA invalide." };
  }

  const sourcePage = document.pages.find((candidate) => candidate.page === page);
  if (!sourcePage) return { reason: `Page ${page} absente du document source.` };

  const passage = raw.passage_exact;
  if (typeof passage !== "string" || passage.length === 0) {
    return { reason: "Passage source IA manquant." };
  }

  // Garde-fou anti-hallucination : un fait n'entre dans ATHAR que si la preuve citée
  // est réellement présente, à l'identique, dans la page transmise au modèle.
  if (!sourcePage.text.includes(passage)) {
    return {
      reason:
        "Passage IA rejeté : la citation n'existe pas à l'identique dans la page source.",
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
    return {
      reason: "Un fait attributaire ne doit pas contenir de note ou de rang.",
    };
  }

  return {
    fact: {
      id: `${document.document_source}:${page}:${type}:${index + 1}`,
      type_fait: type as AiFactType,
      valeur,
      note: typeof note === "number" ? note : null,
      rang: typeof rang === "number" ? rang : null,
      // La provenance est reprise de l'entrée de confiance, pas du texte libre généré.
      document_source: document.document_source,
      page,
      passage_exact: passage,
      confidence: clampConfidence(raw.confidence),
      origin: "ia_extraction",
      prompt_version: FACT_EXTRACTION_PROMPT_VERSION,
    },
  };
}

export async function extractFactsWithLocalAi(
  document: SourceDocumentText,
  client: LocalModelClient,
): Promise<FactExtractionResult> {
  if (!document.document_source.trim()) {
    throw new Error("Le nom du document source est obligatoire.");
  }
  if (!Array.isArray(document.pages) || document.pages.length === 0) {
    throw new Error("Le document doit contenir au moins une page de texte.");
  }

  const prompt = buildFactExtractionPrompt(document);
  const completion = await client.completeJson({
    prompt,
    schema: FACT_EXTRACTION_SCHEMA,
    system: SYSTEM_PROMPT,
  });

  const payload = isRecord(completion.json) ? completion.json : {};
  const rawFacts = Array.isArray(payload.facts) ? payload.facts : [];
  const rejected_facts: FactExtractionResult["rejected_facts"] = [];
  const facts: ExtractedFact[] = [];

  rawFacts.forEach((raw, index) => {
    const validation = validateRawFact(raw, document, index);
    if (validation.fact) facts.push(validation.fact);
    else rejected_facts.push({ reason: validation.reason ?? "Fait IA rejeté.", raw });
  });

  const uncertainty =
    typeof payload.uncertainty === "string" && payload.uncertainty.trim()
      ? payload.uncertainty.trim()
      : rejected_facts.length
        ? "Un ou plusieurs faits proposés par le modèle ont été rejetés faute de preuve source exacte."
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
