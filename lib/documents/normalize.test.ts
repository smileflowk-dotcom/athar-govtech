import { describe, expect, it } from "vitest";
import { detectPageScript, normalizeExtractedPages } from "./normalize";

describe("CDC page normalization", () => {
  it("detects Arabic text", () => {
    expect(detectPageScript("إعلان طلب عروض عمومي خاص بالأشغال والخدمات")).toBe("arabic");
  });

  it("detects Latin/French text", () => {
    expect(detectPageScript("Règlement de consultation et critères d'évaluation des offres")).toBe("latin");
  });

  it("detects mixed bilingual text", () => {
    expect(detectPageScript("Marché public طلب عروض commission évaluation لجنة فتح الأظرفة")).toBe("mixed");
  });

  it("preserves table markers for downstream evidence extraction", () => {
    const [page] = normalizeExtractedPages([
      { page: 3, text: "Résultat\n\n[TABLE]\n| Société A | 92 | Attributaire |" },
    ]);

    expect(page.hasTableContent).toBe(true);
    expect(page.page).toBe(3);
    expect(page.characterCount).toBeGreaterThan(0);
  });
});
