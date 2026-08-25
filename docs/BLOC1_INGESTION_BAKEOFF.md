# ATHAR — Bloc 1 Ingestion documentaire

## Objectif
Valider une chaîne d’ingestion à faible code capable de traiter en masse les documents attendus par la CDC/CRC : PDF natifs et scannés, Word/Office, images, tableurs et données structurées, avec routage automatique, contrôle qualité, preuve/provenance et déploiement compatible environnement institutionnel.

## Principe
Un seul geste utilisateur : **Ajouter les pièces**.

Flux cible :

`Téléverser en masse → reconnaître → router → extraire/OCR → vérifier → classer → prêt / à vérifier`

Le contrôleur ne choisit ni moteur OCR, ni paramètres techniques.

## Candidats

### Unstructured
- UI no-code pour construire des workflows.
- Batch processing et orchestration ETL.
- Smart Document Routing, retries, monitoring et nombreux connecteurs.
- 65+ formats annoncés selon l’offre actuelle.
- Déploiement dedicated/VPC/bare metal sur offre Business.
- Candidat prioritaire pour réduire au maximum le code ATHAR.

### Reducto
- Parse, Extract, Split, classification et citations.
- OCR agentique orienté documents difficiles.
- Batch/async et forte traçabilité visuelle.
- On-prem/VPC/air-gap sur offre Enterprise.
- Référence qualité à utiliser dans le benchmark.

### LandingAI ADE
- Parse, Extract, Split/Classification, visual grounding et confidence scoring.
- Traitement asynchrone et architecture agentique de routage des pages/blocs.
- VPC/on-prem/air-gap sur offre Enterprise.
- Référence qualité pour scans, formulaires et tableaux.

### Docling
- Open source et exécutable localement.
- PDF, Office, images, CSV, emails et autres formats.
- OCR multi-moteurs, API REST, async, batch et MCP.
- Déjà intégré partiellement dans ATHAR.
- Filet souverain / baseline locale gratuite.

## Corpus de test commun
Chaque candidat doit recevoir les mêmes cas :
1. PDF natif FR.
2. PDF scan propre FR.
3. PDF scan dégradé.
4. Document arabe.
5. Document mixte FR/AR.
6. DOCX.
7. XLSX avec tableau.
8. JPG/PNG de pièce scannée.
9. PDF avec tableaux complexes.
10. Lot multi-fichiers représentant un dossier complet.

Aucune donnée institutionnelle sensible ne doit être envoyée dans un service SaaS pendant le benchmark. Utiliser uniquement des documents publics, synthétiques ou explicitement autorisés.

## Mesures
Pour chaque document et chaque moteur :
- succès/échec ;
- texte exploitable ;
- structure et tableaux ;
- conservation de la page / bounding box / provenance ;
- qualité FR ;
- qualité arabe ;
- qualité FR/AR ;
- temps de traitement ;
- capacité batch ;
- intervention humaine requise ;
- coût ;
- possibilité on-prem/air-gap ;
- effort d’intégration ATHAR.

## Règle de décision
Le moteur retenu doit minimiser le code spécifique ATHAR sans sacrifier :
1. confidentialité et déploiement institutionnel ;
2. qualité sur les documents CDC réels ;
3. provenance permettant de revenir à la preuve ;
4. capacité de traitement massif ;
5. gestion explicite des erreurs et documents à vérifier.

## Architecture cible envisagée

### Voie A — minimum de code
`ATHAR UI → Unstructured workflow → documents normalisés → moteur de contrôle ATHAR`

### Voie B — souveraineté maximale
`ATHAR UI → orchestrateur léger → Docling Serve/queue → documents normalisés → moteur de contrôle ATHAR`

Reducto et LandingAI servent de benchmarks premium et restent des options Enterprise si leurs gains de qualité justifient le coût et que la CDC accepte leur modèle de déploiement.

## Critère de fermeture du Bloc 1
Le Bloc 1 n’est considéré terminé que lorsque :
- le corpus commun passe les tests ;
- l’upload multi-fichiers est utilisable ;
- chaque pièce reçoit un état **Prêt / À vérifier / Non traité** ;
- la provenance est conservée ;
- les scans et l’arabe sont testés ;
- le scénario de déploiement institutionnel est documenté ;
- l’interface et le copywriting sont validés sur PC.
