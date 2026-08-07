# ATHAR — PoC on-premise via Docker

Ce packaging ne change pas les contrôles métier. Il rend le démonstrateur ATHAR lançable localement avec stockage SQLite persistant et sans dépendance cloud requise en exécution.

## Prérequis

- Docker Engine / Docker Desktop avec Docker Compose v2 ;
- 8 Go de RAM recommandés pour une démonstration confortable ;
- connexion Internet nécessaire uniquement pour le premier build des images et le téléchargement des dépendances.

## Lancer le PoC

Une commande :

```bash
make demo
```

Elle construit les images, démarre ATHAR puis affiche l'URL locale :

```text
http://127.0.0.1:3000
```

Après le build initial, la machine peut être isolée d'Internet et relancer les images existantes avec :

```bash
docker compose up -d
```

Aucune API cloud n'est requise pour exécuter l'interface, l'extraction PDF texte, les quatre contrôles ou la persistance locale.

## Architecture du PoC

Deux conteneurs sont utilisés, sans découper le métier en micro-services :

- `athar` : application Next.js, API locales, extraction PDF, quatre contrôles et SQLite ;
- `gateway` : relais HTTP minimal qui expose uniquement `127.0.0.1` et transmet le flux vers ATHAR. Il ne contient aucune règle, n'extrait aucun document et ne stocke pas les requêtes.

Cette séparation est uniquement une frontière réseau : elle permet de conserver le conteneur qui traite les documents sur un réseau Docker totalement interne tout en laissant le navigateur local accéder au démonstrateur.

## Stockage local

Les dossiers, alertes et décisions de validation sont enregistrés dans SQLite dans le volume Docker nommé :

```text
athar_govtech_data
```

Un `docker compose down` conserve ce volume. `docker compose down -v` le supprime volontairement.

## Isolation réseau

Le conteneur `athar`, qui reçoit les PDF après relais et exécute les règles, est attaché uniquement au réseau :

```text
athar_govtech_internal
```

Ce réseau est déclaré `internal: true` dans `docker-compose.yml`. ATHAR n'a donc pas de route Internet sortante.

Le `gateway` est le seul composant exposé sur `127.0.0.1`. Il est un proxy fixe vers `athar:3000` et ne possède aucune logique de stockage ou d'analyse documentaire.

Vérifier la configuration Docker :

```bash
docker network inspect athar_govtech_internal
```

Vérifier activement qu'une sortie Internet échoue depuis le conteneur qui traite les documents :

```bash
docker compose exec -T athar node -e "fetch('https://example.com',{signal:AbortSignal.timeout(3000)}).then(()=>{console.error('ERREUR: sortie Internet disponible');process.exit(1)}).catch(()=>{console.log('OK: aucune sortie Internet');process.exit(0)})"
```

Le raccourci suivant teste le healthcheck local et cette absence de sortie Internet :

```bash
make verify
```

## Configuration

`.env.example` ne contient que :

- `ATHAR_PORT` : port HTTP local exposé par le gateway ;
- `ATHAR_DATA_DIR` : chemin du stockage persistant dans le conteneur ATHAR.

Aucune clé API n'est requise.

## Limites assumées du PoC

- SQLite convient au démonstrateur mono-instance ; une architecture de production pourra utiliser le stockage interne validé par la DSI ;
- HTTP local uniquement : HTTPS/TLS n'est pas configuré par défaut ;
- pas encore de gestion avancée des comptes, rôles, SSO ou RBAC ;
- pas d'OCR dans ce packaging : l'import PDF actuel cible les PDF avec texte extractible ;
- pas de mécanisme de sauvegarde/restauration institutionnel configuré ;
- le gateway est une frontière de démonstration, pas un reverse proxy de production durci ;
- pas d'homologation sécurité : certificats, identité, rétention, supervision et règles réseau de production restent à cadrer avec la DSI CDC/CRC.

## Portée technique

Le cœur ATHAR reste volontairement une seule application déployable : frontend Next.js, routes API locales, extraction PDF et moteur de règles sont empaquetés ensemble. Le deuxième conteneur ne sert qu'à l'entrée HTTP locale et à préserver l'absence de sortie réseau du moteur documentaire.
