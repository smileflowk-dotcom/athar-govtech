import { describe, expect, it } from "vitest";
import { reconcileFactsWithLocalAi } from "./factReconciliation";
import type {
  JsonSchema,
  LocalModelClient,
  LocalModelCompletion,
} from "./localModel";
import type { ExtractedFact } from "./types";

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

function awardeeFact(id: string, document: string, value: string): ExtractedFact {
  return {
    id,
    type_fait: "attributaire_declare",
    valeur: value,
    note: null,
    rang: null,
    document_source: document,
    page: 1,
    passage_exact: `Attributaire déclaré : ${value}`,
    confidence: 0.95,
    origin: "ia_extraction",
    prompt_version: "athar-fact-extraction-v1",
  };
}

describe("reconcileFactsWithLocalAi", () => {
  it("confirme deux mentions compatibles du même attributaire", async () => {
    const result = await reconcileFactsWithLocalAi(
      awardeeFact("a", "grille.pdf", "Atlas Services"),
      awardeeFact("b", "pv.pdf", "Atlas Services"),
      new FakeLocalModelClient({
        relation: "confirme",
        confidence: 0.96,
        reason: "Même attributaire explicitement nommé dans les deux sources.",
      }),
    );

    expect(result.relation).toBe("confirme");
    expect(result.confidence).toBe(0.96);
    expect(result.origin).toBe("ia_rapprochement");
  });

  it("signale une contradiction entre deux mentions du même fait", async () => {
    const result = await reconcileFactsWithLocalAi(
      awardeeFact("a", "grille.pdf", "Atlas Services"),
      awardeeFact("b", "pv.pdf", "Rif Solutions"),
      new FakeLocalModelClient({
        relation: "contredit",
        confidence: 0.91,
        reason: "Les deux sources déclarent des attributaires différents.",
      }),
    );

    expect(result.relation).toBe("contredit");
    expect(result.confidence).toBe(0.91);
  });

  it("force insuffisant lorsque la confiance du rapprochement est trop faible", async () => {
    const result = await reconcileFactsWithLocalAi(
      awardeeFact("a", "grille.pdf", "Atlas Services"),
      awardeeFact("b", "pv.pdf", "Atlas Services Group"),
      new FakeLocalModelClient({
        relation: "confirme",
        confidence: 0.52,
        reason: "La dénomination est proche mais l'identité juridique n'est pas certaine.",
      }),
    );

    expect(result.relation).toBe("insuffisant");
    expect(result.confidence).toBe(0.52);
  });
});
