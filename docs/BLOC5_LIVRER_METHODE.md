# ATHAR — Bloc 5 Livrer

## Objectif
Transformer uniquement les éléments validés par le contrôleur en livrables clairs, traçables et réutilisables, sans introduire de conclusion automatique supplémentaire.

## Principe
Le livrable est la restitution d’un travail de contrôle humain assisté par ATHAR.

Flux cible :

`Points vérifiés → décisions humaines → constats retenus → preuves associées → synthèse → rapport`

ATHAR ne transforme pas un signal non validé en constat final.

## Contenu d’un livrable
Selon le besoin, un livrable peut regrouper :
- identification du dossier ;
- périmètre du contrôle ;
- pièces examinées ;
- constats validés ;
- références aux règles ou critères applicables ;
- sources documentaires ;
- pages ou zones pertinentes ;
- extraits utiles ;
- éléments de rapprochement ;
- observations du contrôleur ;
- pièces manquantes ou réserves éventuelles ;
- statut de validation.

## Niveaux de restitution
ATHAR peut produire plusieurs niveaux de lecture à partir du même dossier validé :

### Synthèse de dossier
Vue courte destinée à comprendre rapidement :
- ce qui a été contrôlé ;
- les principaux points validés ;
- les éléments restant ouverts ;
- la disponibilité des preuves.

### Fiche de constat
Chaque constat reste autonome et relié à sa base probante :

`Constat → justification → source → localisation → validation humaine`

### Rapport de contrôle
Restitution structurée destinée à être relue, complétée et utilisée dans le processus institutionnel.

## Traçabilité
Tout élément présenté comme constat doit pouvoir être relié aux informations qui ont conduit à sa validation.

Le système conserve notamment, selon les données disponibles :
- dossier d’origine ;
- pièce source ;
- localisation dans la pièce ;
- éléments examinés ;
- décision humaine associée ;
- état du point au moment de la génération du livrable.

Cette chaîne permet au lecteur de revenir du rapport vers la preuve.

## Gestion de l’incertitude
Les éléments incomplets, contradictoires ou insuffisamment étayés ne doivent pas être présentés comme des constats certains.

Ils peuvent apparaître séparément comme :
- point restant à vérifier ;
- information manquante ;
- contradiction non résolue ;
- pièce complémentaire requise.

## Validation avant émission
Avant qu’un livrable soit considéré comme finalisable :
- les constats inclus doivent être validés selon le workflow défini ;
- les preuves associées doivent rester accessibles ;
- les réserves doivent être visibles ;
- le contrôleur doit pouvoir relire et corriger la restitution.

La génération documentaire ne vaut pas approbation institutionnelle automatique.

## Formats
La couche de restitution est conçue pour pouvoir prendre en charge, selon le contexte de déploiement :
- vue écran ;
- export documentaire ;
- impression ;
- formats structurés pour interopérabilité ;
- reprise dans les outils internes de la CDC/CRC.

Les formats définitifs sont à valider avec les utilisateurs institutionnels et les contraintes de leur système d’information.

## Rôle de l’IA
Une IA peut assister la reformulation, la synthèse ou l’organisation d’informations déjà validées.

Elle ne doit pas :
- inventer un constat ;
- supprimer une réserve importante ;
- modifier le sens d’une preuve ;
- convertir une hypothèse en conclusion ;
- décider de la conformité à la place du contrôleur.

La donnée validée et la preuve restent prioritaires sur toute génération de texte.

## Copywriting de l’espace « Livrer »
Le vocabulaire privilégie :
- **Synthèse**
- **Constats validés**
- **Preuves associées**
- **Points ouverts**
- **Générer le rapport**
- **Relire avant export**

Éviter les formulations donnant l’impression qu’ATHAR prononce seul une décision juridique ou institutionnelle.

## Validation opérationnelle future
Les modèles de restitution seront ajustés avec la CDC/CRC à partir de leurs dossiers, pratiques de contrôle, modèles de rapports et contraintes de diffusion si ATHAR est retenu.

L’objectif sera de vérifier notamment :
- niveau de détail attendu ;
- ordre de présentation ;
- terminologie métier ;
- formats d’export ;
- exigences de traçabilité ;
- règles de validation et de diffusion.

## Ce qui reste volontairement privé
La documentation publique ne décrit pas :
- les mécanismes internes de sélection des éléments à restituer ;
- les règles de condensation ;
- les méthodes de rapprochement entre preuves et constats ;
- les prompts ou chaînes de génération ;
- les contrôles internes de cohérence ;
- les heuristiques de priorisation ;
- la logique détaillée de l’Evidence Engine.

Ces éléments relèvent de l’implémentation ATHAR et de la documentation technique interne.

## Critère de fermeture du Bloc 5
Le Bloc 5 est considéré cadré lorsque :
- aucun élément non validé ne peut être présenté comme constat final ;
- chaque constat peut revenir à sa preuve ;
- les réserves et points ouverts restent visibles ;
- le contrôleur conserve une étape de relecture ;
- les formats institutionnels restent adaptables ;
- la méthode est documentée sans exposer les mécanismes internes propriétaires.
