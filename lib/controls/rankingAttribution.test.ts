import { describe, expect, it } from "vitest";
import {
  detectRankingAttributionInconsistency,
  RankingDataError,
} from "./rankingAttribution";

describe("detectRankingAttributionInconsistency", () => {
  it("ne déclenche pas d'alerte lorsque l'attributaire correspond au mieux classé", () => {
    const result = detectRankingAttributionInconsistency({
      grille_notation: [
        { soumissionnaire: "Atlas Services", note_totale: 92 },
        { soumissionnaire: "Rif Solutions", note_totale: 84 },
        { soumissionnaire: "Sahara Tech", note_totale: 79 },
      ],
      soumissionnaire_attributaire: "Atlas Services",
      source_grille: "Grille de notation — page 4",
      source_pv: "PV de commission — page 7",
    });

    expect(result.triggered).toBe(false);
    expect(result.level).toBe("Faible");
    expect(result.ranking[0].soumissionnaire).toBe("Atlas Services");
    expect(result.indicators).toEqual([]);
  });

  it("déclenche une alerte lorsque l'attributaire déclaré n'est pas le mieux classé", () => {
    const result = detectRankingAttributionInconsistency({
      grille_notation: [
        { soumissionnaire: "Atlas Services", note_totale: 92 },
        { soumissionnaire: "Rif Solutions", note_totale: 84 },
        { soumissionnaire: "Sahara Tech", note_totale: 79 },
      ],
      soumissionnaire_attributaire: "Rif Solutions",
    });

    expect(result.triggered).toBe(true);
    expect(result.level).toBe("Élevé");
    expect(result.topBidders).toEqual(["Atlas Services"]);
    expect(result.gap).toContain("ne figure pas");
    expect(result.indicators).toEqual(["ranking-attribution-mismatch"]);
  });

  it("ne déclenche pas d'alerte automatique en cas d'égalité en tête si l'attributaire est ex aequo", () => {
    const result = detectRankingAttributionInconsistency({
      grille_notation: [
        { soumissionnaire: "Atlas Services", note_totale: 90 },
        { soumissionnaire: "Rif Solutions", note_totale: 90 },
        { soumissionnaire: "Sahara Tech", note_totale: 80 },
      ],
      soumissionnaire_attributaire: "Rif Solutions",
    });

    expect(result.triggered).toBe(false);
    expect(result.level).toBe("Moyen");
    expect(result.tieAtTop).toBe(true);
    expect(result.topBidders).toEqual(["Atlas Services", "Rif Solutions"]);
    expect(result.explanation).toContain("égalité en tête");
  });

  it("signale quand même un attributaire hors du groupe ex aequo de tête", () => {
    const result = detectRankingAttributionInconsistency({
      grille_notation: [
        { soumissionnaire: "Atlas Services", note_totale: 90 },
        { soumissionnaire: "Rif Solutions", note_totale: 90 },
        { soumissionnaire: "Sahara Tech", note_totale: 80 },
      ],
      soumissionnaire_attributaire: "Sahara Tech",
    });

    expect(result.triggered).toBe(true);
    expect(result.level).toBe("Élevé");
  });

  it("lève une erreur de données manquantes au lieu de créer une alerte", () => {
    expect(() =>
      detectRankingAttributionInconsistency({
        grille_notation: [
          { soumissionnaire: "Atlas Services", note_totale: 92 },
          { soumissionnaire: "Rif Solutions", note_totale: Number.NaN },
        ],
        soumissionnaire_attributaire: "Atlas Services",
      }),
    ).toThrow(RankingDataError);
  });
});
