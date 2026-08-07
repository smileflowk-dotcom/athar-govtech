import { describe, expect, it } from "vitest";
import { buildCompleteJourneyDossier } from "./demoDossiers";

describe("buildCompleteJourneyDossier", () => {
  it("construit un parcours cohérent avec quatre familles de contrôles", () => {
    const dossier = buildCompleteJourneyDossier();

    expect(dossier.realDocument).toBe(false);
    expect(dossier.sourceLabel).toContain("données fictives explicites");
    expect(dossier.alerts).toHaveLength(4);
    expect(dossier.alerts.map((alert) => alert.page)).toEqual([1, 6, 14, 18]);
    expect(dossier.alerts.map((alert) => alert.status)).toEqual([
      "pending",
      "pending",
      "pending",
      "pending",
    ]);

    expect(dossier.alerts.flatMap((alert) => alert.indicators)).toEqual(
      expect.arrayContaining([
        "insufficient-publication-delay",
        "named-brand",
        "brand-certification",
        "missing-equivalence",
        "missing-probity-declaration",
        "ranking-attribution-mismatch",
      ]),
    );

    dossier.alerts.forEach((alert) => {
      expect(alert.generatedByControl).toBe(true);
      expect(alert.rule.length).toBeGreaterThan(0);
      expect(alert.expected.length).toBeGreaterThan(0);
      expect(alert.observed.length).toBeGreaterThan(0);
      expect(alert.evidence.length).toBeGreaterThan(0);
      expect(alert.action.length).toBeGreaterThan(0);
    });
  });
});
