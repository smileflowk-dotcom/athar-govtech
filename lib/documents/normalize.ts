import type { ExtractedPage } from "./router";

export type PageScript = "arabic" | "latin" | "mixed" | "unknown";

export type NormalizedPage = ExtractedPage & {
  script: PageScript;
  hasTableContent: boolean;
  characterCount: number;
};

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const LATIN_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]/g;

export function detectPageScript(text: string): PageScript {
  const arabic = text.match(ARABIC_RE)?.length ?? 0;
  const latin = text.match(LATIN_RE)?.length ?? 0;
  const letters = arabic + latin;

  if (letters < 8) return "unknown";
  const arabicRatio = arabic / letters;
  const latinRatio = latin / letters;

  if (arabicRatio >= 0.7) return "arabic";
  if (latinRatio >= 0.7) return "latin";
  return "mixed";
}

export function normalizeExtractedPages(pages: ExtractedPage[]): NormalizedPage[] {
  return pages.map((page) => {
    const text = page.text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    return {
      ...page,
      text,
      script: detectPageScript(text),
      hasTableContent: /\[TABLE\]|\|[^\n]+\|/.test(text),
      characterCount: text.length,
    };
  });
}

export function summarizeDocumentScripts(pages: NormalizedPage[]) {
  const counts = { arabic: 0, latin: 0, mixed: 0, unknown: 0 };
  for (const page of pages) counts[page.script] += 1;
  return counts;
}
