import { describe, expect, it } from "vitest";
import { analyzeRankingAttributionWithLocalAi } from "./rankingAttributionAi";
import type {
  JsonSchema,
  LocalModelClient,
  LocalModelCompletion,
} from "./localModel";

class QueueLocalModelClient implements LocalModelClient {
  private index = 0;

  constructor(private readonly payloads: unknown[]) {}

  async completeJson(_input: {
    prompt: string;
    schema: JsonSchema;
    system?: string;
  }): Promise<LocalModelCompletion> {
    const payload = this.payloads[this.index++];
    if (payload === undefined) throw new Error("Réponse de test manquante.");
    return {
      json: payload,
      raw: JSON.stringify(payload),
      model: "fake-local-model",
      provider: "test-double",
    };
  }
}

describe("analyzeRankingAttributionWithLocalAi", () => {
  it("alimente le contrôle existant et rapproche le premier classé de l'attributaire", async () => {
    const gridText = [
      "Atlas Services — 92 points",
      "Rif Solutions — 84 points",
      "Classement : 1. Atlas Services ; 2. Rif Solutions",
    ].join("\n");
    const pvText = "Attributaire déclaré : Rif Solutions";

    const result = await analyzeRankingAttributionWithLocalAi({
      grille: {
        document_source: "grille.pdf",
        pages: [{ page: 4, text: gridText }],
      },
      pv: {
        document_source: "pv.pdf",
        pages: [{ page: 7, text: pvText }],
      },
      client: new QueueLocalModelClient([
        {
          facts: [
            {
              type_fait: "note_soumissionnaire",
              valeur: "Atlas Services",
              note: 92,
              rang: null,
              source_anchor: "P4-L1",
              confidence: 0.98,
            },
            {
              type_fait: "note_soumissionnaire",
              valeur: "Rif Solutions",
              note: 84,
              rang: null,
              source_anchor: "P4-L2",
              confidence: 0.97,
            },
            {
              type_fait: "classement",
              valeur: "Atlas Services",
              note: null,
              rang: 1,
              source_anchor: "P4-L3",
              confidence: 0.96,
            },
          ],
          uncertainty: null,
        },
        {
          facts: [
            {
              type_fait: "attributaire_declare",
              valeur: "Rif Solutions",
              note: null,
              rang: null,
              source_anchor: "P7-L1",
              confidence: 0.99,
            },
          ],
          uncertainty: null,
        },
        {
          relation: "contredit",
          confidence: 0.96,
          reason: "Le premier classé est Atlas Services alors que le PV déclare Rif Solutions attributaire.",
        },
      ]),
    });

    expect(result.status).toBe("ok");
    expect(result.deterministic_input?.grille_notation).toEqual([
      { soumissionnaire: "Atlas Services", note_totale: 92 },
      { soumissionnaire: "Rif Solutions", note_totale: 84 },
    ]);
    expect(result.rapprochements).toHaveLength(1);
    expect(result.rapprochements[0].relation).toBe("contredit");
    expect(result.deterministic_result?.triggered).toBe(true);
    expect(result.deterministic_result?.topBidders).toEqual(["Atlas Services"]);
    expect(result.deterministic_result?.evidence).toContain("Extraction IA vérifiée");
  });
});
