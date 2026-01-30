# FASE 0 - API CONTRACT & DOCUMENTATION COHERENCE

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)

---

## Objective

Unify API contract and documentation with real system behavior. Eliminate inconsistencies between README/HOW_TO_RUN/API_REFERENCE/runbook and backend.

---

## Dependencies

- None (this is the first phase)

---

## Related Gaps

- API-01, API-02, API-03, API-04, API-05, API-06, INT-01

---

## Checklist

### Decision: Response Format (ADR-001)
1. [x] **[P1][S]** Decide official format: use standard wrapper `{ data, success, timestamp }` or update docs for direct responses.
   - **Acceptance:** ADR-001 written in 10_ADR_REGISTRO.md with decision and rationale.

### API Reference Updates
2. [x] **[P1][S]** Fix `/users/me` → `/auth/me` in API_REFERENCE.md line 22.
   - **Acceptance:** `grep "/users/me" docs/development/API_REFERENCE.md` returns nothing.

3. [x] **[P1][S]** Fix endpoint count: change "15 Total" to actual count (26).
   - **Acceptance:** Count in docs matches `grep -c "^- \`" docs/development/API_REFERENCE.md`.

4. [x] **[P1][S]** Fix example response: change `data.token` to `accessToken`.
   - **Acceptance:** Example code uses correct field name.

5. [x] **[P2][M]** Document all real endpoints with correct paths:
   - `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`
   - `/grants`, `/grants/:id`
   - `/search`
- `/scraper/scrape`, `/scraper/scrape-async`, `/scraper/run`, `/scraper/source/:id`
- `/scraper/source/:id/logs`
   - `/sources`, `/sources/:id`, `/sources/service`
   - `/profile`
   - `/recommendations`, `/notifications`
   - `/health`, `/health/ready`, `/health/live`
   - **Acceptance:** Each endpoint has request/response examples.

### Swagger/OpenAPI
6. [x] **[P2][M]** Resolve Swagger: implement `SwaggerModule.setup()` in main.ts OR remove references from README.
   - **Acceptance:** Either `/swagger` works OR no mention of swagger in docs.

### Health Endpoint
7. [x] **[P2][S]** Resolve `/health` duplication (AppController vs HealthController).
   - **Acceptance:** Only one `/health` endpoint exists. `rg "@Controller\\('health'\\)" apps/backend-core/src/` returns a single result.

### Other Documentation
8. [x] **[P2][S]** Update runbook with real smoke test commands and endpoints.
   - **Acceptance:** Runbook commands can be copy-pasted and work.

9. [x] **[P3][S]** Verify all doc links (REBOOT vs docs/) are valid and consistent.
   - **Acceptance:** No broken links in README.md.

### Inter-Service Contracts
10. [x] **[P2][M]** Define and document the API contract between `backend-core` and `data-service`.
    - **Acceptance:** An OpenAPI/Swagger definition exists for the data-service API, including the `X-Service-Token` header for authentication.

### Final Contract Documentation
11. [x] **[P1][S]** Record final contract changes in this document (summary of real API).
   - **Acceptance:** Summary section below is filled.

---

## API Contract Summary (fill after completion)

```
Endpoints: 29
Base URL: http://localhost:3001
Response Format: WRAPPER `{ data, success, timestamp }`
Auth Header: httpOnly cookies (`access_token`) + optional Bearer token
Rate Limiting: IMPLEMENTED (global + login throttle)
```

---

## Deliverables

- [x] Documentation aligned with real behavior.
- [x] Contract decisions written in ADR.
- [x] All examples work with current backend.

---

## Validation

- [x] README, HOW_TO_RUN, API_REFERENCE have no non-existent routes.
- [x] Request/response examples work with current backend.
- [x] `npm run lint` passes.
- [x] `npm run type-check` passes.

---

## Files Likely to Change

- `docs/development/API_REFERENCE.md`
- `README.md`
- `HOW_TO_RUN.md`
- `apps/backend-core/src/main.ts`
- `apps/backend-core/src/common/interceptors/response-wrapper.interceptor.ts`
- `apps/backend-core/src/common/filters/http-exception.filter.ts`
- `docs/development/data-service.openapi.yaml`

---

## Blockers

- None

---
