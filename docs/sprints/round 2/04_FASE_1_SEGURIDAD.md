# FASE 1 - REAL SECURITY (NOT JUST DOCUMENTED)

Status: DONE
Start date: 2026-01-29
End date: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)
- **MCP Assignment:** Gemini (security code)

---

## Objective

Implement security controls that are currently declared in docs but don't exist in code. Maintain coherence with checklist and runbook.

---

## Dependencies

- FASE 0 complete (contract and docs unified)

---

## Related Gaps

- SEC-01, SEC-02, SEC-03, SEC-04, API-07, SEC-07, SEC-08, SEC-09, SEC-10

---

## Checklist

### Rate Limiting

1. [x] **[P1][M]** Install throttler: `npm install @nestjs/throttler`
   - **Acceptance:** Package in package.json dependencies.

2. [x] **[P1][M]** Configure ThrottlerModule in app.module.ts:
   ```typescript
   ThrottlerModule.forRoot([{
     ttl: 60,     // 60 seconds
     limit: 100,  // 100 requests per minute
   }])
   ```
   - **Acceptance:** Module imported and configured.

3. [x] **[P1][M]** Add ThrottlerGuard as global guard in main.ts or app.module.ts.
   - **Acceptance:** All endpoints protected by default.

4. [x] **[P1][S]** Add specific rate limit for login (5 attempts/5 minutes):
   ```typescript
   @Throttle(5, 300)
   @Post('login')
   ```
   - **Acceptance:** `curl -X POST /auth/login` (x6) returns 429.

### Security Headers

5. [x] **[P1][M]** Install helmet: `npm install helmet`
   - **Acceptance:** Package in package.json dependencies.

6. [x] **[P1][M]** Configure helmet in main.ts:
   ```typescript
   import helmet from 'helmet';
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'", process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:"],
         connectSrc: ["'self'"],
       },
     },
     hsts: { maxAge: 31536000, includeSubDomains: true },
     referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
   }));
   ```
   - **Acceptance:** Response headers include X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security.

### JWT & Session Management

7. [x] **[P1][S]** Document JWT storage decision (ADR-002):
   - Option A: Keep localStorage + add XSS mitigations (CSP)
   - Option B: Move to httpOnly cookie
   - **Acceptance:** ADR-002 written with decision and trade-offs.

8. [x] **[P1][M]** Implement chosen JWT storage strategy.
   - **Acceptance:** Frontend code matches ADR decision.

9. [x] **[P2][L]** Implement refresh token endpoint `/auth/refresh` OR a JWT blacklist mechanism (ADR-006).
   - **Acceptance:** A mechanism for JWT invalidation is in place.

10. [x] **[P2][M]** If using httpOnly cookies, implement CSRF protection.
    - **Acceptance:** Requests from the frontend require a valid CSRF token.

### General Security Hardening

11. [x] **[P1][L]** Implement Input Validation on all DTOs using `class-validator`.
    - **Acceptance:** All `@Body()`, `@Query()`, and `@Param()` objects have validation decorators.

12. [x] **[P2][M]** Implement a `ConfigModule` and ensure no secrets are hardcoded.
    - **Acceptance:** `grep -r "SECRET|PASSWORD|TOKEN" src/` does not show hardcoded secrets.

13. [x] **[P2][S]** Configure a strict CORS policy in `main.ts`.
    - **Acceptance:** `app.enableCors()` is configured with specific origins, not `*`.

### Testing

14. [x] **[P1][M]** Create rate limiting test: `auth.rate-limit.spec.ts`
    - **Acceptance:** Test verifies 429 response after limit exceeded.

15. [x] **[P2][S]** Create security headers test: `security-headers.spec.ts`
    - **Acceptance:** Test verifies required headers present.

### Review

16. [x] **[P1][S]** Execute Gemini review for all security changes (per AGENTS.md).
    - **Acceptance:** Gemini review completed and documented (via gemini CLI on 2026-01-29).

---

## Smoke Tests for This Phase

```bash
# Rate limiting test
for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done
# Expected: 200, 200, 200, 200, 200, 429

# Security headers test
curl -I http://localhost:3001/health | grep -E "(X-Content-Type|X-Frame-Options|Strict-Transport)"
# Expected: Headers present
```

---

## Deliverables

- [x] Rate limiting implemented (global + login-specific).
- [x] Security headers applied.
- [x] Security checklist updated with real status.
- [x] JWT storage decision documented.
- [x] Tests for rate limit and headers.

---

## Validation

- [x] `curl -X POST /auth/login` (x6) returns 429 on 6th attempt (covered by `auth.rate-limit.e2e-spec.ts`).
- [x] Response headers include security headers (covered by `security-headers.e2e-spec.ts`).
- [x] Login rate limit works (5 attempts/5 min).
- [x] Tests pass: `npm run test:cov -w apps/backend-core` (2026-01-29).
- [x] Gemini review completed (2026-01-29).

---

## Files Likely to Change

- `apps/backend-core/src/main.ts`
- `apps/backend-core/src/app.module.ts`
- `apps/backend-core/src/auth/auth.controller.ts`
- `apps/backend-core/src/auth/auth.service.ts`
- `apps/backend-core/src/auth/auth.constants.ts`
- `apps/backend-core/src/auth/strategies/jwt.strategy.ts`
- `apps/backend-core/src/common/guards/csrf.guard.ts`
- `apps/backend-core/src/database/entities/refresh-token.entity.ts`
- `apps/backend-core/src/database/migrations/20260129003000-CreateRefreshTokensTable.ts`
- `apps/backend-core/package.json`
- `apps/web-frontend/src/lib/auth.ts` (if storage changes)
- `apps/web-frontend/src/lib/api.ts`
- `apps/web-frontend/src/hooks/useAuth.ts`
- `apps/backend-core/test/auth.rate-limit.e2e-spec.ts`
- `apps/backend-core/test/security-headers.e2e-spec.ts`
- `docs/sprints/round 2/10_ADR_REGISTRO.md`

---

## Blockers

- None

---
