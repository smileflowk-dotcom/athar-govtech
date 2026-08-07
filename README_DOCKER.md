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

Elle construit l'image, démarre ATHAR puis affiche l'URL locale :

```text
http://127.0.0.1:3000
```

Après le build initial, la machine peut être isolée d'Internet et relancer l'existant avec :

```bash
docker compose up -d
```

Le conteneur n'a pas besoin d'une API cloud pour exécuter l'interface, l'extraction PDF texte, les quatre contrôles ou la persistance locale.

## Stockage local

Les dossiers, alertes et décisions de validation sont enregistrés dans SQLite dans le volume Docker nommé :

```text
athar_govtech_data
```

Un `docker compose down` conserve ce volume. `docker compose down -v` le supprime volontairement.

## Isolation réseau

Le service ATHAR est attaché uniquement au réseau :

```text
athar_govtech_internal
```

Ce réseau est déclaré `internal: true` dans `docker-compose.yml`. Le conteneur qui reçoit les PDF et exécute les règles n'a donc pas de route Internet sortante. Le seul accès publié est le port local lié à `127.0.0.1`.

Vérifier la configuration Docker :

```bash
docker network inspect athar_govtech_internal
```

Vérifier activement qu'une sortie Internet échoue depuis ATHAR :

```bash
docker compose exec -T athar node -e "fetch('https://example.com',{signal:AbortSignal.timeout(3000)}).then(()=>{console.error('ERREUR: sortie Internet disponible');process.exit(1)}).catch(()=>{console.log('OK: aucune sortie Internet');process.exit(0)})"
```

Le raccourci suivant teste le healthcheck local et cette absence de sortie Internet :

```bash
make verify
```

## Configuration

`.env.example` ne contient que :

- `ATHAR_PORT` : port HTTP local ;
- `ATHAR_DATA_DIR` : chemin du stockage persistant dans le conteneur.

Aucune clé API n'est requise.

## Limites assumées du PoC

- SQLite convient au démonstrateur mono-instance ; une architecture de production pourra utiliser le stockage interne validé par la DSI ;
- HTTP local uniquement : HTTPS/TLS n'est pas configuré par défaut ;
- pas encore de gestion avancée des comptes, rôles, SSO ou RBAC ;
- pas d'OCR dans ce packaging : l'import PDF actuel cible les PDF avec texte extractible ;
- pas de mécanisme de sauvegarde/restauration institutionnel configuré ;
- pas d'homologation sécurité : durcissement, certificats, identité, rétention et supervision restent à cadrer avec la DSI CDC/CRC.

## Portée technique

Le PoC conserve volontairement une seule application déployable : frontend Next.js, routes API locales, extraction PDF et moteur de règles sont empaquetés ensemble. Les séparer en micro-services n'apporterait pas de valeur au stade du PoC et augmenterait inutilement la surface d'exploitation.
