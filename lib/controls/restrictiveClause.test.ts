import { describe, expect, it } from "vitest";
import { detectRestrictiveClause } from "./restrictiveClause";

describe("detectRestrictiveClause", () => {
  it("détecte une certification de partenaire écrite avec un mot accentué", () => {
    const result = detectRestrictiveClause(
      "Le soumissionnaire doit être partenaire certifié Dell Technologies, sans mention d’équivalence.",
    );

    expect(result.indicators).toContain("brand-certification");
  });

  it("conserve la mention d’équivalence comme garde-fou", () => {
    const result = detectRestrictiveClause(
      "Le soumissionnaire doit être partenaire certifié Dell Technologies ou solution techniquement équivalente.",
    );

    expect(result.indicators).toContain("brand-certification");
    expect(result.indicators).not.toContain("missing-equivalence");
  });
});
