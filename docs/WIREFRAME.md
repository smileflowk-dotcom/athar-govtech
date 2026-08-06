# Écran unique — contrat d’interface

## Objectif

Permettre au contrôleur de comprendre une alerte, retrouver sa preuve et décider sans changer d’écran.

## Structure

### En-tête

- nom ATHAR ;
- titre du marché ;
- statut du dossier ;
- bouton `Générer la fiche de constat`.

### Panneau gauche — Dossiers

- recherche ;
- filtres : tous, à valider, validés ;
- titre du marché ;
- nombre d’alertes ;
- priorité simple.

### Panneau central — Document

- visualiseur PDF ;
- miniatures de pages ;
- navigation ;
- passage source surligné ;
- clic sur une alerte = ouverture de la page et du passage associés.

### Panneau droit — Alerte

Champs :

- type ;
- niveau ;
- règle applicable ;
- attendu ;
- observé ;
- preuve ;
- action recommandée.

Actions :

- confirmer ;
- écarter ;
- demander une pièce.

### Zone basse — Sortie

- alertes confirmées ;
- alertes en cours ;
- alertes écartées ;
- prévisualisation de la fiche de constat.

## Parcours unique

`Charger → analyser → voir la preuve → décider → générer`

## Critères d’acceptation du squelette UI

- écran desktop fidèle au wireframe validé ;
- données entièrement fictives ;
- sélection d’un dossier fonctionnelle ;
- sélection d’une alerte fonctionnelle ;
- passage source visuellement relié à l’alerte ;
- trois actions modifient le statut localement ;
- aucun moteur d’IA ou backend requis pour cette première étape.
