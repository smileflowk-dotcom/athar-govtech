export type ExtractedPage = {
  page: number;
  text: string;
};

export type ExtractionQuality = {
  status: "good" | "degraded";
  score: number;
  totalCharacters: number;
  readablePages: number;
  totalPages: number;
  reasons: string[];
};

const MIN_PAGE_CHARS = 80;
const MIN_DOCUMENT_CHARS = 200;
const MIN_READABLE_PAGE_RATIO = 0.7;

export function assessExtractionQuality(pages: ExtractedPage[]): ExtractionQuality {
  const cleaned = pages.map((page) => page.text.trim());
  const totalCharacters = cleaned.reduce((sum, text) => sum + text.length, 0);
  const readablePages = cleaned.filter((text) => text.length >= MIN_PAGE_CHARS).length;
  const totalPages = pages.length;
  const readableRatio = totalPages === 0 ? 0 : readablePages / totalPages;
  const replacementCharacters = cleaned.reduce(
    (sum, text) => sum + (text.match(/�/g)?.length ?? 0),
    0,
  );
  const replacementRatio = totalCharacters === 0 ? 1 : replacementCharacters / totalCharacters;

  const reasons: string[] = [];
  if (totalCharacters < MIN_DOCUMENT_CHARS) reasons.push("very-low-text-volume");
  if (readableRatio < MIN_READABLE_PAGE_RATIO) reasons.push("many-low-text-pages");
  if (replacementRatio > 0.01) reasons.push("text-decoding-noise");

  const volumeScore = Math.min(1, totalCharacters / Math.max(MIN_DOCUMENT_CHARS, totalPages * MIN_PAGE_CHARS));
  const ratioScore = Math.min(1, readableRatio / MIN_READABLE_PAGE_RATIO);
  const noiseScore = Math.max(0, 1 - replacementRatio * 20);
  const score = Math.round(((volumeScore + ratioScore + noiseScore) / 3) * 100);

  return {
    status: reasons.length === 0 ? "good" : "degraded",
    score,
    totalCharacters,
    readablePages,
    totalPages,
    reasons,
  };
}

export function shouldUseEnhancedExtraction(quality: ExtractionQuality) {
  return quality.status === "degraded";
}
