import { NextResponse } from "next/server";
import {
  readPersistedState,
  writePersistedState,
  type PersistedAtharState,
} from "../../../lib/persistence/localState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await readPersistedState();
    return NextResponse.json({ state });
  } catch (error) {
    console.error("ATHAR state read failed", error);
    return NextResponse.json(
      { error: "Le stockage local SQLite n'est pas disponible." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const state = (await request.json()) as PersistedAtharState;
    if (!state || !Array.isArray(state.dossiers)) {
      return NextResponse.json(
        { error: "État ATHAR invalide : dossiers doit être une liste." },
        { status: 400 },
      );
    }

    await writePersistedState(state);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("ATHAR state write failed", error);
    return NextResponse.json(
      { error: "ATHAR n'a pas pu enregistrer l'état local." },
      { status: 500 },
    );
  }
}
