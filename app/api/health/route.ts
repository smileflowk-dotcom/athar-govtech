import { NextResponse } from "next/server";
import { persistenceHealth } from "../../../lib/persistence/localState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const persistence = await persistenceHealth();
    return NextResponse.json({
      status: "ok",
      mode: "local-onpremise-poc",
      externalApiRequired: false,
      persistence,
    });
  } catch (error) {
    console.error("ATHAR health check failed", error);
    return NextResponse.json(
      { status: "degraded", persistence: "unavailable" },
      { status: 503 },
    );
  }
}
