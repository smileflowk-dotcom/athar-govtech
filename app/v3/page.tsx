"use client";

import {
  Check,
  CircleX,
  FileCheck2,
  FileSearch2,
  FolderOpen,
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

type View = "dossiers" | "controler" | "prouver" | "livrer";

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

  const dossier = dossiers.find((item) => item.id === dossierId) ?? dossiers[0];
  const alert = dossier.alerts.find((item) => item.id === alertId) ?? dossier.alerts[0];
  const confirmed = useMemo(() => dossier.alerts.filter((item) => item.status === "confirmed"), [dossier]);
  const visibleDossiers = useMemo(
    () => dossiers.filter((item) => `${item.title} ${item.buyer ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [dossiers, query],
  );
  const evidenceItems = alert ? alert.evidenceItems ?? fallbackEvidence(alert) : [];
  const isDemoJourney = dossier.id === "poc-complete-journey";

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
    setNote("");
  }

  function chooseAlert(id: string) {
    setAlertId(id);
    setNote(dossier.alerts.find((item) => item.id === id)?.decisionNote ?? "");
    setView("prouver");
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
      <div className={styles.context}>
        <span>DOSSIER ACTIF</span>
        <strong>{dossier.title}</strong>
        <span>{dossier.buyer ?? "Acheteur non renseigné"}</span>
      </div>
    </header>

    <nav className={styles.nav} aria-label="Workflow ATHAR">
      <button className={view === "dossiers" ? styles.active : ""} onClick={() => setView("dossiers")}><span>01</span>Dossiers</button>
      <button className={view === "controler" ? styles.active : ""} onClick={() => setView("controler")}><span>02</span>Contrôler</button>
      <button className={view === "prouver" ? styles.active : ""} onClick={() => setView("prouver")}><span>03</span>Prouver</button>
      <button className={view === "livrer" ? styles.active : ""} onClick={() => setView("livrer")}><span>04</span>Livrer</button>
    </nav>

    {sourceError && <div className={styles.error}>{sourceError}</div>}

    {view === "dossiers" && <>
      <section className={styles.heroPanel}>
        <div>
          <span className={styles.eyebrow}>01 · DOSSIERS</span>
          <h1>Ajouter les pièces du dossier</h1>
          <p>Déposez une ou plusieurs sources. ATHAR les regroupe dans un même dossier et prépare les points à vérifier.</p>
          <div className={styles.formatLine}><ShieldCheck size={15}/> Traitement local lorsque disponible · provenance conservée</div>
        </div>
        <label className={styles.uploadCard}>
          {sourceImporting ? <Loader2 className={styles.spin} size={30}/> : <Upload size={30}/>} 
          <strong>{sourceImporting ? "Traitement des pièces…" : "Ajouter des pièces"}</strong>
          <span>PDF, JSON ou CSV · sélection multiple</span>
          <small>Les autres formats de la cible institutionnelle seront activés avec la chaîne documentaire adaptée.</small>
          <input type="file" accept="application/pdf,.pdf,application/json,.json,text/csv,.csv" multiple onChange={handleSourceUpload} disabled={sourceImporting} hidden />
        </label>
      </section>

      <section className={styles.workspaceGrid}>
        <aside className={styles.panel}>
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>DOSSIERS DISPONIBLES</span><h2>{dossiers.length} dossier(s)</h2></div></div>
          <label className={styles.search}><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un dossier…"/></label>
          <div className={styles.list}>{visibleDossiers.map((item) => <button key={item.id} className={`${styles.row} ${item.id === dossier.id ? styles.activeRow : ""}`} onClick={() => chooseDossier(item.id)}><FolderOpen size={17}/><span><strong>{item.title}</strong><small>{item.procedure ?? "Procédure à qualifier"} · {item.documentCount ?? 1} source(s)</small></span><b>{item.alerts.length}</b></button>)}</div>
        </aside>

        <section className={styles.panel}>
          <div className={styles.dossierTop}>
            <div>
              <span className={styles.eyebrow}>{isDemoJourney ? "DOSSIER POC DE RÉFÉRENCE" : "DOSSIER SÉLECTIONNÉ"}</span>
              <h2>{dossier.title}</h2>
              <p>{dossier.buyer ?? "Acheteur non renseigné"}</p>
            </div>
            <button className={styles.primary} onClick={() => setView("controler")}>Contrôler le dossier</button>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}><span>Sources</span><strong>{dossier.documentCount ?? 1}</strong><small>pièces regroupées</small></div>
            <div className={styles.metric}><span>Points à vérifier</span><strong>{dossier.alerts.length}</strong><small>avant validation humaine</small></div>
            <div className={styles.metric}><span>Constats validés</span><strong>{confirmed.length}</strong><small>prêts pour livraison</small></div>
          </div>
          {isDemoJourney && <div className={styles.readyLine}><ShieldCheck size={18}/><div><strong>Parcours de démonstration complet</strong><span>Délai de publication · clause restrictive · probité · cohérence notation / attribution.</span></div></div>}
          {!isDemoJourney && <div className={styles.readyLine}><FileSearch2 size={18}/><div><strong>Dossier prêt pour contrôle</strong><span>Les points sont présentés avec règle, fait observé et preuve source.</span></div></div>}
        </section>
      </section>
    </>}

    {view === "controler" && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>02 · CONTRÔLER</span><h1>Points à vérifier</h1><p className={styles.hint}>ATHAR présente ce qui mérite une revue humaine, sans produire de conclusion automatique.</p></div><button className={styles.button} onClick={() => setView("dossiers")}>Ajouter des pièces</button></div>
      <section className={styles.panel}><div className={styles.cards}>{dossier.alerts.map((item) => <article key={item.id} className={styles.control}><div className={styles.controlTop}><div><span className={styles.eyebrow}>{item.controlId ?? "CTRL"}</span><h3>{item.type}</h3></div><span className={styles.status}>{statusLabel[item.status]}</span></div><p><strong>Règle :</strong> {item.rule}</p><p>{item.impact ?? item.observed}</p><button className={styles.primary} onClick={() => chooseAlert(item.id)}>Voir la preuve</button></article>)}</div>{!dossier.alerts.length && <div className={styles.empty}>Aucun point nécessitant une revue humaine pour ce dossier.</div>}</section>
    </>}

    {view === "prouver" && alert && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>03 · PROUVER</span><h1>{alert.type}</h1><p className={styles.hint}>Comprendre le signal, revenir à la source, puis décider.</p></div><button className={styles.button} onClick={() => setView("controler")}>Retour aux contrôles</button></div>
      <div className={styles.proof}>
        <section className={styles.panel}>
          <span className={styles.eyebrow}>POURQUOI ATHAR LE SIGNALE</span>
          <h2>{alert.rule}</h2>
          <div className={styles.compare}><div><span>ATTENDU</span><p>{alert.expected}</p></div><div><span>OBSERVÉ</span><p>{alert.observed}</p></div></div>
          <div className={styles.sourceHeading}><FileSearch2 size={17}/><strong>Preuve source</strong></div>
          <div className={styles.sourceStack}>{evidenceItems.map((evidence) => <div className={styles.quote} key={evidence.id}><strong>{evidence.source} · {evidence.location}</strong><p>{evidence.excerpt}</p></div>)}</div>
        </section>
        <aside className={`${styles.panel} ${styles.decision}`}>
          <span className={styles.eyebrow}>VALIDATION HUMAINE</span>
          <h2>{statusLabel[alert.status]}</h2>
          <p className={styles.hint}>ATHAR signale. Le contrôleur décide.</p>
          <textarea rows={7} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Justifier la décision à partir de la preuve…"/>
          <div className={styles.actions}>
            <button className={styles.primary} disabled={note.trim().length < 8} onClick={() => decide("confirmed")}><Check size={16}/> Confirmer</button>
            <button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("requested")}>Demander une pièce</button>
            <button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("dismissed")}><CircleX size={16}/> Écarter</button>
          </div>
          <small className={styles.auditNote}>La décision humaine reste distincte du signal produit par ATHAR et est conservée dans l’état du dossier.</small>
        </aside>
      </div>
    </>}

    {view === "livrer" && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>04 · LIVRER</span><h1>Livrables du contrôle</h1><p className={styles.hint}>Seuls les constats confirmés alimentent les livrables.</p></div></div>
      <section className={styles.panel}><div className={styles.deliverables}><article className={styles.deliverable}><FileCheck2 size={24}/><h3>Fiche de constat</h3><p>{confirmed.length} constat(s) confirmé(s), chacun relié à sa règle, sa preuve et sa validation.</p><button className={styles.primary} disabled={!confirmed.length} onClick={() => setPreview(true)}>Prévisualiser</button></article><article className={styles.deliverable}><ShieldCheck size={24}/><h3>Dossier de preuves</h3><p>Sources, extraits utiles et trace de la validation humaine regroupés pour la revue.</p></article></div></section>
    </>}

    {preview && <div className={styles.modal} onMouseDown={() => setPreview(false)}><section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.eyebrow}>FICHE DE CONSTAT PROVISOIRE</span><h2>{dossier.title}</h2></div><button className={styles.button} onClick={() => setPreview(false)}>Fermer</button></div><p className={styles.warning}>Document de travail — validation institutionnelle requise.</p>{confirmed.map((item, index) => <article className={styles.finding} key={item.id}><span className={styles.eyebrow}>CONSTAT {index + 1}</span><h3>{item.type}</h3><dl><dt>Règle</dt><dd>{item.rule}</dd><dt>Attendu</dt><dd>{item.expected}</dd><dt>Observé</dt><dd>{item.observed}</dd><dt>Preuve</dt><dd>{item.evidence}</dd><dt>Décision</dt><dd>{item.decisionNote}</dd></dl></article>)}</section></div>}
  </main>;
}
