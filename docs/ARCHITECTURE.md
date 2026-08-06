# Architecture minimale

## Choix initial

Monolithe local simple :

- **Frontend** : Next.js / React, shadcn/ui, PDF.js ;
- **API** : FastAPI ;
- **Extraction** : Docling, après test sur le corpus ;
- **Données** : SQLite ;
- **Fichiers** : stockage local ;
- **Règles** : fonctions Python versionnées et testables ;
- **Livrable** : génération DOCX/PDF dans une phase ultérieure du MVP.

## Flux

1. dépôt des documents et données PMP ;
2. extraction du texte, des pages et des tableaux ;
3. normalisation dans le RSU minimal ;
4. exécution des quatre contrôles ;
5. création d’alertes sourcées ;
6. validation humaine ;
7. génération de la fiche de constat.

## RSU minimal

Entités :

- `case` : dossier de marché ;
- `document` : pièce source ;
- `evidence` : page, passage ou valeur source ;
- `requirement` : règle ou exigence validée ;
- `observation` : élément constaté ;
- `alert` : comparaison et signal ;
- `decision` : validation humaine ;
- `finding` : constat provisoire généré.

## Sécurité MVP

- données fictives ou anonymisées ;
- aucun appel externe contenant les documents ;
- fichiers conservés localement ;
- journal des validations ;
- architecture on-premise cible, à cadrer avec la Cour.

## Extensions non activées

Cardinal, PyOD, NetworkX, Yente, Presidio, PostgreSQL et graphes avancés restent des options après validation du noyau.
