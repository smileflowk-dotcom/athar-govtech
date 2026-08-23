export type GeminiEvidencePage = {
  page: number;
  text: string;
};

export type GeminiAssistInput = {
  control:
    | "publication-delay"
    | "restrictive-clause"
    | "ranking-attribution"
    | "probity";
  pages: GeminiEvidencePage[];
};

export type GeminiAssistResult = {
  summary: string;
  candidateFindings: Array<{
    page: number | null;
    evidence: string;
    reason: string;
    confidence: "low" | "medium" | "high";
  }>;
  limitations: string[];
};

const DEFAULT_MODEL = process.env.ATHAR_GEMINI_MODEL || "gemini-3.7-flash";
const MAX_TEXT_CHARS = 120_000;

export function geminiEnabled() {
  return process.env.ATHAR_GEMINI_ENABLED === "true";
}

function buildPrompt(input: GeminiAssistInput) {
  const text = input.pages
    .map((page) => `--- PAGE ${page.page} ---\n${page.text}`)
    .join("\n\n")
    .slice(0, MAX_TEXT_CHARS);

  return `You are an evidence-assistance component inside ATHAR, a public-procurement control tool.\n\nYour role is strictly limited to identifying candidate passages for human review. Do not conclude that a procurement is illegal, fraudulent, irregular, compliant, or non-compliant. Do not replace ATHAR deterministic controls.\n\nControl under review: ${input.control}\n\nReturn ONLY valid JSON with this exact shape:\n{\n  "summary": "short factual summary",\n  "candidateFindings": [\n    {\n      "page": 1,\n      "evidence": "short verbatim passage from the supplied text",\n      "reason": "why this passage may matter for this control",\n      "confidence": "low|medium|high"\n    }\n  ],\n  "limitations": ["what cannot be established from the supplied text"]\n}\n\nRules:\n- Cite only passages present in the supplied text.\n- Keep evidence short.\n- If nothing useful is found, return an empty candidateFindings array.\n- Treat the result as a lead for human validation, never as a legal conclusion.\n\nDOCUMENT TEXT:\n${text}`;
}

export async function assistWithGemini(
  input: GeminiAssistInput,
): Promise<GeminiAssistResult> {
  if (!geminiEnabled()) {
    throw new Error("Gemini is disabled in ATHAR configuration.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error("Gemini returned no usable output.");
  }

  return JSON.parse(raw) as GeminiAssistResult;
}
