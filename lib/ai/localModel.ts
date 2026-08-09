export type JsonSchema = Record<string, unknown>;

export type LocalModelMetrics = {
  total_duration_ns?: number;
  load_duration_ns?: number;
  prompt_eval_count?: number;
  prompt_eval_duration_ns?: number;
  eval_count?: number;
  eval_duration_ns?: number;
};

export type LocalModelCompletion = {
  json: unknown;
  raw: string;
  model: string;
  provider: "ollama-local" | "test-double";
  metrics?: LocalModelMetrics;
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
    // Sur CPU lent, le coût principal observé est l'évaluation du prompt. Le PoC utilise
    // /api/generate avec un prompt unique et compact plutôt que le gabarit conversationnel.
    const prompt = input.system
      ? `${input.system.trim()}\n${input.prompt.trim()}`
      : input.prompt.trim();

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        format: input.schema,
        keep_alive: "30m",
        options: {
          temperature: 0,
          // Tranche ciblée : extraits grille/PV courts, pas documents complets.
          num_ctx: 1024,
          num_predict: 192,
          // Contrainte PoC : exécution CPU uniquement, même si un GPU est disponible.
          num_gpu: 0,
        },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    }).catch((error) => {
      const details = error instanceof Error ? error.message : String(error);
      const timedOut = /timeout|aborted/i.test(details);
      throw new LocalModelError(
        timedOut
          ? `Le modèle local n'a pas répondu dans le délai de ${Math.round(this.timeoutMs / 1000)} s. Le PoC est configuré pour CPU ; vérifier la taille du prompt et les métriques Ollama.`
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
      response?: string;
      total_duration?: number;
      load_duration?: number;
      prompt_eval_count?: number;
      prompt_eval_duration?: number;
      eval_count?: number;
      eval_duration?: number;
    };
    const raw = payload.response?.trim();

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
      metrics: {
        total_duration_ns: payload.total_duration,
        load_duration_ns: payload.load_duration,
        prompt_eval_count: payload.prompt_eval_count,
        prompt_eval_duration_ns: payload.prompt_eval_duration,
        eval_count: payload.eval_count,
        eval_duration_ns: payload.eval_duration,
      },
    };
  }
}
