"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleX,
  FileCheck2,
  FileSearch2,
  FolderOpen,
  History,
  Loader2,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  demoDossiers,
  type AlertStatus,
  type Dossier,
  type EvidenceItem,
  type ProcurementAlert,
} from "../../lib/data/demoDossiers";
import {
  buildImportedDossier,
  mergeImportedDossiers,
  type ExtractedPdf,
} from "../../lib/data/importedDossier";
import { buildStructuredDossier } from "../../lib/data/importedStructuredSource";
import styles from "../athar-v3.module.css";

type View = "dossiers" | "workspace" | "livrer";

type PersistedUiState = {
  dossiers: Dossier[];
  activeDossierId?: string | null;
  activeAlertId?: string | null;
};

const statusLabel: Record<AlertStatus, string> = {
  pending: "À vérifier",
  confirmed: "Confirmé",
  dismissed: "Écarté",
  requested: "Pièce demandée",
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

function sourceName(item: EvidenceItem) {
  return item.source || "Pièce source";
}

export default function AtharV3() {
  const [view, setView] = useState<View>("dossiers");
  const [dossiers, setDossiers] = useState(demoDossiers);
  const [dossierId, setDossierId] = useState(demoDossiers[0].id);
  const [alertId, setAlertId] = useState(demoDossiers[0].alerts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState("");
  const [sourceImporting, setSourceImporting] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [persistenceReady, setPersistenceReady] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const dossier = dossiers.find((item) => item.id === dossierId) ?? dossiers[0];
  const alert = dossier.alerts.find((item) => item.id === alertId) ?? dossier.alerts[0];
  const alertIndex = Math.max(0, dossier.alerts.findIndex((item) => item.id === alert?.id));
  const confirmed = useMemo(() => dossier.alerts.filter((item) => item.status === "confirmed"), [dossier]);
  const visibleDossiers = useMemo(
    () => dossiers.filter((item) => `${item.title} ${item.buyer ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [dossiers, query],
  );
  const evidenceItems = alert ? alert.evidenceItems ?? fallbackEvidence(alert) : [];
  const selectedEvidence = evidenceItems[0];
  const isDemoJourney = dossier.id === "poc-complete-journey";

  const dossierSources = useMemo(() => {
    const map = new Map<string, EvidenceItem>();
    dossier.alerts.forEach((item) => (item.evidenceItems ?? fallbackEvidence(item)).forEach((evidence) => {
      if (!map.has(sourceName(evidence))) map.set(sourceName(evidence), evidence);
    }));
    return Array.from(map.values());
  }, [dossier]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { state?: PersistedUiState | null };
        const state = payload.state;
        if (!state || !Array.isArray(state.dossiers) || !state.dossiers.length || cancelled) return;
        setDossiers(state.dossiers);
        const selected = state.dossiers.find((item) => item.id === state.activeDossierId) ?? state.dossiers[0];
        setDossierId(selected.id);
        const selectedAlert = selected.alerts.find((item) => item.id === state.activeAlertId);
        setAlertId(selectedAlert?.id ?? selected.alerts[0]?.id ?? "");
      } catch {
        // Le démonstrateur reste utilisable en mémoire si la persistance n'est pas disponible.
      } finally {
        if (!cancelled) setPersistenceReady(true);
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!persistenceReady) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dossiers, activeDossierId: dossierId, activeAlertId: alertId }),
      }).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [dossiers, dossierId, alertId, persistenceReady]);

  function chooseDossier(id: string) {
    const next = dossiers.find((item) => item.id === id) ?? dossiers[0];
    setDossierId(next.id);
    setAlertId(next.alerts[0]?.id ?? "");
    setNote(next.alerts[0]?.decisionNote ?? "");
  }

  function chooseAlert(id: string) {
    setAlertId(id);
    setNote(dossier.alerts.find((item) => item.id === id)?.decisionNote ?? "");
    setView("workspace");
  }

  function moveAlert(direction: -1 | 1) {
    if (!dossier.alerts.length) return;
    const nextIndex = Math.min(dossier.alerts.length - 1, Math.max(0, alertIndex + direction));
    chooseAlert(dossier.alerts[nextIndex].id);
  }

  function decide(status: AlertStatus) {
    if (!alert || note.trim().length < 8) return;
    setDossiers((current) => current.map((item) => item.id !== dossier.id ? item : ({
      ...item,
      alerts: item.alerts.map((candidate) => candidate.id !== alert.id ? candidate : ({
        ...candidate,
        status,
        decisionNote: note.trim(),
        decisionAt: new Date().toISOString(),
      })),
    })));
  }

  async function handleSourceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setSourceError("");
    setSourceImporting(true);
    try {
      const importedSources: Dossier[] = [];
      for (const file of files) {
        if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/pdf/extract", { method: "POST", body: formData });
          const payload = (await response.json()) as ExtractedPdf & { error?: string };
          if (!response.ok) throw new Error(payload.error ?? `Impossible de lire ${file.name}.`);
          importedSources.push(buildImportedDossier(payload));
          continue;
        }
        if (/\.(json|csv)$/i.test(file.name)) {
          importedSources.push(buildStructuredDossier(file.name, await file.text()));
          continue;
        }
        throw new Error(`Format non pris en charge actuellement : ${file.name}. Utilisez PDF, JSON ou CSV.`);
      }
      const importedDossier = mergeImportedDossiers(importedSources);
      setDossiers((current) => [importedDossier, ...current]);
      setDossierId(importedDossier.id);
      setAlertId(importedDossier.alerts[0]?.id ?? "");
      setView("dossiers");
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : "ATHAR n’a pas pu traiter les pièces sélectionnées.");
    } finally {
      setSourceImporting(false);
    }
  }

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.mark}><ShieldCheck size={20}/></div>
        <div><strong>ATHAR</strong><span>Chaque alerte mène à sa preuve.</span></div>
      </div>
      <nav className={styles.nav} aria-label="Navigation principale">
        <button className={view === "dossiers" ? styles.active : ""} onClick={() => setView("dossiers")}>Dossiers</button>
        <button className={view === "workspace" ? styles.active : ""} onClick={() => setView("workspace")}>Contrôle</button>
        <button className={view === "livrer" ? styles.active : ""} onClick={() => setView("livrer")}>Livrables</button>
      </nav>
      <div className={styles.context}>
        <span>DOSSIER ACTIF</span>
        <strong>{dossier.title}</strong>
        <span>{dossier.buyer ?? "Acheteur non renseigné"}</span>
      </div>
    </header>

    {sourceError && <div className={styles.error}>{sourceError}</div>}

    {view === "dossiers" && <>
      <section className={styles.pageHeading}>
        <div><span className={styles.eyebrow}>COMMANDE PUBLIQUE</span><h1>Dossiers de contrôle</h1><p>Retrouver, importer et reprendre un dossier de contrôle.</p></div>
        <label className={styles.primary}>{sourceImporting ? <Loader2 className={styles.spin} size={16}/> : <Upload size={16}/>} {sourceImporting ? "Traitement…" : "Ajouter des pièces"}<input type="file" accept="application/pdf,.pdf,application/json,.json,text/csv,.csv" multiple onChange={handleSourceUpload} disabled={sourceImporting} hidden /></label>
      </section>

      <section className={styles.caseListPanel}>
        <div className={styles.caseToolbar}>
          <label className={styles.search}><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Référence, dossier ou acheteur…"/></label>
          <div className={styles.filterStub}>État : Tous</div><div className={styles.filterStub}>Procédure : Toutes</div>
        </div>
        <div className={styles.caseTable}>
          <div className={styles.caseTableHead}><span>Dossier</span><span>Acheteur</span><span>Procédure</span><span>Pièces</span><span>Points</span><span>État</span></div>
          {visibleDossiers.map((item) => <button key={item.id} className={`${styles.caseRow} ${item.id === dossier.id ? styles.activeCaseRow : ""}`} onClick={() => { chooseDossier(item.id); setView("workspace"); }}>
            <span><strong>{item.title}</strong><small>{item.id}</small></span>
            <span>{item.buyer ?? "—"}</span><span>{item.procedure ?? "À qualifier"}</span><span>{item.documentCount ?? 1}</span><span>{item.alerts.length}</span><span className={styles.caseState}>En contrôle</span>
          </button>)}
        </div>
      </section>
    </>}

    {view === "workspace" && <>
      <section className={styles.caseHeader}>
        <div><span className={styles.breadcrumb}>Dossiers / {dossier.id}</span><h1>{dossier.title}</h1><p>{dossier.buyer ?? "Acheteur non renseigné"} · {dossier.procedure ?? "Procédure à qualifier"}</p></div>
        <div className={styles.caseHeaderMeta}><span>{dossier.documentCount ?? dossierSources.length || 1} pièce(s)</span><span>{dossier.alerts.filter((item) => item.status === "pending").length} point(s) ouvert(s)</span><button className={styles.button} onClick={() => setHistoryOpen((value) => !value)}><History size={15}/> Historique</button></div>
      </section>

      {historyOpen && <section className={styles.historyStrip}><strong>Historique du dossier</strong><span>Pièces importées</span><span>Contrôles exécutés</span><span>{confirmed.length} décision(s) confirmée(s)</span><small>Le journal détaillé sera enrichi lors de l’industrialisation.</small></section>}

      <section className={styles.reviewWorkspace}>
        <aside className={styles.leftRail}>
          <div className={styles.railSection}><span className={styles.eyebrow}>PIÈCES DU DOSSIER</span><label className={styles.miniSearch}><Search size={14}/><input placeholder="Rechercher…"/></label>
            <div className={styles.sourceList}>{dossierSources.map((item, index) => <button key={`${item.id}-${index}`} className={selectedEvidence && sourceName(item) === sourceName(selectedEvidence) ? styles.selectedSource : ""}><FileSearch2 size={15}/><span><strong>{sourceName(item)}</strong><small>{item.location}</small></span><em>Prêt</em></button>)}</div>
          </div>
          <div className={styles.railSection}><span className={styles.eyebrow}>POINTS À VÉRIFIER</span><div className={styles.issueList}>{dossier.alerts.map((item) => <button key={item.id} className={item.id === alert?.id ? styles.selectedIssue : ""} onClick={() => chooseAlert(item.id)}><span><strong>{item.controlId ?? "CTRL"}</strong><small>{item.type}</small></span><em>{statusLabel[item.status]}</em></button>)}</div></div>
          <label className={styles.addSource}><Upload size={15}/>{sourceImporting ? "Traitement…" : "Ajouter des pièces"}<input type="file" accept="application/pdf,.pdf,application/json,.json,text/csv,.csv" multiple onChange={handleSourceUpload} disabled={sourceImporting} hidden /></label>
        </aside>

        <section className={styles.documentViewer}>
          <div className={styles.viewerToolbar}><div><strong>{selectedEvidence ? sourceName(selectedEvidence) : "Pièce source"}</strong><span>{selectedEvidence?.location ?? "Localisation non disponible"}</span></div><div className={styles.viewerTools}><button>−</button><span>100%</span><button>+</button><button>⌕</button></div></div>
          <div className={styles.pageCanvas}>
            <div className={styles.paperHeader}><span>COUR DES COMPTES · DOSSIER DE CONTRÔLE</span><b>{selectedEvidence ? sourceName(selectedEvidence) : "DOCUMENT"}</b></div>
            <div className={styles.paperLines}><span/><span/><span className={styles.short}/><span/></div>
            <div className={styles.evidenceHighlight}><span>PASSAGE RELIÉ AU POINT À VÉRIFIER</span><p>{selectedEvidence?.excerpt ?? alert?.highlight ?? "Aucun passage source disponible."}</p></div>
            <div className={styles.paperLines}><span/><span/><span/><span className={styles.short}/><span/></div>
            <div className={styles.pageNumber}>{selectedEvidence?.location ?? "Source"}</div>
          </div>
          {evidenceItems.length > 1 && <div className={styles.crossEvidence}><span className={styles.eyebrow}>RAPPROCHEMENT MULTISOURCE</span>{evidenceItems.slice(1).map((item) => <article key={item.id}><strong>{item.source} · {item.location}</strong><p>{item.excerpt}</p></article>)}</div>}
        </section>

        {alert && <aside className={styles.controlPanel}>
          <div className={styles.controlPanelHeader}><div><span className={styles.eyebrow}>POINT À VÉRIFIER</span><h2>{alert.type}</h2><small>{alert.controlId ?? "CTRL"}</small></div><span className={styles.status}>{statusLabel[alert.status]}</span></div>
          <section><span className={styles.fieldLabel}>RÈGLE / EXIGENCE</span><p className={styles.ruleText}>{alert.rule}</p></section>
          <div className={styles.expectedObserved}><section><span className={styles.fieldLabel}>ATTENDU</span><p>{alert.expected}</p></section><section><span className={styles.fieldLabel}>OBSERVÉ</span><p>{alert.observed}</p></section></div>
          <section className={styles.evidenceMeta}><span className={styles.fieldLabel}>PREUVE</span><strong>{selectedEvidence ? sourceName(selectedEvidence) : "Pièce source"}</strong><span>{selectedEvidence?.location ?? alert.evidence}</span><small>Preuve retrouvée · provenance conservée</small></section>
          <section className={styles.humanDecision}><span className={styles.fieldLabel}>DÉCISION DU CONTRÔLEUR</span><textarea rows={6} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Motiver la décision à partir de la preuve…"/><div className={styles.decisionButtons}><button className={styles.primary} disabled={note.trim().length < 8} onClick={() => decide("confirmed")}><Check size={15}/> Confirmer le constat</button><button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("requested")}>Demander une pièce</button><button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("dismissed")}><CircleX size={15}/> Écarter</button></div></section>
        </aside>}
      </section>

      <footer className={styles.reviewFooter}><button disabled={alertIndex === 0} onClick={() => moveAlert(-1)}><ArrowLeft size={15}/> Point précédent</button><span>Point {dossier.alerts.length ? alertIndex + 1 : 0} sur {dossier.alerts.length}</span><button disabled={alertIndex >= dossier.alerts.length - 1} onClick={() => moveAlert(1)}>Point suivant <ArrowRight size={15}/></button></footer>
    </>}

    {view === "livrer" && <>
      <section className={styles.pageHeading}><div><span className={styles.eyebrow}>LIVRABLES</span><h1>Livrables du contrôle</h1><p>Seuls les constats confirmés alimentent les livrables.</p></div></section>
      <section className={styles.deliverables}><article className={styles.deliverable}><FileCheck2 size={24}/><h3>Synthèse du contrôle</h3><p>{confirmed.length} constat(s) confirmé(s), relié(s) à leur règle, leur preuve et leur validation.</p><button className={styles.primary} disabled={!confirmed.length} onClick={() => setPreview(true)}>Prévisualiser</button></article><article className={styles.deliverable}><ShieldCheck size={24}/><h3>Dossier de preuves</h3><p>Sources, passages utiles et décisions humaines regroupés pour revue institutionnelle.</p></article></section>
    </>}

    {preview && <div className={styles.modal} onMouseDown={() => setPreview(false)}><section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.eyebrow}>FICHE DE CONSTAT PROVISOIRE</span><h2>{dossier.title}</h2></div><button className={styles.button} onClick={() => setPreview(false)}>Fermer</button></div><p className={styles.warning}>Document de travail — validation institutionnelle requise.</p>{confirmed.map((item, index) => <article className={styles.finding} key={item.id}><span className={styles.eyebrow}>CONSTAT {index + 1}</span><h3>{item.type}</h3><dl><dt>Règle</dt><dd>{item.rule}</dd><dt>Attendu</dt><dd>{item.expected}</dd><dt>Observé</dt><dd>{item.observed}</dd><dt>Preuve</dt><dd>{item.evidence}</dd><dt>Décision</dt><dd>{item.decisionNote}</dd></dl><button className={styles.linkButton} onClick={() => { setPreview(false); chooseAlert(item.id); }}>Revenir à la preuve</button></article>)}</section></div>}
  </main>;
}
