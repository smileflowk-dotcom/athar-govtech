import { NextResponse } from "next/server";
import {
  assistWithGemini,
  geminiEnabled,
  type GeminiAssistInput,
} from "../../../../../lib/ai/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CONTROLS = new Set<GeminiAssistInput["control"]>([
  "publication-delay",
  "restrictive-clause",
  "ranking-attribution",
  "probity",
]);

export async function POST(request: Request) {
  if (!geminiEnabled()) {
    return NextResponse.json(
      {
        error: "L’assistance Gemini est désactivée. ATHAR reste en traitement local.",
        externalApiUsed: false,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as GeminiAssistInput & {
      confirmExternalProcessing?: boolean;
    };

    if (body.confirmExternalProcessing !== true) {
      return NextResponse.json(
        {
          error:
            "Confirmation explicite requise avant l’envoi de texte vers une API externe.",
          externalApiUsed: false,
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_CONTROLS.has(body.control)) {
      return NextResponse.json(
        { error: "Contrôle ATHAR non pris en charge par l’assistance Gemini." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.pages) || body.pages.length === 0) {
      return NextResponse.json(
        { error: "Aucun texte de page fourni à l’assistance Gemini." },
        { status: 400 },
      );
    }

    const pages = body.pages
      .filter(
        (page) =>
          Number.isInteger(page?.page) &&
          page.page > 0 &&
          typeof page.text === "string" &&
          page.text.trim().length > 0,
      )
      .map((page) => ({ page: page.page, text: page.text.trim() }));

    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Le texte fourni est vide ou invalide." },
        { status: 400 },
      );
    }

    const result = await assistWithGemini({
      control: body.control,
      pages,
    });

    return NextResponse.json({
      provider: "gemini",
      role: "evidence-assistance-only",
      requiresHumanValidation: true,
      externalApiUsed: true,
      result,
    });
  } catch (error) {
    console.error("ATHAR Gemini assistance failed", error);
    return NextResponse.json(
      {
        error: "L’assistance Gemini n’a pas pu produire de résultat exploitable.",
        externalApiUsed: true,
      },
      { status: 502 },
    );
  }
}
