# ATHAR — Bloc 6 Industrialisation, sécurité et déploiement institutionnel

## Objectif
Décrire le cadre d’industrialisation d’ATHAR pour un environnement CDC/CRC sans exposer l’architecture détaillée, les choix de sécurité opérationnels internes ni les mécanismes propriétaires.

ATHAR est conçu pour évoluer d’un démonstrateur fonctionnel vers une plateforme institutionnelle gouvernée, traçable et exploitable dans un environnement maîtrisé.

## Principes directeurs
- Déploiement compatible environnement institutionnel et on-premise.
- Maîtrise de la localisation des données et des flux.
- Accès strictement limité selon les responsabilités.
- Traçabilité des actions et des décisions.
- Séparation entre assistance automatisée et décision humaine.
- Administration contrôlée des règles et paramètres métier.
- Réduction des dépendances externes obligatoires.
- Réversibilité des composants techniques lorsque cela est nécessaire.

## Déploiement
Le scénario cible peut être adapté aux contraintes de la CDC/CRC :
- infrastructure on-premise ;
- cloud privé ou environnement souverain validé ;
- réseau isolé ou à connectivité restreinte ;
- services documentaires locaux ;
- composants IA locaux ou externes uniquement lorsque leur usage est explicitement autorisé.

L’architecture finale est définie avec les équipes métier et DSI à partir des exigences de sécurité, de volumétrie, de disponibilité et d’intégration.

## Confidentialité et données
ATHAR applique un principe de minimisation : seules les données nécessaires au traitement sont utilisées.

Le cadre cible prévoit :
- conservation contrôlée des documents et données extraites ;
- séparation logique des dossiers ;
- limitation des exports ;
- politique de rétention configurable ;
- suppression maîtrisée ;
- absence d’envoi externe par défaut des documents sensibles dans le scénario on-premise ;
- journalisation des opérations pertinentes.

## Gestion des accès
Le modèle d’accès institutionnel doit pouvoir distinguer, selon les besoins :
- contrôleurs ;
- validateurs ;
- responsables métier ;
- administrateurs fonctionnels ;
- administrateurs techniques ;
- profils en lecture seule ou audit.

Les autorisations portent sur les fonctions et, lorsque nécessaire, sur le périmètre des dossiers accessibles.

ATHAR n’impose pas publiquement un modèle RBAC figé : le modèle final est aligné sur l’organisation réelle de la CDC/CRC.

## Authentification
Le scénario d’industrialisation prévoit une intégration possible avec les mécanismes d’identité retenus par la DSI, par exemple :
- annuaire institutionnel ;
- SSO ;
- authentification renforcée ;
- politiques de session et de révocation adaptées.

Le mécanisme exact est décidé avec la DSI et n’est pas présupposé par le démonstrateur.

## Traçabilité et audit
Les actions critiques doivent pouvoir être retracées :
- accès à un dossier ;
- ajout ou modification de pièces ;
- lancement ou relance d’un contrôle ;
- consultation d’une preuve ;
- décision humaine ;
- commentaire ou demande de pièce ;
- génération et export d’un livrable ;
- modification administrative d’un paramètre ou d’une règle autorisée.

Les journaux doivent être exploitables pour l’audit sans exposer inutilement le contenu sensible.

## Administration métier
L’objectif est de permettre à terme une gouvernance maîtrisée des contrôles sans modifier le code applicatif pour chaque évolution métier.

Le cadre cible prévoit :
- catalogue de contrôles ;
- activation/désactivation selon le contexte ;
- versionnement ;
- historique des changements ;
- séparation entre préparation, validation et mise en production lorsque cela est requis ;
- documentation de la règle applicable.

La structure interne des règles, seuils, dépendances et mécanismes d’exécution reste confidentielle.

## IA et composants externes
L’IA générative n’est pas une condition nécessaire à la décision de contrôle.

Lorsqu’elle est utilisée, elle sert uniquement des fonctions d’assistance telles que :
- recherche dans un corpus ;
- aide à la lecture ;
- rapprochement documentaire ;
- reformulation ou synthèse contrôlée.

Elle ne prononce pas seule une qualification juridique, une irrégularité ou une conclusion de contrôle.

Le scénario institutionnel peut fonctionner avec des modèles locaux, des services autorisés ou sans composant génératif pour certaines fonctions.

## Robustesse opérationnelle
L’industrialisation doit couvrir notamment :
- traitement de lots importants ;
- files d’attente et reprise après erreur ;
- suivi des traitements ;
- gestion explicite des documents non traités ou à vérifier ;
- sauvegarde et restauration ;
- supervision ;
- montée en charge selon la volumétrie réelle ;
- dégradation contrôlée lorsque certains composants ne sont pas disponibles.

Les choix précis de dimensionnement seront établis à partir des volumes réels fournis par la CDC/CRC.

## Intégration SI
ATHAR est conçu pour pouvoir s’insérer dans un environnement existant plutôt que d’imposer un système parallèle fermé.

Selon les interfaces disponibles et autorisées, les intégrations peuvent concerner :
- données structurées de marchés ;
- dépôts documentaires ;
- référentiels métier ;
- annuaires ;
- outils de reporting ;
- systèmes d’archivage ;
- APIs institutionnelles.

Les connecteurs et modalités finales sont définis après cartographie du SI cible.

## Continuité et réversibilité
Le cadre d’industrialisation privilégie des composants remplaçables et des formats de données exploitables afin de réduire la dépendance à un fournisseur unique.

Les documents sources, preuves, décisions et livrables restent les actifs principaux ; leur exploitation ne doit pas dépendre d’un moteur propriétaire unique.

## Sécurité applicative
Le socle cible inclut les bonnes pratiques attendues pour une application institutionnelle :
- gestion sécurisée des secrets ;
- chiffrement en transit ;
- protection des accès ;
- contrôle des entrées et fichiers ;
- limitation des privilèges ;
- gestion des dépendances ;
- supervision et correctifs ;
- séparation des environnements ;
- tests de sécurité avant mise en production.

Les configurations, politiques, seuils de sécurité, règles de détection et procédures opérationnelles détaillées ne sont pas publiées.

## Validation avec la CDC/CRC
Si ATHAR est retenu, l’industrialisation sera validée avec les équipes concernées sur un périmètre réel ou représentatif afin de confirmer :
- exigences de confidentialité ;
- modèle d’accès ;
- contraintes réseau ;
- volumes ;
- intégrations SI ;
- exigences de disponibilité ;
- conservation et archivage ;
- sécurité ;
- observabilité ;
- modalités d’administration métier.

Cette phase permet de transformer le cadre générique en architecture de production adaptée aux contraintes réelles.

## Ce que la documentation publique n’expose pas
Sont volontairement conservés hors documentation publique :
- topologie détaillée ;
- règles de durcissement ;
- secrets et paramètres opérationnels ;
- mécanismes internes d’autorisation ;
- heuristiques de contrôle ;
- seuils ;
- prompts ;
- scoring ;
- stratégie de routage ;
- logique multisource détaillée ;
- mécanismes internes de l’Evidence Engine ;
- procédures de sécurité sensibles.

## Critère de fermeture du Bloc 6
Le Bloc 6 est considéré cadré lorsque :
- le scénario institutionnel est documenté ;
- la souveraineté et la confidentialité sont couvertes ;
- les principes d’accès et de traçabilité sont définis ;
- l’administration métier est prévue ;
- les dépendances externes ne sont pas obligatoires pour les fonctions critiques ;
- la validation finale est explicitement renvoyée aux contraintes réelles de la CDC/CRC ;
- aucun secret technique ou méthodologique n’est exposé publiquement.

---

**Chaîne ATHAR complète :**

`Dossiers → Contrôler → Prouver → Valider → Livrer → Exploiter dans un environnement institutionnel maîtrisé`
