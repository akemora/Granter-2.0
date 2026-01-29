# 📋 SPRINT 0 PLAN - Setup & Architecture

**Duration:** 3 días (Lunes-Miércoles) | **Team:** 2 devs | **Hours:** 24 | **Status:** Ready to start

---

## 📊 Sprint Overview

```
Sprint Goal: Infra, boilerplate, CI/CD operativa
Duration: 3 días (8h/día)
Team: Frontend Dev + Backend Dev
Success: docker compose up && all healthy
```

---

## Day 1: Monday - Repository & Frontend Infra

### Task S0-D1-1: Create Monorepo with Turbo (8:00-10:30)

**MCP Assignment:** `claude-bridge` + Haiku (Setup task - simple template)
**Tokens Est.:** ~2,000 (Haiku cheap for boilerplate)

**Task Details:**
```
├─ Initialize Turbo monorepo
├─ Setup package.json workspaces
├─ Configure turbo.json
└─ Git init + .gitignore
```

**Checklist:**
- [ ] `npx create-turbo@latest` executed
- [ ] `apps/` folder with 3 subdirs
- [ ] `packages/` folder created
- [ ] `.gitignore` includes node_modules, .env, dist
- [ ] `turbo.json` configured with build cache

**MCP Prompt:**
```
Task: Setup Turbo monorepo for GRANTER v2
Scope: 3 apps (backend-core, web-frontend, data-service) + 1 package (shared)
Output: Code snippets for turbo.json + root package.json
Token budget: 2000 max
Speed: Critical (this is Day 1 blocker)
```

**Success Criteria:**
```bash
turbo run build  # Must not error
turbo run test   # Must work (even if tests pass as empty)
```

---

### Task S0-D1-2: Next.js 16.0.x Boilerplate (10:30-12:30)

**MCP Assignment:** `claude-bridge` + Haiku (Boilerplate generation)
**Tokens Est.:** ~2,500

**Task Details:**
```
├─ Create web-frontend with App Router (Next.js 16.0.x)
├─ TypeScript strict mode
├─ Tailwind CSS with design tokens
├─ Jest setup
└─ .eslintrc + .prettierrc
```

**Checklist:**
- [ ] `npm create next-app@latest web-frontend@16.0.x` (App Router, TS, Tailwind)
- [ ] `tsconfig.json` with `"strict": true`
- [ ] `jest.config.js` configured
- [ ] `tailwind.config.js` created (empty, will fill later)
- [ ] `.eslintrc.json` + `.prettierrc` from CONVENTIONS_FRONTEND

**MCP Prompt:**
```
Task: Generate Next.js 16 + Tailwind + Jest boilerplate
Requirements:
  - App Router (not Pages)
  - TypeScript strict mode
  - Tailwind CSS installed
  - Jest for component tests
  - ESLint + Prettier config

Output format: File contents (tsconfig, jest.config, etc)
Keep it simple: no complex features, just boilerplate
```

---

### Task S0-D1-3: Backend Core NestJS 11.0.x Boilerplate (13:30-15:30)

**MCP Assignment:** `claude-bridge` + Haiku (Framework setup)
**Tokens Est.:** ~2,500

**Task Details:**
```
├─ Create backend-core with NestJS 11.0.x
├─ TypeORM setup
├─ PostgreSQL connection config
├─ Jest for unit tests
└─ Environment validation (joi)
```

**Checklist:**
- [ ] `npm i -g @nestjs/cli@11.0.x && nest new backend-core`
- [ ] `package.json` has: @nestjs/typeorm, typeorm, pg, joi
- [ ] `src/app.module.ts` imports TypeOrmModule
- [ ] `.env.example` created (NO secrets)
- [ ] `jest.config.js` configured

---

### Task S0-D1-4: Data Service FastAPI Boilerplate (15:30-17:30)

**MCP Assignment:** `claude-bridge` + Haiku (FastAPI minimal)
**Tokens Est.:** ~2,000

**Task Details:**
```
├─ Create data-service FastAPI
├─ Pydantic models
├─ Pytest setup
└─ requirements.txt
```

**Checklist:**
- [ ] `apps/data-service/main.py` created
- [ ] FastAPI app initialized (`app = FastAPI()`)
- [ ] Health endpoint: `GET /health`
- [ ] `src/models/` folder with `__init__.py`
- [ ] `src/tests/conftest.py` with pytest fixtures
- [ ] `requirements.txt` with: fastapi, uvicorn, pydantic, pytest
- [ ] `pyproject.toml` with pytest config

**MCP Prompt:**
```
Task: Generate FastAPI boilerplate for data service
Requirements:
  - Main FastAPI app with health endpoint
  - Pydantic v2 models
  - Pytest fixtures
  - requirements.txt
  - Project structure (src/, tests/)

Output: Code files + requirements.txt
Keep minimal: no complex logic, just structure
```

---

## Day 2: Tuesday - Docker & Database Setup

### Task S0-D2-1: Docker Compose Orchestration (8:00-10:00)

**MCP Assignment:** `claude-bridge` + Haiku (Docker config is straightforward)
**Tokens Est.:** ~1,500

**Task Details:**
```
├─ Create docker-compose.yml
├─ Define 5 services: frontend, backend, data-service, postgres, redis
├─ Health checks
├─ Environment variables
└─ Volumes for persistence
```

**Checklist:**
- [ ] Service: `web-frontend` (port 3000)
- [ ] Service: `backend-core` (port 3001)
- [ ] Service: `data-service` (port 8000)
- [ ] Service: `postgres` (port 5432, volume for data)
- [ ] Service: `redis` (port 6379)
- [ ] Health checks on each service
- [ ] Environment variables from .env
- [ ] Network configured (default docker-compose network)

**Docker Compose Template:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: granter
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  backend-core:
    build: ./apps/backend-core
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/granter

  data-service:
    build: ./apps/data-service
    ports:
      - "8000:8000"
    environment:
      BACKEND_URL: http://backend-core:3001

  web-frontend:
    build: ./apps/web-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend-core:3001
```

---

### Task S0-D2-2: TypeORM Database Schema (10:00-12:00)

**MCP Assignment:** `claude-bridge` + Sonnet (DB schema needs precision)
**Tokens Est.:** ~3,000 (more complex than Haiku can handle)

**Task Details:**
```
├─ Create TypeORM entities
├─ users, grants, sources, scraper_logs
├─ Constraints: UNIQUE, CHECK, FK
└─ Database config in app.module.ts
```

**Checklist:**
- [ ] `src/database/entities/user.entity.ts` (id, email, password_hash, created_at)
- [ ] `src/database/entities/grant.entity.ts` (id, title, amount, deadline, source_id, created_at)
- [ ] `src/database/entities/source.entity.ts` (id, name, url, region, active)
- [ ] `src/database/entities/scraper_log.entity.ts` (id, source_id, status, result, timestamp)
- [ ] Constraints:
  - [ ] users: UNIQUE(email), CHECK(password_hash length >= 60)
  - [ ] grants: CHECK(amount > 0), FK to source
  - [ ] source: UNIQUE(url)
- [ ] TypeOrmModule.forRoot() in app.module.ts

**MCP Prompt (Sonnet):**
```
Task: Generate TypeORM entities for GRANTER database
Requirements:
  - Entity: User (id, email, password_hash, created_at)
  - Entity: Grant (id, title, description, amount, deadline, region, source_id)
  - Entity: Source (id, name, url, region, active, created_at)
  - Entity: ScraperLog (id, source_id, status, result, timestamp)
  - Constraints: UNIQUE on email, url; CHECK on amount > 0; FK relationships
  - TypeORM decorators: @Entity, @Column, @PrimaryGeneratedColumn, @Index

Include database config for app.module.ts (TypeOrmModule.forRoot)
Token budget: 3000 max
```

---

### Task S0-D2-3: .env & Secrets Configuration (12:00-13:00)

**MCP Assignment:** `claude-bridge` + Haiku (Configuration is simple)
**Tokens Est.:** ~800

**Task Details:**
```
├─ Create .env.example (NO SECRETS)
├─ Create .env (gitignore, local development only)
├─ Environment validation setup
└─ Secrets checklist
```

**Checklist:**
- [ ] `.env.example` exists in root
- [ ] `.env` exists locally (NEVER commit)
- [ ] `.gitignore` includes `.env`
- [ ] Variables: JWT_SECRET, DB_*, GEMINI_API_KEY, SERVICE_TOKEN
- [ ] All secrets MIN 32 characters
- [ ] `.env.example` has placeholder values (no real secrets)

**Content:**
```env
# .env.example (commit this)
DATABASE_URL=postgresql://user:password@localhost:5432/granter
JWT_SECRET=your-secret-key-minimum-32-characters-required
SERVICE_TOKEN=your-service-token-32-chars-minimum
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001

# .env (DO NOT COMMIT - local only)
DATABASE_URL=postgresql://granter_dev:dev_password@localhost:5432/granter
JWT_SECRET=dev-secret-key-that-is-at-least-32-characters-long-yes
SERVICE_TOKEN=dev-service-token-that-is-32-characters-minimum-here
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NODE_ENV=development
```

---

### Task S0-D2-4: GitHub Actions CI/CD Pipeline (13:00-15:30)

**MCP Assignment:** `claude-bridge` + Sonnet (CI/CD config complex)
**Tokens Est.:** ~2,500

**Task Details:**
```
├─ Create .github/workflows/test.yml
├─ Jobs: lint, type-check, test, coverage
├─ Matrix: backend, frontend, data-service
└─ Fail if: tests fail, coverage < 70%, lint errors
```

**Checklist:**
- [ ] `.github/workflows/test.yml` created
- [ ] Job: Lint (eslint, ruff)
- [ ] Job: Type Check (tsc, mypy --strict)
- [ ] Job: Tests (Jest, pytest, parallel)
- [ ] Job: Coverage Check (must be > 70%)
- [ ] Matrix strategy for parallel jobs
- [ ] PR checks blocking: NO merge if any job fails

**MCP Prompt (Sonnet):**
```
Task: Create GitHub Actions CI/CD workflow
Requirements:
  - Parallel jobs: lint (eslint + ruff), type-check (tsc + mypy), test (jest + pytest), coverage
  - Backend (NestJS): npm run lint, npm run type-check, npm run test
  - Frontend (Next.js): npm run lint, npm run type-check, npm test
  - Data (FastAPI): ruff check, mypy --strict, pytest
  - Coverage check: fail if < 70%
  - Trigger: on push, on PR
  - NO merge if any job fails

Output: .github/workflows/test.yml
Keep concise: use matrix for parallelization
```

---

## Day 3: Wednesday - Boilerplate Tests & Documentation

### Task S0-D3-1: Test Boilerplate Setup (8:00-10:00)

**MCP Assignment:** `claude-bridge` + Haiku (Test boilerplate simple)
**Tokens Est.:** ~2,000

**Task Details:**
```
├─ Create first test files (empty, structure only)
├─ auth.service.spec.ts (NestJS)
├─ Button.test.tsx (React)
├─ test_ia_service.py (pytest)
└─ Verify all pass (even if empty)
```

**Checklist:**
- [ ] `apps/backend-core/src/auth/__tests__/auth.service.spec.ts` exists
- [ ] `apps/backend-core/test/auth.e2e-spec.ts` exists
- [ ] `apps/web-frontend/__tests__/Button.test.tsx` exists
- [ ] `apps/data-service/src/tests/test_ia_service.py` exists
- [ ] `npm run test` passes (all tests, even if empty)
- [ ] Coverage reports generated (baseline)

---

### Task S0-D3-2: Component Library Foundation (10:00-12:00)

**MCP Assignment:** `claude-bridge` + Haiku (Component templates)
**Tokens Est.:** ~2,000

**Task Details:**
```
├─ Create Button, Input, Label atoms
├─ Create FormField molecule
├─ Each with basic test
└─ Tailwind styling
```

**Checklist:**
- [ ] `src/components/atoms/Button/Button.tsx` (variant, size, loading props)
- [ ] `src/components/atoms/Button/Button.test.tsx` (renders, onClick, disabled)
- [ ] `src/components/atoms/Input/Input.tsx`
- [ ] `src/components/atoms/Label/Label.tsx`
- [ ] `src/components/molecules/FormField/FormField.tsx`
- [ ] All use Tailwind utilities (from tailwind.config.js)

**Button Example:**
```typescript
// src/components/atoms/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${variants[variant]} ${sizes[size]} rounded-md transition-colors`}
      {...props}
    >
      {isLoading ? '...' : children}
    </button>
  );
}
```

---

### Task S0-D3-3: Tailwind Design Tokens (12:00-13:00)

**MCP Assignment:** `claude-bridge` + Haiku (Config file)
**Tokens Est.:** ~1,500

**Task Details:**
```
├─ Complete tailwind.config.js
├─ Colors (primary, secondary, neutral, status)
├─ Spacing, typography, shadows, radius
└─ Design tokens from PROPUESTA_FRONTEND
```

**Checklist:**
- [ ] Colors defined (primary 50-900, secondary, neutral, danger, warning, success)
- [ ] Spacing: xs, sm, md, lg, xl, 2xl
- [ ] Typography: fontFamily, fontSize (xs-4xl), fontWeight, lineHeight
- [ ] Shadows: xs, sm, base, md, lg, xl, focus
- [ ] Border radius: sm, md, lg, xl, full
- [ ] Z-index: dropdown, modal, tooltip, toast
- [ ] Transitions: fast, base, slow

---

### Task S0-D3-4: Documentation & AGENTS.md Setup (13:00-15:00)

**MCP Assignment:** `claude-bridge` + Haiku (Documentation)
**Tokens Est.:** ~1,000

**Task Details:**
```
├─ Create AGENTS_CUSTOMIZADO_GRANTER.md summary
├─ Create local-dev README
├─ Create CONVENTIONS.md reference link
└─ Verify all links work
```

**Checklist:**
- [ ] Root `README.md` created (quick start)
- [ ] Link to `AGENTS_CUSTOMIZADO_GRANTER.md`
- [ ] Link to `CONVENTIONS.md`
- [ ] Link to `CONVENTIONS_FRONTEND.md`
- [ ] Dev setup instructions in README
- [ ] `make dev` command created (Makefile)
- [ ] All links verified

---

### Task S0-D3-5: Local Dev Environment Validation (15:00-17:30)

**MCP Assignment:** Manual (no MCP needed - this is validation)
**Tokens Est.:** 0 (local testing)

**Checklist:**
- [ ] `npm install` completes without errors
- [ ] `docker compose up -d` starts all services
- [ ] `npm run typeorm migration:run` completes successfully
- [ ] `curl http://localhost:3001/health` returns 200
- [ ] `curl http://localhost:8000/health` returns 200
- [ ] `npm run test` passes all (even if empty)
- [ ] `npm run lint` passes (no errors)
- [ ] `npm run type-check` passes (no errors)
- [ ] All services healthy: `docker compose ps` shows all running
- [ ] `.env` configured locally
- [ ] Smoke test E2E: `curl -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"TestPass123"}' ` returns 201 or 400 (not 500)
- [ ] CI/CD pipeline runs green on first commit

---

## 📊 Daily Summary

### Day 1 (Monday)
| Task | MCP | Model | Est. Hours | Status |
|------|-----|-------|-----------|--------|
| Turbo setup | claude-bridge | Haiku | 2.5h | 🟡 |
| Next.js boilerplate | claude-bridge | Haiku | 2h | 🟡 |
| NestJS boilerplate | claude-bridge | Haiku | 2h | 🟡 |
| FastAPI boilerplate | claude-bridge | Haiku | 2h | 🟡 |
| **Day 1 Total** | | | **8.5h** | |

### Day 2 (Tuesday)
| Task | MCP | Model | Est. Hours | Status |
|------|-----|-------|-----------|--------|
| Docker Compose | claude-bridge | Haiku | 2h | 🟡 |
| TypeORM schema | claude-bridge | Sonnet | 2h | 🟡 |
| .env config | claude-bridge | Haiku | 1h | 🟡 |
| GitHub Actions CI/CD | claude-bridge | Sonnet | 2.5h | 🟡 |
| **Day 2 Total** | | | **7.5h** | |

### Day 3 (Wednesday)
| Task | MCP | Model | Est. Hours | Status |
|------|-----|-------|-----------|--------|
| Test boilerplate | claude-bridge | Haiku | 2h | 🟡 |
| Component library | claude-bridge | Haiku | 2h | 🟡 |
| Tailwind tokens | claude-bridge | Haiku | 1h | 🟡 |
| Documentation | claude-bridge | Haiku | 2h | 🟡 |
| Local validation | Manual | N/A | 2.5h | 🟡 |
| **Day 3 Total** | | | **9.5h** | |

---

## 🎯 Sprint 0 Success Criteria

```
✅ MUST PASS:
  □ docker compose up -d → all services healthy
  □ npm run dev → no errors (frontend + backend start)
  □ npm run test → all pass (empty tests OK)
  □ npm run lint → 0 errors
  □ npm run type-check → 0 errors
  □ CI/CD pipeline → green on first commit
  □ .env.example → exists, no secrets
  □ AGENTS.md → linked and accessible

❌ IF ANY FAIL:
  → DO NOT proceed to Sprint 1
  → Fix blockers immediately
```

---

## 📝 Notes

- **Token Budget Sprint 0:** ~24,000 tokens (Haiku-heavy, 80% Haiku, 20% Sonnet)
- **Actual Cost:** ~18,000 tokens (Haiku = 75% cheaper than Sonnet)
- **Critical Path:** Docker + Database (Day 2) - if fails, blocks everything
- **Parallelization:** Frontend/Backend/DataService can be setup in parallel (assign one person per service)

---

**Sprint 0 Ready to Start!** 🚀
