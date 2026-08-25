# ATHAR — Bloc 2 Contrôler

## Objectif
Transformer un dossier documentaire normalisé en **points à vérifier explicables**, sans accusation automatique et sans décision opaque.

Le Bloc 2 répond à une question simple :

**Quels éléments du dossier méritent l’attention du contrôleur, et pourquoi ?**

## Principe
ATHAR ne remplace pas l’auditeur. Le système prépare le travail de contrôle en rapprochant les informations disponibles, en appliquant des contrôles documentés et en signalant uniquement ce qui doit être revu.

Flux cible :

`Dossier prêt → sélectionner la phase / finalité → rapprocher les faits → appliquer les contrôles → qualifier les résultats → générer des points à vérifier`

Le résultat du Bloc 2 n’est jamais un verdict. Il s’agit d’un **signal de contrôle** destiné à être vérifié dans le Bloc 3 — Prouver.

## Périmètre fonctionnel
Le moteur de contrôle peut couvrir notamment :
- mise en concurrence ;
- publication et délais ;
- conditions d’accès et clauses ;
- critères et méthodes d’évaluation ;
- cohérence des notes et classements ;
- attribution ;
- cohérence entre pièces du dossier ;
- complétude documentaire ;
- signaux de probité ou d’intégrité lorsque des sources autorisées sont disponibles ;
- rapprochements entre données structurées et documents.

Cette liste est volontairement large. Les règles opérationnelles exactes sont paramétrées selon le cadre juridique, le périmètre de mission et les données disponibles.

## Méthode générale

### 1. Qualification du contexte
ATHAR identifie le contexte utile au contrôle : phase de procédure, nature des pièces, données structurées disponibles et niveau de complétude.

### 2. Rapprochement des faits
Les informations provenant de plusieurs pièces ou sources sont rapprochées pour vérifier leur cohérence.

Exemples de catégories de rapprochement :
- dates ;
- montants ;
- critères ;
- soumissionnaires ;
- scores ;
- classements ;
- décisions ;
- références de procédure.

### 3. Application des contrôles
ATHAR applique des contrôles explicites et traçables. Chaque contrôle est associé à :
- un objectif ;
- un périmètre ;
- les données nécessaires ;
- un résultat interprétable ;
- une possibilité de revenir aux sources.

### 4. Qualification du résultat
Un résultat peut notamment être :
- **Conforme / cohérent** ;
- **À vérifier** ;
- **Information insuffisante** ;
- **Non applicable**.

Le système doit distinguer l’absence de preuve d’une anomalie réelle.

### 5. Création d’un point à vérifier
Lorsqu’un contrôle nécessite une revue humaine, ATHAR crée un **Point à vérifier** contenant seulement les informations utiles au contrôleur :
- sujet du contrôle ;
- constat factuel ;
- raison de la vérification ;
- sources concernées ;
- statut de revue.

Les éléments de preuve détaillés sont ouverts dans le Bloc 3 — Prouver.

## Explicabilité
Un contrôle ne doit jamais produire une boîte noire.

Pour chaque point à vérifier, ATHAR doit permettre de comprendre :
1. ce qui a été observé ;
2. quelles informations ont été comparées ;
3. pourquoi le point a été généré ;
4. quelles sources doivent être consultées ;
5. si des données manquent.

## Validation humaine
ATHAR n’établit pas seul une irrégularité, une fraude ou une responsabilité.

Le contrôleur reste responsable de l’interprétation finale. Le système prépare, structure et documente la revue.

## Gestion de l’incertitude
ATHAR doit traiter explicitement les cas où :
- une pièce manque ;
- un document est partiellement lisible ;
- une donnée est contradictoire ;
- une règle ne peut pas être appliquée avec certitude ;
- plusieurs interprétations sont possibles.

Dans ces situations, le système privilégie **À vérifier** ou **Information insuffisante**, plutôt qu’une conclusion automatique.

## IA et modèles génératifs
Des composants d’IA peuvent assister la recherche, la lecture ou le rapprochement documentaire, mais ils ne doivent pas être l’unique fondement d’une conclusion de conformité.

La logique de contrôle reste explicable, traçable et soumise à validation humaine.

## Ce qui est volontairement non documenté publiquement
La documentation publique ne décrit pas :
- les seuils internes ;
- les heuristiques ;
- les pondérations ;
- les règles détaillées ;
- la logique de priorisation ;
- les mécanismes internes de rapprochement ;
- les prompts ;
- les stratégies de fallback ;
- les paramètres de scoring ;
- l’orchestration interne du moteur de contrôle.

Ces éléments relèvent de l’implémentation privée ATHAR et sont adaptés au contexte de déploiement.

## Interface cible
L’espace **Contrôler** doit rester compact.

L’utilisateur voit principalement :
- la phase ou finalité analysée ;
- les contrôles exécutés ;
- les résultats ;
- les points à vérifier ;
- les informations manquantes.

Action principale : **Prouver**.

## Copywriting
Préférer :
- **Point à vérifier** plutôt que « anomalie » ou « alerte » ;
- **Contrôle appliqué** plutôt que « détection IA » ;
- **Information insuffisante** plutôt que « erreur » lorsque la preuve manque ;
- **Voir la preuve** / **Prouver** pour accéder au détail sourcé.

## Validation future
La validation opérationnelle détaillée du moteur sera réalisée sur un corpus représentatif fourni ou approuvé par la CDC/CRC si ATHAR est retenu.

Elle permettra notamment de :
- confirmer la pertinence des contrôles ;
- ajuster leur paramétrage ;
- mesurer les faux positifs / faux négatifs ;
- vérifier la couverture réelle des procédures ;
- adapter le moteur aux pratiques et documents de la CDC/CRC.

## Critère de fermeture du Bloc 2
Le Bloc 2 est considéré prêt lorsque :
- les contrôles sont regroupés par finalité ou phase ;
- chaque résultat est compréhensible ;
- chaque point à vérifier peut être relié à ses sources ;
- l’incertitude et les données manquantes sont explicites ;
- aucune conclusion sensible n’est produite sans validation humaine ;
- les détails propriétaires du moteur restent hors de la documentation publique.
