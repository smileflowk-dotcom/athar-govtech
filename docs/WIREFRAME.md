# Écran unique — contrat d’interface

## Objectif

Permettre au contrôleur de comprendre une alerte, retrouver sa preuve et décider sans changer d’écran.

## Structure

### En-tête

- nom ATHAR ;
- titre du marché ;
- statut du dossier ;
- bouton `Générer la fiche de constat`.

### Panneau gauche — Dossier et file de contrôle

- recherche ;
- sélection du dossier ;
- liste complète des éléments à examiner ;
- niveau de vigilance, état de preuve et statut humain visibles.

### Panneau central — Evidence Engine

- règle versionnée ;
- attendu, observé, écart et impact à examiner ;
- pièces rapprochées ;
- passage exact surligné et relié au contrôle ;
- trois états sûrs : preuve retrouvée, contradiction, preuve insuffisante.

### Panneau droit — Décision humaine

Champs :

- type ;
- niveau ;
- règle applicable ;
- attendu ;
- observé ;
- preuve ;
- justification obligatoire ;
- traçabilité de la décision.

Actions :

- confirmer ;
- écarter ;
- demander une pièce.

## Parcours unique

`Dossier → élément à examiner → preuve multisource → décision → fiche de constat`

## Critères d’acceptation du squelette UI

- écran desktop fidèle au wireframe validé ;
- données entièrement fictives ;
- sélection d’un dossier fonctionnelle ;
- sélection d’une alerte fonctionnelle ;
- passage source visuellement relié à l’alerte ;
- trois actions modifient le statut localement ;
- aucun moteur d’IA ou backend requis pour cette première étape.
