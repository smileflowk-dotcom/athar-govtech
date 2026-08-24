# ATHAR — PoC on-premise via Docker

Ce packaging ne change pas les contrôles métier. Il rend le démonstrateur ATHAR lançable localement avec stockage SQLite persistant et sans dépendance cloud requise en exécution.

## Prérequis

- Docker Engine / Docker Desktop avec Docker Compose v2 ;
- 8 Go de RAM recommandés pour le mode léger ;
- davantage de RAM est recommandée pour le mode OCR/Docling selon la taille des dossiers ;
- connexion Internet nécessaire uniquement pour le premier build des images et le téléchargement initial des modèles/dépendances.

## Lancer le PoC — mode léger

Une commande :

```bash
make demo
```

Elle construit les images, démarre ATHAR puis affiche l'URL locale :

```text
http://127.0.0.1:3000
```

Ce mode utilise l'extraction PDF native `pdfjs-dist` et conserve les quatre contrôles déterministes.

## Lancer le PoC — mode documentaire renforcé

Une commande :

```bash
make enhanced
```

Ce mode démarre aussi le service local Docling et configure automatiquement ATHAR avec :

```text
ATHAR_DOCLING_URL=http://docling:5001
```

Le flux devient : extraction native → contrôle qualité → fallback Docling/OCR si nécessaire → normalisation FR/AR/tableaux → contrôles ATHAR.

Docling reste sur le réseau Docker interne et n'est pas exposé sur l'hôte. L'API utilisée par ATHAR est `/v1/convert/file`.

Après le téléchargement initial des images et modèles nécessaires, l'instance peut fonctionner dans un environnement isolé selon la politique réseau retenue.

## Architecture du PoC

Mode léger :

- `athar` : application Next.js, API locales, extraction PDF, quatre contrôles et SQLite ;
- `gateway` : relais HTTP minimal qui expose uniquement `127.0.0.1`.

Mode renforcé :

- `docling` s'ajoute comme moteur documentaire local optionnel pour OCR, structure et tableaux ;
- il communique uniquement avec `athar` sur `athar_govtech_internal`.

Cette séparation est une frontière technique : elle permet de conserver les documents et traitements sur le réseau interne tout en laissant le navigateur local accéder au démonstrateur.

## Stockage local

Les dossiers, alertes et décisions de validation sont enregistrés dans SQLite dans le volume Docker nommé :

```text
athar_govtech_data
```

Le cache documentaire Docling est conservé dans :

```text
athar_docling_cache
```

Un `docker compose down` conserve les volumes. Une suppression avec `-v` les supprime volontairement.

## Isolation réseau

Le conteneur `athar`, qui reçoit les PDF et exécute les règles, est attaché au réseau :

```text
athar_govtech_internal
```

Ce réseau est déclaré `internal: true` dans `docker-compose.yml`.

En mode renforcé, `docling` est attaché au même réseau interne et n'expose aucun port vers l'extérieur.

Le `gateway` est le seul composant exposé sur `127.0.0.1`.

Vérifier activement la configuration :

```bash
make verify
```

## Configuration

Variables principales :

- `ATHAR_PORT` : port HTTP local exposé par le gateway ;
- `ATHAR_DATA_DIR` : stockage persistant ;
- `ATHAR_DOCLING_URL` : URL interne du moteur documentaire ; le mode `make enhanced` la configure automatiquement.

Gemini reste optionnel et désactivé par défaut ; aucune clé API n'est requise pour le mode local Docling.

## Limites assumées du PoC

- SQLite convient au démonstrateur mono-instance ;
- HTTP local uniquement : HTTPS/TLS n'est pas configuré par défaut ;
- pas encore de gestion avancée des comptes, rôles, SSO ou RBAC ;
- l'OCR manuscrit arabe ancien reste un cas difficile et devra être benchmarké sur le dataset pilote CDC ;
- pas de mécanisme de sauvegarde/restauration institutionnel configuré ;
- pas d'homologation sécurité : certificats, identité, rétention, supervision et règles réseau de production restent à cadrer avec la DSI CDC/CRC.

## Portée technique

Le cœur ATHAR reste volontairement une seule application métier. Docling est un service documentaire local optionnel ; il n'est pas une source de décision et ne remplace ni les règles ATHAR ni la validation humaine.
