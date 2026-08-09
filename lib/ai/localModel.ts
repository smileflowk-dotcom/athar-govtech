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

export class OllamaLocalModelClient implements LocalModelClient {
  readonly baseUrl: string;
  readonly model: string;

  constructor(options?: { baseUrl?: string; model?: string }) {
    this.baseUrl = normalizeBaseUrl(
      options?.baseUrl ?? process.env.ATHAR_LOCAL_MODEL_URL ?? DEFAULT_BASE_URL,
    );
    this.model =
      options?.model ?? process.env.ATHAR_LOCAL_MODEL ?? DEFAULT_MODEL;
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
        messages: [
          ...(input.system
            ? [{ role: "system", content: input.system }]
            : []),
          { role: "user", content: input.prompt },
        ],
        options: {
          temperature: 0,
          num_ctx: 4096,
          // Contrainte PoC : exécution CPU uniquement, même si une machine dispose d'un GPU.
          num_gpu: 0,
        },
      }),
      signal: AbortSignal.timeout(120_000),
    }).catch((error) => {
      throw new LocalModelError(
        `Runtime IA local indisponible : ${error instanceof Error ? error.message : String(error)}`,
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
