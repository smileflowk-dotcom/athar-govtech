import type { Metadata } from "next";
import { LegalSection, LegalShell } from "../legal/LegalShell";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Cookies — ATHAR",
  description: "Informations relatives aux cookies du site ATHAR.",
};

export default function CookiesPage() {
  return (
    <LegalShell
      eyebrow="TRACEURS"
      title="Cookies"
      intro="Cette page présente la situation actuelle du site public ATHAR concernant les cookies et autres traceurs."
    >
      <LegalSection title="Qu’est-ce qu’un cookie ?">
        <p>Un cookie est un petit fichier ou identifiant enregistré ou lu par un site sur l’appareil utilisé pour consulter une page. Il peut servir au fonctionnement d’un service, à la mesure d’audience ou à d’autres finalités.</p>
      </LegalSection>

      <LegalSection title="Utilisation actuelle">
        <p>L’inspection du code actuel ne montre aucun outil d’analytics, pixel publicitaire, outil de mesure d’audience, gestionnaire de consentement ou autre traceur non essentiel ajouté à la landing ATHAR.</p>
        <p className={styles.legalNotice}>Aucun cookie publicitaire ou de mesure d’audience non essentiel n’est actuellement identifié dans la version publique du site.</p>
      </LegalSection>

      <LegalSection title="Pourquoi ?">
        <p>La version actuelle se limite à présenter le site et le démonstrateur. Aucun suivi publicitaire ou mesure d’audience non essentiel n’a été ajouté.</p>
      </LegalSection>

      <LegalSection title="Évolution possible">
        <p>Si un nouveau service ou un nouveau traceur est ajouté, sa finalité, son fonctionnement et les modalités d’information ou de consentement nécessaires devront être réévalués avant sa mise en ligne.</p>
        <p>Cette page sera alors mise à jour pour décrire précisément les outils réellement utilisés.</p>
      </LegalSection>
    </LegalShell>
  );
}
