import { NextResponse } from "next/server";
import { analyzeRankingAttributionWithLocalAi } from "../../../../lib/ai/rankingAttributionAi";
import { LocalModelError, OllamaLocalModelClient } from "../../../../lib/ai/localModel";
import type { SourceDocumentText } from "../../../../lib/ai/types";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDocument(value: unknown, field: string): SourceDocumentText {
  if (!isRecord(value)) throw new Error(`${field} doit être un objet.`);

  // Le endpoint accepte directement soit le contrat PoC `document_source + pages`,
  // soit la forme renvoyée par le pipeline PDF existant `filename + pages`.
  const rawDocumentSource = value.document_source ?? value.filename;
  const pages = value.pages;

  if (typeof rawDocumentSource !== "string" || !rawDocumentSource.trim()) {
    throw new Error(`${field}.document_source ou ${field}.filename est obligatoire.`);
  }
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error(`${field}.pages doit contenir au moins une page.`);
  }

  return {
    document_source: rawDocumentSource.trim(),
    pages: pages.map((pageValue, index) => {
      if (!isRecord(pageValue)) {
        throw new Error(`${field}.pages[${index}] doit être un objet.`);
      }
      const page = pageValue.page;
      const text = pageValue.text;
      if (typeof page !== "number" || !Number.isInteger(page) || page < 1) {
        throw new Error(`${field}.pages[${index}].page est invalide.`);
      }
      if (typeof text !== "string" || !text.trim()) {
        throw new Error(`${field}.pages[${index}].text est vide.`);
      }
      return { page, text };
    }),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isRecord(body)) throw new Error("Corps JSON invalide.");

    const grille = parseDocument(body.grille, "grille");
    const pv = parseDocument(body.pv, "pv");
    const client = new OllamaLocalModelClient();

    const analysis = await analyzeRankingAttributionWithLocalAi({
      grille,
      pv,
      client,
    });

    return NextResponse.json({
      ...analysis,
      traceability: {
        extraction: "IA locale — faits candidats avec source, page, passage exact et confiance",
        rapprochement: "IA locale — confirme / contredit / insuffisant avec confiance",
        controle: "Déterministe — logique existante de cohérence notation/classement/attribution",
        decision: "Aucune qualification juridique automatique ; validation humaine requise",
      },
    });
  } catch (error) {
    if (error instanceof LocalModelError) {
      return NextResponse.json(
        { error: error.message, code: "LOCAL_MODEL_UNAVAILABLE" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue.",
        code: "INVALID_AI_POC_INPUT",
      },
      { status: 400 },
    );
  }
}
