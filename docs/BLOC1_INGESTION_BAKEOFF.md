# ATHAR — Bloc 1 · Méthode d’ingestion documentaire

## Finalité
ATHAR doit pouvoir recevoir un dossier de commande publique composé de pièces hétérogènes et les rendre exploitables pour le contrôle, sans demander au contrôleur de choisir un moteur technique ou une procédure de traitement.

L’objectif fonctionnel est simple : **ajouter les pièces, qualifier leur état, conserver leur provenance et signaler ce qui nécessite une vérification humaine.**

## Périmètre couvert
La chaîne documentaire est conçue pour prendre en charge, selon les besoins du contexte institutionnel :
- documents PDF natifs ou numérisés ;
- documents bureautiques ;
- images et pièces scannées ;
- tableaux et données structurées ;
- documents multilingues, notamment français et arabe ;
- lots multi-pièces constituant un dossier complet.

Le choix précis des composants techniques reste interchangeable afin de pouvoir s’adapter aux contraintes de sécurité, de souveraineté, de volume, de qualité documentaire et d’environnement de déploiement de la CDC/CRC.

## Parcours cible
`Ajouter les pièces → reconnaître → extraire → qualifier → conserver la provenance → Prêt / À vérifier / Non traité`

Le contrôleur n’a pas à sélectionner un moteur OCR, un parseur, un modèle ou des paramètres techniques.

## Principes de méthode

### 1. Qualification documentaire
ATHAR identifie la nature de la pièce et son niveau d’exploitabilité avant de la transmettre aux contrôles métier.

### 2. Extraction structurée
Le contenu utile est transformé dans un format commun exploitable par les fonctions de contrôle, quelle que soit la nature initiale du document.

### 3. Provenance conservée
Lorsqu’un fait ou un élément est extrait, ATHAR conserve les informations nécessaires pour permettre le retour au document source et à son emplacement pertinent.

### 4. Gestion explicite de l’incertitude
Une extraction incertaine n’est pas assimilée à une donnée fiable. Les pièces nécessitant une revue sont signalées au contrôleur.

### 5. Traitement multi-pièces
Le système raisonne au niveau du dossier et non du fichier isolé. Plusieurs pièces peuvent contribuer à établir ou à vérifier un même fait.

### 6. Déploiement institutionnel
La chaîne est conçue pour pouvoir fonctionner dans un environnement compatible avec les exigences de confidentialité, de traçabilité des accès et de souveraineté définies avec la CDC/CRC.

## Validation opérationnelle
La validation détaillée sera réalisée, en cas de sélection, sur un corpus représentatif fourni ou approuvé par la CDC/CRC.

Le protocole couvrira notamment :
- documents numériques et scans ;
- documents de qualité variable ;
- contenus français, arabes et mixtes ;
- tableaux et pièces bureautiques ;
- dossiers multi-pièces ;
- volumétrie et traitement en lot ;
- restitution de la provenance ;
- gestion des cas nécessitant une intervention humaine.

Les critères détaillés, seuils, scénarios de routage, mécanismes de sélection des moteurs, règles internes de qualité et logique d’orchestration sont conservés dans la documentation technique privée du projet.

## Critères de réussite visibles
Le Bloc 1 est considéré fonctionnel lorsque :
- l’utilisateur peut ajouter plusieurs pièces dans un même dossier ;
- les formats attendus sont reconnus ou explicitement signalés comme non traités ;
- chaque pièce dispose d’un état clair : **Prêt / À vérifier / Non traité** ;
- la provenance vers la source est conservée ;
- les pièces difficiles ne produisent pas silencieusement une donnée réputée fiable ;
- les résultats sont exploitables par les contrôles ATHAR ;
- le scénario de déploiement institutionnel est documenté.

## Limite de publication
La documentation publique décrit **les capacités, les garanties et la méthode de validation**.

Elle ne publie pas :
- les seuils internes ;
- les règles de routage ;
- les heuristiques ;
- les mécanismes de scoring ;
- les prompts ;
- la priorité entre moteurs ;
- la logique détaillée de rapprochement ;
- les mécanismes internes de l’Evidence Engine.

Principe : **documenter la méthode sans publier la recette.**
