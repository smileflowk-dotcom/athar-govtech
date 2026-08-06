# Instructions de travail — ATHAR

## Finalité

Construire le minimum nécessaire pour démontrer :

`1 dossier → 4 contrôles → preuves visibles → validation humaine → 1 fiche de constat`

## Principes obligatoires

1. **Goal directness** : aucune fonctionnalité sans lien direct avec la démonstration GovTech.
2. **Condensation de la valeur** : chaque écran et chaque sortie répond à : quoi contrôler, pourquoi, quelle preuve, quel impact, quelle action.
3. **RSU minimal** : documents, exigences, observations, alertes, preuves et validations partagent un référentiel traçable.
4. **Human-in-the-loop** : aucune irrégularité ou fraude n’est conclue automatiquement.
5. **Security by design** : traitement local, données fictives par défaut, aucune API cloud externe pour les documents sensibles.

## Périmètre autorisé du MVP

- écran unique en trois panneaux : dossiers / document / alerte ;
- quatre règles : délai, clause restrictive, notation, probité simple ;
- preuve liée à une page ou une donnée source ;
- actions : confirmer, écarter, demander une pièce ;
- génération d’une fiche de constat provisoire.

## Hors périmètre avant validation

- bénéficiaires effectifs ;
- graphes complexes ;
- scoring national ;
- IA générative autonome ;
- authentification avancée ;
- microservices ;
- Kubernetes ;
- déploiement cloud ;
- ajout de bibliothèques non indispensables.

## Règle d’implémentation

Avant chaque ajout, préciser :

- décision utilisateur améliorée ;
- donnée nécessaire ;
- preuve produite ;
- critère de réussite ;
- raison pour laquelle une solution plus simple ne suffit pas.
