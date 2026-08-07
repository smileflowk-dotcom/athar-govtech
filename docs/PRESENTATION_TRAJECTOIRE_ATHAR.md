# ATHAR — Présentation de la trajectoire produit

**Signature : Chaque alerte mène à sa preuve.**

Cette trame complète la proposition GovTech maître avec une lecture plus visuelle de la valeur actuelle d’ATHAR, de son paradigme de conception et de sa trajectoire de développement.

## 1. Positionnement

ATHAR est un assistant de contrôle explicable des marchés publics.

Chaîne de valeur :

`document / donnée → exigence → observé → contrôle → alerte → preuve → validation humaine → livrable`

Principe : aucune alerte sans règle visible, sans preuve vérifiable et sans validation humaine.

## 2. Paradigme de conception

### Multisources

ATHAR rapproche les sources utiles au dossier : données PMP, avis, CPS, règlement de consultation, PV, grilles de notation et déclarations de probité.

La valeur vient du croisement des sources, pas de la lecture isolée d’une pièce.

### Multifinalitaire

Chaque finalité de contrôle détermine :

- les sources à mobiliser ;
- la règle applicable ;
- l’élément attendu ;
- la preuve nécessaire ;
- la décision à sécuriser.

### Condensation de la valeur

Chaque traitement est ramené à ce qui aide immédiatement le contrôleur :

`règle → attendu → observé → preuve → décision`

Tout élément sans utilité directe pour le contrôle est différé ou écarté.

### Voie directe

ATHAR cherche le chemin le plus court entre la donnée disponible et la décision à sécuriser.

Une capacité n’est ajoutée que lorsqu’elle réduit directement une incertitude du contrôle.

> **Plusieurs sources → une finalité de contrôle → uniquement les preuves nécessaires → décision humaine.**

## 3. État actuel

Le démonstrateur fonctionnel actuel comprend :

- quatre contrôles déterministes ;
- import et extraction locale d’un PDF texte ;
- preuve rattachée à une source et une page ;
- validation humaine individuelle ;
- fiche de constat provisoire ;
- dossier PoC complet avec quatre alertes ;
- packaging Docker on-premise démontrable ;
- persistance locale SQLite.

Les quatre familles de contrôle :

1. clause potentiellement restrictive ;
2. délai de publication potentiellement insuffisant ;
3. absence documentaire d’une déclaration de probité ;
4. incohérence entre notation finale, classement recalculé et attribution déclarée.

Limite actuelle : le PDF réel alimente aujourd’hui le contrôle de clause restrictive. Les contrôles délai, probité et classement utilisent encore des données structurées de démonstration.

## 4. Saut produit prioritaire

Faire fonctionner les quatre contrôles actuels sur un véritable dossier composé de plusieurs documents :

`Avis + CPS + RC + PV + grille + POD → extraction ciblée → contrôles → preuve → décision → constat`

Résultat attendu :

> **Un vrai dossier → plusieurs contrôles automatiques → preuves → décision humaine.**

## 5. Roadmap produit

| Période | Stade | Enrichissements principaux | Résultat attendu |
|---|---|---|---|
| Aujourd’hui | Démonstrateur fonctionnel | 4 contrôles, PDF texte, preuve, validation, fiche, Docker local | Premier jalon démontré |
| 0–2 mois | Assistant de dossier | Dossier réel multi-documents, reconnaissance des pièces, extraction ciblée | Un vrai dossier alimente les 4 contrôles |
| 2–4 mois | Moteur contextualisé | Cross-check documentaire, référentiel de règles, versionnement | ATHAR contrôle le dossier comme un ensemble |
| 4–6 mois | PoC institutionnel avancé | OCR ciblé, scans, arabe/français, tableaux, livrables CDC/CRC, PMP pilote | Test sur corpus et workflow réels |
| 6–10 mois | Produit institutionnel | SSO/RBAC, journaux, sauvegardes, administration des règles, indicateurs | Solution industrialisable on-premise |

Trajectoire visuelle :

`Démonstrateur → assistant de dossier réel → moteur de contrôle contextualisé → PoC institutionnel → plateforme industrialisée`

## 6. Chronologie détaillée et charge indicative

Hypothèse : un développeur principal, pilotage produit/règles et validation métier ponctuelle.

| Version | Développement | Chronologie | Effort estimé |
|---|---|---:|---:|
| V1 | Dossier réel multi-documents | Semaines 1–3 | 10–15 j-h |
| V2 | Extraction structurée pour les 4 contrôles | Semaines 3–7 | 15–20 j-h |
| V3 | Cross-check entre documents | Semaines 6–10 | 15–20 j-h |
| V4 | Référentiel de règles CDC versionné | Mois 3–4 | 20–30 j-h |
| V5 | OCR, scans, tableaux, arabe/français | Mois 4–5 | 20–30 j-h |
| V6 | Livrables institutionnels | Mois 5 | 10–15 j-h |
| V7 | PMP et données institutionnelles | Mois 5–7 | 20–40 j-h |
| V8 | Industrialisation on-premise | Mois 7–9 | 30–50 j-h |
| V9 | Pilotage et indicateurs | Mois 9–10 | 15–20 j-h |

**Charge indicative totale : 155–240 jours-homme.**

**PoC avancé atteignable en environ 3–6 mois**, selon la taille de l’équipe, l’accès au corpus, la disponibilité des données PMP, les exigences DSI et la vitesse de validation métier.

## 7. Conditions de réussite

- accès à un corpus réel, représentatif et contrôlé ;
- formalisation des règles avec les contrôleurs ;
- distinction stricte entre absence de donnée et alerte métier ;
- validation progressive des modèles de livrables ;
- définition avec la DSI des exigences SSO, rôles, journaux, sauvegardes et architecture cible.

Règle de pilotage :

> **Ne pas ajouter de nombreuses nouvelles familles de contrôle tant que les quatre contrôles actuels ne fonctionnent pas proprement sur un dossier réel multi-documents.**

## 8. Message de conclusion

La roadmap ATHAR ne part pas de zéro : le premier jalon est déjà démontré.

Le fil rouge reste constant à chaque étape :

> **Plusieurs sources → une finalité de contrôle → uniquement les preuves nécessaires → décision humaine.**
