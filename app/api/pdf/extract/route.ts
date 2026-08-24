import { NextResponse } from "next/server";
import { doclingEnabled, extractWithDocling } from "../../../../lib/documents/docling";
import {
  assessExtractionQuality,
  shouldUseEnhancedExtraction,
  type ExtractedPage,
} from "../../../../lib/documents/router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE = 25 * 1024 * 1024;

async function extractNativePdf(bytes: Uint8Array): Promise<ExtractedPage[]> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({ data: bytes, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const pages: ExtractedPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let text = "";

      for (const item of content.items) {
        if (!("str" in item)) continue;
        text += item.str;
        text += item.hasEOL ? "\n" : " ";
      }

      pages.push({
        page: pageNumber,
        text: text
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .replace(/[ \t]{2,}/g, " ")
          .trim(),
      });
    }
  } finally {
    await pdf.destroy();
  }

  return pages;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier PDF reçu." }, { status: 400 });
    }

    if (uploaded.type !== "application/pdf") {
      return NextResponse.json({ error: "Le fichier doit être un PDF." }, { status: 400 });
    }

    if (uploaded.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "Le PDF dépasse la limite de 25 Mo du démonstrateur." },
        { status: 413 },
      );
    }

    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    const nativePages = await extractNativePdf(bytes);
    const nativeQuality = assessExtractionQuality(nativePages);

    if (!shouldUseEnhancedExtraction(nativeQuality)) {
      return NextResponse.json({
        filename: uploaded.name,
        totalPages: nativePages.length,
        pages: nativePages,
        processing: "local-native-pdf",
        extractionEngine: "pdfjs-dist",
        extractionQuality: nativeQuality,
        enhancedExtractionAvailable: doclingEnabled(),
        externalApiUsed: false,
      });
    }

    if (doclingEnabled()) {
      try {
        const enhancedFile = new File([bytes], uploaded.name, { type: "application/pdf" });
        const enhancedPages = await extractWithDocling(enhancedFile);
        const enhancedQuality = assessExtractionQuality(enhancedPages);

        return NextResponse.json({
          filename: uploaded.name,
          totalPages: enhancedPages.length,
          pages: enhancedPages,
          processing: "local-enhanced-document",
          extractionEngine: "docling-ocr",
          extractionQuality: enhancedQuality,
          nativeExtractionQuality: nativeQuality,
          enhancedExtractionAvailable: true,
          externalApiUsed: false,
        });
      } catch (error) {
        console.error("ATHAR enhanced document extraction failed; native result retained", error);
      }
    }

    return NextResponse.json({
      filename: uploaded.name,
      totalPages: nativePages.length,
      pages: nativePages,
      processing: "local-native-pdf-degraded",
      extractionEngine: "pdfjs-dist",
      extractionQuality: nativeQuality,
      enhancedExtractionAvailable: doclingEnabled(),
      enhancedExtractionRecommended: true,
      externalApiUsed: false,
    });
  } catch (error) {
    console.error("ATHAR PDF extraction failed", error);
    return NextResponse.json(
      { error: "ATHAR n’a pas pu extraire le texte de ce PDF." },
      { status: 500 },
    );
  }
}
