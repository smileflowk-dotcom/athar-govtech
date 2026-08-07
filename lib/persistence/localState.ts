import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_STATE_BYTES = 10 * 1024 * 1024;

export type PersistedAtharState = {
  dossiers: unknown[];
  activeDossierId?: string | null;
  activeAlertId?: string | null;
};

function dataDirectory() {
  return process.env.ATHAR_DATA_DIR || path.join(process.cwd(), ".athar-data");
}

function databasePath() {
  return path.join(dataDirectory(), "athar.sqlite3");
}

async function runSql(sql: string) {
  await mkdir(dataDirectory(), { recursive: true });
  const { stdout } = await execFileAsync("sqlite3", ["-batch", databasePath(), sql], {
    maxBuffer: MAX_STATE_BYTES * 2,
  });
  return stdout.trim();
}

async function ensureSchema() {
  await runSql(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS athar_state (
      id TEXT PRIMARY KEY,
      payload_base64 TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function readPersistedState(): Promise<PersistedAtharState | null> {
  await ensureSchema();
  const payloadBase64 = await runSql(
    "SELECT payload_base64 FROM athar_state WHERE id = 'current' LIMIT 1;",
  );

  if (!payloadBase64) return null;

  const json = Buffer.from(payloadBase64, "base64").toString("utf8");
  return JSON.parse(json) as PersistedAtharState;
}

export async function writePersistedState(state: PersistedAtharState) {
  const json = JSON.stringify(state);
  const size = Buffer.byteLength(json, "utf8");
  if (size > MAX_STATE_BYTES) {
    throw new Error("État ATHAR trop volumineux pour le stockage local du PoC.");
  }

  const payloadBase64 = Buffer.from(json, "utf8").toString("base64");
  await ensureSchema();
  await runSql(`
    INSERT INTO athar_state (id, payload_base64, updated_at)
    VALUES ('current', '${payloadBase64}', CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      payload_base64 = excluded.payload_base64,
      updated_at = CURRENT_TIMESTAMP;
  `);
}

export async function persistenceHealth() {
  await ensureSchema();
  return {
    database: databasePath(),
    backend: "sqlite3-local",
  } as const;
}
