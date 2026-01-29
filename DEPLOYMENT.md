# DEPLOYMENT.md - CI/CD and Release Flow

Version: 2.0.0
Last Updated: 2026-01-29

---

## Overview

GRANTER 2.0 ships via a simple CI/CD flow that validates code quality, runs tests, performs security scanning, and executes smoke checks before a release is approved. Deployment is designed for staging first, then production with a rollback plan.

---

## CI Pipeline (GitHub Actions)

Trigger:
- Pull requests to main/develop
- Pushes to main/develop

Jobs:
1. lint (backend-core, web-frontend, data-service)
2. type-check (backend-core, web-frontend, data-service)
3. test (backend-core, web-frontend, data-service)
4. smoke (starts backend + Postgres, runs scripts/smoke-test.sh)
5. coverage (backend, frontend, data-service)
6. codeql (SAST for JS/TS + Python)

Success Criteria:
- All jobs green
- Coverage above 70 percent

---

## Environments

- Development: Local, NODE_ENV=development (TypeORM synchronize enabled)
- Staging: Pre-production validation, migrations applied before deploy
- Production: Strict change control, migrations applied with backups and rollback

---

## Database Migrations

Development:
- TypeORM synchronize is enabled in non-production to reduce friction.
- Migrations still exist for staging/production traceability.

Staging/Production:
- Back up the database before deploying.
- Apply migrations before scaling up new application pods.
- Verify migration status and health checks after applying.

Recommended steps:
1. Backup the database
2. Apply pending migrations
3. Deploy services
4. Run smoke tests

Note:
- Migration runner commands should be executed from the backend-core workspace.
- If a migration fails, stop the rollout and roll back the database from backup.

---

## Release Flow (Staging to Production)

1. Build and publish images (backend-core, web-frontend, data-service).
2. Deploy to staging.
3. Run smoke tests (npm run test:smoke).
4. Verify health endpoints and critical flows.
5. Deploy to production.
6. Monitor error rate and latency for at least 2 hours.

---

## Rollback Strategy

If critical issues are detected:
1. Scale down the new deployment.
2. Restore database from the last verified backup.
3. Redeploy previous stable image tags.
4. Re-run smoke tests.

---

## Smoke Tests

The smoke test script validates:
- /health
- /auth/register
- /auth/me
- /profile
- /search
- /grants
- /sources

Command:
- npm run test:smoke

---

## Secrets and Configuration

- All secrets are provided via environment variables.
- Do not commit .env files.
- Rotate SERVICE_TOKEN and JWT_SECRET on a regular cadence.

---

## References

- docs/sprints/round 1/SPRINT_4_DEPLOYMENT_RUNBOOK.md
- docs/development/ARCHITECTURE_OVERVIEW.md
