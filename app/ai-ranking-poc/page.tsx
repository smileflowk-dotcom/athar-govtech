"use client";

import { useState } from "react";
import type { AiRankingAttributionAnalysis } from "../../lib/ai/rankingAttributionAi";
import type { ExtractedFact, FactReconciliationResult } from "../../lib/ai/types";

type ApiResponse = AiRankingAttributionAnalysis & {
  traceability?: {
    extraction: string;
    rapprochement: string;
    controle: string;
    decision: string;
  };
  error?: string;
};

const DEFAULT_GRID = [
  "Grille finale de notation :",
  "Atlas Services — 92 points",
  "Rif Solutions — 84 points",
  "Sahara Tech — 79 points",
  "Classement : 1. Atlas Services ; 2. Rif Solutions ; 3. Sahara Tech",
].join("\n");

const DEFAULT_PV = [
  "Procès-verbal de la commission.",
  "Après examen des offres, l'attributaire déclaré est Rif Solutions.",
].join("\n");

function confidence(value: number): string {
  return `${Math.round(value * 100)} %`;
}

function FactCard({ fact }: { fact: ExtractedFact }) {
  return (
    <article style={{ border: "1px solid #d9dde5", borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <strong>{fact.type_fait}</strong>
      <div>Valeur : {fact.valeur}{fact.note !== null ? ` — note ${fact.note}` : ""}{fact.rang !== null ? ` — rang ${fact.rang}` : ""}</div>
      <div style={{ fontSize: 13, marginTop: 6 }}>
        <b>IA extraction</b> · confiance {confidence(fact.confidence)} · {fact.document_source} · page {fact.page}
      </div>
      <blockquote style={{ margin: "8px 0 0", paddingLeft: 10, borderLeft: "3px solid #9aa4b2" }}>
        {fact.passage_exact}
      </blockquote>
    </article>
  );
}

function RelationCard({ relation }: { relation: FactReconciliationResult }) {
  return (
    <article style={{ border: "1px solid #d9dde5", borderRadius: 10, padding: 12, marginBottom: 10 }}>
      <strong>IA rapprochement : {relation.relation}</strong>
      <div style={{ fontSize: 13 }}>Confiance : {confidence(relation.confidence)}</div>
      <div>{relation.reason}</div>
    </article>
  );
}

export default function AiRankingPocPage() {
  const [gridText, setGridText] = useState(DEFAULT_GRID);
  const [pvText, setPvText] = useState(DEFAULT_PV);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ai/ranking-attribution", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          grille: {
            document_source: "grille-notation-poc.txt",
            pages: [{ page: 4, text: gridText }],
          },
          pv: {
            document_source: "pv-commission-poc.txt",
            pages: [{ page: 7, text: pvText }],
          },
        }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(payload.error ?? "Analyse IA locale impossible.");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analyse IA locale impossible.");
    } finally {
      setLoading(false);
    }
  }

  const facts = result
    ? [...result.extraction.grille.facts, ...result.extraction.pv.facts]
    : [];

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px", fontFamily: "Arial, sans-serif" }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 0.8 }}>ATHAR · POC IA CIBLÉ</p>
      <h1 style={{ margin: "8px 0" }}>Grille + PV → faits → rapprochement → contrôle</h1>
      <p style={{ maxWidth: 850 }}>
        Cette vue ne remplace pas l'interface ATHAR principale. Elle démontre uniquement la tranche verticale IA : extraction locale de faits sourcés, rapprochement prudent, puis réutilisation du contrôle déterministe existant.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <label>
          <strong>Texte extrait — grille de notation</strong>
          <textarea value={gridText} onChange={(event) => setGridText(event.target.value)} rows={11} style={{ width: "100%", marginTop: 8, padding: 10, boxSizing: "border-box" }} />
        </label>
        <label>
          <strong>Texte extrait — PV</strong>
          <textarea value={pvText} onChange={(event) => setPvText(event.target.value)} rows={11} style={{ width: "100%", marginTop: 8, padding: 10, boxSizing: "border-box" }} />
        </label>
      </section>

      <button onClick={runAnalysis} disabled={loading} style={{ marginTop: 16, padding: "10px 16px", fontWeight: 700, cursor: loading ? "wait" : "pointer" }}>
        {loading ? "Analyse locale en cours…" : "Lancer la tranche verticale IA"}
      </button>

      {error && <p style={{ color: "#b42318", fontWeight: 700 }}>{error}</p>}

      {result && (
        <section style={{ marginTop: 32 }}>
          <h2>1. Faits extraits par IA locale</h2>
          {facts.length ? facts.map((fact) => <FactCard key={fact.id} fact={fact} />) : <p>Aucun fait suffisamment sourcé n'a été retenu.</p>}
          {result.extraction.grille.uncertainty && <p><b>Incertitude grille :</b> {result.extraction.grille.uncertainty}</p>}
          {result.extraction.pv.uncertainty && <p><b>Incertitude PV :</b> {result.extraction.pv.uncertainty}</p>}

          <h2 style={{ marginTop: 28 }}>2. Rapprochements assistés par IA</h2>
          {result.rapprochements.length
            ? result.rapprochements.map((relation, index) => <RelationCard key={`${relation.left_fact_id}-${relation.right_fact_id}-${index}`} relation={relation} />)
            : <p>Aucun couple de faits de même type n'était disponible entre les deux documents.</p>}

          <h2 style={{ marginTop: 28 }}>3. Contrôle déterministe existant</h2>
          {result.status === "insuffisant" ? (
            <article style={{ border: "1px solid #f0b4aa", borderRadius: 10, padding: 14 }}>
              <strong>Données insuffisantes — aucun contrôle métier forcé</strong>
              <p>{result.reason}</p>
            </article>
          ) : (
            <article style={{ border: "1px solid #b8c5d6", borderRadius: 10, padding: 14 }}>
              <strong>Calcul déterministe · {result.deterministic_result?.triggered ? "écart à vérifier" : "aucun écart automatique"}</strong>
              <p>{result.deterministic_result?.observed}</p>
              <p>{result.deterministic_result?.gap}</p>
              <p><b>Preuve :</b> {result.deterministic_result?.evidence}</p>
            </article>
          )}

          <h2 style={{ marginTop: 28 }}>4. Lecture de traçabilité</h2>
          <p><b>Extraction IA :</b> faits candidats, confiance et passages sources visibles.</p>
          <p><b>Rapprochement IA :</b> confirme / contredit / insuffisant, avec confiance ; jamais une conclusion juridique.</p>
          <p><b>Contrôle :</b> classement et cohérence d'attribution calculés par la logique déterministe déjà existante.</p>
          <p><b>Décision :</b> la qualification finale reste au contrôleur.</p>
        </section>
      )}
    </main>
  );
}
