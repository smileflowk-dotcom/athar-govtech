# ATHAR — Bloc 4 Validation humaine

## Objectif
Garantir qu’ATHAR reste un outil d’assistance au contrôle et non un système de décision autonome.

Le rôle d’ATHAR est de préparer, structurer et documenter les points à examiner. La décision finale appartient toujours au contrôleur habilité.

## Principe directeur

`ATHAR signale → ATHAR documente → le contrôleur décide`

Aucun point détecté par le système ne devient automatiquement un constat définitif.

## Actions du contrôleur
Pour chaque point à vérifier, le contrôleur peut notamment :

- confirmer le point ;
- rejeter le point ;
- demander une pièce complémentaire ;
- ajouter un commentaire ou une justification ;
- maintenir le point en attente lorsque les éléments disponibles sont insuffisants.

## Information présentée avant décision
La décision humaine doit pouvoir s’appuyer sur un dossier de preuve compréhensible contenant, selon le cas :

- le point à vérifier ;
- les faits identifiés ;
- la règle ou référence applicable ;
- les documents sources ;
- la localisation de la preuve dans les pièces ;
- les éventuelles contradictions ou insuffisances ;
- l’état de qualité ou de complétude des éléments disponibles.

L’interface privilégie l’accès direct à la source plutôt qu’une conclusion opaque.

## Statuts fonctionnels
ATHAR distingue au minimum les situations suivantes :

- **À examiner** : le système a identifié un point nécessitant une revue humaine ;
- **Confirmé** : le contrôleur considère le point suffisamment établi ;
- **Rejeté** : le contrôleur considère que le point ne doit pas être retenu ;
- **Pièce demandée** : une information complémentaire est nécessaire ;
- **En attente** : la décision est différée faute d’éléments suffisants.

Ces libellés décrivent un état de travail. Ils ne constituent pas, à eux seuls, une qualification juridique ou disciplinaire.

## Traçabilité de la validation
La plateforme est conçue pour conserver une trace exploitable des décisions de revue, notamment :

- l’état retenu ;
- l’auteur de la validation lorsque l’environnement d’identité est activé ;
- la date et l’heure ;
- la justification ou le commentaire associé lorsque nécessaire ;
- les références des éléments examinés au moment de la décision.

L’objectif est de permettre la relecture, l’auditabilité et la continuité du dossier.

## Gestion des modifications
Lorsqu’un document, une donnée ou une preuve importante évolue après une validation, ATHAR doit pouvoir signaler que le point concerné mérite une nouvelle revue.

Le principe recherché est simple : une décision humaine doit rester reliée à l’état des éléments sur lesquels elle s’est fondée.

## Rôle de l’intelligence artificielle
Une composante IA peut aider à rechercher, résumer ou présenter les éléments utiles à la revue.

Elle ne doit pas :

- décider qu’une irrégularité est juridiquement établie ;
- valider un point à la place du contrôleur ;
- remplacer la justification humaine ;
- transformer automatiquement une hypothèse en constat définitif.

## Copywriting de l’espace de validation
Le vocabulaire doit rester neutre, opérationnel et non accusatoire.

Préférer :

- **Confirmer**
- **Rejeter**
- **Demander une pièce**
- **Ajouter une justification**
- **Laisser en attente**

Éviter les formulations suggérant qu’ATHAR prononce lui-même une conclusion définitive.

## Articulation avec le workflow ATHAR

`Dossiers → Contrôler → Prouver → Validation humaine → Livrer`

La validation est intégrée à l’espace **Prouver** afin que le contrôleur puisse décider au contact direct des faits et des sources.

Seuls les éléments ayant atteint le niveau de validation requis peuvent alimenter les livrables définitifs.

## Validation opérationnelle future
Les modalités détaillées de validation, les rôles, droits, circuits de revue et exigences de journalisation seront adaptés avec la Cour des Comptes et les CRC à partir de leurs processus réels, profils utilisateurs et contraintes de sécurité.

## Informations volontairement non publiques
La documentation publique ne décrit pas :

- les règles internes de transition entre états ;
- les mécanismes techniques de versionnement ;
- les politiques de réouverture automatique ;
- les niveaux internes de confiance ;
- les détails de journalisation et de contrôle d’accès ;
- les mécanismes de priorisation des revues ;
- les éventuelles heuristiques utilisées pour proposer une action au contrôleur.

Ces éléments relèvent de l’implémentation, de la sécurité et du savoir-faire interne ATHAR.

## Critère de réussite du Bloc 4
Le Bloc 4 est considéré fonctionnel lorsque le contrôleur peut comprendre les éléments présentés, prendre explicitement une décision humaine, justifier cette décision si nécessaire et retrouver ultérieurement le contexte de la validation.
