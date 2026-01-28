.PHONY: dev lint test type-check docker

dev:
	@echo "Starting Turbo dev servers..."
	npm run dev

lint:
	npm run lint

test:
	npm run test

type-check:
	npm run type-check

docker:
	docker compose up -d --build
