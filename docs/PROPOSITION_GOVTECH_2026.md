# ATHAR — Proposition GovTech 2026

**Défi : automatisation du contrôle des marchés publics — Cour des comptes et Cours régionales des comptes du Maroc**

**Signature : Chaque alerte mène à sa preuve.**

> Version de travail maître. Les éléments entre crochets `[À COMPLÉTER]` doivent être verrouillés avant soumission.

## 1. Résumé exécutif

ATHAR est un assistant de contrôle explicable pour les marchés publics. Son objectif est de permettre aux contrôleurs de la Cour des comptes et des Cours régionales des comptes de passer d’analyses manuelles et échantillonnées à un contrôle plus systématique des phases de mise en concurrence, d’évaluation des offres et d’attribution.

ATHAR transforme chaque contrôle en une chaîne vérifiable :

`document / donnée → exigence → observé → contrôle → alerte → preuve → validation humaine → livrable`

Le système n’accuse pas et ne conclut pas automatiquement à une irrégularité. Il signale un écart ou une incohérence, rattache l’alerte à sa source, à la règle de contrôle, à l’attendu et à l’observé, puis laisse la décision au contrôleur.

Le démonstrateur fonctionnel actuel prouve déjà quatre familles de contrôles déterministes : clause potentiellement restrictive, délai de publication potentiellement insuffisant, absence de déclaration de probité pour un membre de commission, et incohérence entre notation finale, classement recalculé et attribution déclarée. Il permet ensuite au contrôleur de confirmer, écarter ou demander une pièce, puis de générer une fiche de constat provisoire.

Le PoC proposé avec la CDC/CRC vise à généraliser cette logique sur un corpus pilote réel, à connecter les données structurées du Portail des Marchés Publics aux pièces du dossier de consultation, et à mesurer la couverture, la pertinence des alertes, le temps de contrôle et le temps de production des livrables.

## 2. Problème traité

Le défi officiel identifie trois phases concentrant une part importante des risques : mise en concurrence, évaluation des offres et attribution. Les contrôles reposent encore largement sur des analyses manuelles de dossiers, de procès-verbaux et de données du PMP, généralement sur des échantillons.

ATHAR cible quatre frictions opérationnelles :

1. **Couverture limitée** : le contrôle manuel conduit à l’échantillonnage plutôt qu’à l’examen systématique du périmètre d’une mission.
2. **Analyse documentaire coûteuse** : les clauses, critères, dates, grilles et PV doivent être rapprochés manuellement.
3. **Traçabilité dispersée** : la justification d’un constat exige de revenir aux sources, à la règle et aux pièces associées.
4. **Temps de rédaction** : les constats et livrables formels restent largement produits manuellement.

ATHAR ne cherche donc pas à remplacer le contrôleur. Il réduit le coût de la recherche, du rapprochement, du calcul et de la préparation de la preuve afin de concentrer le temps humain sur l’analyse, la qualification et la recommandation.

## 3. Solution proposée

### 3.1 Moteur de contrôle contextualisé

ATHAR applique des règles en fonction du contexte du marché : type de procédure, montant, dates, nature du marché, pièces disponibles et informations extraites des documents.

Exemple de logique :

`si procédure = X ET montant > seuil Y ET délai observé < délai minimal → alerte avec dates, règle et sources`

Le moteur est déterministe pour les contrôles réglementaires qui peuvent l’être. Les composants d’analyse documentaire servent à retrouver et structurer les éléments utiles, mais la conclusion du contrôle reste explicable et traçable.

### 3.2 Lecture et rapprochement des sources

Le PoC doit rapprocher progressivement :

- données structurées du PMP : publication, montant, échéances, résultats, attributaire ;
- CPS / cahiers des charges ;
- règlements de consultation ;
- grilles de notation ;
- procès-verbaux de commission ;
- déclarations d’obligation de probité ;
- référentiel de contrôle CDC/CRC et textes applicables.

Chaque alerte conserve un lien vers la donnée ou le passage ayant déclenché le contrôle.

### 3.3 Interface de décision

Le contrôleur voit sur un même écran :

- le dossier et la source ;
- le signal détecté ;
- la règle de contrôle ;
- l’attendu ;
- l’observé ;
- la preuve ;
- l’action recommandée ;
- les actions de validation humaine.

La logique d’usage est volontairement simple : **voir → comprendre → décider → générer**.

### 3.4 Génération assistée des livrables

Une alerte confirmée peut alimenter une fiche de constat et, dans le PoC, les formats institutionnels prioritaires définis avec la CDC/CRC. Le contrôleur conserve la capacité de modifier et valider le contenu avant toute sortie finale.

## 4. Preuves déjà réalisées

ATHAR dispose aujourd’hui d’un **démonstrateur d’interface fonctionnel**, et non d’un système de production final.

Preuves réalisées :

- import local d’un PDF texte et extraction page par page avec PDF.js côté serveur ATHAR ;
- traitement sans API documentaire externe dans ce chemin ;
- confrontation d’un CPS réel de 60 pages au contrôle de clause restrictive ;
- correction d’un risque de faux positif lié à la fragmentation des lignes du PDF et à la présence d’une mention d’équivalence sur la ligne suivante ;
- quatre contrôles déterministes : clause restrictive, délai de publication, complétude déclarative de probité, cohérence notation/classement/attribution ;
- tests unitaires sur les cas limites : seuil exact, absence multiple, ex æquo, données incomplètes ;
- parcours complet sur un dossier de démonstration : contrôle → alerte → règle → attendu → observé → preuve → validation humaine → fiche de constat ;
- plusieurs alertes gérées et validées individuellement dans un même dossier ;
- packaging Docker on-premise démontrable ;
- conteneur ATHAR isolé sur un réseau interne sans sortie Internet lors des vérifications CI ;
- stockage local SQLite des dossiers, alertes et décisions ;
- persistance vérifiée après arrêt et redémarrage des conteneurs ;
- démarrage et persistance également vérifiés sur un poste Windows réel via Docker Desktop.

Limites actuelles assumées :

- PDF texte uniquement ; pas encore d’OCR pour scans anciens ou documents manuscrits ;
- le contrôle de clause restrictive est aujourd’hui le contrôle relié à l’import PDF réel ;
- délai, probité et classement utilisent encore des données structurées de démonstration ;
- la fiche de constat est une sortie PoC, pas encore un modèle institutionnel CDC/CRC validé ;
- pas encore de SSO/RBAC avancé, homologation DSI ou dispositif institutionnel de sauvegarde/restauration.

## 5. PoC proposé avec la CDC/CRC

Le PoC doit rester étroit et mesurable. Nous proposons un périmètre pilote portant sur un nombre limité de marchés et quatre familles de contrôle représentatives.

### Étape 1 — Cadrage du référentiel

- sélectionner avec la CDC/CRC les règles prioritaires issues du guide d’audit et des textes applicables ;
- préciser pour chaque règle les données nécessaires, conditions d’application, attendu, observé et preuve ;
- sélectionner les formats de documents et les modèles de livrables prioritaires.

### Étape 2 — Corpus pilote et ingestion

- constituer un corpus pilote anonymisé ou contrôlé ;
- connecter les données PMP disponibles ;
- ingérer les pièces numériques ;
- tester OCR et traitement des scans uniquement lorsque le corpus le justifie.

### Étape 3 — Exécution des contrôles

Priorité aux quatre familles déjà prouvées :

1. délais de publication ;
2. clauses ou spécifications potentiellement restrictives ;
3. présence des déclarations d’obligation de probité ;
4. cohérence entre notation finale, classement et attribution.

Le catalogue sera enrichi uniquement après validation de la valeur et de la précision de ces contrôles sur données réelles.

### Étape 4 — Validation par les contrôleurs

Pour chaque alerte : confirmer, écarter ou demander une pièce, avec conservation de la piste d’audit.

### Étape 5 — Livrable pilote

Générer au minimum une fiche de constat conforme à un format défini avec la CDC/CRC, puis mesurer le gain de temps par rapport au processus manuel.

## 6. Architecture, souveraineté et sécurité

ATHAR est conçu pour être déployable **on-premise**. Docker constitue un mode de packaging démontrable, pas une dépendance fonctionnelle du produit.

Architecture PoC :

`documents / données → instance ATHAR interne → extraction / structuration → règles → alertes → validation → stockage local → livrable`

Principes :

- traitement des documents sensibles dans l’environnement de la CDC/CRC ;
- absence de dépendance fonctionnelle à une API documentaire cloud externe ;
- stockage local des états et décisions ;
- séparation entre logique de traitement et exposition réseau ;
- journalisation et droits d’accès à définir avec la DSI dans le PoC ;
- possibilité d’utiliser des modèles locaux uniquement si leur apport est démontré sur le corpus.

Le démonstrateur Docker actuel prouve la faisabilité de l’isolation du conteneur ATHAR et de la persistance locale ; il ne constitue pas une homologation de sécurité ni une architecture de production finale.

## 7. Innovation et différenciation

ATHAR ne se positionne pas comme un chatbot documentaire généraliste. Sa différenciation est la transformation d’un signal en **preuve de contrôle exploitable**.

Chaque résultat doit répondre immédiatement à cinq questions :

- quelle règle est appliquée ?
- pourquoi s’applique-t-elle ici ?
- qu’attendait-on ?
- qu’a-t-on observé ?
- quelle pièce ou donnée permet au contrôleur de vérifier le résultat ?

Cette approche réduit la dépendance à une sortie probabiliste opaque et rend possible un déploiement progressif, règle par règle, avec validation métier explicite.

Le PoC privilégie la précision et la traçabilité à l’étendue fonctionnelle : un petit nombre de contrôles fiables, mesurables et réutilisables vaut davantage qu’un catalogue large produisant des alertes difficiles à expliquer.

## 8. Gestion des risques

**Qualité documentaire** — scans anciens, arabe manuscrit, formats variés. Réponse : mesurer la qualité du corpus au démarrage, séparer PDF texte / OCR / documents non exploitables, et ne pas présenter une absence d’extraction comme une absence d’irrégularité.

**Faux positifs** — particulièrement sensibles pour les alertes d’éthique ou les formulations juridiques. Réponse : règles explicables, seuils conservateurs, tests de non-régression, preuve obligatoire et validation humaine. Le test sur un CPS réel a déjà conduit à corriger un faux positif potentiel lié au découpage d’une phrase.

**Données incomplètes** — une pièce absente peut fausser un rapprochement. Réponse : distinguer erreur/absence de donnée et alerte métier ; demander la pièce au lieu de conclure.

**Règles évolutives** — seuils et textes peuvent évoluer. Réponse : référentiel de règles versionné, paramètres séparés du code métier et validation avec le guide d’audit CDC avant généralisation.

**Livrables non conformes** — risque de sortie incomplète ou hors modèle. Réponse : commencer par un seul modèle institutionnel validé, générer uniquement à partir de constats confirmés et maintenir une revue humaine avant signature.

**Sécurité et accès** — données de contrôle confidentielles. Réponse : déploiement on-premise, stockage interne, droits et journalisation définis avec la DSI, et aucun transfert documentaire externe par défaut.

## 9. Indicateurs de succès

Les indicateurs du PoC sont alignés sur ceux du défi :

- **Couverture** : proportion des marchés du périmètre pilote effectivement soumis aux contrôles automatisables ;
- **Temps de contrôle** : temps moyen d’exécution des tests avant / après ATHAR ;
- **Pertinence des alertes** : part des alertes jugées utiles ou confirmées par les équipes de contrôle ;
- **Traçabilité** : part des alertes disposant de la source, de la règle, de l’attendu, de l’observé et de la preuve ; objectif PoC : 100 % ;
- **Temps de production du livrable** : comparaison entre préparation manuelle et fiche générée/revue dans ATHAR ;
- **Taux d’erreurs de données** : cas où ATHAR refuse de conclure faute de pièce ou de donnée suffisante.

Aucun objectif chiffré de gain de temps ou de précision ne sera annoncé avant constitution du corpus de référence et mesure du processus manuel avec la CDC/CRC.

## 10. Équipe et capacité d’exécution

ATHAR est porté par **[NOM DE LA SOCIÉTÉ — À COMPLÉTER]**.

Capacités mobilisées pour le PoC :

- conception de workflows de contrôle et de traçabilité ;
- structuration de référentiels de règles ;
- analyse documentaire et données structurées ;
- développement d’interfaces de décision ;
- packaging on-premise et déploiement local ;
- coordination France–Maroc et travail en français.

À compléter avant soumission :

- forme juridique, date de création, pays d’immatriculation ;
- effectif ;
- chiffre d’affaires ;
- membres de l’équipe et rôles ;
- références professionnelles pertinentes ;
- disponibilité pour le programme ;
- expertises complémentaires prévues pour sécurité, NLP/OCR arabe et droit des marchés publics si nécessaires.

## 11. Pourquoi ATHAR pour ce défi

Le besoin de la CDC/CRC n’est pas seulement de « détecter plus ». Il est de contrôler plus systématiquement sans perdre la qualité de la preuve ni la responsabilité du contrôleur.

ATHAR concentre donc sa proposition sur une idée simple :

**Chaque alerte mène à sa preuve.**

Le démonstrateur actuel montre déjà cette chaîne sur quatre familles de contrôles, avec validation humaine, génération de constat et packaging local. Le PoC avec la CDC/CRC doit maintenant tester cette approche sur les vrais référentiels, les vraies pièces et les vrais formats institutionnels afin de mesurer sa capacité à augmenter la couverture des contrôles tout en conservant une traçabilité complète.

## 12. État actuel / PoC / évolution

| Capacité | Démonstrateur actuel | PoC CDC/CRC | Évolution ultérieure |
|---|---|---|---|
| Interface de contrôle | Fonctionnelle | Adaptée au workflow pilote | Industrialisation UX |
| PDF texte | Import/extraction locale | Corpus réel | Généralisation formats |
| OCR scans | Non | À tester selon corpus | Industrialisation si utile |
| Clause restrictive | Contrôle opérationnel V0 | Validation sur corpus CDC | Catalogue enrichi |
| Délai publication | Données structurées démo | PMP / pièces réelles | Extension règles |
| Probité | Présence documentaire démo | POD réelles selon accès | Croisements additionnels validés |
| Classement / attribution | Données structurées démo | Grilles + PV réels | Règles de départage validées |
| Validation humaine | Fonctionnelle | Oui | Workflow institutionnel |
| Fiche de constat | Fonctionnelle V0 | Modèle CDC/CRC pilote | Autres livrables |
| On-premise | Docker démontré | Déploiement pilote | Architecture DSI cible |
| SSO / RBAC / homologation | Non | Selon DSI | Production |

## Sources officielles de cadrage

- Challenge CDC/CRC 2026 : https://govtech.trustvalley.swiss/challenges/cdc-morocco/
- Challenge Statement v3-1, 25 juin 2026 : https://govtech.trustvalley.swiss/assets/uploads/2026/CDC/en/2026-GIC-challenge-statement-public-procurement-control-EN-1.pdf

## Points à verrouiller avant soumission

- `[À COMPLÉTER]` identité et éligibilité de la société candidate ;
- équipe nominative et rôles ;
- références et expériences vérifiables ;
- format exact demandé dans le portail de candidature ;
- éventuelle limite de pages / poids du PDF 2026 ;
- périmètre et calendrier PoC à chiffrer une fois les contraintes du portail connues.
