# GRANTER v2

A modular turbo monorepo for Government Grant Intelligence.

## Getting Started

1. Review the orchestration docs (`dev_plan/GETTING_STARTED.md`, `AGENTS.md`).
2. Install dependencies at the root: `npm install`.
3. Copy `.env.example` to `.env` and fill secrets (do not commit `.env`).
4. Bring up the stack:
   ```bash
   make dev
   ```

## Key Commands

| Task | Command |
| --- | --- |
| Dev servers | `npm run dev` |
| Lint all | `npm run lint` |
| Unit tests | `npm run test` |
| Type check | `npm run type-check` |
| Coverage | `npm run test:coverage -w apps/web-frontend` & `npm run test:cov -w apps/backend-core` |
| Docker | `docker compose up -d` |

## Documentation

- `AGENTS.md`: Agent workflow + MCP rules
- `AGENTS_CUSTOMIZADO_GRANTER.md`: Customized guidance for this sprint
- `CONVENTIONS.md` & `CONVENTIONS_FRONTEND.md`: Coding standards

## Contacts

- Security: as defined in `AGENTS.md`
- Architecture: see `PROPUESTA_ARQUITECTURA_DESDE_0.md`
- Escalations: open in `#granter-development`
