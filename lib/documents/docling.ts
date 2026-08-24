import type { ExtractedPage } from "./router";

type DoclingProv = { page_no?: number };
type DoclingTextItem = {
  text?: string;
  orig?: string;
  prov?: DoclingProv[];
};
type DoclingTableCell = { text?: string };
type DoclingTableItem = {
  prov?: DoclingProv[];
  data?: { table_cells?: DoclingTableCell[] };
};
type DoclingJson = {
  texts?: DoclingTextItem[];
  tables?: DoclingTableItem[];
  pages?: Record<string, { page_no?: number }>;
};
type DoclingResponse = {
  status?: string;
  document?: { json_content?: DoclingJson };
  errors?: unknown[];
};

export function doclingEnabled() {
  return Boolean(process.env.ATHAR_DOCLING_URL);
}

function firstPageNo(prov?: DoclingProv[]) {
  const pageNo = prov?.find((item) => Number.isInteger(item.page_no))?.page_no;
  return typeof pageNo === "number" && pageNo > 0 ? pageNo : 1;
}

function pagesFromDoclingJson(document: DoclingJson): ExtractedPage[] {
  const chunks = new Map<number, string[]>();

  for (const item of document.texts ?? []) {
    const text = (item.text ?? item.orig ?? "").trim();
    if (!text) continue;
    const page = firstPageNo(item.prov);
    const current = chunks.get(page) ?? [];
    current.push(text);
    chunks.set(page, current);
  }

  for (const table of document.tables ?? []) {
    const cells = (table.data?.table_cells ?? [])
      .map((cell) => cell.text?.trim())
      .filter((value): value is string => Boolean(value));
    if (cells.length === 0) continue;

    const page = firstPageNo(table.prov);
    const current = chunks.get(page) ?? [];
    current.push(`[TABLE]\n| ${cells.join(" | ")} |`);
    chunks.set(page, current);
  }

  return [...chunks.entries()]
    .sort(([a], [b]) => a - b)
    .map(([page, values]) => ({ page, text: values.join("\n\n").trim() }));
}

export async function extractWithDocling(file: File): Promise<ExtractedPage[]> {
  const baseUrl = process.env.ATHAR_DOCLING_URL?.replace(/\/$/, "");
  if (!baseUrl) throw new Error("Docling is not configured.");

  const form = new FormData();
  form.append("files", file, file.name);
  form.append("from_formats", "pdf");
  form.append("to_formats", "json");
  form.append("do_ocr", "true");
  form.append("force_ocr", process.env.ATHAR_DOCLING_FORCE_OCR === "true" ? "true" : "false");
  form.append("table_mode", "accurate");
  form.append("image_export_mode", "placeholder");

  const ocrLang = process.env.ATHAR_DOCLING_OCR_LANG?.trim();
  if (ocrLang) form.append("ocr_lang", ocrLang);

  const response = await fetch(`${baseUrl}/v1/convert/file`, {
    method: "POST",
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new Error(`Docling request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as DoclingResponse;
  if (payload.status !== "success" && payload.status !== "partial_success") {
    throw new Error("Docling did not return a successful conversion.");
  }

  const json = payload.document?.json_content;
  if (!json) throw new Error("Docling returned no JSON document.");

  const pages = pagesFromDoclingJson(json);
  if (pages.length === 0) throw new Error("Docling returned no usable page text.");
  return pages;
}
