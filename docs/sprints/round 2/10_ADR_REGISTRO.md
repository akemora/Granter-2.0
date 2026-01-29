# ARCHITECTURE DECISION RECORDS (ADR)

Status: IN PROGRESS
Last update: 2026-01-29

---

## Purpose

This document records all architectural decisions made during Round 2. Each ADR captures the context, decision, and consequences to ensure transparency and enable future review.

---

## ADR Template

```markdown
## ADR-XXX: [Title]

**Status:** PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
**Date:** YYYY-MM-DD
**Phase:** [Which phase this decision belongs to]

### Context
[Describe the issue or question that needs resolution]

### Decision
[Describe the decision made]

### Alternatives Considered
[List other options that were evaluated]

### Consequences
- Positive: [Benefits]
- Negative: [Drawbacks/Trade-offs]
- Neutral: [Other effects]

### Implementation Notes
[Any specific implementation details]
```

---

## ADR-001: API Response Format

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 0

### Context
API documentation describes a wrapper format `{ data, success, timestamp }` but current implementation returns responses directly (e.g., `{ accessToken }` instead of `{ data: { accessToken }, success: true, timestamp: ... }`).

This causes:
- Frontend confusion about response structure
- Inconsistent error handling
- Documentation-code mismatch

### Decision
**Option A: Implement Wrapper**
- Add a global response interceptor to wrap successful responses
- Add a global exception filter/interceptor for standardized error format
- Update frontend API client to unwrap `{ data, success, timestamp }`

### Alternatives Considered
1. Partial wrapper (only for errors) - Rejected: inconsistent
2. Version API (v1 direct, v2 wrapped) - Rejected: complexity

### Consequences
- Positive: Consistent contract across all endpoints; aligns with docs and conventions; simplifies error handling.
- Negative: Requires backend + frontend changes; introduces a breaking change for any external consumers.
- Neutral: Slightly larger payloads on all responses.

### Implementation Notes
- Implement a NestJS interceptor to wrap responses.
- Update API docs and examples to show wrapper as canonical.
- Add tests for wrapper shape on representative endpoints.

---

## ADR-002: JWT Storage Strategy

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 1

### Context
Current implementation stores JWT in localStorage, which is vulnerable to XSS attacks. Security best practices recommend httpOnly cookies for token storage.

### Decision
**Option B: Move to httpOnly Cookies**
- Store access token in an httpOnly, Secure cookie (SameSite=Lax in dev; SameSite=Strict in prod if feasible)
- Frontend no longer stores tokens in localStorage
- Add CSRF protection (double-submit cookie or CSRF token header)

### Alternatives Considered
1. Session-based auth - Rejected: stateless JWT preferred
2. OAuth with external provider - Rejected: scope creep

### Consequences
- Positive: Stronger protection against XSS token theft; aligns with security checklist.
- Negative: Requires CSRF protection; requires CORS credentials handling; updates to frontend auth flow.
- Neutral: Slightly more complex local dev configuration.

### Implementation Notes
- Set cookies in auth controller (`Set-Cookie` with httpOnly/Secure/SameSite).
- Enable `credentials: true` in CORS for frontend origin(s).
- Issue a CSRF token and validate it on state-changing requests.

---

## ADR-003: Grant Data Model Extensions

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 2

### Context
GrantEntity lacks fields needed for filtering: status, sectors, beneficiaries. These are required for GRANTER 1.0 feature parity.

### Decision
Add the following fields to GrantEntity:

```typescript
// GrantStatus enum
export enum GrantStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

// Fields to add:
status: VARCHAR(20) DEFAULT 'open'
sectors: TEXT (simple-array, comma-separated)
beneficiaries: TEXT (simple-array, comma-separated)
sourceId: UUID (FK to sources, nullable)
```

### Alternatives Considered
1. Separate tables for sectors/beneficiaries - Rejected: over-engineering for MVP
2. JSONB fields - Rejected: simple-array sufficient, better TypeORM support
3. Enum for sectors - Rejected: sectors should be flexible

### Consequences
- Positive: Enables filtering, better data model, improved traceability
- Negative: Migration needed, existing grants get defaults
- Neutral: Scrapers need update to populate fields

### Implementation Notes
- Use TypeORM simple-array for sectors/beneficiaries
- Create index on status for query performance
- Default status to 'open' for existing grants
- Set `onDelete: 'SET NULL'` for the `sourceId` foreign key.

---

## ADR-004: Source Handler Architecture

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 4

### Context
ScraperService currently only handles HTML sources. Need to support API, RSS, and PDF sources without creating a monolithic service.

### Decision
Implement Strategy Pattern with handler registry:

```typescript
interface SourceHandler {
  canHandle(source: SourceEntity): boolean;
  scrape(source: SourceEntity): Promise<ScrapedGrant[]>;
}

// Registry in ScraperService
handlers: SourceHandler[] = [
  new HtmlHandler(smartScraper, genericScraper),
  new ApiHandler(),
  new RssHandler(),
  new PdfHandler(),
];
```

### Alternatives Considered
1. Switch statement in service - Rejected: violates Open/Closed principle
2. Factory pattern - Rejected: handlers need dependencies
3. Separate services per type - Rejected: code duplication

### Consequences
- Positive: Easy to add new source types, clean separation
- Negative: Initial refactoring effort
- Neutral: Handlers can be tested independently

### Implementation Notes
- Use NestJS dependency injection for handlers
- HtmlHandler wraps existing SmartScraper + GenericScraper
- Each handler in separate file

---

## ADR-005: User Profile Architecture

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 3

### Context
Current profile is global (`default-profile`). Need per-user profiles for personalization.

### Decision
- Add `user_id` FK to user_profiles table
- Change profile ID from static string to UUID
- Create profile automatically on first access
- Update all services to receive userId from JWT

### Alternatives Considered
1. Embedded profile in User entity - Rejected: too many columns
2. Separate preferences table - Rejected: over-engineering
3. Keep global + user override - Rejected: complex

### Consequences
- Positive: True personalization, proper data model
- Negative: Migration complexity, service refactoring
- Neutral: Profile created lazily on first access

### Implementation Notes
- The old `default-profile` will be orphaned by the migration.
- The `ProfileService` will implement a "lazy creation" pattern: if a user has no profile when `getProfile(userId)` is called, a new default one is created and saved. This is safer than a data migration script.
- Use OneToOne relation with cascade delete.

---

## ADR-006: JWT Invalidation Strategy

**Status:** ACCEPTED
**Date:** 2026-01-29
**Phase:** 1

### Context
The current JWT implementation has no mechanism for invalidation. If a token is compromised or a user logs out, the token remains valid until it expires, which is a security risk.

### Decision
**Option A: Short-lived Access Tokens + Refresh Tokens**
- Access tokens expire quickly (15 minutes).
- Refresh token stored in httpOnly cookie (7 days) with rotation.
- `/auth/refresh` issues new access token (and rotates refresh token).
- `/auth/logout` invalidates refresh token server-side.

### Alternatives Considered
1. Do nothing (rely on short expiry) - Rejected: insufficient for immediate invalidation.

### Consequences
- Positive: Fast access token expiry reduces impact of compromise; refresh rotation enables robust invalidation.
- Negative: Requires refresh token storage and rotation logic; more moving parts.
- Neutral: Slight increase in auth-related DB writes.

### Implementation Notes
- Store hashed refresh tokens per user/session (DB table).
- Rotate refresh token on every refresh; revoke previous token.
- Ensure logout clears refresh cookie and invalidates server record.

---

## ADR-007: Background Job & Queue Management

**Status:** PROPOSED
**Date:** 2026-01-29
**Phase:** 4

### Context
The project has an undocumented `queue/` module. Long-running tasks like scraping (`scrape-async`) or sending bulk notifications should not block the main application thread. A formal queueing system is needed.

### Decision
Utilize NestJS's built-in Queue support, backed by Bull (which uses Redis).

- **Library:** `@nestjs/bull`, `bull`
- **Provider:** Redis
- **Use Cases:** Asynchronous scraping, email/push notifications.
- **Configuration:** Define queues (e.g., 'scraping', 'notifications') and processors.

### Alternatives Considered
1. RabbitMQ/AMQP - Rejected: heavier, more complex for current needs.
2. In-memory queue - Rejected: not persistent, jobs lost on restart.
3. Cron jobs (`@nestjs/schedule`) - Rejected: not suitable for on-demand job dispatching.

### Consequences
- Positive: Decouples long-running tasks, improves API responsiveness, provides job persistence and retry mechanisms.
- Negative: Adds a new dependency (Redis) to the infrastructure stack.

### Implementation Notes
- A new Redis instance will need to be available in all environments.
- The `queue/` module should be documented with a README.md.

---

## ADR-008: Testing Strategy

**Status:** PROPOSED
**Date:** 2026-01-29
**Phase:** 6

### Context
The project lacks a formal testing strategy, leading to placeholder tests (`AuthService.spec`) and inconsistent coverage.

### Decision
Adopt a standard testing pyramid strategy:

1.  **Unit Tests (Jest):** Focus on services, helpers, and individual components in isolation. Mock all external dependencies (repositories, other services). Goal: >80% coverage on business logic.
2.  **Integration Tests (Jest + Testcontainers/Supertest):** Test modules together. Use a real database instance (e.g., via Testcontainers) to verify database interactions and migrations. Test controller endpoints with `supertest`.
3.  **End-to-End (E2E) Tests (Playwright/Cypress):** Simulate real user flows from the frontend. A small, critical set of tests for major user journeys (e.g., register -> login -> search -> view detail).
4.  **Smoke Tests (Bash/Curl):** A simple script to verify that all services are up and key endpoints are responding after a deployment.

### Alternatives Considered
1. Only unit tests - Rejected: insufficient for verifying integrations.
2. Only E2E tests - Rejected: slow, brittle, and expensive to run.

### Consequences
- Positive: Increased code quality, reliability, and confidence in deployments.
- Negative: Increased development time to write and maintain tests.

### Implementation Notes
- The `test:smoke` script in FASE 6 is a good start.
- `AuthService.spec` is the first candidate for real integration tests.
- CI pipeline should run unit and integration tests on every commit/PR. E2E tests can run nightly or pre-deployment.

---

## Decision Log

| ADR | Title | Status | Phase | Date |
|-----|-------|--------|-------|------|
| 001 | API Response Format | ACCEPTED | 0 | 2026-01-29 |
| 002 | JWT Storage Strategy | ACCEPTED | 1 | 2026-01-29 |
| 003 | Grant Data Model | ACCEPTED | 2 | 2026-01-29 |
| 004 | Source Handler Architecture | ACCEPTED | 4 | 2026-01-29 |
| 005 | User Profile Architecture | ACCEPTED | 3 | 2026-01-29 |
| 006 | JWT Invalidation Strategy | ACCEPTED | 1 | 2026-01-29 |
| 007 | Background Job & Queue Mgmt | PROPOSED | 4 | 2026-01-29 |
| 008 | Testing Strategy | PROPOSED | 6 | 2026-01-29 |

---
