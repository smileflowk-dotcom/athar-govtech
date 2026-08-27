import type { Metadata } from "next";
import { LegalSection, LegalShell } from "../legal/LegalShell";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Mentions légales — ATHAR",
  description: "Mentions légales du site ATHAR.",
};

export default function LegalNoticePage() {
  return (
    <LegalShell
      eyebrow="INFORMATIONS"
      title="Mentions légales"
      intro="Cette page présente les informations disponibles concernant le site public ATHAR. Les éléments d’identification manquants doivent être complétés avant toute mise en production publique."
    >
      <LegalSection title="Éditeur du site">
        <p>Le site est édité sous le nom ATHAR, projet de démonstration GovTech.</p>
        <p className={styles.legalNotice}>Information à compléter avant mise en production publique.</p>
      </LegalSection>

      <LegalSection title="Responsable de la publication">
        <p className={styles.legalNotice}>Information à compléter avant mise en production publique.</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>Le site public est actuellement déployé sur Vercel pour sa mise à disposition en ligne.</p>
        <p>Les informations d’identification et les coordonnées de l’hébergeur à afficher dans la version publique doivent être vérifiées et complétées avant publication.</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>Les contenus, éléments graphiques et logiciels présentés sur le site ATHAR sont susceptibles d’être protégés par des droits de propriété intellectuelle. Les conditions de réutilisation doivent être vérifiées avant toute reproduction ou diffusion.</p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>Le site présente un démonstrateur fonctionnel et des données fictives. Il ne constitue ni un avis juridique, ni une décision de contrôle, ni une garantie de disponibilité ou de capacité de production.</p>
        <p>Les contrôles et les informations présentés doivent être interprétés dans leur contexte et validés par une personne habilitée.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p className={styles.legalNotice}>Information à compléter avant mise en production publique.</p>
      </LegalSection>
    </LegalShell>
  );
}
