ATHAR_PORT ?= 3000

.PHONY: demo up enhanced down logs verify

demo:
	docker compose build
	docker compose up -d
	@echo "ATHAR démarré : http://127.0.0.1:$(ATHAR_PORT)"

up:
	docker compose up -d
	@echo "ATHAR disponible : http://127.0.0.1:$(ATHAR_PORT)"

enhanced:
	docker compose -f docker-compose.yml -f docker-compose.enhanced.yml up -d --build
	@echo "ATHAR + Docling local démarrés : http://127.0.0.1:$(ATHAR_PORT)"

down:
	docker compose -f docker-compose.yml -f docker-compose.enhanced.yml down

logs:
	docker compose -f docker-compose.yml -f docker-compose.enhanced.yml logs -f athar docling

verify:
	@echo "Vérification du healthcheck local…"
	@curl --fail --silent http://127.0.0.1:$(ATHAR_PORT)/api/health
	@echo "\nVérification de l'absence d'accès Internet sortant…"
	@docker compose -f docker-compose.yml -f docker-compose.enhanced.yml exec -T athar node -e "fetch('https://example.com',{signal:AbortSignal.timeout(3000)}).then(()=>{console.error('ERREUR: sortie Internet disponible');process.exit(1)}).catch(()=>{console.log('OK: aucune sortie Internet');process.exit(0)})"
