import type { Metadata } from "next";
import { LegalSection, LegalShell } from "../legal/LegalShell";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Accessibilité — ATHAR",
  description: "Engagement d’ATHAR en faveur d’une interface accessible.",
};

export default function AccessibilityPage() {
  return (
    <LegalShell
      eyebrow="ACCÈS"
      title="Accessibilité"
      intro="ATHAR est conçu avec une attention portée à l’accessibilité et à la compréhension de l’interface par des utilisateurs aux besoins différents."
    >
      <LegalSection title="Engagement">
        <p>La structure et les contenus sont conçus pour rester lisibles, compréhensibles et utilisables dans les différents contextes de consultation du site.</p>
      </LegalSection>

      <LegalSection title="Structure sémantique">
        <p>Les pages utilisent une structure sémantique avec des titres hiérarchisés, des zones de navigation identifiées et des liens nommés pour faciliter la compréhension du contenu.</p>
      </LegalSection>

      <LegalSection title="Navigation au clavier">
        <p>Les liens et les éléments interactifs sont prévus pour pouvoir être parcourus au clavier. Un lien d’accès direct au contenu est proposé sur les pages concernées.</p>
      </LegalSection>

      <LegalSection title="Lisibilité et contrastes">
        <p>La hiérarchie visuelle, la taille des textes, les contrastes et les états de focus font l’objet d’une attention particulière dans l’interface.</p>
      </LegalSection>

      <LegalSection title="Responsive">
        <p>Le site est conçu pour s’adapter aux écrans desktop et mobiles, avec une attention portée aux espacements, aux titres et aux zones de toucher.</p>
      </LegalSection>

      <LegalSection title="État de conformité">
        <p className={styles.legalNotice}>ATHAR est conçu avec une attention portée à l’accessibilité. Un audit formel reste à réaliser avant toute déclaration de conformité.</p>
      </LegalSection>

      <LegalSection title="Signaler une difficulté">
        <p>Si vous rencontrez une difficulté d’accès ou de navigation, elle pourra être signalée via le point de contact officiel du projet lorsqu’il sera publié.</p>
        <p className={styles.legalNotice}>Coordonnées de contact à compléter avant mise en production publique.</p>
      </LegalSection>
    </LegalShell>
  );
}
