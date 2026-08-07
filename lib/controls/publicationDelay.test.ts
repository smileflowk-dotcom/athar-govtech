import { describe, expect, it } from "vitest";
import { detectPublicationDelay } from "./publicationDelay";

describe("detectPublicationDelay", () => {
  it("ne déclenche pas d'alerte lorsque le délai est suffisant", () => {
    const result = detectPublicationDelay({
      date_publication: "2026-01-01",
      date_limite_depot: "2026-01-25",
      montant_estime: 1_000_000,
      type_procedure: "appel_offres_ouvert_fournitures_services_etat",
    });

    expect(result.observedDays).toBe(24);
    expect(result.minimumDays).toBe(21);
    expect(result.triggered).toBe(false);
    expect(result.indicators).toEqual([]);
  });

  it("déclenche une alerte lorsque le délai est inférieur au minimum applicable", () => {
    const result = detectPublicationDelay({
      date_publication: "2026-01-01",
      date_limite_depot: "2026-01-31",
      montant_estime: 2_500_000,
      type_procedure: "appel_offres_ouvert_fournitures_services_etat",
    });

    expect(result.observedDays).toBe(30);
    expect(result.minimumDays).toBe(40);
    expect(result.triggered).toBe(true);
    expect(result.level).toBe("Élevé");
    expect(result.gap).toContain("10 jours");
    expect(result.indicators).toEqual(["insufficient-publication-delay"]);
  });

  it("ne déclenche pas d'alerte lorsque le délai observé est exactement égal au seuil", () => {
    const result = detectPublicationDelay({
      date_publication: "2026-01-01",
      date_limite_depot: "2026-02-10",
      montant_estime: 80_000_000,
      type_procedure: "appel_offres_ouvert_travaux",
    });

    expect(result.observedDays).toBe(40);
    expect(result.minimumDays).toBe(40);
    expect(result.triggered).toBe(false);
  });
});
