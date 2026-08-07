import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE = 25 * 1024 * 1024;

type ExtractedPage = {
  page: number;
  text: string;
};

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

    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    const loadingTask = getDocument({ data: bytes, useSystemFonts: true });
    const pdf = await loadingTask.promise;
    const pages: ExtractedPage[] = [];

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

    await pdf.destroy();

    return NextResponse.json({
      filename: uploaded.name,
      totalPages: pages.length,
      pages,
      processing: "local-server",
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
