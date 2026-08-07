"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CircleX,
  Eye,
  FileCheck2,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import {
  demoDossiers,
  type AlertStatus,
  type Dossier,
} from "../lib/data/demoDossiers";
import {
  buildImportedDossier,
  type ExtractedPdf,
} from "../lib/data/importedDossier";

const statusLabels: Record<AlertStatus, string> = {
  pending: "À valider",
  confirmed: "Confirmée",
  dismissed: "Écartée",
  requested: "Pièce demandée",
};

const indicatorLabels: Record<string, string> = {
  "named-brand": "Marque nommément désignée",
  "brand-certification": "Certification liée à une marque",
  "missing-equivalence": "Absence de mention d’équivalence",
  "insufficient-publication-delay": "Délai observé inférieur au minimum applicable",
  "missing-probity-declaration": "Déclaration de probité absente ou non retrouvée",
};

export default function Home() {
  const [dossiers, setDossiers] = useState(demoDossiers);
  const [activeDossierId, setActiveDossierId] = useState(demoDossiers[0].id);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(
    demoDossiers[0].alerts[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfImporting, setPdfImporting] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const activeDossier =
    dossiers.find((dossier) => dossier.id === activeDossierId) ?? dossiers[0];
  const activeAlert =
    activeDossier.alerts.find((alert) => alert.id === activeAlertId) ?? activeDossier.alerts[0];
  const activeAlertIndex = activeAlert
    ? activeDossier.alerts.findIndex((alert) => alert.id === activeAlert.id)
    : -1;
  const confirmedAlerts = activeDossier.alerts.filter((alert) => alert.status === "confirmed");

  const filteredDossiers = useMemo(
    () =>
      dossiers.filter((dossier) =>
        dossier.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [dossiers, query],
  );

  function selectDossier(dossier: Dossier) {
    setActiveDossierId(dossier.id);
    setActiveAlertId(dossier.alerts[0]?.id ?? null);
  }

  function updateAlertStatus(status: AlertStatus) {
    if (!activeAlert || activeAlert.status === status) return;

    setDossiers((current) =>
      current.map((dossier) =>
        dossier.id !== activeDossier.id
          ? dossier
          : {
              ...dossier,
              alerts: dossier.alerts.map((alert) =>
                alert.id === activeAlert.id ? { ...alert, status } : alert,
              ),
            },
      ),
    );
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

      const response = await fetch("/api/pdf/extract", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as ExtractedPdf & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de lire ce PDF.");
      }

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
          <div className="brand-mark" aria-hidden="true">A</div>
          <div><strong>ATHAR</strong><span>Public Procurement Control</span></div>
        </div>

        <div className="market-title">
          <span>{activeDossier.title}</span>
          <span className="status-chip">
            {activeAlert ? statusLabels[activeAlert.status] : "Aucune alerte"}
          </span>
        </div>

        <div className="top-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
          <button className="icon-button" aria-label="Aide"><HelpCircle size={18} /></button>
          <button className="primary-button" onClick={() => setPreviewOpen(true)}>
            <FileCheck2 size={17} /> Générer la fiche de constat
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel dossier-panel">
          <div className="panel-title-row">
            <h2>Dossiers</h2>
            <label
              className="secondary-button"
              style={{ minHeight: 32, padding: "0 9px", fontSize: 11, opacity: pdfImporting ? 0.7 : 1 }}
              title="Le PDF est traité par l’instance ATHAR locale, sans API externe."
            >
              {pdfImporting ? <Loader2 size={14} /> : <Upload size={14} />}
              {pdfImporting ? "Extraction…" : "Importer PDF"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfUpload}
                disabled={pdfImporting}
                hidden
              />
            </label>
          </div>
          <div className="search-row">
            <label className="search-box">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un dossier…"
              />
            </label>
          </div>

          {pdfError && (
            <div style={{ color: "#b42318", fontSize: 11, padding: "0 12px 10px" }}>
              {pdfError}
            </div>
          )}

          <div className="dossier-list">
            {filteredDossiers.map((dossier) => (
              <button
                key={dossier.id}
                className={`dossier-item ${dossier.id === activeDossier.id ? "selected" : ""}`}
                onClick={() => selectDossier(dossier)}
              >
                <div>
                  <strong>{dossier.title}</strong>
                  <span className={dossier.alerts.length ? "alert-count" : "muted"}>
                    {dossier.alerts.length ? <AlertTriangle size={13} /> : <ShieldCheck size={13} />}
                    {dossier.alerts.length
                      ? ` ${dossier.alerts.length} alerte${dossier.alerts.length > 1 ? "s" : ""} calculée${dossier.alerts.length > 1 ? "s" : ""}`
                      : " Aucun signal détecté"}
                  </span>
                </div>
                <span className={`score score-${dossier.score >= 70 ? "high" : "low"}`}>
                  {dossier.score}
                </span>
              </button>
            ))}
          </div>
          <div className="panel-footer">Traitement local · aucune API documentaire externe</div>
        </aside>

        <section className="panel document-panel">
          <div className="panel-title-row">
            <h2>Document</h2>
            <span className="source-badge">
              <FileText size={14} /> {activeDossier.sourceLabel}
            </span>
          </div>

          <div className="pdf-toolbar">
            <span>Page {activeDossier.activePage} / {activeDossier.totalPages}</span>
            <span className="toolbar-separator" />
            <span>{activeDossier.realDocument ? "PDF extrait localement" : "Analyse locale V0"}</span>
          </div>

          <div className="pdf-stage">
            <article className="pdf-page">
              <p className="document-kicker">
                {activeDossier.realDocument ? "Document importé dans ATHAR" : "Document de démonstration"}
              </p>
              <h3>{activeDossier.realDocument ? `Texte extrait — page ${activeDossier.activePage}` : "Éléments analysés"}</h3>
              <p>
                {activeDossier.realDocument
                  ? "Le texte ci-dessous a été extrait du PDF par l’instance ATHAR. Le document n’est envoyé à aucune API externe."
                  : "Le présent extrait est fictif et sert uniquement à démontrer un contrôle ATHAR."}
              </p>
              {activeAlert ? (
                <mark>{activeAlert.highlight}</mark>
              ) : (
                <p style={{ whiteSpace: "pre-wrap", marginTop: 18 }}>{activeDossier.excerpt}</p>
              )}
              <h4>Résultat du traitement</h4>
              <p>
                {activeAlert
                  ? "Le moteur a trouvé un signal nécessitant une validation humaine."
                  : "Aucun signal suffisant n’a été détecté par le contrôle appliqué."}
              </p>
            </article>
          </div>
        </section>

        <aside className="panel alert-panel">
          <div className="panel-title-row"><h2>Résultat du contrôle</h2></div>

          {activeAlert ? (
            <>
              <div className="alert-heading">
                <AlertTriangle size={20} />
                <div>
                  <strong>{activeAlert.type}</strong>
                  <span>{statusLabels[activeAlert.status]} · calculée automatiquement</span>
                </div>
              </div>

              <dl className="alert-details">
                <div><dt>Niveau de vigilance</dt><dd><span className={`level level-${activeAlert.level.toLowerCase()}`}>{activeAlert.level}</span></dd></div>
                <div><dt>Indicateurs déclenchés</dt><dd>{activeAlert.indicators.map((indicator) => indicatorLabels[indicator] ?? indicator).join(" · ")}</dd></div>
                <div><dt>Règle de contrôle</dt><dd>{activeAlert.rule}</dd></div>
                <div><dt>Attendu</dt><dd>{activeAlert.expected}</dd></div>
                <div><dt>Justification</dt><dd>{activeAlert.observed}</dd></div>
                <div><dt>Preuve</dt><dd><button className="evidence-link">{activeAlert.evidence}</button></dd></div>
                <div><dt>Action recommandée</dt><dd>{activeAlert.action}</dd></div>
                <div><dt>Traçabilité</dt><dd>Contrôle V0 local · résultat déterministe · aucune conclusion juridique automatique</dd></div>
              </dl>

              <div className="decision-actions" style={{ position: "sticky", bottom: 0, zIndex: 3, background: "white" }}>
                <button
                  className="primary-button"
                  disabled={activeAlert.status === "confirmed"}
                  onClick={() => updateAlertStatus("confirmed")}
                >
                  <Check size={17} /> {activeAlert.status === "confirmed" ? "Confirmée" : "Confirmer"}
                </button>
                <button
                  className="secondary-button"
                  disabled={activeAlert.status === "dismissed"}
                  onClick={() => updateAlertStatus("dismissed")}
                >
                  <CircleX size={17} /> {activeAlert.status === "dismissed" ? "Écartée" : "Écarter"}
                </button>
                <button
                  className="secondary-button full"
                  disabled={activeAlert.status === "requested"}
                  onClick={() => updateAlertStatus("requested")}
                >
                  <MessageSquareText size={17} /> {activeAlert.status === "requested" ? "Pièce demandée" : "Demander une pièce"}
                </button>
              </div>

              {activeDossier.alerts.length > 1 && (
                <div className="alert-switcher">
                  <span>Alerte {activeAlertIndex + 1} / {activeDossier.alerts.length}</span>
                  <div>
                    {activeDossier.alerts.map((alert) => (
                      <button
                        key={alert.id}
                        className={`alert-dot ${alert.id === activeAlert.id ? "active" : ""}`}
                        aria-label={`Afficher ${alert.type}`}
                        onClick={() => setActiveAlertId(alert.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-alerts">
              <ShieldCheck size={36} />
              <strong>Aucune alerte déclenchée</strong>
              <span>Le contrôle V0 n’a pas trouvé de signal suffisant dans ce document.</span>
            </div>
          )}
        </aside>
      </section>

      <section className="output-panel">
        <div className="output-title"><h2>Sortie</h2><span>Résultat du dossier actif</span></div>
        <div className="stat-card"><ShieldCheck size={21} /><strong>{confirmedAlerts.length}</strong><span>alerte{confirmedAlerts.length > 1 ? "s" : ""} validée{confirmedAlerts.length > 1 ? "s" : ""}</span></div>
        <div className="stat-card"><AlertTriangle size={21} /><strong>{activeDossier.alerts.length}</strong><span>signal{activeDossier.alerts.length > 1 ? "aux" : ""} calculé{activeDossier.alerts.length > 1 ? "s" : ""}</span></div>
        <div className="stat-card"><FileText size={21} /><strong>{activeDossier.alerts.length}</strong><span>preuve{activeDossier.alerts.length > 1 ? "s" : ""} rattachée{activeDossier.alerts.length > 1 ? "s" : ""}</span></div>
        <button className="preview-button" onClick={() => setPreviewOpen(true)}><Eye size={18} /> Prévisualiser la fiche de constat</button>
      </section>

      {previewOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><span>Fiche de constat provisoire</span><h2>{activeDossier.title}</h2></div>
              <button className="icon-button" onClick={() => setPreviewOpen(false)} aria-label="Fermer"><X size={18} /></button>
            </div>
            <div className="report-body">
              <p className="report-warning">Validation humaine requise — aucune conclusion juridique automatique.</p>
              {confirmedAlerts.length ? (
                confirmedAlerts.map((alert, index) => (
                  <article key={alert.id} className="report-finding">
                    <span>Constat {index + 1}</span>
                    <h3>{alert.type}</h3>
                    <p>{alert.observed}</p>
                    <dl>
                      <dt>Preuve</dt><dd>{alert.evidence}</dd>
                      <dt>Suite proposée</dt><dd>{alert.action}</dd>
                    </dl>
                  </article>
                ))
              ) : (
                <p>Aucun constat exportable : le contrôleur doit confirmer au moins une alerte.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
