import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./legal.module.css";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.legalSection}>
      <h2>{title}</h2>
      <div className={styles.legalSectionBody}>{children}</div>
    </section>
  );
}

export function LegalShell({ eyebrow, title, intro, children }: LegalShellProps) {
  return (
    <div className={styles.legalPage}>
      <a className={styles.skipLink} href="#contenu">Aller au contenu</a>

      <header className={styles.legalHeader}>
        <Link href="/" className={styles.legalBrand} aria-label="Accueil ATHAR">
          <span className={styles.legalMark}><ShieldCheck size={18} aria-hidden="true" /></span>
          <span className={styles.legalBrandText}><strong>ATHAR</strong><small>Chaque alerte mène à sa preuve</small></span>
        </Link>
        <Link href="/" className={styles.backLink}><ArrowLeft size={14} aria-hidden="true" /> Retour à l’accueil</Link>
      </header>

      <main id="contenu" className={styles.legalContent}>
        <span className={styles.legalEyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p className={styles.legalLead}>{intro}</p>
        <div className={styles.legalSections}>{children}</div>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.legalFooterInner}>
          <Link href="/" className={styles.legalFooterBrand}>
            <span className={styles.legalFooterMark}><ShieldCheck size={14} aria-hidden="true" /></span>
            <span><strong>ATHAR</strong><small>Chaque alerte mène à sa preuve</small></span>
          </Link>
          <nav className={styles.legalFooterNav} aria-label="Navigation légale">
            <Link href="/">Accueil</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/accessibilite">Accessibilité</Link>
            <Link href="/v3">Démonstrateur</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
