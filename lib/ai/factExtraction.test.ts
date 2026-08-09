import { describe, expect, it } from "vitest";
import { extractFactsWithLocalAi } from "./factExtraction";
import type {
  JsonSchema,
  LocalModelClient,
  LocalModelCompletion,
} from "./localModel";

class FakeLocalModelClient implements LocalModelClient {
  constructor(private readonly payload: unknown) {}

  async completeJson(_input: {
    prompt: string;
    schema: JsonSchema;
    system?: string;
  }): Promise<LocalModelCompletion> {
    return {
      json: this.payload,
      raw: JSON.stringify(this.payload),
      model: "fake-local-model",
      provider: "test-double",
    };
  }
}

describe("extractFactsWithLocalAi", () => {
  it("extrait des notes claires et reconstruit la preuve exacte depuis l'ancre source", async () => {
    const text = [
      "Grille finale de notation :",
      "Atlas Services — 92 points",
      "Rif Solutions — 84 points",
      "Classement : 1. Atlas Services ; 2. Rif Solutions",
    ].join("\n");

    const result = await extractFactsWithLocalAi(
      {
        document_source: "grille.pdf",
        pages: [{ page: 4, text }],
      },
      new FakeLocalModelClient({
        facts: [
          {
            type_fait: "note_soumissionnaire",
            valeur: "Atlas Services",
            note: 92,
            rang: null,
            source_anchor: "P4-L2",
            confidence: 0.98,
          },
          {
            type_fait: "note_soumissionnaire",
            valeur: "Rif Solutions",
            note: 84,
            rang: null,
            source_anchor: "P4-L3",
            confidence: 0.97,
          },
        ],
        uncertainty: null,
      }),
    );

    expect(result.facts).toHaveLength(2);
    expect(result.facts[0]).toMatchObject({
      type_fait: "note_soumissionnaire",
      valeur: "Atlas Services",
      note: 92,
      document_source: "grille.pdf",
      page: 4,
      passage_exact: "Atlas Services — 92 points",
      origin: "ia_extraction",
    });
    expect(result.trace.prompt).toContain("source_anchor");
    expect(result.trace.prompt_version).toBe("athar-fact-extraction-v2");
  });

  it("signale l'incertitude et rejette un fait dont l'ancre source est inventée", async () => {
    const result = await extractFactsWithLocalAi(
      {
        document_source: "pv.pdf",
        pages: [
          {
            page: 7,
            text: "La commission décide de poursuivre l'examen après vérification des pièces.",
          },
        ],
      },
      new FakeLocalModelClient({
        facts: [
          {
            type_fait: "attributaire_declare",
            valeur: "Atlas Services",
            note: null,
            rang: null,
            source_anchor: "P7-L99",
            confidence: 0.61,
          },
        ],
        uncertainty: "Aucun attributaire n'est explicitement déclaré dans l'extrait.",
      }),
    );

    expect(result.facts).toEqual([]);
    expect(result.rejected_facts).toHaveLength(1);
    expect(result.rejected_facts[0].reason).toContain("n'existe pas");
    expect(result.uncertainty).toContain("Aucun attributaire");
  });
});
