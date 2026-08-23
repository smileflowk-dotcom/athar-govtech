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

## Assistance Gemini optionnelle

ATHAR conserve son extraction PDF locale et ses contrôles déterministes comme fonctionnement par défaut. Une couche Gemini facultative peut être activée uniquement pour proposer des passages candidats à examiner par un contrôleur humain.

Elle ne décide jamais qu’un marché est conforme, irrégulier, illégal ou frauduleux et ne remplace aucune règle ATHAR.

Configuration serveur :

```env
ATHAR_GEMINI_ENABLED=false
ATHAR_GEMINI_MODEL=gemini-3.7-flash
GEMINI_API_KEY=
```

L’API `POST /api/ai/gemini/assist` exige en plus `confirmExternalProcessing: true` dans chaque requête. Seul le texte explicitement fourni à cette route est transmis à Gemini ; l’import PDF `/api/pdf/extract` reste local et n’appelle aucune API externe.

Ne jamais activer cette capacité pour des documents sensibles sans cadre institutionnel, contractuel et de sécurité explicitement autorisé.

## Principes

- aucune accusation automatique ;
- preuve visible avant toute conclusion ;
- règles configurables et validées par la Cour ;
- fonctionnement local / on-premise cible ;
- aucune donnée sensible envoyée vers une API externe sans autorisation explicite ;
- Gemini, lorsqu’il est activé, reste une assistance à la recherche de preuves et non un moteur de décision ;
- minimum viable avant toute extension.

## État

Phase de cadrage du PoC GovTech 2026. Le dépôt ne contient encore aucun système présenté comme déployé ou validé par la Cour.
