import { describe, expect, it } from "vitest";
import { buildStructuredDossier, parseStructuredSource } from "./importedStructuredSource";

describe("structured source import", () => {
  it("parses a semicolon CSV PMP record", () => {
    const records = parseStructuredSource(
      "pmp.csv",
      [
        "reference_marche;date_publication;date_limite_depot;montant_estime;type_procedure",
        "AO-2026-014;2026-01-01;2026-01-31;2500000;appel_offres_ouvert_fournitures_services_etat",
      ].join("\n"),
    );

    expect(records).toHaveLength(1);
    expect(records[0].reference_marche).toBe("AO-2026-014");
  });

  it("creates a sourced publication-delay alert from JSON", () => {
    const dossier = buildStructuredDossier(
      "pmp.json",
      JSON.stringify({
        reference_marche: "AO-2026-014",
        acheteur: "Commune de démonstration",
        date_publication: "2026-01-01",
        date_limite_depot: "2026-01-31",
        montant_estime: 2500000,
        type_procedure: "appel_offres_ouvert_fournitures_services_etat",
      }),
    );

    expect(dossier.title).toBe("AO-2026-014");
    expect(dossier.alerts).toHaveLength(1);
    expect(dossier.alerts[0].controlId).toBe("CTRL-DEL-01");
    expect(dossier.alerts[0].evidenceItems?.[0].source).toBe("pmp.json");
    expect(dossier.alerts[0].evidenceItems?.[0].location).toContain("Enregistrement structuré");
  });

  it("refuses an ambiguous multi-market structured file", () => {
    expect(() => buildStructuredDossier(
      "pmp.json",
      JSON.stringify([
        { reference_marche: "AO-1" },
        { reference_marche: "AO-2" },
      ]),
    )).toThrow(/un marché par fichier structuré/i);
  });
});
