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
  MessageSquareText,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  demoDossiers,
  type AlertStatus,
  type Dossier,
} from "../lib/data/demoDossiers";

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
};

export default function Home() {
  const [dossiers, setDossiers] = useState(demoDossiers);
  const [activeDossierId, setActiveDossierId] = useState(demoDossiers[0].id);
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeDossier =
    dossiers.find((dossier) => dossier.id === activeDossierId) ?? dossiers[0];
  const activeAlert = activeDossier.alerts[0];

  const filteredDossiers = useMemo(
    () =>
      dossiers.filter((dossier) =>
        dossier.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [dossiers, query],
  );

  function selectDossier(dossier: Dossier) {
    setActiveDossierId(dossier.id);
  }

  function updateAlertStatus(status: AlertStatus) {
    if (!activeAlert || activeAlert.status === status) return;

    setDossiers((current) =>
      current.map((dossier) =>
        dossier.id !== activeDossier.id
          ? dossier
          : {
              ...dossier,
              alerts: dossier.alerts.map((alert) => ({ ...alert, status })),
            },
      ),
    );
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
          <div className="panel-title-row"><h2>Dossiers de démonstration</h2></div>
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
                      ? " 1 alerte calculée"
                      : " Aucun signal détecté"}
                  </span>
                </div>
                <span className={`score score-${dossier.score >= 70 ? "high" : "low"}`}>
                  {dossier.score}
                </span>
              </button>
            ))}
          </div>
          <div className="panel-footer">Contrôle local et déterministe</div>
        </aside>

        <section className="panel document-panel">
          <div className="panel-title-row">
            <h2>Document</h2>
            <span className="source-badge">
              <FileText size={14} /> CPS fictif — extrait analysé
            </span>
          </div>

          <div className="pdf-toolbar">
            <span>Page {activeAlert?.page ?? 8} / 34</span>
            <span className="toolbar-separator" />
            <span>Analyse locale V0</span>
          </div>

          <div className="pdf-stage">
            <article className="pdf-page">
              <p className="document-kicker">Section III. Instructions aux soumissionnaires</p>
              <h3>Spécifications et conditions d’éligibilité</h3>
              <p>Le présent extrait est fictif et sert uniquement à démontrer le contrôle ATHAR.</p>
              {activeAlert ? <mark>{activeAlert.highlight}</mark> : <p>{activeDossier.excerpt}</p>}
              <h4>Résultat du traitement</h4>
              <p>
                {activeAlert
                  ? "Le moteur a trouvé une combinaison d’indicateurs nécessitant une validation humaine."
                  : "Aucune combinaison suffisante d’indicateurs restrictifs n’a été détectée."}
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
                <div><dt>Indicateurs déclenchés</dt><dd>{activeAlert.indicators.map((indicator) => indicatorLabels[indicator]).join(" · ")}</dd></div>
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
            </>
          ) : (
            <div className="no-alerts">
              <ShieldCheck size={36} />
              <strong>Aucune alerte déclenchée</strong>
              <span>La mention d’équivalence neutralise le signal dans ce scénario.</span>
            </div>
          )}
        </aside>
      </section>

      <section className="output-panel">
        <div className="output-title"><h2>Sortie</h2><span>Résultat du dossier actif</span></div>
        <div className="stat-card"><ShieldCheck size={21} /><strong>{activeAlert?.status === "confirmed" ? 1 : 0}</strong><span>alerte validée</span></div>
        <div className="stat-card"><AlertTriangle size={21} /><strong>{activeDossier.alerts.length}</strong><span>signal calculé</span></div>
        <div className="stat-card"><FileText size={21} /><strong>1</strong><span>preuve rattachée</span></div>
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
              {activeAlert?.status === "confirmed" ? (
                <article className="report-finding">
                  <span>Constat 1</span>
                  <h3>{activeAlert.type}</h3>
                  <p>{activeAlert.observed}</p>
                  <dl>
                    <dt>Preuve</dt><dd>{activeAlert.evidence}</dd>
                    <dt>Suite proposée</dt><dd>{activeAlert.action}</dd>
                  </dl>
                </article>
              ) : (
                <p>Aucun constat exportable : le contrôleur doit confirmer l’alerte.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
