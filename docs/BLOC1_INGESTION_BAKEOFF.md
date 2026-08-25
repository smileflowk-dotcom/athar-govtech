# ATHAR — Bloc 1 Ingestion documentaire

## Objectif
Valider une chaîne d’ingestion à faible code capable de traiter en masse les documents attendus par la CDC/CRC : PDF natifs et scannés, Word/Office, images, tableurs et données structurées, avec routage automatique, contrôle qualité, preuve/provenance et déploiement compatible environnement institutionnel.

## Principe
Un seul geste utilisateur : **Ajouter les pièces**.

Flux cible :

`Téléverser en masse → reconnaître → router → extraire/OCR → vérifier → classer → prêt / à vérifier`

Le contrôleur ne choisit ni moteur OCR, ni paramètres techniques.

## Candidats

### Unstructured — candidat no-code/minimum-code prioritaire
- UI no-code pour configurer et lancer des workflows.
- API et MCP disponibles si ATHAR doit automatiser ensuite.
- Batch processing, orchestration ETL, Smart Document Routing, retries et error transparency.
- 64+ formats annoncés sur l’offre actuelle.
- Offre gratuite actuelle : 15 000 pages/mois, sans carte ; au-delà, 0,03 USD/page en pay-as-you-go.
- Dedicated/VPC/bare metal réservés à l’offre Business sur devis.
- Ne jamais envoyer de données CDC sensibles vers le SaaS pendant le benchmark.

### Reducto — référence qualité premium
- Parse, Extract, Split, classification et citations.
- OCR agentique orienté documents difficiles.
- Batch/async et forte traçabilité visuelle.
- On-prem/VPC/air-gap sur offre Enterprise.
- Référence qualité à utiliser sur les scans difficiles, tableaux et formulaires.

### LandingAI ADE — référence qualité visuelle
- Parse, Extract, Split/Classification, visual grounding et confidence scoring.
- Traitement asynchrone et routage automatique.
- VPC/on-prem/air-gap sur offre Enterprise.
- Référence qualité pour scans, formulaires et tableaux.

### Docling — baseline souveraine locale
- Open source et exécutable localement.
- PDF, Office, images, CSV, emails et autres formats.
- OCR, tables, provenance, API REST et batch.
- Déjà intégré dans ATHAR pour le fallback OCR des PDF dégradés.
- Filet souverain / baseline locale gratuite.

## Corpus de test commun
Chaque candidat reçoit exactement les mêmes cas :
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

## Mesures obligatoires
Pour chaque document et chaque moteur :
- succès / échec ;
- texte exploitable ;
- structure et tableaux ;
- page / bounding box / provenance ;
- qualité FR ;
- qualité arabe ;
- qualité FR/AR ;
- temps de traitement ;
- capacité batch ;
- intervention humaine requise ;
- coût ;
- possibilité on-prem / air-gap ;
- effort d’intégration ATHAR.

Les résultats sont saisis dans `docs/BLOC1_TEST_RESULTS.csv`.

## Séquence d’exécution

### Phase A — Unstructured sans code
1. Créer/utiliser un compte d’essai Unstructured.
2. Utiliser l’interface web no-code, pas d’intégration ATHAR.
3. Importer uniquement le corpus public/synthétique.
4. Tester d’abord les cas 1 à 9 individuellement.
5. Tester ensuite le lot multi-fichiers complet.
6. Exporter/observer la sortie structurée, les erreurs et la provenance disponible.
7. Reporter les résultats dans la grille.

**But :** déterminer jusqu’où Unstructured supprime réellement le code d’ingestion ATHAR avant toute intégration.

### Phase B — Docling local
Sur le PC ATHAR :

```powershell
cd "C:\Users\lenovo\OneDrive\Documents\Parcelle\athar-govtech"
git pull
docker compose --profile enhanced-docs up -d --build
docker compose ps
```

Puis vérifier ATHAR :

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/health
```

Faire passer le même corpus avec Docling local. Pour les PDF dégradés, ATHAR possède déjà le chemin :

`pdfjs-dist → contrôle qualité → Docling/OCR si qualité dégradée`

**But :** établir la baseline souveraine gratuite, sans envoi externe.

### Phase C — Reducto et LandingAI
Ne tester que :
- scan dégradé ;
- arabe / FR-AR ;
- tableau complexe ;
- lot multi-fichiers.

**But :** vérifier si le gain de qualité premium est suffisamment important pour justifier une solution Enterprise institutionnelle.

## Règle de décision
Le moteur retenu doit minimiser le code spécifique ATHAR sans sacrifier :
1. confidentialité et déploiement institutionnel ;
2. qualité sur les documents CDC réels ;
3. provenance permettant de revenir à la preuve ;
4. capacité de traitement massif ;
5. gestion explicite des erreurs et documents à vérifier.

### Score de décision
- Qualité OCR / structure : 30 %
- Provenance / preuve : 20 %
- Batch et robustesse : 15 %
- Souveraineté / on-prem : 15 %
- Effort d’intégration : 10 %
- Coût : 10 %

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
