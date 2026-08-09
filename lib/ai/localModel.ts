export type JsonSchema = Record<string, unknown>;

export type LocalModelCompletion = {
  json: unknown;
  raw: string;
  model: string;
  provider: "ollama-local" | "test-double";
};

export interface LocalModelClient {
  completeJson(input: {
    prompt: string;
    schema: JsonSchema;
    system?: string;
  }): Promise<LocalModelCompletion>;
}

export class LocalModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalModelError";
  }
}

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen2.5:1.5b-instruct-q4_K_M";
const DEFAULT_TIMEOUT_MS = 300_000;
const ALLOWED_LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "ollama",
  "host.docker.internal",
]);

function normalizeBaseUrl(rawValue: string): string {
  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    throw new LocalModelError("ATHAR_LOCAL_MODEL_URL n'est pas une URL valide.");
  }

  if (url.protocol !== "http:") {
    throw new LocalModelError(
      "Le runtime IA ATHAR doit utiliser une URL HTTP locale, jamais une API cloud externe.",
    );
  }

  if (!ALLOWED_LOCAL_HOSTS.has(url.hostname)) {
    throw new LocalModelError(
      `Hôte IA refusé (${url.hostname}) : seuls localhost, Ollama interne ou host.docker.internal sont autorisés pour ce PoC.`,
    );
  }

  return url.toString().replace(/\/$/, "");
}

function resolveTimeoutMs(rawValue: string | undefined): number {
  if (!rawValue) return DEFAULT_TIMEOUT_MS;
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 30_000 || parsed > 900_000) {
    throw new LocalModelError(
      "ATHAR_LOCAL_MODEL_TIMEOUT_MS doit être compris entre 30000 et 900000 ms.",
    );
  }
  return Math.round(parsed);
}

export class OllamaLocalModelClient implements LocalModelClient {
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;

  constructor(options?: { baseUrl?: string; model?: string; timeoutMs?: number }) {
    this.baseUrl = normalizeBaseUrl(
      options?.baseUrl ?? process.env.ATHAR_LOCAL_MODEL_URL ?? DEFAULT_BASE_URL,
    );
    this.model = options?.model ?? process.env.ATHAR_LOCAL_MODEL ?? DEFAULT_MODEL;
    this.timeoutMs =
      options?.timeoutMs ?? resolveTimeoutMs(process.env.ATHAR_LOCAL_MODEL_TIMEOUT_MS);
  }

  async completeJson(input: {
    prompt: string;
    schema: JsonSchema;
    system?: string;
  }): Promise<LocalModelCompletion> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        format: input.schema,
        keep_alive: "10m",
        messages: [
          ...(input.system ? [{ role: "system", content: input.system }] : []),
          { role: "user", content: input.prompt },
        ],
        options: {
          temperature: 0,
          // Budget volontairement compact pour le PoC CPU : les extraits transmis sont
          // ciblés (grille/PV), pas des documents complets.
          num_ctx: 2048,
          num_predict: 512,
          // Contrainte PoC : exécution CPU uniquement, même si une machine dispose d'un GPU.
          num_gpu: 0,
        },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    }).catch((error) => {
      const details = error instanceof Error ? error.message : String(error);
      const timedOut = /timeout|aborted/i.test(details);
      throw new LocalModelError(
        timedOut
          ? `Le modèle local n'a pas répondu dans le délai de ${Math.round(this.timeoutMs / 1000)} s. Sur CPU, le premier chargement peut être lent ; vérifier Ollama puis relancer.`
          : `Runtime IA local indisponible : ${details}`,
      );
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new LocalModelError(
        `Ollama local a répondu ${response.status}${body ? ` : ${body.slice(0, 300)}` : ""}`,
      );
    }

    const payload = (await response.json()) as {
      model?: string;
      message?: { content?: string };
    };
    const raw = payload.message?.content?.trim();

    if (!raw) {
      throw new LocalModelError("Le modèle local n'a retourné aucun contenu exploitable.");
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new LocalModelError(
        "Le modèle local n'a pas respecté le format JSON structuré attendu.",
      );
    }

    return {
      json,
      raw,
      model: payload.model ?? this.model,
      provider: "ollama-local",
    };
  }
}
