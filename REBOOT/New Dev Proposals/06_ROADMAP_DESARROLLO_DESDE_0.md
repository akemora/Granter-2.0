# 📅 ROADMAP DESARROLLO DESDE 0 - GRANTER V2

**Sprint-by-Sprint Breakdown: From Scratch to Production** | v1.0 | 2026-01-27

> **Timeline:** 4 weeks (2 weeks MVP, 1 week hardening, 1 week go-live)
> **Team:** 2 senior developers (full-time, no context switching)
> **Methodology:** Agile + TDD + Security-First + Test-Driven

---

## 📋 Índice

- [Executive Summary](#executive-summary)
- [Sprint 0: Setup & Architecture](#sprint-0-setup--architecture)
- [Sprint 1: MVP Auth & Security](#sprint-1-mvp-auth--security)
- [Sprint 2: MVP Features](#sprint-2-mvp-features)
- [Sprint 3: Data & Integration](#sprint-3-data--integration)
- [Sprint 4: Hardening & Go-Live](#sprint-4-hardening--go-live)
- [Release Gates](#release-gates)
- [Risk Management](#risk-management)

---

## Executive Summary

### Vision

```
Week 0:  Setup infra, boilerplate, CI/CD          (3 days)
Week 1:  Auth, JWT, tests (P0 security)           (40 hours)
Week 2:  Grants CRUD, Search, Integration         (32 hours)
Week 3:  IA Service, Scraper, Performance         (24 hours)
Week 4:  Go-live validation, monitoring, deploy   (16 hours)

TOTAL: ~112 hours of development work (2 devs, 4 weeks)
STATUS: MVP ready for BETA LIMITED in Week 3
```

### Non-Negotiable Requirements

```
✅ MUST HAVE (P0 - BLOCKING):
   ├─ JWT without fallback (FAIL SECURE)
   ├─ Auth inter-service (X-Service-Token)
   ├─ Class validators + ValidationPipe
   ├─ Tests: >70% coverage in all services
   ├─ Database constraints (UNIQUE, CHECK, etc.)
   └─ Secrets management (rotate, never in repo)

✅ SHOULD HAVE (P1 - Important):
   ├─ Retries + exponential backoff
   ├─ IA Service with fallback
   ├─ Indices en BD (performance)
   ├─ CORS fail-secure
   ├─ Rate limiting
   └─ Structured logging

⚠️ NICE TO HAVE (P2 - If time permits):
   ├─ Token HttpOnly
   ├─ Health checks
   ├─ CSP headers
   └─ Advanced monitoring

🚫 DO NOT IMPLEMENT (P3 - Defer to v2.1):
   ├─ API Gateway
   ├─ Service Mesh
   ├─ Advanced caching strategy
   ├─ Multi-region deployment
   └─ Advanced analytics
```

---

## Sprint 0: Setup & Architecture

**Duration:** 3 days (Monday-Wednesday) | **Team:** 2 devs | **Est. Hours:** 24

### Goals

- [ ] Repository setup (monorepo, turbo)
- [ ] Local dev environment working
- [ ] CI/CD pipeline (tests + lint + security audit)
- [ ] Database schema and migrations
- [ ] Docker Compose running locally
- [ ] All boilerplate code generated

### Tasks

#### Day 1: Repository & Infra (8 hours)

**Frontend Developer:**
```
1. Create Next.js 16 boilerplate with Tailwind (2h)
   └─ App Router, TypeScript strict mode
   └─ Design tokens in tailwind.config.js
   └─ Atomic design folder structure
   └─ jest.config.js + testing setup

2. Setup ESLint + Prettier + TypeScript (1h)
   └─ .eslintrc.json
   └─ .prettierrc
   └─ tsconfig.json (strict: true)

3. Create basic pages (1h)
   └─ pages/login.tsx (shell)
   └─ pages/dashboard.tsx (shell)
   └─ pages/not-found.tsx

4. Tests boilerplate (1h)
   └─ jest setup
   └─ @testing-library/react setup
   └─ First component test example
```

**Backend Developer:**
```
1. Create NestJS 11 boilerplate (1.5h)
   └─ Backend Core app.module.ts
   └─ TypeORM setup
   └─ Env validation (joi)

2. Create FastAPI boilerplate (1.5h)
   └─ Data Service main.py
   └─ Pydantic models
   └─ Pytest setup

3. Docker Compose orchestration (1h)
   └─ docker-compose.yml (all 5 services)
   └─ .env.example (NO secrets)
   └─ Startup health checks

4. Database schema (migrations) (2h)
   └─ TypeORM migrations (backend-core)
   └─ Tables: users, grants, sources, scraper_logs
   └─ Constraints: UNIQUE, CHECK, FK
```

#### Day 2: CI/CD & Databases (8 hours)

**Both devs:**
```
1. GitHub Actions CI setup (2h)
   └─ .github/workflows/test.yml
   └─ Parallel jobs: backend, frontend, data-service
   └─ Fail if: tests fail, coverage < 70%, lint errors
   └─ No merge without green CI

2. Database local setup (1h)
   └─ Docker postgres 15
   └─ Test database with cleanup scripts
   └─ Seed minimal test data

3. Authentication skeleton (2h)
   ├─ Backend: AuthModule boilerplate
   ├─ JWT strategy (NOT IMPLEMENTED YET, just skeleton)
   ├─ Frontend: useAuth hook (mock implementation)
   └─ Tests: auth.service.spec.ts (empty, will fill in Sprint 1)

4. API routes skeleton (1h)
   ├─ POST /auth/register
   ├─ POST /auth/login
   ├─ GET /grants
   ├─ POST /sources (for inter-service)
   └─ All return mock data

5. Documentation & AGENTS.md (1h)
   └─ Create AGENTS_CUSTOMIZADO_GRANTER.md
   └─ Commands for dev, test, build
   └─ File size limits (400 lines max)
   └─ Security checklist
```

#### Day 3: Boilerplate & Local Testing (8 hours)

**Frontend:**
```
1. Component library foundation (2h)
   └─ Button, Input, Label components
   └─ FormField molecule
   └─ Tests for each

2. Hooks boilerplate (1h)
   └─ useAuth (mocked)
   └─ useForm (basic)
   └─ useApi (basic)

3. Pages structure (1h)
   └─ LoginPage (form shell)
   └─ DashboardPage (shell)
   └─ Layout (Header, Nav, Footer)

4. CSS: Design tokens (1h)
   └─ tailwind.config.js complete
   └─ All colors, spacing, fonts from PROPUESTA_FRONTEND
   └─ Dark mode setup
```

**Backend:**
```
1. DTOs boilerplate (2h)
   ├─ src/auth/dto/register.dto.ts (class + @IsString, etc.)
   ├─ src/grants/dto/create-grant.dto.ts
   ├─ src/sources/dto/create-source.dto.ts
   └─ ValidationPipe global setup

2. Guards skeleton (1h)
   └─ JWT guard (not functional yet)
   └─ X-Service-Token guard (not functional yet)

3. Database seeding (1h)
   └─ src/database/seeders/
   └─ Default test users
   └─ Sample grants
   └─ Sample sources

4. Python service skeleton (1h)
   └─ src/services/ia_service.py (mock)
   └─ src/services/scraper_service.py (mock)
   └─ Logging setup (Pino JSON)
```

### Deliverables

- [ ] Git repo: monorepo with turbo + 3 apps
- [ ] All 5 Docker services running locally
- [ ] Local dev environment: `make dev` works
- [ ] CI/CD pipeline green
- [ ] Test scaffolding (empty tests, ready to fill)
- [ ] AGENTS_CUSTOMIZADO_GRANTER.md complete

### Approval Criteria

```
✅ docker compose up -d && sleep 10
   ├─ All 5 services healthy (GET /health returns 200)
   ├─ Frontend accessible at http://localhost:3000
   ├─ Backend accessible at http://localhost:3001/health
   ├─ Data service accessible at http://localhost:8000/health

✅ npm run dev works without errors

✅ CI/CD first run succeeds (green checkmarks)

✅ All boilerplate tests pass (even if they do nothing)

❌ If any of above fails → DO NOT PROCEED to Sprint 1
```

---

## Sprint 1: MVP Auth & Security

**Duration:** 5 days (Lunes-Viernes) | **Team:** 2 devs | **Est. Hours:** 40

### Goals

- [ ] JWT authentication fully implemented (FAIL SECURE)
- [ ] Inter-service auth (X-Service-Token)
- [ ] User registration & login working end-to-end
- [ ] Password hashing (bcrypt)
- [ ] Class validators + GlobalValidationPipe
- [ ] 100% of auth critical paths tested
- [ ] Database constraints and audit tables

### Tasks

#### Day 1-2: JWT Implementation (8 hours backend, 4 hours frontend)

**Backend:**
```
1. JWT Implementation (3h)
   ├─ JwtStrategy: payload validation
   ├─ FAIL SECURE: No fallback, throw if JWT_SECRET missing
   ├─ Token generation with exp claim
   ├─ Token verification with revocation check
   └─ TEST: jwt.strategy.spec.ts (100% coverage)

2. Password Security (2h)
   ├─ Bcrypt 12 rounds minimum
   ├─ Constant-time comparison
   ├─ Password strength validation (min 12 chars, mixed case, numbers)
   └─ TEST: auth.service.spec.ts (100% coverage)

3. Auth Endpoints (2h)
   ├─ POST /auth/register (validation, create user)
   ├─ POST /auth/login (credentials check, token generation)
   ├─ GET /users/me (protected, returns current user)
   └─ TEST: auth.e2e-spec.ts (integration tests)

4. Tests (1h)
   ├─ jwt.strategy.spec.ts
   ├─ auth.service.spec.ts
   ├─ auth.controller.spec.ts
   └─ Coverage: >95%
```

**Frontend:**
```
1. useAuth Hook (1.5h)
   ├─ login(email, password) → calls /auth/login
   ├─ register(email, password) → calls /auth/register
   ├─ logout() → clears token
   ├─ getCurrentUser() → GET /users/me
   └─ TEST: useAuth.test.ts

2. LoginForm Component (1.5h)
   ├─ Email + password inputs
   ├─ Form validation (client-side)
   ├─ Error handling
   ├─ Loading state
   ├─ Redirect on success
   └─ TEST: LoginForm.test.tsx (>80% coverage)

3. AuthLayout (1h)
   ├─ Login page skeleton
   ├─ Register page skeleton
   ├─ Protected routes guard
   └─ TEST: AuthLayout.test.tsx
```

#### Day 3: Inter-Service Auth & DTOs (8 hours backend, 2 hours frontend)

**Backend:**
```
1. X-Service-Token Guard (2h)
   ├─ Read X-Service-Token header
   ├─ Constant-time comparison with service secret
   ├─ Allow data-service to create grants/sources without user JWT
   ├─ Deny if token invalid or missing
   └─ TEST: x-service-token.guard.spec.ts (100%)

2. DTOs with Validators (3h)
   ├─ src/auth/dto/register.dto.ts
   │  └─ @IsEmail(), @MinLength(12), @Matches(regex for password)
   ├─ src/grants/dto/create-grant.dto.ts
   │  └─ @IsString(), @IsNumber(min: 0), @IsISO8601(), etc.
   ├─ src/sources/dto/create-source.dto.ts
   │  └─ @IsUrl(), @IsString()
   └─ Global ValidationPipe: whitelist, forbidNonWhitelisted, transform

3. Tests (2h)
   ├─ validation.pipe.spec.ts
   ├─ Each DTO validation tests
   └─ Coverage: 100%
```

**Frontend:**
```
1. Auth Guard (1h)
   ├─ Middleware to check JWT before accessing /dashboard
   ├─ Redirect to /login if no token
   └─ TEST: auth.guard.test.ts

2. Token Management (1h)
   ├─ Store token in localStorage (Sprint 2 → HttpOnly)
   ├─ Send Authorization header with requests
   ├─ Refresh token logic (basic)
```

#### Day 4: Database Constraints & Audit (8 hours backend)

**Backend:**
```
1. Database Constraints (2h)
   ├─ users:
   │  ├─ email UNIQUE NOT NULL
   │  ├─ password_hash NOT NULL
   │  └─ created_at DEFAULT NOW()
   ├─ grants:
   │  ├─ title NOT NULL
   │  ├─ amount CHECK (amount > 0)
   │  └─ source_id FK users(id)
   └─ sources:
      ├─ url UNIQUE NOT NULL
      └─ region NOT NULL

2. Audit Tables (2h)
   ├─ audit_log (user_id, action, resource, timestamp)
   ├─ Triggers on: INSERT, UPDATE, DELETE for grants
   ├─ Logging every grant change
   └─ Query audit logs in tests

3. Migrations (2h)
   ├─ TypeORM migrations for all above
   ├─ Test: migrations run cleanly
   ├─ Seed test data
   └─ Rollback migrations work

4. Tests (2h)
   ├─ Database constraint tests
   ├─ Audit trigger tests
   ├─ Transaction rollback tests
   └─ Coverage: >90%
```

#### Day 5: Integration & QA (6 hours both, + 2h testing)

**Both devs:**
```
1. E2E Flow Testing (2h)
   ├─ Frontend → Backend: Register flow
   ├─ Frontend → Backend: Login flow
   ├─ Verify JWT stored in localStorage
   ├─ Verify protected endpoint requires JWT
   └─ Manual testing on browsers (Chrome, Firefox, Safari)

2. Security Validation (2h)
   ├─ ✅ JWT expires correctly
   ├─ ✅ Cannot access /dashboard without token
   ├─ ✅ Cannot use expired token
   ├─ ✅ Password is hashed (not plain text in DB)
   ├─ ✅ SQL injection prevention (parameterized queries)
   └─ ✅ XSS prevention (escaping in React)

3. Code Review & Fixes (2h)
   ├─ Review each other's code
   ├─ Fix issues
   ├─ Ensure coverage > 70%
   └─ Run final tests

4. Tests & Coverage (2h)
   ├─ npm run test:cov -w backend-core
   ├─ npm run test:coverage -w web-frontend
   ├─ docker compose exec data-service pytest --cov=src
   └─ All > 70%?
```

### Deliverables

- [ ] Registration & login working end-to-end
- [ ] JWT stored and sent with requests
- [ ] X-Service-Token guard functional
- [ ] All DTOs with class validators
- [ ] Global ValidationPipe configured
- [ ] Database constraints in place
- [ ] Audit logging working
- [ ] Backend: >70% coverage
- [ ] Frontend: >70% coverage
- [ ] All P0 security tests passing

### Release Gates (Must pass to continue)

```
✅ JWT without fallback (FAIL SECURE)
✅ Registration creates hashed password
✅ Login returns valid JWT
✅ Protected endpoints reject invalid JWT
✅ X-Service-Token guard allows data-service
✅ Class validators reject invalid DTOs
✅ ValidationPipe whitelist enabled
✅ Database constraints enforced
✅ Tests > 70% coverage
✅ CI/CD passing
```

---

## Sprint 2: MVP Features

**Duration:** 5 days (Lunes-Viernes) | **Team:** 2 devs | **Est. Hours:** 32

### Goals

- [ ] Grants CRUD (Create, Read, Update, Delete)
- [ ] Search & filter functionality
- [ ] Sources management
- [ ] IA Service integration (with fallback)
- [ ] Retries + exponential backoff
- [ ] Database indices and performance
- [ ] >70% coverage on all services

### Tasks

#### Day 1-2: Grants CRUD (8 hours backend, 4 hours frontend)

**Backend:**
```
1. Grants Service (2h)
   ├─ create(CreateGrantDTO): Grant
   ├─ findAll(filters): Grant[]
   ├─ findById(id): Grant
   ├─ update(id, UpdateGrantDTO): Grant
   ├─ delete(id): void
   └─ Pagination support (limit 100)

2. Grants Controller (1h)
   ├─ GET /grants (list with filters)
   ├─ POST /grants (create, requires JWT)
   ├─ GET /grants/:id (detail)
   ├─ PUT /grants/:id (update)
   ├─ DELETE /grants/:id (delete)

3. Tests (2h)
   ├─ grants.service.spec.ts
   ├─ grants.controller.spec.ts
   ├─ grants.e2e-spec.ts
   └─ Coverage: >80%
```

**Frontend:**
```
1. GrantsList Component (1.5h)
   ├─ Render list of grants
   ├─ Responsive grid (1 col mobile, 3 cols desktop)
   ├─ Loading state
   ├─ Error state
   └─ TEST: GrantsList.test.tsx

2. GrantDetail Component (1.5h)
   ├─ Show full grant details
   ├─ Edit form
   ├─ Delete button with confirmation
   └─ TEST: GrantDetail.test.tsx

3. CreateGrantForm (1h)
   ├─ Form with validation
   ├─ Submit to backend
   ├─ Success/error handling
   └─ TEST: CreateGrantForm.test.tsx
```

#### Day 2-3: Search & Filters (4 hours backend, 4 hours frontend)

**Backend:**
```
1. Search Service (1.5h)
   ├─ Full-text search on title + description
   ├─ Filter by: region, sector, amount range, deadline
   ├─ Pagination with limit 100
   └─ Query optimization with indices

2. Database Indices (1h)
   ├─ CREATE INDEX idx_grants_region
   ├─ CREATE INDEX idx_grants_sector
   ├─ CREATE INDEX idx_grants_deadline
   ├─ CREATE INDEX idx_grants_amount
   └─ Verify query performance

3. Tests (1.5h)
   ├─ search.service.spec.ts
   ├─ Filter tests
   ├─ Performance tests (query time < 100ms)
```

**Frontend:**
```
1. SearchPage (2h)
   ├─ Search input with autocomplete
   ├─ Filter sidebar: region, sector, amount
   ├─ Results list (with pagination)
   ├─ Responsive layout
   └─ TEST: SearchPage.test.tsx

2. SearchBox Component (1h)
   ├─ Input + clear button
   ├─ Debounce search (300ms)
   ├─ Loading state
   └─ TEST: SearchBox.test.tsx

3. FilterPanel Component (1h)
   ├─ Checkboxes for sectors
   ├─ Slider for amount range
   ├─ Date range picker
   └─ TEST: FilterPanel.test.tsx
```

#### Day 3-4: IA Service & Retries (6 hours backend, 2 hours frontend)

**Backend (Data Service):**
```
1. IA Service with Fallback (2h)
   ├─ Call Gemini API for extraction
   ├─ FALLBACK: If API key missing → raise error (not return [])
   ├─ FALLBACK: If Gemini timeout → heuristic extraction
   ├─ FALLBACK: If heuristic fails → error message
   └─ TEST: ia_service.spec.ts (100%)

2. Retries + Exponential Backoff (2h)
   ├─ Retry failed requests: 3 attempts
   ├─ Backoff: 100ms, 500ms, 2000ms
   ├─ Apply to: Gemini API, backend API, BD queries
   └─ TEST: retry.interceptor.spec.ts

3. Tests (2h)
   ├─ ia_service.spec.ts
   ├─ retry logic tests
   ├─ Timeout tests
   └─ Coverage: >80%
```

**Frontend:**
```
1. useGrants Hook (1h)
   ├─ useQuery for GET /grants
   ├─ Retry on failure
   ├─ Handle loading/error states
   └─ TEST: useGrants.test.ts

2. Error Handling (1h)
   ├─ Toast notifications for errors
   ├─ Retry button on failure
   ├─ Graceful fallback UI
```

#### Day 4-5: Integration & Performance (8 hours both)

**Both:**
```
1. IA Integration Test (2h)
   ├─ Data service: Scrape + extract with Gemini
   ├─ Verify grants saved to backend
   ├─ Verify fallback works if API key missing
   └─ Manual test with real Gemini API

2. Search Performance (2h)
   ├─ Query 1000 grants with filters < 100ms
   ├─ Pagination prevents memory overflow
   ├─ N+1 query problem solved
   └─ Verify indices used

3. Coverage Validation (2h)
   ├─ Backend: npm run test:cov > 70%
   ├─ Frontend: npm test:coverage > 70%
   ├─ Data service: pytest --cov > 70%
   └─ Fix gaps

4. Code Review & Merge (2h)
   ├─ Peer review
   ├─ Fix issues
   ├─ Merge to develop
   ├─ CI/CD green
```

### Deliverables

- [ ] Grants CRUD working
- [ ] Search + filters functional
- [ ] IA Service with fallback
- [ ] Retries + exponential backoff
- [ ] Database indices created
- [ ] All >70% coverage
- [ ] E2E flow: Search → View → Save workflow

### Release Gates

```
✅ Create grant: works with validation
✅ Update grant: updates fields correctly
✅ Delete grant: removes from DB
✅ Search: filters by region/sector/amount
✅ IA Service: fallback works if API key missing
✅ Retries: 429 errors handled with backoff
✅ Database: indices improve query time
✅ Coverage: all services > 70%
```

---

## Sprint 3: Data & Integration

**Duration:** 4 days (Lunes-Jueves) | **Team:** 2 devs | **Est. Hours:** 24

### Goals

- [ ] Scraper integration (SmartScraper + GenericScraper)
- [ ] Sources management
- [ ] Discovery engine
- [ ] Performance optimization
- [ ] Monitoring & logging
- [ ] Pre-production validation

### Tasks

#### Day 1-2: Scraper Integration (6 hours backend, 2 hours frontend)

**Backend (Data Service):**
```
1. SmartScraper (2h)
   ├─ Multi-page navigation
   ├─ Paginators detection
   ├─ Max 5 pages, 2 levels depth
   ├─ Timeout: 30s per page
   └─ TEST: scraper.service.spec.ts

2. GenericScraper (1h)
   ├─ Single-page extraction
   ├─ Fallback if SmartScraper fails
   └─ TEST: generic_scraper.spec.ts

3. Scraper Integration (2h)
   ├─ Endpoint: POST /scrape (accepts source URL)
   ├─ Extract grants using IA
   ├─ Save to backend via POST /grants
   ├─ Logging (success/failure)
   └─ TEST: scraper.e2e-spec.ts
```

**Frontend:**
```
1. ScrapeButton Component (1.5h)
   ├─ Button to scrape URL
   ├─ Loading progress
   ├─ Error message on failure
   ├─ Success notification
   └─ TEST: ScrapeButton.test.tsx

2. SourcesPage (0.5h)
   ├─ List of sources
   ├─ Add/remove sources
   ├─ Trigger scrape for source
```

#### Day 2-3: Sources & Discovery (4 hours backend, 2 hours frontend)

**Backend:**
```
1. Sources Service (2h)
   ├─ CRUD for sources
   ├─ Categories: BDNS, UE, regions (ES-Madrid, ES-Barcelona, etc.)
   ├─ Mark as active/inactive
   └─ TEST: sources.service.spec.ts

2. Discovery Service (2h)
   ├─ Endpoint: GET /discover?region=ES&scope=BDNS
   ├─ List known sources for region
   ├─ Suggest new sources (heuristic)
   └─ TEST: discovery.service.spec.ts
```

**Frontend:**
```
1. SourcesList Component (1.5h)
   ├─ Display available sources
   ├─ Filter by region/category
   ├─ Add new source button
   └─ TEST: SourcesList.test.tsx

2. DiscoverSources (0.5h)
   ├─ Button to auto-discover for region
   ├─ Add discovered sources
```

#### Day 3-4: Performance & Monitoring (6 hours both)

**Backend:**
```
1. Database Performance (2h)
   ├─ Verify all indices in place
   ├─ N+1 query fixes
   ├─ Connection pooling (TypeORM)
   ├─ Cache strategy (Redis basic)
   └─ TEST: performance.spec.ts

2. Structured Logging (1.5h)
   ├─ Pino JSON logs
   ├─ Log format: timestamp, level, context, message, data
   ├─ NO console.log()
   ├─ Sensitive data redacted
   └─ TEST: logging.spec.ts

3. Health Checks (1.5h)
   ├─ GET /health endpoint
   ├─ Check: DB, Redis, IA Service
   ├─ Return: status, checks, timestamp
   └─ TEST: health.controller.spec.ts
```

**Frontend:**
```
1. Performance Optimization (2h)
   ├─ Code splitting (lazy load pages)
   ├─ Image optimization (next/image)
   ├─ Memoization (React.memo, useMemo, useCallback)
   ├─ Bundle size analysis
   └─ Target: <300KB gzipped

2. Error Tracking (1h)
   ├─ Sentry integration (basic)
   ├─ Log errors to backend
   ├─ User-friendly error messages
```

### Deliverables

- [ ] Scraper integration working
- [ ] Sources CRUD and discovery
- [ ] All indices in place
- [ ] Structured logging
- [ ] Health checks functional
- [ ] Performance baseline established

---

## Sprint 4: Hardening & Go-Live

**Duration:** 4 days (Lunes-Jueves) + Go-Live (Viernes) | **Team:** 2 devs | **Est. Hours:** 20

### Goals

- [ ] Validate all release gates
- [ ] Final security audit
- [ ] Load testing
- [ ] Deployment procedure
- [ ] Monitoring setup
- [ ] Go-live!

### Tasks

#### Day 1-2: Security Audit (8 hours both)

**Both:**
```
1. Security Checklist (2h)
   ✅ JWT: No fallback, FAIL SECURE
   ✅ Passwords: Bcrypt 12 rounds
   ✅ Auth inter-service: X-Service-Token
   ✅ DTOs: All with class validators
   ✅ ValidationPipe: Whitelist enabled
   ✅ Secrets: None in repo (scan with detect-secrets)
   ✅ CORS: FAIL SECURE, no '*'
   ✅ Rate limiting: All endpoints limited
   ✅ SQL Injection: All queries parameterized
   ✅ XSS: React escaping enabled
   ✅ CSRF: Next.js built-in protection

2. Penetration Testing (2h)
   ├─ Try to bypass auth
   ├─ Try SQL injection
   ├─ Try XSS attacks
   ├─ Try to access other user's data
   ├─ Verify rate limiting works
   └─ Document results

3. Code Scanning (2h)
   ├─ npm audit (dependencies)
   ├─ docker scan (images)
   ├─ detect-secrets (scan for API keys)
   ├─ snyk (vulnerability scan)
   └─ Fix any issues found

4. Performance Load Testing (2h)
   ├─ Apache Bench: 100 concurrent users
   ├─ Expected: p99 < 1s, no 5xx errors
   ├─ Verify auto-scaling (if applicable)
   └─ Document results
```

#### Day 2-3: Release Validation (6 hours both)

**Both:**
```
1. Final Test Suite Run (2h)
   ├─ Backend: npm run test:cov -w backend-core
   ├─ Frontend: npm run test:coverage -w web-frontend
   ├─ Data service: pytest --cov=src
   ├─ E2E: npm run test:e2e -w web-frontend
   └─ ALL > 70% coverage? YES ✅

2. Release Gates Validation (2h)
   ├─ ✅ P0-1: Auth inter-service funcional
   ├─ ✅ P0-2: JWT FAIL SECURE
   ├─ ✅ P0-3: Tests >70% coverage
   ├─ ✅ P0-4: IA with fallback
   ├─ ✅ P1-1: DTOs + ValidationPipe
   ├─ ✅ P1-2: Timeouts on requests
   ├─ ✅ P1-3: Retries + backoff
   ├─ ✅ P1-4: Secrets not in repo
   ├─ ✅ P1-5: /scrape protected
   ├─ ✅ P1-6: Indices created
   ├─ ✅ P1-7: CI/CD bloqueante
   └─ ✅ P1-8: Paginación (max 100)

3. Manual Testing Checklist (2h)
   ├─ Register new user
   ├─ Login as user
   ├─ Search grants
   ├─ Create/edit/delete grant
   ├─ Trigger scraper
   ├─ Verify data saved
   └─ Test on mobile/tablet/desktop
```

#### Day 3-4: Deployment Prep (4 hours both)

**Both:**
```
1. Deployment Procedure (1h)
   ├─ Create runbook: deploy-steps.md
   ├─ Database migration rollback plan
   ├─ Rollback procedures
   ├─ Smoke tests post-deploy
   └─ Team communication plan

2. Monitoring Setup (1h)
   ├─ Logging aggregation (basic)
   ├─ Error tracking (Sentry)
   ├─ Uptime monitoring
   ├─ Alert rules (errors, 5xx, latency)
   └─ On-call runbook

3. Go-Live Checklist (1h)
   ├─ Backups verified
   ├─ Secrets rotated (new JWT_SECRET)
   ├─ Terraform/IaC ready
   ├─ DNS/SSL configured
   ├─ Load balancer ready
   └─ Team trained on runbook

4. Knowledge Transfer (1h)
   ├─ Handoff documentation
   ├─ Architecture diagrams
   ├─ API documentation (Swagger)
   ├─ Common troubleshooting
   └─ Escalation procedures
```

#### Go-Live (Viernes 13:00-18:00)

**Deployment:**
```
1. Pre-go-live (13:00-14:00)
   ├─ Final backup
   ├─ CI/CD green
   ├─ All services healthy locally
   ├─ Team in Slack/video call
   └─ Smoke tests passing

2. Deployment (14:00-16:00)
   ├─ Deploy backend-core
   ├─ Run migrations
   ├─ Deploy data-service
   ├─ Deploy web-frontend
   ├─ DNS cutover (if needed)
   └─ Health checks passing

3. Post-deployment (16:00-18:00)
   ├─ Manual smoke tests on production
   ├─ Monitor logs/errors (0 expected)
   ├─ Load testing (basic)
   ├─ User testing (friendly testers)
   ├─ Close go-live ticket
   └─ Celebrate! 🎉

4. Post-go-live Monitoring (Ongoing)
   ├─ On-call engineer monitoring 24/7
   ├─ Incident response if issues arise
   ├─ Daily health check (1 week)
   ├─ Weekly health check (1 month)
   ├─ Performance analysis
   └─ User feedback collection
```

### Deliverables

- [ ] All security checks passed
- [ ] All release gates validated
- [ ] Deployment runbook tested
- [ ] Monitoring alerts configured
- [ ] Team trained
- [ ] GO-LIVE SUCCESSFUL ✅

---

## Release Gates

### MUST PASS to Go-Live

```
CRITICAL (P0 - BLOCKING):
  ✅ JWT without fallback (FAIL SECURE)
  ✅ Auth inter-service working (X-Service-Token)
  ✅ Tests > 70% coverage (all services)
  ✅ IA Service with explicit fallback
  ✅ Secrets rotated, none in repo
  ✅ Database constraints in place
  ✅ CI/CD passing (no overrides)

IMPORTANT (P1 - BLOCKING):
  ✅ DTOs with class validators
  ✅ ValidationPipe global + whitelist
  ✅ Timeouts on all requests (10s max)
  ✅ Retries + exponential backoff
  ✅ CORS FAIL SECURE
  ✅ Rate limiting on endpoints
  ✅ Database indices created
  ✅ /scrape and /discover protected

OPTIONAL (P2 - Defer if needed):
  ⏭️ HttpOnly tokens (can do in 2.1)
  ⏭️ Advanced monitoring (Datadog)
  ⏭️ CDN setup
  ⏭️ Kubernetes deployment

DO NOT (P3 - Explicitly excluded):
  ❌ API Gateway (add in v2.1)
  ❌ Service Mesh (add in v2.1)
  ❌ Multi-region (add in v2.1)
  ❌ Kubernetes (use Docker Compose initially)
```

---

## Risk Management

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| IA API key missing at go-live | Medium | Critical | Implement fallback, test without key in Sprint 2 |
| Database migration fails | Low | Critical | Test rollbacks, have backup strategy |
| Performance under load | Medium | High | Load test in Sprint 3, optimize indices |
| Security audit finds issues | Medium | Critical | Daily security reviews, pen testing |
| Team burnout (4-week sprint) | Low | Medium | Daily standups, realistic estimates, day off post-go-live |
| Third-party API outages | Low | Medium | Implement timeouts + retries, graceful degradation |

### Mitigation Strategy

```
✅ Daily standups (15 min) - identify blockers early
✅ 2-day sprint planning - clear priorities
✅ Pair programming on critical paths (auth, security)
✅ Automated tests catch 80% of bugs
✅ CI/CD bloqueante - no bad code merges
✅ Code review every PR - knowledge sharing
✅ Realistic estimates based on complexity
✅ Buffer time: 10% for unknowns
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Code Coverage | > 70% | ✅ Measured in Sprint 1 |
| Test Execution Time | < 5 min (unit), < 10 min (integration) | ✅ Measured in Sprint 0 |
| API Response Time (p99) | < 500ms | ✅ Measured in Sprint 3 |
| Security Issues Found | 0 critical | ✅ Audit in Sprint 4 |
| Go-Live Success | No rollback needed | ✅ Target |
| User Satisfaction | > 4/5 stars | ✅ Post-launch survey |
| System Uptime | > 99.5% (first month) | ✅ Monitor post-launch |

---

**Última actualización:** 2026-01-27
**Versión:** 1.0
**Status:** APPROVED FOR IMPLEMENTATION
