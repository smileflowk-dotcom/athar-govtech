# MVP GovTech — périmètre figé

## Promesse

Charger un dossier de marché, détecter les écarts prioritaires, afficher la règle et la preuve, permettre une validation humaine, puis générer une fiche de constat.

## Corpus minimal

- avis / données PMP ;
- CPS ou règlement de consultation ;
- grille de notation ;
- procès-verbal d’évaluation ;
- décision d’attribution.

## Quatre contrôles

### 1. Délai de publication

- calcul : date limite de remise − date de publication ;
- comparaison à une règle paramétrée ;
- sortie : conforme ou à vérifier ;
- preuve : dates et source.

### 2. Clause potentiellement restrictive

- signaux : marque, certification fabricant, format propriétaire, spécification très précise, absence d’équivalence ;
- sortie : passage exact et justification à examiner ;
- aucune conclusion juridique automatique.

### 3. Notation et attribution

- recalcul des notes ;
- comparaison règlement → grille → classement → PV → attributaire ;
- sortie : écart chiffré et impact éventuel sur le classement.

### 4. Probité simple

- signaux : offre unique, concurrence faible, attributaire récurrent ;
- sortie : signal contextuel à examiner ;
- aucune accusation automatique.

## Modèle d’alerte

Chaque alerte contient :

- type ;
- niveau ;
- règle applicable ;
- attendu ;
- observé ;
- preuve ;
- niveau de confiance ;
- action recommandée ;
- décision humaine ;
- historique.

## Livrable MVP

Une fiche de constat provisoire générée uniquement à partir des alertes confirmées, avec :

- constat ;
- règle ;
- preuves ;
- pièces concernées ;
- réserves et limites ;
- validation du contrôleur.
