# ATHAR — Bloc 3 Prouver

## Objectif
Transformer chaque point à vérifier en un objet de preuve lisible, traçable et révisable par un contrôleur humain.

ATHAR ne doit jamais demander au contrôleur de faire confiance à une conclusion opaque. Le système doit permettre de revenir à la source qui justifie le point soulevé.

Principe directeur :

**Chaque alerte mène à sa preuve.**

## Rôle du Bloc 3
Le Bloc 3 reçoit les points à vérifier produits lors du contrôle et les relie aux éléments documentaires qui permettent de les examiner.

Flux public de référence :

`Point à vérifier → fait observable → règle ou exigence concernée → source → localisation → extrait utile → éléments croisés → validation humaine`

Ce flux décrit la méthode générale. Les mécanismes internes de rapprochement, de classement et de sélection de preuves restent privés.

## Un objet de preuve ATHAR
Un objet de preuve peut contenir :

- l’intitulé du point à vérifier ;
- le fait observable ;
- la règle, exigence ou étape de procédure concernée ;
- le document source ;
- la page ou zone documentaire lorsque disponible ;
- l’extrait utile ;
- les autres pièces ou données qui corroborent ou contredisent le fait ;
- l’état de vérification humaine ;
- les commentaires et demandes de pièces complémentaires.

L’objectif n’est pas de produire une accumulation de texte, mais une chaîne de justification courte et navigable.

## Provenance
ATHAR conserve autant que possible la provenance des éléments utilisés :

- document d’origine ;
- page ;
- section, tableau ou zone ;
- passage textuel utile ;
- référence à une donnée structurée lorsque le fait provient d’un système source.

Lorsque la localisation précise n’est pas disponible ou que la qualité d’extraction est insuffisante, le système doit le signaler au lieu de présenter la preuve comme certaine.

## Croisement des sources
Un point à vérifier peut être examiné à partir de plusieurs catégories de sources :

- dossier de consultation ;
- avis et pièces de publication ;
- offres et documents remis ;
- procès-verbaux et documents d’évaluation ;
- décision ou document d’attribution ;
- données structurées disponibles dans les systèmes métiers ;
- autres sources autorisées dans le cadre du contrôle.

ATHAR peut rapprocher plusieurs éléments pour faciliter le travail du contrôleur, mais le rapprochement automatisé ne vaut pas validation humaine.

## Gestion des contradictions
Lorsque deux sources ne concordent pas, ATHAR ne choisit pas silencieusement une version.

Le système doit :

1. exposer la contradiction ;
2. présenter les sources concernées ;
3. indiquer si une pièce manque ou si une extraction est incertaine ;
4. laisser le contrôleur décider de la suite à donner.

## Niveaux de confiance et incertitude
La qualité d’un élément de preuve peut dépendre de la qualité du document, de son extraction et de sa provenance.

La documentation publique d’ATHAR distingue simplement :

- **preuve exploitable** ;
- **preuve à vérifier** ;
- **preuve insuffisante ou pièce manquante**.

Les seuils, critères techniques, pondérations et mécanismes internes permettant de produire ces états ne sont pas publiés.

## Validation humaine
Le contrôleur reste décisionnaire.

À partir d’un objet de preuve, il peut notamment :

- confirmer le point ;
- le rejeter ;
- demander une pièce complémentaire ;
- ajouter un commentaire ;
- conserver le point en attente.

ATHAR conserve la trace de cette action afin de distinguer clairement ce qui a été proposé par le système de ce qui a été validé par l’utilisateur.

## Rôle de l’IA
Une IA générative peut assister certaines tâches documentaires ou de synthèse si l’environnement institutionnel l’autorise.

Elle ne doit pas être utilisée comme autorité de décision sur la conformité, la légalité, la qualification d’une irrégularité ou l’existence d’une fraude.

Les contrôles déterministes, la provenance documentaire et la validation humaine restent les mécanismes de référence.

## Expérience utilisateur cible
Dans l’espace **Prouver**, le contrôleur doit pouvoir comprendre rapidement :

1. ce qui a déclenché le point à vérifier ;
2. sur quelles sources il repose ;
3. où se trouve l’information ;
4. quelles pièces vont dans le même sens ou le contredisent ;
5. quelle action humaine reste nécessaire.

L’interface doit privilégier la navigation vers la preuve plutôt que la multiplication de tableaux ou de scores abstraits.

## Copywriting
Termes à privilégier :

- Point à vérifier
- Fait observé
- Source
- Page
- Passage
- Éléments croisés
- Pièce manquante
- À vérifier
- Confirmation humaine

Éviter les formulations qui présentent automatiquement un soupçon comme un fait établi :

- fraude détectée ;
- irrégularité certaine ;
- violation confirmée ;
- risque de corruption confirmé.

## Ce qui reste volontairement privé
La documentation publique ne décrit pas :

- les heuristiques internes de recherche de preuve ;
- les seuils de confiance ;
- les règles de priorisation ;
- les pondérations ;
- les prompts ;
- les stratégies de routage ;
- la logique détaillée de rapprochement multisource ;
- les mécanismes internes de scoring ;
- les méthodes propriétaires de l’Evidence Engine.

Ces éléments peuvent être présentés de manière contrôlée lors d’une phase de sélection, d’audit technique ou de PoC encadré, selon les exigences de confidentialité.

## Validation future avec la CDC / CRC
La validation opérationnelle du Bloc 3 doit être réalisée sur un corpus fourni ou approuvé par la CDC/CRC afin de vérifier :

- la pertinence de la provenance ;
- la capacité à revenir rapidement à la source ;
- la qualité des extraits ;
- le traitement des contradictions ;
- la gestion des pièces manquantes ;
- la lisibilité pour les contrôleurs ;
- la traçabilité de la validation humaine.

Les jeux de test publics ou synthétiques servent uniquement à démontrer la capacité technique générale avant cette phase.

## Critère de fermeture du Bloc 3
Le Bloc 3 est considéré prêt lorsque, pour chaque point à vérifier présenté à l’utilisateur :

- une justification compréhensible est affichée ;
- les sources utiles sont accessibles ;
- la provenance disponible est conservée ;
- les limites et incertitudes sont visibles ;
- aucune conclusion définitive n’est imposée par le système ;
- le contrôleur peut effectuer et tracer sa décision.
