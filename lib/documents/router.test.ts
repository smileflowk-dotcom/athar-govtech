import { describe, expect, it } from "vitest";
import { assessExtractionQuality, shouldUseEnhancedExtraction } from "./router";

describe("document extraction router", () => {
  it("keeps a readable native PDF on the fast path", () => {
    const quality = assessExtractionQuality([
      { page: 1, text: "A".repeat(220) },
      { page: 2, text: "B".repeat(180) },
    ]);

    expect(quality.status).toBe("good");
    expect(shouldUseEnhancedExtraction(quality)).toBe(false);
  });

  it("routes scan-like low-text PDFs to enhanced extraction", () => {
    const quality = assessExtractionQuality([
      { page: 1, text: "" },
      { page: 2, text: "12" },
      { page: 3, text: "" },
    ]);

    expect(quality.status).toBe("degraded");
    expect(quality.reasons).toContain("very-low-text-volume");
    expect(quality.reasons).toContain("many-low-text-pages");
    expect(shouldUseEnhancedExtraction(quality)).toBe(true);
  });

  it("flags decoding noise", () => {
    const quality = assessExtractionQuality([
      { page: 1, text: `${"Texte lisible ".repeat(20)}������������` },
    ]);

    expect(quality.status).toBe("degraded");
    expect(quality.reasons).toContain("text-decoding-noise");
  });
});
