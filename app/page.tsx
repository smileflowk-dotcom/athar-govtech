import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  FileSearch2,
  FileText,
  LockKeyhole,
  Scale,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import styles from "./landing.module.css";

type ProductWorkspaceProps = {
  compact?: boolean;
};

function ProductWorkspace({ compact = false }: ProductWorkspaceProps) {
  return (
    <div
      className={`${styles.productWindow} ${compact ? styles.productWindowCompact : ""}`}
      aria-label="Aperçu de l’espace ATHAR"
    >
      <div className={styles.windowBar}>
        <div className={styles.windowTitle}>
          <span className={styles.windowLogo}><ShieldCheck size={14} aria-hidden="true" /></span>
          <strong>ATHAR — Dossier actif</strong>
        </div>
        <span className={styles.windowStatus}><span /> Démonstrateur</span>
      </div>

      <div className={styles.productGrid}>
        <aside className={styles.productRail}>
          <span className={styles.productLabel}>PIÈCES DU DOSSIER</span>
          <div className={`${styles.productItem} ${styles.productItemActive}`}>
            <FileText size={13} aria-hidden="true" />
            <span><strong>CPS — page 6</strong><small>Clause technique</small></span>
          </div>
          <div className={styles.productItem}>
            <FileText size={13} aria-hidden="true" />
            <span><strong>Grille — page 17</strong><small>Notation des offres</small></span>
          </div>
          <div className={styles.productItem}>
            <FileText size={13} aria-hidden="true" />
            <span><strong>PV — page 18</strong><small>Attribution</small></span>
          </div>
          <span className={`${styles.productLabel} ${styles.productLabelSpaced}`}>POINTS À VÉRIFIER</span>
          <div className={styles.productIssue}>
            <span className={styles.issueMarker} />
            <span><strong>CTRL-ACC-01</strong><small>Clause potentiellement restrictive</small></span>
          </div>
        </aside>

        <section className={styles.productDocument} aria-label="Passage source">
          <div className={styles.documentTopline}><span>PIÈCE SOURCE</span><strong>CPS — page 6</strong></div>
          <div className={styles.paperSheet}>
            <span className={styles.paperKicker}>CAHIER DES PRESCRIPTIONS SPÉCIALES</span>
            <span className={styles.paperLine} />
            <span className={styles.paperLine} />
            <span className={`${styles.paperLine} ${styles.paperLineShort}`} />
            <p className={styles.paperHighlight}>« Le soumissionnaire doit être partenaire certifié agréé… »</p>
            <span className={styles.paperLine} />
            <span className={`${styles.paperLine} ${styles.paperLineShort}`} />
            <span className={styles.paperLine} />
            <span className={styles.sourceAnchor}><FileSearch2 size={12} aria-hidden="true" /> Passage source relié</span>
          </div>
        </section>

        <aside className={styles.productControl}>
          <span className={styles.productLabel}>POINT À VÉRIFIER</span>
          <h3>Clause technique</h3>
          <div className={styles.controlFact}><span>RÈGLE</span><p>Examiner les exigences susceptibles de limiter la concurrence.</p></div>
          <div className={styles.controlFact}><span>ATTENDU</span><p>Spécifications proportionnées et ouvertes.</p></div>
          <div className={styles.controlFact}><span>OBSERVÉ</span><p>Exigence de certification nominative.</p></div>
          <div className={styles.decisionBar}><UserCheck size={13} aria-hidden="true" /> Décision du contrôleur</div>
        </aside>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className={styles.page} id="contenu">
      <a className={styles.skipLink} href="#contenu">Aller au contenu</a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Accueil ATHAR">
            <span className={styles.brandMark}><ShieldCheck size={19} aria-hidden="true" /></span>
            <span className={styles.brandText}><strong>ATHAR</strong><small>Chaque alerte mène à sa preuve</small></span>
          </Link>
          <nav className={styles.nav} aria-label="Navigation principale">
            <a href="#enjeu">Enjeu</a>
            <a href="#approche">Approche</a>
            <a href="#workspace">Espace produit</a>
            <a href="#preuve">Preuves</a>
            <a href="#souverainete">Souveraineté</a>
            <Link href="/v3" className={styles.navDemo}>Ouvrir le démonstrateur <ArrowRight size={14} aria-hidden="true" /></Link>
          </nav>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>CONTRÔLE PUBLIC SOUVERAIN</span>
          <h1 id="hero-title">Des contrôles publics souverains, traçables et validés par l’humain</h1>
          <p className={styles.heroLead}>ATHAR aide les institutions publiques à examiner des dossiers complexes, retrouver les preuves utiles et documenter chaque contrôle de manière traçable et souveraine.</p>
          <div className={styles.heroActions}>
            <Link href="/v3" className={styles.primaryButton}>Ouvrir le démonstrateur <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href="#approche" className={styles.secondaryButton}>Voir le parcours</a>
          </div>
          <div className={styles.trustRow} aria-label="Principes ATHAR">
            <span><CheckCircle2 size={14} aria-hidden="true" /> Preuves reliées aux sources</span>
            <span><CheckCircle2 size={14} aria-hidden="true" /> Contrôles explicites</span>
            <span><CheckCircle2 size={14} aria-hidden="true" /> Décision humaine</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <ProductWorkspace />
          <p className={styles.visualCaption}><span>ESPACE PRODUIT</span> Un espace de contrôle centré sur le dossier</p>
        </div>
      </section>

      <section className={styles.signature} aria-label="Principe ATHAR">
        <div className={styles.signatureInner}>
          <span className={styles.signatureIndex}>01</span>
          <strong>Chaque alerte mène à sa preuve</strong>
          <p>Le signal ouvre une vérification. La décision reste au contrôleur.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.problemSection}`} id="enjeu" aria-labelledby="enjeu-title">
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>ENJEU</span><h2 id="enjeu-title">Un chemin vérifiable pour chaque contrôle</h2></div>
          <p>Les pièces, les données et les procès-verbaux doivent être rapprochés avant de confirmer un point. ATHAR réduit cette dispersion et conserve le lien avec les sources.</p>
        </div>
        <div className={styles.problemGrid}>
          <article className={styles.problemCard}>
            <span className={styles.cardIcon}><LayersIcon /></span>
            <h3>Sources dispersées</h3>
            <p>Le contrôleur passe d’une pièce à l’autre pour reconstituer le contexte utile au dossier.</p>
          </article>
          <article className={styles.problemCard}>
            <span className={styles.cardIcon}><Scale size={18} aria-hidden="true" /></span>
            <h3>Rapprochement</h3>
            <p>Règle, attendu et observé sont comparés sans perdre la provenance de l’information.</p>
          </article>
          <article className={styles.problemCard}>
            <span className={styles.cardIcon}><FileCheck2 size={18} aria-hidden="true" /></span>
            <h3>Justification</h3>
            <p>Chaque constat reste relié à la pièce et au passage qui le fondent.</p>
          </article>
        </div>
        <p className={styles.cautionNote}><CheckCircle2 size={15} aria-hidden="true" /> Une pièce manquante n’est pas une anomalie : elle doit être signalée séparément.</p>
      </section>

      <section className={`${styles.section} ${styles.approachSection}`} id="approche" aria-labelledby="approche-title">
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>APPROCHE</span><h2 id="approche-title">De la pièce à la décision</h2></div>
          <p>ATHAR organise le contrôle autour du dossier, des points à vérifier et des preuves nécessaires à la décision.</p>
        </div>
        <ol className={styles.flow}>
          <li><span className={styles.flowNumber}>01</span><BookOpen size={19} aria-hidden="true" /><h3>Regrouper</h3><p>Réunir les pièces et conserver leur provenance</p></li>
          <li><span className={styles.flowNumber}>02</span><Scale size={19} aria-hidden="true" /><h3>Contrôler</h3><p>Appliquer les contrôles utiles au contexte du dossier</p></li>
          <li><span className={styles.flowNumber}>03</span><FileSearch2 size={19} aria-hidden="true" /><h3>Prouver</h3><p>Revenir à la source, à la page et au passage utile</p></li>
          <li><span className={styles.flowNumber}>04</span><UserCheck size={19} aria-hidden="true" /><h3>Valider</h3><p>Confirmer, écarter ou demander une pièce</p></li>
        </ol>
      </section>

      <section className={`${styles.section} ${styles.workspaceSection}`} id="workspace" aria-labelledby="workspace-title">
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>ESPACE PRODUIT</span><h2 id="workspace-title">Un espace conçu autour du dossier</h2></div>
          <p>Les pièces, le point à vérifier, la règle et la source restent visibles dans un même contexte de travail.</p>
        </div>
        <div className={styles.workspaceShowcase}>
          <div className={styles.workspaceProduct}><ProductWorkspace compact /></div>
          <div className={styles.workspaceCopy}>
            <span className={styles.featureNumber}>02</span>
            <h3>Tout le contrôle dans un même contexte</h3>
            <p>À gauche, les pièces et les points à vérifier. Au centre, la source. À droite, la règle, l’attendu, l’observé et la décision.</p>
            <ul className={styles.featureList}>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Pièces du dossier</li>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Points à vérifier</li>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Passage source relié</li>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Décision du contrôleur</li>
            </ul>
            <Link href="/v3" className={styles.primaryButton}>Ouvrir le démonstrateur <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.evidenceSection} id="preuve" aria-labelledby="preuve-title">
        <div className={styles.evidenceInner}>
          <div className={styles.sectionIntroDark}>
            <div><span className={styles.eyebrowDark}>PREUVES & TRAÇABILITÉ</span><h2 id="preuve-title">Chaque alerte mène à sa preuve</h2></div>
            <p>ATHAR montre ce qui déclenche le signal, où retrouver la source et ce qu’il manque pour décider.</p>
          </div>
          <div className={styles.evidenceLayout}>
            <div className={styles.evidenceCard}>
              <div className={styles.evidenceCardTop}><span className={styles.evidenceState}><CheckCircle2 size={13} aria-hidden="true" /> Preuve retrouvée</span><span>CTRL-ACC-01</span></div>
              <span className={styles.evidenceLabel}>Passage source relié</span>
              <p>« Le soumissionnaire doit être partenaire certifié agréé… »</p>
              <div className={styles.evidenceMeta}><span><FileText size={13} aria-hidden="true" /> CPS fictif · Page 6</span></div>
            </div>
            <div className={styles.evidenceChain} aria-label="Chaîne de traçabilité">
              <div><span>01</span><strong>Source</strong><small>Pièce</small></div>
              <div><span>02</span><strong>Localisation</strong><small>Page / passage</small></div>
              <div><span>03</span><strong>Contrôle</strong><small>Règle</small></div>
              <div><span>04</span><strong>Décision</strong><small>Validation humaine</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.humanSection}`} aria-labelledby="humain-title">
        <div className={styles.humanLayout}>
          <div className={styles.humanCopy}>
            <span className={styles.eyebrow}>CONTRÔLE HUMAIN</span>
            <h2 id="humain-title">ATHAR signale, le contrôleur décide</h2>
            <p>Aucun point signalé par ATHAR ne devient automatiquement un constat. Le contrôleur peut confirmer, écarter, demander une pièce ou laisser le point en attente.</p>
            <p className={styles.smallNote}>Chaque décision reste reliée aux éléments examinés.</p>
          </div>
          <div className={styles.decisionCard}>
            <div className={styles.decisionCardHeader}><span>POINT À VÉRIFIER</span><strong>À examiner</strong></div>
            <h3>Clause technique</h3>
            <p>Le passage source et la règle sont visibles avant toute action.</p>
            <div className={styles.decisionNote}><span>DÉCISION DU CONTRÔLEUR</span><small>Justification requise</small></div>
            <div className={styles.decisionActions}><span className={styles.decisionPrimary}><UserCheck size={14} aria-hidden="true" /> Confirmer</span><span>Demander une pièce</span><span>Écarter</span></div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sovereigntySection}`} id="souverainete" aria-labelledby="souverainete-title">
        <div className={styles.sovereigntyLayout}>
          <div>
            <span className={styles.eyebrow}>SOUVERAINETÉ</span>
            <h2 id="souverainete-title">L’institution garde la maîtrise</h2>
            <p>ATHAR est conçu pour fonctionner dans l’environnement autorisé par l’institution. Dans le scénario on-premise cible, les documents, preuves, décisions et livrables restent dans le périmètre défini avec la DSI.</p>
          </div>
          <div className={styles.boundaryCard} aria-label="Déploiement institutionnel">
            <div className={styles.boundaryHeader}><span className={styles.boundaryTag}><Server size={14} aria-hidden="true" /> Scénario cible</span><span>Environnement autorisé</span></div>
            <div className={styles.boundaryFlow}>
              <div><FileText size={17} aria-hidden="true" /><strong>Documents</strong><small>Sources sensibles</small></div>
              <span className={styles.boundaryArrow}>→</span>
              <div><ShieldCheck size={17} aria-hidden="true" /><strong>ATHAR</strong><small>Contrôle local</small></div>
              <span className={styles.boundaryArrow}>→</span>
              <div><UserCheck size={17} aria-hidden="true" /><strong>Décision</strong><small>Validation humaine</small></div>
            </div>
            <div className={styles.boundaryFooter}><LockKeyhole size={14} aria-hidden="true" /> Périmètre et modalités à définir avec la DSI</div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.useCasesSection}`} aria-labelledby="cas-title">
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>CAS D’USAGE</span><h2 id="cas-title">Un socle pour plusieurs contrôles publics</h2></div>
          <p>La commande publique est le premier cas démontré. Les autres usages sont cadrés avec chaque institution selon ses règles, ses sources et ses livrables.</p>
        </div>
        <div className={styles.useCasesGrid}>
          <article className={`${styles.useCaseCard} ${styles.useCaseActive}`}>
            <div className={styles.useCaseTop}><span className={styles.useCaseStatus}>Démontré</span><Scale size={19} aria-hidden="true" /></div>
            <h3>Commande publique</h3>
            <p>Examiner la mise en concurrence, l’évaluation des offres et l’attribution.</p>
            <div className={styles.useCaseTags}><span>Données fictives</span></div>
          </article>
          <article className={styles.useCaseCard}>
            <div className={styles.useCaseTop}><span className={styles.useCaseStatusMuted}>À cadrer</span><FileSearch2 size={19} aria-hidden="true" /></div>
            <h3>Contrôles documentaires</h3>
            <p>Adapter ATHAR à des contrôles fondés sur des règles et des sources définies par l’institution.</p>
          </article>
          <article className={styles.useCaseCard}>
            <div className={styles.useCaseTop}><span className={styles.useCaseStatusMuted}>À cadrer</span><FileCheck2 size={19} aria-hidden="true" /></div>
            <h3>Revues administratives</h3>
            <p>Examiner des dossiers où chaque décision doit rester reliée aux faits et aux pièces.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.whySection}`} aria-labelledby="why-title">
        <div className={styles.sectionIntro}>
          <div><span className={styles.eyebrow}>POURQUOI ATHAR</span><h2 id="why-title">Contrôler plus vite sans sacrifier la preuve</h2></div>
          <p>ATHAR réunit les éléments essentiels d’un contrôle professionnel sans retirer au contrôleur la maîtrise de la décision.</p>
        </div>
        <div className={styles.principlesGrid}>
          <article><span className={styles.principleIcon}><FileSearch2 size={18} aria-hidden="true" /></span><h3>Preuve avant conclusion</h3><p>Le passage source reste accessible au moment d’examiner le signal.</p></article>
          <article><span className={styles.principleIcon}><Scale size={18} aria-hidden="true" /></span><h3>Contrôles explicites</h3><p>Le contrôleur voit la règle, l’attendu et l’observé.</p></article>
          <article><span className={styles.principleIcon}><UserCheck size={18} aria-hidden="true" /></span><h3>Responsabilité humaine</h3><p>ATHAR prépare et documente, la personne habilitée décide.</p></article>
          <article><span className={styles.principleIcon}><LockKeyhole size={18} aria-hidden="true" /></span><h3>Déploiement maîtrisé</h3><p>Le déploiement s’adapte à l’environnement autorisé par l’institution.</p></article>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-title">
        <div className={styles.finalCtaInner}>
          <div><span className={styles.eyebrowDark}>DÉMONSTRATEUR</span><h2 id="final-title">Examinez le dossier, suivez la preuve, décidez</h2><p>Le démonstrateur présente un dossier d’exemple et le parcours complet : point à vérifier, règle, preuve, décision humaine et fiche de constat provisoire.</p></div>
          <div className={styles.finalCtaAction}><Link href="/v3" className={styles.lightButton}>Ouvrir le démonstrateur <ArrowRight size={16} aria-hidden="true" /></Link><span><CheckCircle2 size={14} aria-hidden="true" /> Données fictives · validation humaine requise</span></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.footerBrand}><span className={styles.footerMark}><ShieldCheck size={15} aria-hidden="true" /></span><span><strong>ATHAR</strong><small>Chaque alerte mène à sa preuve</small></span></Link>
          <nav className={styles.footerNav} aria-label="Navigation secondaire"><a href="#approche">Approche</a><a href="#preuve">Preuves</a><a href="#souverainete">Souveraineté</a><Link href="/v3">Démonstrateur</Link><span className={styles.footerLegalNav} role="group" aria-label="Informations légales"><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/cookies">Cookies</Link><Link href="/accessibilite">Accessibilité</Link></span></nav>
          <p>Solution GovTech pour le contrôle public<br /><span>Démonstrateur fonctionnel · données fictives</span></p>
        </div>
      </footer>
    </main>
  );
}

function LayersIcon() {
  return <span className={styles.layersIcon} aria-hidden="true"><span /><span /><span /></span>;
}
