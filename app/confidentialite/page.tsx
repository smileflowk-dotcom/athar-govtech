import type { Metadata } from "next";
import { LegalSection, LegalShell } from "../legal/LegalShell";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Politique de confidentialité — ATHAR",
  description: "Politique de confidentialité du site ATHAR.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="DONNÉES"
      title="Politique de confidentialité"
      intro="Cette page décrit de manière prudente les principes applicables au site public ATHAR et les points qui devront être définis avec l’institution utilisatrice pour un environnement de contrôle."
    >
      <LegalSection title="Objet de la politique">
        <p>La présente politique concerne le site public et le démonstrateur ATHAR. Elle ne remplace pas la documentation qui devra encadrer un déploiement institutionnel ou un traitement de données réelles.</p>
      </LegalSection>

      <LegalSection title="Données concernées">
        <p>Le démonstrateur public utilise des données fictives. Aucune donnée réelle de dossier sensible ne doit y être déposée.</p>
        <p>Les catégories de données éventuellement traitées dans un environnement institutionnel devront être définies avec l’institution utilisatrice avant tout usage réel.</p>
      </LegalSection>

      <LegalSection title="Finalités">
        <p>Les finalités pouvant être envisagées sont la mise à disposition du site et du démonstrateur, la sécurité du service et, si un canal est créé, la réponse aux demandes adressées à ATHAR.</p>
        <p>Tout traitement supplémentaire devra être décrit avant sa mise en œuvre.</p>
      </LegalSection>

      <LegalSection title="Base et cadre de traitement">
        <p>Aucune base légale précise n’est déclarée ici pour un traitement qui n’est pas identifié dans le site actuel. Chaque traitement devra être documenté selon sa finalité, son contexte et les responsabilités de l’institution concernée.</p>
        <p>Les modalités de traitement en environnement institutionnel doivent être définies avec l’institution utilisatrice.</p>
      </LegalSection>

      <LegalSection title="Conservation">
        <p>Aucune durée précise de conservation n’est arrêtée dans cette politique. Elle devra être définie pour chaque traitement, selon sa finalité, son environnement et les règles applicables.</p>
      </LegalSection>

      <LegalSection title="Destinataires">
        <p>ATHAR n’a pas vocation à vendre les données personnelles.</p>
        <p>Les destinataires éventuels des données devront être identifiés avant tout traitement réel et limités à ce qui est nécessaire à la finalité déclarée.</p>
      </LegalSection>

      <LegalSection title="Sous-traitants éventuels">
        <p>Les éventuels sous-traitants techniques, leurs rôles et les conditions de leurs interventions devront être vérifiés et documentés avant un déploiement institutionnel.</p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>ATHAR est conçu avec une attention portée à la maîtrise du périmètre documentaire et à la séparation entre le démonstrateur public et un éventuel environnement institutionnel.</p>
        <p>Aucune certification de sécurité, homologation ou conformité particulière n’est revendiquée par cette page. Les mesures applicables devront être définies avec l’institution et sa DSI.</p>
      </LegalSection>

      <LegalSection title="Droits des personnes">
        <p>Selon le traitement concerné et les conditions applicables, les personnes peuvent notamment disposer de droits d’accès, de rectification, d’effacement lorsque celui-ci est applicable, de limitation et d’opposition lorsque celle-ci est applicable.</p>
        <p>Les modalités pratiques d’exercice de ces droits et l’interlocuteur compétent doivent être précisés avant la mise en œuvre d’un traitement réel.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p className={styles.legalNotice}>Coordonnées de contact à compléter avant mise en production publique.</p>
      </LegalSection>

      <LegalSection title="Mise à jour de la politique">
        <p>Cette politique pourra être mise à jour lorsque le périmètre du site, du démonstrateur ou d’un éventuel déploiement institutionnel évoluera.</p>
        <p className={styles.legalNotice}>Date de mise à jour à compléter avant mise en production publique.</p>
      </LegalSection>
    </LegalShell>
  );
}
