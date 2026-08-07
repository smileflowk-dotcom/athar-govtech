import { describe, expect, it } from "vitest";
import { detectProbityDeclarationSignals } from "./probityDeclaration";

describe("detectProbityDeclarationSignals", () => {
  it("ne déclenche aucune alerte lorsque tous les membres ont une déclaration", () => {
    const results = detectProbityDeclarationSignals([
      { name: "Membre A", declaration_probite_presente: true },
      { name: "Membre B", declaration_probite_presente: true },
    ]);

    expect(results).toHaveLength(0);
  });

  it("déclenche une alerte lorsqu'un membre n'a pas de déclaration", () => {
    const results = detectProbityDeclarationSignals([
      { name: "Membre A", declaration_probite_presente: true },
      { name: "Membre B", declaration_probite_presente: false },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].triggered).toBe(true);
    expect(results[0].level).toBe("Élevé");
    expect(results[0].memberName).toBe("Membre B");
    expect(results[0].observed).toContain("absente ou non retrouvée");
    expect(results[0].explanation).toContain("ne permet pas de conclure à un conflit d'intérêts réel");
  });

  it("déclenche une alerte distincte pour chaque membre sans déclaration", () => {
    const results = detectProbityDeclarationSignals([
      { name: "Membre A", declaration_probite_presente: false },
      { name: "Membre B", declaration_probite_presente: true },
      { name: "Membre C", declaration_probite_presente: false },
    ]);

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.memberName)).toEqual(["Membre A", "Membre C"]);
    expect(results.every((result) => result.indicators.includes("missing-probity-declaration"))).toBe(true);
  });
});
