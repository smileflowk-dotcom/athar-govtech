"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  FileCheck2,
  FileSearch2,
  FileText,
  FolderOpen,
  Loader2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  demoDossiers,
  type AlertStatus,
  type Dossier,
  type EvidenceItem,
  type EvidenceState,
  type ProcurementAlert,
} from "../lib/data/demoDossiers";
import { buildImportedDossier, type ExtractedPdf } from "../lib/data/importedDossier";

const statusLabels: Record<AlertStatus, string> = {
  pending: "À examiner",
  confirmed: "Constat confirmé",
  dismissed: "Alerte écartée",
  requested: "Complément demandé",
};

const evidenceStateLabels: Record<EvidenceState, string> = {
  retrieved: "Preuve retrouvée",
  contradictory: "Informations contradictoires",
  insufficient: "Preuve insuffisante",
};

type PersistedUiState = {
  dossiers: Dossier[];
  activeDossierId?: string | null;
  activeAlertId?: string | null;
};

function fallbackEvidence(alert: ProcurementAlert): EvidenceItem[] {
  return [{
    id: `${alert.id}-source`,
    source: alert.evidence.split(" — ")[0] || "Pièce source",
    location: alert.evidence,
    excerpt: alert.highlight,
    role: "observé",
    state: alert.evidenceState ?? "retrieved",
  }];
}

function formatDecisionDate(value?: string) {
  if (!value) return "Aucune décision enregistrée";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Home() {
  const [dossiers, setDossiers] = useState(demoDossiers);
  const [activeDossierId, setActiveDossierId] = useState(demoDossiers[0].id);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(demoDossiers[0].alerts[0]?.id ?? null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [decisionMessage, setDecisionMessage] = useState("");
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfImporting, setPdfImporting] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [persistenceReady, setPersistenceReady] = useState(false);

  const activeDossier = dossiers.find((dossier) => dossier.id === activeDossierId) ?? dossiers[0];
  const activeAlert = activeDossier.alerts.find((alert) => alert.id === activeAlertId) ?? activeDossier.alerts[0];
  const confirmedAlerts = activeDossier.alerts.filter((alert) => alert.status === "confirmed");
  const evidenceItems = useMemo(
    () => (activeAlert ? activeAlert.evidenceItems ?? fallbackEvidence(activeAlert) : []),
    [activeAlert],
  );
  const selectedEvidence = evidenceItems.find((item) => item.id === selectedEvidenceId) ?? evidenceItems[0];
  const displayedPage = activeAlert?.page ?? activeDossier.activePage;
  const selectedEvidencePage = Number(selectedEvidence?.location.match(/page\s+(\d+)/i)?.[1]) || displayedPage;
  const canDecide = decisionNote.trim().length >= 8;
  const filteredDossiers = useMemo(
    () => dossiers.filter((dossier) => dossier.title.toLowerCase().includes(query.toLowerCase())),
    [dossiers, query],
  );

  useEffect(() => {
    let cancelled = false;
    async function hydrateLocalState() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { state?: PersistedUiState | null };
        const state = payload.state;
        if (!state || !Array.isArray(state.dossiers) || state.dossiers.length === 0 || cancelled) return;
        setDossiers(state.dossiers);
        const selectedDossier = state.dossiers.find((dossier) => dossier.id === state.activeDossierId) ?? state.dossiers[0];
        setActiveDossierId(selectedDossier.id);
        const selectedAlert = selectedDossier.alerts.find((alert) => alert.id === state.activeAlertId);
        setActiveAlertId(selectedAlert?.id ?? selectedDossier.alerts[0]?.id ?? null);
      } catch {
        // L’interface reste utilisable avec les données fictives en mémoire.
      } finally {
        if (!cancelled) setPersistenceReady(true);
      }
    }
    void hydrateLocalState();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!persistenceReady) return;
    const timeout = window.setTimeout(() => {
      void fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dossiers, activeDossierId, activeAlertId }),
      }).catch(() => {
        // La persistance locale ne bloque jamais le démonstrateur.
      });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [dossiers, activeDossierId, activeAlertId, persistenceReady]);

  useEffect(() => {
    setSelectedEvidenceId(activeAlert?.evidenceItems?.[0]?.id ?? null);
    setDecisionNote(activeAlert?.decisionNote ?? "");
    setDecisionMessage("");
  }, [activeAlert?.id]);

  function selectDossier(dossier: Dossier) {
    setActiveDossierId(dossier.id);
    setActiveAlertId(dossier.alerts[0]?.id ?? null);
  }

  function updateAlertStatus(status: AlertStatus) {
    if (!activeAlert || !canDecide) return;
    const decisionAt = new Date().toISOString();
    setDossiers((current) => current.map((dossier) =>
      dossier.id !== activeDossier.id ? dossier : {
        ...dossier,
        alerts: dossier.alerts.map((alert) => alert.id === activeAlert.id ? {
          ...alert,
          status,
          decisionNote: decisionNote.trim(),
          decisionAt,
        } : alert),
      },
    ));
    setDecisionMessage(`${statusLabels[status]} · décision enregistrée et traçable.`);
  }

  async function handlePdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPdfError("");
    setPdfImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/pdf/extract", { method: "POST", body: formData });
      const payload = (await response.json()) as ExtractedPdf & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Impossible de lire ce PDF.");
      const importedDossier = buildImportedDossier(payload);
      setDossiers((current) => [importedDossier, ...current]);
      setActiveDossierId(importedDossier.id);
      setActiveAlertId(importedDossier.alerts[0]?.id ?? null);
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "Impossible de lire ce PDF.");
    } finally {
      setPdfImporting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><ShieldCheck size={21} /></div>
          <div><strong>ATHAR</strong><span>Contrôle · preuve · décision</span></div>
        </div>
        <div className="dossier-context" aria-label="Contexte du dossier actif">
          <div><span className="eyebrow">DOSSIER ACTIF</span><strong>{activeDossier.title}</strong></div>
          <span>{activeDossier.buyer ?? "Acheteur non renseigné"}</span>
          <span>{activeDossier.procedure ?? "Procédure à identifier"}</span>
          <span>{activeDossier.documentCount ?? 1} pièce{(activeDossier.documentCount ?? 1) > 1 ? "s" : ""}</span>
        </div>
        <div className="top-actions">
          <label className="secondary-button upload-button" title="Traitement local, sans API documentaire externe">
            {pdfImporting ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
            {pdfImporting ? "Extraction…" : "Importer un PDF"}
            <input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} disabled={pdfImporting} hidden />
          </label>
          <button className="primary-button" onClick={() => setPreviewOpen(true)}><FileCheck2 size={16} /> Fiche de constat</button>
        </div>
      </header>

      {pdfError && <div className="error-banner" role="alert">{pdfError}</div>}

      <section className="workspace" aria-label="Poste de contrôle ATHAR">
        <aside className="panel case-panel">
          <div className="panel-heading">
            <div><span className="step-number">01</span><div><span className="eyebrow">DOSSIER</span><h2>Éléments à examiner</h2></div></div>
            <span className="count-badge">{activeDossier.alerts.length}</span>
          </div>
          <label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Changer de dossier…" /></label>
          <div className="dossier-strip" aria-label="Dossiers disponibles">
            {filteredDossiers.map((dossier) => (
              <button key={dossier.id} className={`dossier-row ${dossier.id === activeDossier.id ? "selected" : ""}`} onClick={() => selectDossier(dossier)}>
                <FolderOpen size={15} />
                <span><strong>{dossier.title}</strong><small>{dossier.alerts.length} élément{dossier.alerts.length > 1 ? "s" : ""}</small></span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="queue-heading"><span>File du dossier</span><small>Priorité · preuve · action</small></div>
          <div className="alert-list">
            {activeDossier.alerts.map((alert, index) => (
              <button key={alert.id} className={`alert-row ${alert.id === activeAlert?.id ? "selected" : ""}`} onClick={() => setActiveAlertId(alert.id)}>
                <span className={`severity-marker severity-${alert.level.toLowerCase()}`} />
                <span className="alert-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="alert-copy">
                  <strong>{alert.type}</strong>
                  <small>{alert.controlId ?? "CTRL-V0"} · page {alert.page}</small>
                  <span className={`evidence-state state-${alert.evidenceState ?? "retrieved"}`}>{evidenceStateLabels[alert.evidenceState ?? "retrieved"]}</span>
                </span>
                <span className={`status-dot status-${alert.status}`} title={statusLabels[alert.status]} />
              </button>
            ))}
            {!activeDossier.alerts.length && <div className="empty-queue"><ShieldCheck size={28} /><strong>Aucun élément à examiner</strong><span>Aucun signal suffisant n’a été détecté.</span></div>}
          </div>
          <div className="local-note"><ShieldCheck size={14} /> Traitement local · données fictives par défaut</div>
        </aside>

        <section className="panel evidence-panel">
          <div className="panel-heading">
            <div><span className="step-number">02</span><div><span className="eyebrow">PREUVE MULTISOURCE</span><h2>{activeAlert ? "Comprendre l’écart" : "Aucune alerte sélectionnée"}</h2></div></div>
            {activeAlert && <span className={`evidence-summary state-${activeAlert.evidenceState ?? "retrieved"}`}>{evidenceStateLabels[activeAlert.evidenceState ?? "retrieved"]}</span>}
          </div>
          {activeAlert ? (
            <div className="evidence-scroll">
              <section className="control-card">
                <div className="control-title">
                  <div><span>{activeAlert.controlId ?? "CTRL-V0"} · version {activeAlert.controlVersion ?? "1.0"}</span><h1>{activeAlert.type}</h1></div>
                  <span className={`level level-${activeAlert.level.toLowerCase()}`}>{activeAlert.level}</span>
                </div>
                <div className="rule-line"><ShieldCheck size={15} /><span><strong>Règle appliquée</strong>{activeAlert.rule}</span></div>
              </section>
              <section className="comparison-grid" aria-label="Comparaison attendu et observé">
                <article><span className="fact-label">ATTENDU</span><p>{activeAlert.expected}</p></article>
                <div className="comparison-arrow"><ArrowRight size={18} /></div>
                <article className="observed"><span className="fact-label">OBSERVÉ</span><p>{activeAlert.observed}</p></article>
              </section>
              {(activeAlert.gap || activeAlert.impact) && (
                <section className="impact-row">
                  {activeAlert.gap && <div><span>ÉCART</span><strong>{activeAlert.gap}</strong></div>}
                  <p><strong>Impact à examiner</strong>{activeAlert.impact ?? activeAlert.action}</p>
                </section>
              )}
              <section className="sources-section">
                <div className="section-title"><div><FileSearch2 size={17} /><strong>Pièces rapprochées</strong></div><span>{evidenceItems.length} source{evidenceItems.length > 1 ? "s" : ""}</span></div>
                <div className="source-tabs" role="tablist" aria-label="Sources de preuve">
                  {evidenceItems.map((item) => (
                    <button key={item.id} role="tab" aria-selected={item.id === selectedEvidence?.id} className={item.id === selectedEvidence?.id ? "active" : ""} onClick={() => setSelectedEvidenceId(item.id)}>
                      <FileText size={15} /><span><strong>{item.source}</strong><small>{item.location}</small></span><span className={`source-state state-${item.state}`}>{item.role}</span>
                    </button>
                  ))}
                </div>
              </section>
              {selectedEvidence && (
                <section className="document-viewer" aria-label="Passage source exact">
                  <header><div><span className="eyebrow">PASSAGE SOURCE EXACT</span><strong>{selectedEvidence.source}</strong></div><span>{selectedEvidence.location}</span></header>
                  <article>
                    <span className="document-kicker">{activeDossier.realDocument ? "Document importé et extrait localement" : "Document de démonstration — données fictives"}</span>
                    <p>Page {selectedEvidencePage} / {activeDossier.totalPages}</p>
                    <mark>{selectedEvidence.excerpt}</mark>
                    <div className="source-anchor"><CheckCircle2 size={15} /> Passage rattaché au contrôle {activeAlert.controlId ?? "CTRL-V0"}</div>
                  </article>
                </section>
              )}
            </div>
          ) : <div className="empty-evidence"><ShieldCheck size={36} /><strong>Aucune preuve à examiner</strong><span>Sélectionnez un dossier comportant un signal.</span></div>}
        </section>

        <aside className="panel decision-panel">
          <div className="panel-heading"><div><span className="step-number">03</span><div><span className="eyebrow">VALIDATION HUMAINE</span><h2>Décider</h2></div></div></div>
          {activeAlert ? (
            <div className="decision-content">
              <div className={`current-status status-card-${activeAlert.status}`}><span>STATUT</span><strong>{statusLabels[activeAlert.status]}</strong><small>{formatDecisionDate(activeAlert.decisionAt)}</small></div>
              <section className="decision-brief">
                <span className="eyebrow">CE QUE LA PREUVE PERMET DE DIRE</span>
                <p>{activeAlert.impact ?? activeAlert.observed}</p>
                <div><AlertTriangle size={15} /> Aucune conclusion juridique ou accusation automatique.</div>
              </section>
              <label className="decision-note">
                <span>Justification du contrôleur <strong>requise</strong></span>
                <textarea value={decisionNote} onChange={(event) => { setDecisionNote(event.target.value); setDecisionMessage(""); }} placeholder="Expliquer brièvement la décision à partir des preuves affichées…" rows={5} />
                <small>{canDecide ? "Justification prête à être enregistrée." : "8 caractères minimum pour assurer la traçabilité."}</small>
              </label>
              <div className="decision-actions">
                <button className="primary-button confirm" disabled={!canDecide} onClick={() => updateAlertStatus("confirmed")}><Check size={17} /> Confirmer le constat</button>
                <button className="secondary-button request" disabled={!canDecide} onClick={() => updateAlertStatus("requested")}><MessageSquareText size={17} /> Demander une pièce</button>
                <button className="secondary-button dismiss" disabled={!canDecide} onClick={() => updateAlertStatus("dismissed")}><CircleX size={17} /> Écarter l’alerte</button>
              </div>
              <p className="decision-message" role="status">{decisionMessage}</p>
              <section className="trace-card">
                <div><Clock3 size={15} /><strong>Traçabilité</strong></div>
                <ul><li>Contrôle déterministe {activeAlert.controlId ?? "CTRL-V0"}</li><li>{evidenceItems.length} source{evidenceItems.length > 1 ? "s rapprochées" : " rattachée"}</li><li>Décision et justification conservées localement</li></ul>
              </section>
              <button className="report-button" onClick={() => setPreviewOpen(true)} disabled={!confirmedAlerts.length}><FileCheck2 size={17} /> Générer la fiche de constat<span>{confirmedAlerts.length}</span></button>
            </div>
          ) : <div className="empty-decision"><FileCheck2 size={32} /><strong>Aucune décision attendue</strong><span>Le dossier actif ne contient aucune alerte.</span></div>}
        </aside>
      </section>

      {previewOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span>Fiche de constat provisoire</span><h2 id="report-title">{activeDossier.title}</h2></div><button className="icon-button" onClick={() => setPreviewOpen(false)} aria-label="Fermer"><X size={18} /></button></div>
            <div className="report-body">
              <p className="report-warning">Validation humaine requise — document de travail non validé institutionnellement.</p>
              {confirmedAlerts.length ? confirmedAlerts.map((alert, index) => (
                <article key={alert.id} className="report-finding">
                  <span>Constat {index + 1} · {alert.controlId ?? "CTRL-V0"}</span><h3>{alert.type}</h3>
                  <dl><dt>Règle</dt><dd>{alert.rule}</dd><dt>Attendu</dt><dd>{alert.expected}</dd><dt>Observé</dt><dd>{alert.observed}</dd><dt>Preuves</dt><dd>{(alert.evidenceItems ?? fallbackEvidence(alert)).map((item) => `${item.source}, ${item.location}`).join(" ; ")}</dd><dt>Décision</dt><dd>{statusLabels[alert.status]}</dd><dt>Motif</dt><dd>{alert.decisionNote}</dd><dt>Suite</dt><dd>{alert.action}</dd></dl>
                </article>
              )) : <p className="empty-report">Aucun constat exportable : confirmez au moins un élément après examen de sa preuve.</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
