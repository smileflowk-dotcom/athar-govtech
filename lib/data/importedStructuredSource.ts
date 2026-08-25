import {
  detectPublicationDelay,
  type PublicationDelayInput,
  type PublicationProcedureType,
} from "../controls/publicationDelay";
import type { Dossier, ProcurementAlert } from "./demoDossiers";

const PROCEDURE_TYPES: PublicationProcedureType[] = [
  "appel_offres_simplifie_ouvert",
  "appel_offres_ouvert_travaux",
  "appel_offres_ouvert_fournitures_services_etat",
  "appel_offres_ouvert_fournitures_services_collectivite",
  "appel_offres_ouvert_fournitures_services_etablissement_public",
];

function cleanFilename(filename: string) {
  return filename.replace(/\.(json|csv)$/i, "");
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
      continue;
    }

    value += char;
  }

  values.push(value.trim());
  return values;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error("Le CSV doit contenir un en-tête et au moins une ligne de données.");

  const delimiter = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function parseStructuredSource(filename: string, text: string): Record<string, unknown>[] {
  if (/\.json$/i.test(filename)) {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item));
    if (parsed && typeof parsed === "object") {
      const object = parsed as Record<string, unknown>;
      const records = object.records;
      if (Array.isArray(records)) {
        return records.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item));
      }
      return [object];
    }
    throw new Error("Le JSON doit contenir un objet ou une liste d’objets.");
  }

  if (/\.csv$/i.test(filename)) return parseCsv(text);
  throw new Error("Format structuré non pris en charge. Utilisez JSON ou CSV.");
}

function requiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Champ structuré manquant : ${key}.`);
  return value.trim();
}

function publicationInput(record: Record<string, unknown>): PublicationDelayInput {
  const procedure = requiredString(record, "type_procedure") as PublicationProcedureType;
  if (!PROCEDURE_TYPES.includes(procedure)) {
    throw new Error("type_procedure n’est pas reconnu par le contrôle de délai du PoC.");
  }

  const amount = Number(record.montant_estime);
  if (!Number.isFinite(amount)) throw new Error("Champ structuré invalide : montant_estime.");

  return {
    date_publication: requiredString(record, "date_publication"),
    date_limite_depot: requiredString(record, "date_limite_depot"),
    montant_estime: amount,
    type_procedure: procedure,
  };
}

function displayProcedure(value: string) {
  return value.replaceAll("_", " ");
}

export function buildStructuredDossier(filename: string, text: string): Dossier {
  const records = parseStructuredSource(filename, text);
  if (records.length === 0) throw new Error("Aucun enregistrement exploitable trouvé dans la source structurée.");
  if (records.length > 1) {
    throw new Error("Le démonstrateur attend un marché par fichier structuré. Séparez les enregistrements avant import.");
  }

  const record = records[0];
  const input = publicationInput(record);
  const result = detectPublicationDelay(input);
  const importId = `structured-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const evidenceExcerpt = [
    `date_publication=${input.date_publication}`,
    `date_limite_depot=${input.date_limite_depot}`,
    `montant_estime=${input.montant_estime}`,
    `type_procedure=${input.type_procedure}`,
  ].join(" · ");

  const alerts: ProcurementAlert[] = result.triggered ? [{
    id: `${importId}-publication-delay`,
    type: "Délai de publication potentiellement insuffisant",
    level: result.level,
    rule: result.ruleReference,
    expected: result.expected,
    observed: `${result.observed} ${result.gap}`,
    evidence: `${filename} — donnée structurée — ${result.evidence}`,
    action: result.recommendation,
    page: 1,
    highlight: evidenceExcerpt,
    status: "pending",
    indicators: result.indicators,
    generatedByControl: true,
    controlId: "CTRL-DEL-01",
    controlVersion: "1.0",
    gap: result.gap,
    impact: "Le délai laissé aux opérateurs peut réduire leur capacité à préparer une offre.",
    evidenceState: "retrieved",
    evidenceItems: [{
      id: `${importId}-structured-source`,
      source: filename,
      location: "Enregistrement structuré · calendrier de consultation",
      excerpt: evidenceExcerpt,
      role: "observé",
      state: "retrieved",
    }],
  }] : [];

  const reference = typeof record.reference_marche === "string" && record.reference_marche.trim()
    ? record.reference_marche.trim()
    : cleanFilename(filename);
  const buyer = typeof record.acheteur === "string" && record.acheteur.trim()
    ? record.acheteur.trim()
    : "Non renseigné";

  return {
    id: importId,
    title: reference,
    score: alerts.length ? 80 : 12,
    excerpt: evidenceExcerpt,
    alerts,
    sourceLabel: `${filename} — données structurées locales`,
    totalPages: 1,
    activePage: 1,
    realDocument: true,
    buyer,
    procedure: displayProcedure(input.type_procedure),
    deadline: input.date_limite_depot,
    documentCount: 1,
  };
}
