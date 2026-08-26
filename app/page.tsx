import Link from "next/link";
import { ArrowRight, CheckCircle2, FileSearch2, ShieldCheck } from "lucide-react";
import styles from "./landing.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="ATHAR — accueil">
          <span className={styles.mark}><ShieldCheck size={19} /></span>
          <span><strong>ATHAR</strong><span>Chaque alerte mène à sa preuve.</span></span>
        </Link>
        <nav className={styles.nav} aria-label="Navigation principale">
          <a href="#approche">Approche</a>
          <a href="#preuve">Preuve</a>
          <Link className={styles.demo} href="/v3">Ouvrir le démonstrateur</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>GovTech · Contrôle de la commande publique</span>
          <h1>Du signal à la preuve, sans perdre le contrôleur.</h1>
          <p>
            ATHAR rapproche les pièces d’un marché, applique des contrôles explicables et conduit le contrôleur jusqu’aux éléments qui fondent sa décision. Le système signale. L’humain valide.
          </p>
          <div className={styles.actions}>
            <Link href="/v3" className={styles.primary}>Explorer le PoC <ArrowRight size={16} /></Link>
            <a href="#approche" className={styles.secondary}>Comprendre l’approche</a>
          </div>
          <div className={styles.trust}>
            <span><CheckCircle2 size={14} /> Provenance conservée</span>
            <span><CheckCircle2 size={14} /> Contrôles explicables</span>
            <span><CheckCircle2 size={14} /> Validation humaine</span>
          </div>
        </div>

        <div className={styles.workbench} aria-label="Aperçu du poste de contrôle ATHAR">
          <div className={styles.frame}>
            <div className={styles.frameTop}><strong>ATHAR · Dossier actif</strong><span>Contrôle en cours</span></div>
            <div className={styles.workspace}>
              <aside className={styles.rail}>
                <span className={styles.tinyLabel}>PIÈCES</span>
                <div className={`${styles.item} ${styles.itemActive}`}><strong>CPS · page 6</strong><span>Clause technique</span></div>
                <div className={styles.item}><strong>Grille · page 17</strong><span>Notation des offres</span></div>
                <div className={styles.item}><strong>PV · page 18</strong><span>Attribution</span></div>
                <span className={styles.tinyLabel} style={{display:"block",marginTop:20}}>POINTS À VÉRIFIER</span>
                <div className={styles.item}><strong>CTRL-ACC-01</strong><span>Clause potentiellement restrictive</span></div>
              </aside>
              <section className={styles.document}>
                <div className={styles.paper}>
                  <div className={styles.line} /><div className={styles.line} /><div className={`${styles.line} ${styles.lineShort}`} />
                  <div className={styles.highlight}>« Le soumissionnaire doit être partenaire certifié agréé… »</div>
                  <div className={styles.line} /><div className={`${styles.line} ${styles.lineShort}`} /><div className={styles.line} />
                </div>
              </section>
              <aside className={styles.control}>
                <span className={styles.tinyLabel}>POINT À VÉRIFIER</span>
                <h3>Clause technique</h3>
                <div className={styles.fact}><strong>RÈGLE</strong><p>Examiner les exigences susceptibles de limiter la concurrence.</p></div>
                <div className={styles.fact}><strong>ATTENDU</strong><p>Spécifications proportionnées et ouvertes.</p></div>
                <div className={styles.fact}><strong>OBSERVÉ</strong><p>Exigence de certification nominative.</p></div>
                <div className={styles.decision}>Décision du contrôleur</div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.principle}>
        <div className={styles.principleBox}>
          <strong>Chaque alerte mène à sa preuve.</strong>
          <p>ATHAR n’automatise pas un verdict. Il rend le contrôle plus rapide, traçable et vérifiable en reliant chaque signal à sa règle, son attendu, son observé et ses sources.</p>
        </div>
      </section>

      <section className={styles.section} id="approche">
        <div className={styles.sectionHead}>
          <div><span className={styles.eyebrow}>PARCOURS DE CONTRÔLE</span><h2>Un dossier. Une chaîne de preuve. Une décision humaine.</h2></div>
          <p>Le poste de travail est conçu autour du dossier de contrôle, pas autour d’un tableau de bord générique. Les pièces, les points à vérifier et la preuve restent visibles dans le même contexte.</p>
        </div>
        <div className={styles.steps}>
          <article className={styles.step}><span className={styles.number}>01</span><h3>Regrouper</h3><p>Importer et organiser les pièces du dossier tout en conservant leur provenance.</p></article>
          <article className={styles.step}><span className={styles.number}>02</span><h3>Contrôler</h3><p>Appliquer des contrôles explicites et distinguer l’attendu de l’observé.</p></article>
          <article className={styles.step}><span className={styles.number}>03</span><h3>Prouver</h3><p>Revenir à la pièce, la page et au passage utile, y compris dans un rapprochement multisource.</p></article>
          <article className={styles.step}><span className={styles.number}>04</span><h3>Valider</h3><p>Confirmer, écarter ou demander une pièce avant d’alimenter les livrables.</p></article>
        </div>
      </section>

      <section className={styles.evidence} id="preuve">
        <div className={styles.evidenceInner}>
          <span className={styles.eyebrow}>EVIDENCE ENGINE</span>
          <div className={styles.evidenceGrid}>
            <h2>La preuve est un objet de travail, pas une note de bas de page.</h2>
            <div>
              <p>Une preuve ATHAR reste reliée à sa source, sa localisation et au point de contrôle qui l’utilise. Le rapprochement entre plusieurs pièces permet de rendre visibles les incohérences sans masquer le chemin documentaire.</p>
              <div className={styles.chain}>
                <div><FileSearch2 size={16} /><strong>Source</strong><span>Pièce originale</span></div>
                <div><strong>Localisation</strong><span>Page / passage</span></div>
                <div><strong>Contrôle</strong><span>Règle explicite</span></div>
                <div><strong>Décision</strong><span>Validation humaine</span></div>
                <div><strong>Historique</strong><span>Trace conservée</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.final}>
        <span className={styles.eyebrow}>PROTOTYPE FONCTIONNEL</span>
        <h2>Voir le parcours complet dans le poste de contrôle ATHAR.</h2>
        <p>Le démonstrateur présente un dossier fictif complet et permet d’explorer le chemin du point à vérifier jusqu’à la preuve et au livrable.</p>
        <Link href="/v3" className={styles.primary}>Ouvrir ATHAR <ArrowRight size={16} /></Link>
      </section>

      <footer className={styles.footer}>
        <span>ATHAR · GovTech public procurement control</span>
        <span>Prototype de démonstration · décision humaine requise</span>
      </footer>
    </main>
  );
}
