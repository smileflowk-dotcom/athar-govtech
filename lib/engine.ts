import {
  detectProbityDeclarationSignals,
  type CommissionMemberProbity,
} from "./controls/probityDeclaration";
import {
  detectPublicationDelay,
  type PublicationDelayInput,
} from "./controls/publicationDelay";
import {
  detectRankingAttributionInconsistency,
  type RankingAttributionInput,
} from "./controls/rankingAttribution";
import { detectRestrictiveClause } from "./controls/restrictiveClause";

/**
 * Point d'entrée unique des contrôles ATHAR.
 *
 * Décision améliorée : présenter au contrôleur les signaux comparables d'un
 * même dossier, avec leur règle, leur preuve et leur action proposée.
 *
 * Le moteur est volontairement déterministe et ne déduit jamais une
 * irrégularité. Les données incomplètes sont retournées comme erreurs de
 * traitement, jamais comme alertes métier.
 */

export type AlertStatus = "pending" | "confirmed" | "dismissed" | "requested";
export type AlertLevel = "Élevé" | "Moyen" | "Faible";

export type ControlAlert = {
  id: string;
  control: "restrictive-clause" | "publication-delay" | "probity-declaration" | "ranking-attribution";
  type: string;
  level: AlertLevel;
  rule: string;
  expected: string;
  observed: string;
  evidence: string;
  action: string;
  page?: number;
  highlight: string;
  indicators: string[];
  status: AlertStatus;
  generatedByControl: true;
};

export type ControlProcessingError = {
  control: ControlAlert["control"];
  inputId: string;
  message: string;
};

export type RestrictiveClauseControlInput = {
  id: string;
  text: string;
  page?: number;
  source?: string;
};

export type ProbityControlInput = {
  id: string;
  members: CommissionMemberProbity[];
  sourceReference?: string;
  page?: number;
};

export type PublicationDelayControlInput = PublicationDelayInput & {
  id: string;
  page?: number;
  source?: string;
};

export type RankingAttributionControlInput = RankingAttributionInput & {
  id: string;
  page?: number;
};

export type UnifiedControlInput = {
  restrictiveClauses?: RestrictiveClauseControlInput[];
  publicationDelays?: PublicationDelayControlInput[];
  probityDeclarations?: ProbityControlInput[];
  rankingAttributions?: RankingAttributionControlInput[];
};

export type UnifiedControlResult = {
  alerts: ControlAlert[];
  errors: ControlProcessingError[];
};

export type ProvisionalFinding = {
  id: string;
  title: string;
  rule: string;
  expected: string;
  observed: string;
  evidence: string;
  humanDecision: "confirmed";
  recommendedAction: string;
};

export type ProvisionalFindingSheet = {
  title: "Fiche de constat provisoire";
  dossierId: string;
  dossierTitle: string;
  generatedAt: string;
  warning: "Validation humaine requise — aucune conclusion juridique automatique.";
  findings: ProvisionalFinding[];
};

function addError(
  errors: ControlProcessingError[],
  control: ControlProcessingError["control"],
  inputId: string,
  error: unknown,
): void {
  errors.push({
    control,
    inputId,
    message: error instanceof Error ? error.message : "Erreur de traitement inconnue.",
  });
}

/** Exécute tous les contrôles fournis sans interrompre le reste du dossier en cas d'erreur locale. */
export function runUnifiedControlEngine(input: UnifiedControlInput): UnifiedControlResult {
  const alerts: ControlAlert[] = [];
  const errors: ControlProcessingError[] = [];

  for (const item of input.restrictiveClauses ?? []) {
    try {
      const result = detectRestrictiveClause(item.text);
      if (!result.triggered) continue;

      alerts.push({
        id: `${item.id}-restrictive-clause`,
        control: "restrictive-clause",
        type: "Clause potentiellement restrictive",
        level: result.level,
        rule: "Principe d’accès équitable à la commande publique",
        expected: "Une exigence technique doit rester objective, proportionnée et ouverte aux solutions équivalentes.",
        observed: result.explanation,
        evidence: item.source ?? `Extrait analysé${item.page ? ` — page ${item.page}` : ""}`,
        action: result.recommendation,
        page: item.page,
        highlight: result.evidence,
        indicators: result.indicators,
        status: "pending",
        generatedByControl: true,
      });
    } catch (error) {
      addError(errors, "restrictive-clause", item.id, error);
    }
  }

  for (const item of input.publicationDelays ?? []) {
    try {
      const result = detectPublicationDelay(item);
      if (!result.triggered) continue;

      alerts.push({
        id: `${item.id}-publication-delay`,
        control: "publication-delay",
        type: "Délai de publication potentiellement insuffisant",
        level: result.level,
        rule: result.ruleReference,
        expected: result.expected,
        observed: `${result.observed} ${result.gap}`,
        evidence: item.source ?? result.evidence,
        action: result.recommendation,
        page: item.page,
        highlight: result.evidence,
        indicators: result.indicators,
        status: "pending",
        generatedByControl: true,
      });
    } catch (error) {
      addError(errors, "publication-delay", item.id, error);
    }
  }

  for (const item of input.probityDeclarations ?? []) {
    try {
      const results = detectProbityDeclarationSignals(item.members, item.sourceReference);
      results.forEach((result, index) => {
        alerts.push({
          id: `${item.id}-probity-${index + 1}`,
          control: "probity-declaration",
          type: "Signal simple relatif aux obligations de probité",
          level: result.level,
          rule: result.ruleReference,
          expected: result.expected,
          observed: result.explanation,
          evidence: result.evidence,
          action: result.recommendation,
          page: item.page,
          highlight: `${result.memberName} — déclaration de probité : non retrouvée`,
          indicators: result.indicators,
          status: "pending",
          generatedByControl: true,
        });
      });
    } catch (error) {
      addError(errors, "probity-declaration", item.id, error);
    }
  }

  for (const item of input.rankingAttributions ?? []) {
    try {
      const result = detectRankingAttributionInconsistency(item);
      if (!result.triggered) continue;

      alerts.push({
        id: `${item.id}-ranking-attribution`,
        control: "ranking-attribution",
        type: "Incohérence entre notation, classement et attribution",
        level: result.level,
        rule: result.ruleReference,
        expected: result.expected,
        observed: `${result.observed} ${result.gap}`,
        evidence: result.evidence,
        action: result.recommendation,
        page: item.page,
        highlight: result.observed,
        indicators: result.indicators,
        status: "pending",
        generatedByControl: true,
      });
    } catch (error) {
      addError(errors, "ranking-attribution", item.id, error);
    }
  }

  return { alerts, errors };
}

/**
 * Construit le livrable provisoire à partir des seules alertes explicitement
 * confirmées par un contrôleur. Une alerte calculée, écartée ou en attente ne
 * peut donc jamais être exportée comme constat.
 */
export function generateProvisionalFindingSheet(input: {
  dossierId: string;
  dossierTitle: string;
  alerts: readonly ControlAlert[];
  generatedAt?: string;
}): ProvisionalFindingSheet {
  const confirmedAlerts = input.alerts.filter((alert) => alert.status === "confirmed");

  return {
    title: "Fiche de constat provisoire",
    dossierId: input.dossierId,
    dossierTitle: input.dossierTitle,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    warning: "Validation humaine requise — aucune conclusion juridique automatique.",
    findings: confirmedAlerts.map((alert) => ({
      id: alert.id,
      title: alert.type,
      rule: alert.rule,
      expected: alert.expected,
      observed: alert.observed,
      evidence: alert.evidence,
      humanDecision: "confirmed",
      recommendedAction: alert.action,
    })),
  };
}
