# ATHAR

**Chaque alerte mène à sa preuve.**

ATHAR est une proposition de solution GovTech d’aide au contrôle des marchés publics pour la Cour des Comptes et les Cours Régionales des Comptes du Maroc.

## Promesse MVP

Charger un dossier de marché, détecter les écarts prioritaires, afficher la règle et la preuve, permettre une validation humaine, puis générer une fiche de constat.

**Flux unique :**

`Document → exigence → observé → contrôle → alerte → preuve → validation humaine → livrable`

## Périmètre MVP

Un dossier pilote, quatre contrôles :

1. délai de publication ;
2. clause potentiellement restrictive ;
3. incohérence de notation ou d’attribution ;
4. signal simple de probité.

Sortie : alertes sourcées, décision humaine et fiche de constat provisoire.

## Démonstrateur d’interface

La branche `feat/mvp-01-ui` contient une interface Next.js entièrement fictive :

- liste et filtrage des dossiers ;
- document avec passage source surligné ;
- fiche d’alerte explicable ;
- confirmation, rejet ou demande de pièce ;
- prévisualisation d’une fiche de constat.

### Lancer localement

```powershell
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Principes

- aucune accusation automatique ;
- preuve visible avant toute conclusion ;
- règles configurables et validées par la Cour ;
- fonctionnement local / on-premise cible ;
- aucune donnée sensible envoyée vers une API externe ;
- minimum viable avant toute extension.

## État

Phase de cadrage du PoC GovTech 2026. Le dépôt ne contient encore aucun système présenté comme déployé ou validé par la Cour.
