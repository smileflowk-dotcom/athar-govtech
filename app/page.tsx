"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type AlertStatus = "pending" | "confirmed" | "dismissed" | "requested";
type Tab = "all" | "pending" | "validated";

type ProcurementAlert = {
  id: string;
  type: string;
  level: "Élevé" | "Moyen" | "Faible";
  rule: string;
  expected: string;
  observed: string;
  evidence: string;
  action: string;
  page: number;
  highlight: string;
  status: AlertStatus;
};

type Dossier = {
  id: string;
  title: string;
  score: number;
  alerts: ProcurementAlert[];
};

const initialDossiers: Dossier[] = [
  {
    id: "equipment",
    title: "Acquisition de 500 équipements informatiques",
    score: 85,
    alerts: [
      {
        id: "restrictive-clause",
        type: "Clause potentiellement restrictive",
        level: "Élevé",
        rule: "Principe d’accès équitable à la commande publique",
        expected: "Une exigence technique doit rester objective, proportionnée et ouverte aux solutions équivalentes.",
        observed: "Le soumissionnaire doit être partenaire certifié de deux fabricants nommément désignés.",
        evidence: "CPS — section III.A.3.2, page 12",
        action: "Demander la justification technique ou reformuler l’exigence en termes de performance et d’équivalence.",
        page: 12,
        highlight:
          "Le Soumissionnaire doit être un partenaire certifié agréé du fabricant suivant : Dell Technologies ou Hewlett Packard Enterprise (HPE). La preuve de cette certification doit être fournie à l’appui de la soumission.",
        status: "pending",
      },
      {
        id: "deadline",
        type: "Délai de remise à vérifier",
        level: "Moyen",
        rule: "Délai paramétré selon la procédure et le seuil applicables",
        expected: "Le délai minimal validé par la Cour doit être respecté.",
        observed: "Douze jours calendaires entre publication et remise des offres.",
        evidence: "Avis PMP — dates de publication et de clôture",
        action: "Vérifier la règle applicable à cette procédure avant toute conclusion.",
        page: 3,
        highlight: "Date de publication : 4 mai 2026 — date limite de remise des offres : 16 mai 2026.",
        status: "pending",
      },
      {
        id: "scoring",
        type: "Incohérence potentielle de notation",
        level: "Élevé",
        rule: "Cohérence entre règlement, grille, classement et attribution",
        expected: "Chaque note doit pouvoir être recalculée à partir d’un critère défini et d’une preuve identifiable.",
        observed: "Le critère « avec Wi-Fi » ajoute dix points sans précision de norme, de performance ou de preuve attendue.",
        evidence: "RC et grille de notation — page 18",
        action: "Recalculer le classement avec et sans le critère ambigu puis soumettre l’écart au contrôleur.",
        page: 18,
        highlight: "Critère 4 — Équipement avec Wi-Fi : 10 points.",
        status: "dismissed",
      },
      {
        id: "probity",
        type: "Signal contextuel de probité",
        level: "Moyen",
        rule: "Signal de contexte — aucune conclusion automatique",
        expected: "Une concurrence effective et un historique d’attribution explicable.",
        observed: "Une seule offre recevable et même attributaire sur plusieurs marchés comparables.",
        evidence: "Historique PMP fictif — 2024 à 2026",
        action: "Examiner les causes de la faible concurrence et la comparabilité des marchés précédents.",
        page: 2,
        highlight: "Nombre d’offres reçues : 1 — attributaire : Atlas Digital Services.",
        status: "confirmed",
      },
      {
        id: "missing-proof",
        type: "Pièce justificative manquante",
        level: "Faible",
        rule: "Lien exigence — pièce — validation",
        expected: "La certification annoncée doit être rattachable au soumissionnaire.",
        observed: "La pièce est établie au nom d’un importateur tiers.",
        evidence: "Certificat fournisseur — page 1",
        action: "Demander le document établissant le lien entre l’importateur et le soumissionnaire.",
        page: 25,
        highlight: "Titulaire du certificat : Import Maroc Services.",
        status: "requested",
      },
    ],
  },
  {
    id: "building",
    title: "Construction d’un bâtiment administratif",
    score: 62,
    alerts: [
      {
        id: "building-delay",
        type: "Délai de publication à vérifier",
        level: "Moyen",
        rule: "Délai paramétré selon la procédure",
        expected: "Le délai applicable doit être respecté.",
        observed: "Délai inférieur au seuil paramétré pour le scénario fictif.",
        evidence: "Avis PMP — page 2",
        action: "Confirmer la procédure et le seuil avant validation.",
        page: 2,
        highlight: "Délai entre publication et remise : 14 jours.",
        status: "pending",
      },
      {
        id: "building-clause",
        type: "Référence technique très précise",
        level: "Moyen",
        rule: "Ouverture aux solutions équivalentes",
        expected: "La performance attendue prime sur une référence fermée.",
        observed: "Une référence produit unique est citée sans équivalence.",
        evidence: "CPS — page 31",
        action: "Demander la justification fonctionnelle.",
        page: 31,
        highlight: "Revêtement modèle XZ-450, marque indiquée sans mention d’équivalence.",
        status: "confirmed",
      },
      {
        id: "building-score",
        type: "Écart de calcul",
        level: "Faible",
        rule: "Exactitude arithmétique de la grille",
        expected: "La somme des sous-notes correspond à la note finale.",
        observed: "Un écart de deux points apparaît dans la grille fictive.",
        evidence: "Grille — page 6",
        action: "Vérifier la saisie avant de conclure.",
        page: 6,
        highlight: "Sous-total : 72 — note reportée : 74.",
        status: "dismissed",
      },
    ],
  },
  {
    id: "cleaning",
    title: "Fourniture de produits d’entretien",
    score: 48,
    alerts: [
      {
        id: "cleaning-clause",
        type: "Spécification à justifier",
        level: "Moyen",
        rule: "Proportionnalité de l’exigence",
        expected: "L’exigence doit être liée au besoin.",
        observed: "Un format de conditionnement unique est imposé.",
        evidence: "CPS — page 9",
        action: "Vérifier si plusieurs formats équivalents peuvent répondre au besoin.",
        page: 9,
        highlight: "Conditionnement obligatoire en flacon de 735 ml.",
        status: "pending",
      },
      {
        id: "cleaning-proof",
        type: "Preuve incomplète",
        level: "Faible",
        rule: "Traçabilité documentaire",
        expected: "La fiche technique doit identifier le produit offert.",
        observed: "La référence commerciale n’apparaît pas.",
        evidence: "Fiche technique — page 1",
        action: "Demander une fiche rattachable à l’offre.",
        page: 1,
        highlight: "Référence commerciale : non renseignée.",
        status: "requested",
      },
    ],
  },
  {
    id: "vehicles",
    title: "Maintenance des véhicules administratifs",
    score: 28,
    alerts: [
      {
        id: "vehicles-proof",
        type: "Pièce à compléter",
        level: "Faible",
        rule: "Complétude de la preuve",
        expected: "L’agrément doit couvrir la période du marché.",
        observed: "La date de validité est absente du scan.",
        evidence: "Agrément — page 1",
        action: "Demander une copie lisible et datée.",
        page: 1,
        highlight: "Date de validité : illisible sur le document transmis.",
        status: "confirmed",
      },
    ],
  },
  {
    id: "transport",
    title: "Prestations de transport de personnel",
    score: 18,
    alerts: [],
  },
];

const statusLabels: Record<AlertStatus, string> = {
  pending: "À valider",
  confirmed: "Confirmée",
  dismissed: "Écartée",
  requested: "Pièce demandée",
};

export default function Home() {
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [activeDossierId, setActiveDossierId] = useState(initialDossiers[0].id);
  const [activeAlertId, setActiveAlertId] = useState(initialDossiers[0].alerts[0].id);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeDossier = dossiers.find((item) => item.id === activeDossierId) ?? dossiers[0];
  const activeAlert =
    activeDossier.alerts.find((item) => item.id === activeAlertId) ?? activeDossier.alerts[0];

  const filteredDossiers = useMemo(() => {
    return dossiers.filter((dossier) => {
      const matchesQuery = dossier.title.toLowerCase().includes(query.toLowerCase());
      const hasPending = dossier.alerts.some((alert) => alert.status === "pending" || alert.status === "requested");
      const hasValidated = dossier.alerts.some((alert) => alert.status === "confirmed" || alert.status === "dismissed");
      const matchesTab = tab === "all" || (tab === "pending" ? hasPending : hasValidated);
      return matchesQuery && matchesTab;
    });
  }, [dossiers, query, tab]);

  const stats = useMemo(() => {
    const alerts = activeDossier.alerts;
    return {
      confirmed: alerts.filter((item) => item.status === "confirmed").length,
      pending: alerts.filter((item) => item.status === "pending" || item.status === "requested").length,
      dismissed: alerts.filter((item) => item.status === "dismissed").length,
      total: alerts.length,
    };
  }, [activeDossier]);

  function selectDossier(dossier: Dossier) {
    setActiveDossierId(dossier.id);
    setActiveAlertId(dossier.alerts[0]?.id ?? "");
  }

  function updateAlertStatus(status: AlertStatus) {
    if (!activeAlert) return;
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">A</div>
          <div>
            <strong>ATHAR</strong>
            <span>Public Procurement Control</span>
          </div>
        </div>

        <div className="market-title">
          <span>{activeDossier.title}</span>
          <span className="status-chip">À valider</span>
        </div>

        <div className="top-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot">3</span></button>
          <button className="icon-button" aria-label="Aide"><HelpCircle size={18} /></button>
          <button className="primary-button" onClick={() => setPreviewOpen(true)}>
            <FileCheck2 size={17} /> Générer la fiche de constat
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel dossier-panel">
          <div className="panel-title-row"><h2>Dossiers</h2></div>
          <div className="tabs" role="tablist" aria-label="Filtrer les dossiers">
            <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>Tous</button>
            <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>À valider</button>
            <button className={tab === "validated" ? "active" : ""} onClick={() => setTab("validated")}>Validés</button>
          </div>
          <div className="search-row">
            <label className="search-box">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un dossier…" />
            </label>
            <button className="icon-button compact" aria-label="Filtres"><Filter size={16} /></button>
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
                    <Bell size={13} /> {dossier.alerts.length} alerte{dossier.alerts.length > 1 ? "s" : ""}
                  </span>
                </div>
                <span className={`score score-${dossier.score >= 70 ? "high" : dossier.score >= 40 ? "medium" : "low"}`}>{dossier.score}</span>
              </button>
            ))}
          </div>
          <div className="panel-footer">{filteredDossiers.length} dossier{filteredDossiers.length > 1 ? "s" : ""}</div>
        </aside>

        <section className="panel document-panel">
          <div className="panel-title-row">
            <h2>Document</h2>
            {activeAlert && <span className="source-badge"><FileText size={14} /> {activeAlert.evidence}</span>}
          </div>
          <div className="pdf-toolbar">
            <button className="icon-button compact" aria-label="Page précédente"><ChevronLeft size={16} /></button>
            <span>Page {activeAlert?.page ?? 1} / 34</span>
            <button className="icon-button compact" aria-label="Page suivante"><ChevronRight size={16} /></button>
            <span className="toolbar-separator" />
            <button className="toolbar-text">−</button><span>100%</span><button className="toolbar-text">+</button>
          </div>
          <div className="pdf-stage">
            <div className="thumbnail-strip" aria-label="Pages voisines">
              {[10, 11, activeAlert?.page ?? 12, 13].map((page, index) => (
                <button key={`${page}-${index}`} className={index === 2 ? "thumbnail active" : "thumbnail"}>
                  <span className="thumb-lines" />
                  <small>{page}</small>
                </button>
              ))}
            </div>
            <article className="pdf-page">
              <p className="document-kicker">Section III. Instructions aux soumissionnaires (IS)</p>
              <h3>A. Instructions générales</h3>
              <h4>1. Portée de la soumission</h4>
              <p>Le Maître d’Ouvrage émet la présente demande de propositions et invite les soumissionnaires à présenter une offre fermée pour les biens et services décrits dans la liste des besoins.</p>
              <h4>2. Frais de soumission</h4>
              <p>Le soumissionnaire supportera les frais associés à la préparation et à la présentation de son offre, quelle que soit l’issue de la procédure.</p>
              <h4>3. Éligibilité des soumissionnaires</h4>
              <p>La présente demande de propositions s’adresse à tous les soumissionnaires des pays éligibles tels que définis dans les données particulières.</p>
              {activeAlert ? <mark>{activeAlert.highlight}</mark> : <p className="empty-state">Aucune alerte dans ce dossier.</p>}
              <h4>4. Matériaux, équipements et services conformes</h4>
              <p>Les biens et services doivent provenir de sources éligibles et répondre aux performances attendues dans les documents de consultation.</p>
            </article>
          </div>
        </section>

        <aside className="panel alert-panel">
          <div className="panel-title-row"><h2>Alerte</h2></div>
          {activeAlert ? (
            <>
              <div className="alert-heading">
                <AlertTriangle size={20} />
                <div><strong>{activeAlert.type}</strong><span>{statusLabels[activeAlert.status]}</span></div>
              </div>
              <dl className="alert-details">
                <div><dt>Type</dt><dd>{activeAlert.type}</dd></div>
                <div><dt>Niveau</dt><dd><span className={`level level-${activeAlert.level.toLowerCase()}`}>{activeAlert.level}</span></dd></div>
                <div><dt>Règle applicable</dt><dd>{activeAlert.rule}</dd></div>
                <div><dt>Attendu</dt><dd>{activeAlert.expected}</dd></div>
                <div><dt>Observé</dt><dd>{activeAlert.observed}</dd></div>
                <div><dt>Preuve</dt><dd><button className="evidence-link">{activeAlert.evidence}</button></dd></div>
                <div><dt>Action recommandée</dt><dd>{activeAlert.action}</dd></div>
              </dl>
              <div className="decision-actions">
                <button className="primary-button" onClick={() => updateAlertStatus("confirmed")}><Check size={17} /> Confirmer</button>
                <button className="secondary-button" onClick={() => updateAlertStatus("dismissed")}><CircleX size={17} /> Écarter</button>
                <button className="secondary-button full" onClick={() => updateAlertStatus("requested")}><MessageSquareText size={17} /> Demander une pièce</button>
              </div>
              <div className="alert-switcher">
                <span>Alertes du dossier</span>
                <div>
                  {activeDossier.alerts.map((alert) => (
                    <button
                      key={alert.id}
                      className={alert.id === activeAlert.id ? "alert-dot active" : "alert-dot"}
                      aria-label={`Ouvrir : ${alert.type}`}
                      onClick={() => setActiveAlertId(alert.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-alerts"><ShieldCheck size={36} /><strong>Aucune alerte</strong><span>Aucun écart prioritaire dans ce scénario fictif.</span></div>
          )}
        </aside>
      </section>

      <section className="output-panel">
        <div className="output-title"><h2>Sortie</h2><span>Résumé du dossier actif</span></div>
        <div className="stat-card"><ShieldCheck className="green" size={21} /><strong>{stats.confirmed}</strong><span>alerte{stats.confirmed > 1 ? "s" : ""} validée{stats.confirmed > 1 ? "s" : ""}</span></div>
        <div className="stat-card"><Clock3 className="orange" size={21} /><strong>{stats.pending}</strong><span>alerte{stats.pending > 1 ? "s" : ""} en cours</span></div>
        <div className="stat-card"><CircleX className="blue" size={21} /><strong>{stats.dismissed}</strong><span>alerte{stats.dismissed > 1 ? "s" : ""} écartée{stats.dismissed > 1 ? "s" : ""}</span></div>
        <div className="stat-card"><Bell className="red" size={21} /><strong>{stats.total}</strong><span>total des alertes</span></div>
        <button className="preview-button" onClick={() => setPreviewOpen(true)}><Eye size={18} /> Prévisualiser la fiche de constat</button>
      </section>

      {previewOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><span>Fiche de constat provisoire</span><h2 id="preview-title">{activeDossier.title}</h2></div>
              <button className="icon-button" onClick={() => setPreviewOpen(false)} aria-label="Fermer"><X size={18} /></button>
            </div>
            <div className="report-body">
              <p className="report-warning">Document de démonstration — aucune conclusion juridique automatique.</p>
              {activeDossier.alerts.filter((alert) => alert.status === "confirmed").length ? (
                activeDossier.alerts.filter((alert) => alert.status === "confirmed").map((alert, index) => (
                  <article key={alert.id} className="report-finding">
                    <span>Constat {index + 1}</span>
                    <h3>{alert.type}</h3>
                    <p>{alert.observed}</p>
                    <dl><dt>Règle</dt><dd>{alert.rule}</dd><dt>Preuve</dt><dd>{alert.evidence}</dd><dt>Suite proposée</dt><dd>{alert.action}</dd></dl>
                  </article>
                ))
              ) : (
                <p>Aucune alerte confirmée. Le contrôleur doit valider au moins une alerte avant génération.</p>
              )}
            </div>
            <div className="modal-footer"><span>Validation humaine requise avant export.</span><button className="primary-button" onClick={() => setPreviewOpen(false)}>Fermer l’aperçu</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
