import type { RestrictiveClauseResult } from "./restrictiveClause";

export type CommissionMemberProbity = {
  name: string;
  declaration_probite_presente: boolean;
};

export type ProbityDeclarationIndicator = "missing-probity-declaration";

export type ProbityDeclarationResult = Omit<RestrictiveClauseResult, "indicators"> & {
  indicators: ProbityDeclarationIndicator[];
  memberName: string;
  ruleReference: string;
  expected: string;
  observed: string;
};

export const PROBITY_DECLARATION_RULE = {
  ruleReference:
    "Cadre de contrôle CDC/CRC — obligations de probité des membres de commission (Déclarations d’Obligation de Probité) [à paramétrer avec le guide d’audit CDC].",
  expected: "Déclaration de probité présente pour chaque membre de la commission.",
} as const;

/**
 * Contrôle volontairement limité à une absence déclarative documentaire.
 *
 * Il NE conclut PAS à l'existence d'un conflit d'intérêts, d'un manquement de probité
 * ou d'une irrégularité. Il signale uniquement qu'une déclaration attendue n'est pas
 * présente / retrouvée dans les pièces fournies au contrôle.
 *
 * Hors périmètre du PoC : aucun croisement d'identité entre les membres de commission,
 * les soumissionnaires, attributaires, dirigeants, bénéficiaires effectifs ou autres tiers.
 */
export function detectProbityDeclarationSignals(
  members: CommissionMemberProbity[],
  sourceReference = "Liste des membres de la commission d'appel d'offres",
): ProbityDeclarationResult[] {
  return members
    .filter((member) => !member.declaration_probite_presente)
    .map((member) => {
      const observed = `${member.name} — déclaration de probité : absente ou non retrouvée dans les pièces examinées.`;

      return {
        triggered: true,
        level: "Élevé",
        indicators: ["missing-probity-declaration"],
        memberName: member.name,
        ruleReference: PROBITY_DECLARATION_RULE.ruleReference,
        expected: PROBITY_DECLARATION_RULE.expected,
        observed,
        evidence: `${sourceReference} — membre : ${member.name} — statut déclaratif manquant.`,
        explanation:
          `${observed} Ce signal porte uniquement sur l'absence documentaire de la déclaration ; ` +
          "il ne permet pas de conclure à un conflit d'intérêts réel ni à un manquement de probité.",
        recommendation:
          "Vérifier la complétude du dossier et rechercher ou demander la déclaration de probité correspondante avant toute conclusion humaine.",
      };
    });
}
