import type { LocalModelClient } from "./localModel";
import type {
  AiFactType,
  ExtractedFact,
  FactExtractionResult,
  SourceDocumentText,
} from "./types";

export const FACT_EXTRACTION_PROMPT_VERSION = "athar-fact-extraction-v2";

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

const SYSTEM_PROMPT = [
  "Tu es un extracteur factuel local pour ATHAR, outil d'assistance au contrôle des marchés publics.",
  "Tu ne qualifies jamais juridiquement une situation et tu n'inventes jamais une donnée absente.",
  "Tu extrais uniquement des faits explicitement présents dans les lignes sources fournies.",
].join(" ");

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

export function buildFactExtractionPrompt(document: SourceDocumentText): string {
  const anchors = buildSourceAnchors(document);
  const sourceLines = anchors
    .map((item) => `[${item.anchor}] ${item.passage}`)
    .join("\n");

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
    "3. Chaque fait doit citer exactement un source_anchor présent dans le texte ci-dessous.\n" +
    "4. Ne recopie pas le passage source : ATHAR le reconstruira lui-même à partir de source_anchor.\n" +
    "5. confidence exprime uniquement la confiance d'extraction factuelle, jamais un risque métier.\n" +
    "6. Pour note_soumissionnaire, note doit être renseignée et rang doit être null.\n" +
    "7. Pour classement, rang doit être renseigné et note doit être null.\n" +
    "8. Pour attributaire_declare, note et rang doivent être null.\n" +
    "9. Une même ligne peut soutenir plusieurs faits distincts si elle les énonce explicitement.\n\n" +
    "Lignes sources à analyser :\n\n" +
    sourceLines;
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
  index: number,
): { fact?: ExtractedFact; reason?: string } {
  if (!isRecord(raw)) return { reason: "Fait IA non structuré." };

  const type = raw.type_fait;
  if (typeof type !== "string" || !FACT_TYPES.includes(type as AiFactType)) {
    return { reason: "Type de fait IA non autorisé." };
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
    return {
      reason: "Un fait attributaire ne doit pas contenir de note ou de rang.",
    };
  }

  return {
    fact: {
      id: `${document.document_source}:${source.page}:${type}:${index + 1}`,
      type_fait: type as AiFactType,
      valeur,
      note: typeof note === "number" ? note : null,
      rang: typeof rang === "number" ? rang : null,
      // Provenance forte : la page et le passage exact ne sont jamais repris du texte
      // généré par le modèle. Ils sont reconstruits à partir d'une ancre source existante.
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
): Promise<FactExtractionResult> {
  if (!document.document_source.trim()) {
    throw new Error("Le nom du document source est obligatoire.");
  }
  if (!Array.isArray(document.pages) || document.pages.length === 0) {
    throw new Error("Le document doit contenir au moins une page de texte.");
  }

  const sourceAnchors = buildSourceAnchors(document);
  if (sourceAnchors.length === 0) {
    throw new Error("Le document ne contient aucune ligne de texte exploitable.");
  }

  const anchorMap = new Map(sourceAnchors.map((item) => [item.anchor, item]));
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
    const validation = validateRawFact(raw, document, anchorMap, index);
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
