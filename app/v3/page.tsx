"use client";

import { Check, CircleX, FileCheck2, FolderOpen, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { demoDossiers, type AlertStatus } from "../../lib/data/demoDossiers";
import styles from "../athar-v3.module.css";

type View = "dossiers" | "controler" | "prouver" | "livrer";

const statusLabel: Record<AlertStatus, string> = {
  pending: "À vérifier",
  confirmed: "Confirmé",
  dismissed: "Écarté",
  requested: "Pièce demandée",
};

export default function AtharV3() {
  const [view, setView] = useState<View>("dossiers");
  const [dossiers, setDossiers] = useState(demoDossiers);
  const [dossierId, setDossierId] = useState(demoDossiers[0].id);
  const [alertId, setAlertId] = useState(demoDossiers[0].alerts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(false);

  const dossier = dossiers.find((item) => item.id === dossierId) ?? dossiers[0];
  const alert = dossier.alerts.find((item) => item.id === alertId) ?? dossier.alerts[0];
  const confirmed = useMemo(() => dossier.alerts.filter((item) => item.status === "confirmed"), [dossier]);

  function chooseDossier(id: string) {
    const next = dossiers.find((item) => item.id === id) ?? dossiers[0];
    setDossierId(next.id);
    setAlertId(next.alerts[0]?.id ?? "");
    setView("controler");
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

  const evidence = alert?.evidenceItems?.[0];

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.mark}><ShieldCheck size={20}/></div>
        <div><strong>ATHAR</strong><span>Chaque alerte mène à sa preuve.</span></div>
      </div>
      <div className={styles.context}><span>DOSSIER ACTIF</span><strong>{dossier.title}</strong><span>{dossier.buyer ?? "Acheteur non renseigné"}</span></div>
    </header>

    <nav className={styles.nav} aria-label="Workflow ATHAR">
      <button className={view === "dossiers" ? styles.active : ""} onClick={() => setView("dossiers")}>Dossiers</button>
      <button className={view === "controler" ? styles.active : ""} onClick={() => setView("controler")}>Contrôler</button>
      <button className={view === "prouver" ? styles.active : ""} onClick={() => setView("prouver")}>Prouver</button>
      <button className={view === "livrer" ? styles.active : ""} onClick={() => setView("livrer")}>Livrer</button>
    </nav>

    {view === "dossiers" && <section className={styles.panel}>
      <span className={styles.eyebrow}>01 · DOSSIERS</span><h1>Choisir le dossier à contrôler</h1>
      <div className={styles.list}>{dossiers.map((item) => <button key={item.id} className={`${styles.row} ${item.id === dossier.id ? styles.active : ""}`} onClick={() => chooseDossier(item.id)}><FolderOpen size={16}/><strong>{item.title}</strong><small>{item.procedure ?? "Procédure à qualifier"}</small><span className={styles.pill}>{item.alerts.length} point(s) à vérifier</span></button>)}</div>
    </section>}

    {view === "controler" && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>02 · CONTRÔLER</span><h1>Points à vérifier</h1><p className={styles.hint}>Les contrôles sont présentés par finalité, pas par complexité technique.</p></div></div>
      <section className={styles.panel}><div className={styles.cards}>{dossier.alerts.map((item) => <article key={item.id} className={styles.control}><div className={styles.controlTop}><div><span className={styles.eyebrow}>{item.controlId ?? "CTRL"}</span><h3>{item.type}</h3></div><span className={styles.status}>{statusLabel[item.status]}</span></div><p><strong>Finalité :</strong> {item.rule}</p><p>{item.impact ?? item.observed}</p><button className={styles.primary} onClick={() => chooseAlert(item.id)}>Examiner la preuve</button></article>)}</div>{!dossier.alerts.length && <div className={styles.empty}>Aucun point nécessitant une revue humaine.</div>}</section>
    </>}

    {view === "prouver" && alert && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>03 · PROUVER</span><h1>{alert.type}</h1></div><button className={styles.button} onClick={() => setView("controler")}>Retour aux contrôles</button></div>
      <div className={styles.proof}>
        <section className={styles.panel}><span className={styles.eyebrow}>POURQUOI ATHAR LE SIGNALE</span><h2>{alert.rule}</h2><div className={styles.cards}><div className={styles.control}><strong>Attendu</strong><p>{alert.expected}</p></div><div className={styles.control}><strong>Observé</strong><p>{alert.observed}</p></div></div><span className={styles.eyebrow}>PREUVE SOURCE</span><div className={styles.quote}><strong>{evidence?.source ?? "Pièce source"} · {evidence?.location ?? alert.evidence}</strong><p>{evidence?.excerpt ?? alert.highlight}</p></div></section>
        <aside className={`${styles.panel} ${styles.decision}`}><span className={styles.eyebrow}>VALIDATION HUMAINE</span><h2>{statusLabel[alert.status]}</h2><p className={styles.hint}>ATHAR signale. Le contrôleur décide.</p><textarea rows={6} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Justifier la décision à partir de la preuve…"/><div className={styles.actions}><button className={styles.primary} disabled={note.trim().length < 8} onClick={() => decide("confirmed")}><Check size={16}/> Confirmer</button><button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("requested")}>Demander une pièce</button><button className={styles.button} disabled={note.trim().length < 8} onClick={() => decide("dismissed")}><CircleX size={16}/> Écarter</button></div></aside>
      </div>
    </>}

    {view === "livrer" && <>
      <div className={styles.bar}><div><span className={styles.eyebrow}>04 · LIVRER</span><h1>Livrables du contrôle</h1><p className={styles.hint}>Produits uniquement à partir des constats validés.</p></div></div>
      <section className={styles.panel}><div className={styles.deliverables}><article className={styles.deliverable}><FileCheck2 size={22}/><h3>Synthèse des constats</h3><p>{confirmed.length} constat(s) confirmé(s) avec règle, preuve et décision.</p><button className={styles.primary} disabled={!confirmed.length} onClick={() => setPreview(true)}>Prévisualiser</button></article><article className={styles.deliverable}><ShieldCheck size={22}/><h3>Dossier de preuves</h3><p>Sources, passages exacts et traçabilité de la validation humaine.</p></article></div></section>
    </>}

    {preview && <div className={styles.modal} onMouseDown={() => setPreview(false)}><section className={styles.modalCard} onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHeader}><div><span className={styles.eyebrow}>LIVRABLE PROVISOIRE</span><h2>{dossier.title}</h2></div><button className={styles.button} onClick={() => setPreview(false)}>Fermer</button></div><p className={styles.warning}>Document de travail — validation institutionnelle requise.</p>{confirmed.map((item, index) => <article className={styles.finding} key={item.id}><span className={styles.eyebrow}>CONSTAT {index + 1}</span><h3>{item.type}</h3><dl><dt>Règle</dt><dd>{item.rule}</dd><dt>Observé</dt><dd>{item.observed}</dd><dt>Preuve</dt><dd>{item.evidence}</dd><dt>Décision</dt><dd>{item.decisionNote}</dd></dl></article>)}</section></div>}
  </main>;
}
