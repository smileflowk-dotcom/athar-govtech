# ATHAR — Déploiement on-premise et sécurité des documents sensibles

## 1. Pourquoi ce choix

Le challenge GovTech de la Cour des comptes (CDC) et des Cours régionales des comptes (CRC) demande explicitement aux candidats de disposer d'une capacité de développement **on-premise**, avec des exigences de souveraineté des données.

Le cahier des charges identifie également comme risque opérationnel la **confidentialité des données de contrôle**, avec un accès qui doit être **strictement limité et traçable**.

Sources officielles :

- Challenge CDC/CRC : https://govtech.trustvalley.swiss/challenges/cdc-morocco/
- Challenge Statement — Public Procurement Control : https://govtech.trustvalley.swiss/assets/uploads/2026/CDC/en/2026-GIC-challenge-statement-public-procurement-control-EN-1.pdf

## 2. Principe d'architecture ATHAR

ATHAR est conçu pour pouvoir fonctionner dans l'environnement informatique de la CDC/CRC, sans envoyer les documents sensibles vers un service cloud externe.

Flux cible :

`Document sensible → infrastructure interne CDC/CRC → extraction locale → moteur de règles ATHAR → alerte + preuve → validation humaine → livrable`

Le principe est que les documents, textes extraits, règles, résultats, preuves et validations restent dans l'environnement autorisé par l'institution.

## 3. Briques techniques locales

L'ingestion documentaire peut s'appuyer sur des composants open source exécutés localement, notamment :

- **Docling** pour l'extraction structurée de PDF et documents après validation sur le corpus réel ;
- **Apache Tika** comme option de parsing multi-format ;
- **pypdf / pdfplumber** pour certains traitements PDF ciblés ;
- OCR local uniquement lorsque nécessaire pour les documents scannés.

Ces composants sont envisagés comme des briques techniques internes. Le caractère open source ne constitue pas, à lui seul, une garantie de conformité ou de sécurité : chaque composant devra être évalué, configuré et validé dans l'environnement de la CDC/CRC.

## 4. Ce qui doit rester local

Dans le déploiement cible, les éléments suivants ne doivent pas sortir de l'environnement autorisé :

- fichiers PDF, Word et scans du dossier de marché ;
- données du Portail des Marchés Publics lorsqu'elles sont rapprochées du dossier de contrôle ;
- texte extrait et index documentaire ;
- règles et paramètres de contrôle ;
- alertes, preuves et décisions des contrôleurs ;
- livrables provisoires et finaux ;
- journaux d'accès et de validation.

Aucun document sensible ne doit être envoyé à une API externe non autorisée.

## 5. Contrôles de sécurité à prévoir

Le PoC puis le déploiement devront être cadrés avec la DSI et les responsables sécurité de la CDC/CRC. Les contrôles cibles comprennent notamment :

- authentification des utilisateurs ;
- gestion des rôles et droits d'accès ;
- accès au strict besoin métier ;
- journalisation des consultations, actions et validations ;
- chiffrement des flux et du stockage selon les exigences de la CDC/CRC ;
- stockage et sauvegardes internes ;
- désactivation ou maîtrise de toute télémétrie externe ;
- gestion des versions des règles de contrôle ;
- traçabilité entre alerte, règle, donnée source et document ;
- procédure de mise à jour et d'audit des composants open source.

## 6. Déploiement technique envisageable

ATHAR doit pouvoir être livré comme une application déployable sur l'infrastructure interne de l'institution, par exemple :

- serveur Linux ou machine virtuelle interne ;
- conteneurs Docker si autorisés par la DSI ;
- API et moteur de règles exécutés localement ;
- stockage documentaire interne ;
- base de données locale/interne ;
- connexion au système d'identité de l'institution dans une phase d'intégration ;
- fonctionnement sans accès Internet en production si cette contrainte est retenue.

Le choix exact de l'infrastructure ne doit pas être imposé par ATHAR : il sera adapté aux standards techniques et de sécurité de la CDC/CRC.

## 7. État actuel vs cible

### Déjà démontré

- prototype exécuté localement ;
- premier contrôle déterministe ;
- aucun besoin d'API d'IA externe pour ce contrôle ;
- rattachement d'une alerte à une preuve ;
- validation humaine.

### À construire pendant le PoC

- ingestion de documents réels en local ;
- extraction PDF/Word/scans ;
- moteur de règles contextuelles paramétrable ;
- stockage local structuré ;
- journalisation complète ;
- gestion des utilisateurs et droits ;
- intégration aux contraintes de l'infrastructure CDC/CRC.

### À valider avec la CDC/CRC

- architecture réseau cible ;
- système d'authentification ;
- règles de chiffrement ;
- politique de sauvegarde et rétention ;
- composants open source autorisés ;
- éventuel besoin de fonctionnement totalement isolé d'Internet ;
- procédures de sécurité, homologation et mise en production.

## 8. Positionnement pour le dossier GovTech

ATHAR ne doit pas être présenté comme « sécurisé parce qu'il est open source ».

Le positionnement correct est :

> **ATHAR est conçu pour être déployé et traité dans l'environnement interne de la CDC/CRC. L'ingestion documentaire, le moteur de règles, les preuves et les validations peuvent fonctionner localement, sans transmission des documents sensibles vers des API cloud externes. L'intégration finale des droits, du chiffrement, de la journalisation et des exigences d'homologation sera réalisée avec la DSI de la CDC/CRC pendant le PoC.**

Ce choix répond directement à la contrainte de souveraineté des données tout en laissant à l'institution le contrôle de son infrastructure et de ses documents sensibles.
