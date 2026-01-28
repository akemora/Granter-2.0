# 🛠️ GRANTER 2.0 - DEVELOPMENT GUIDE

**Version:** 2.0.0 | **Status:** Production Ready | **Last Updated:** 2026-01-28

---

## Quick Start

```bash
git clone <repo-url>
cd "GRANTER 2.0"
npm install
cp .env.example .env
# Edit .env with your secrets
docker compose up -d
npm run migration:run
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Project Structure

- **apps/backend-core/** - NestJS API
- **apps/web-frontend/** - React SPA with useGrants hook
- **apps/data-service/** - Python data processing
- **packages/** - Shared code
- **migrations/** - Database migrations

---

## Development Workflow

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### API Development
- Create DTO in `src/*/dto/`
- Create service in `src/*/services/`
- Create controller in `src/*/controllers/`
- Add tests in `__tests__/`

### Frontend Development
- Create components in `src/components/`
- Use custom hooks (useGrants for grants operations)
- Add tests with React Testing Library
- Follow atomic design (atoms, molecules, organisms)

### Testing
```bash
npm run test              # All tests
npm run test --watch    # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E tests
```

### Code Quality
```bash
npm run lint            # Check linting
npm run type-check      # TypeScript check
npm run format          # Format code
```

---

## Code Standards

### TypeScript
- Full type annotations required
- No 'any' types
- Strict mode enforced

### React
- Functional components only
- Hooks for state management
- useCallback for callbacks
- useMemo for expensive computations

### Error Handling
- Comprehensive try/catch
- Proper error logging
- User-friendly error messages

---

## Database

### Migrations
```bash
npm run migration:generate -- --name=add_field_name
npm run migration:run
npm run migration:status
```

### Query Performance
- Indices on: region, amount, deadline, search
- Full-text search with GIN index
- Target: < 100ms queries

---

## Authentication

**JWT Implementation:**
- Algorithm: HS256
- Expiration: 7 days
- Secret: 32+ characters

**Password:**
- Hashing: bcrypt (12 rounds)
- Storage: Always hashed, never plain text

---

## Key Services

### Scraper (2-Tier Fallback)
1. SmartScraper (multi-page, 30s timeout)
2. GenericScraper (single-page, 15s timeout)

### IA Extraction (Gemini → Heuristic)
1. Gemini API (primary, 10s timeout)
2. Heuristic (fallback)

### Search
- Full-text search in title/description
- Filtering by region, sector, amount, deadline
- Pagination support
- Response: < 100ms

---

## Testing Requirements

- Unit Tests: 85%+ coverage
- Critical Paths: 100% coverage
- E2E Tests: 5 critical flows
- Total: 200+ test cases

Current Status: ✅ All passing

---

## Common Commands

```bash
npm run dev              # Start all services
npm run build            # Build for production
npm run test             # Run tests
npm run test:coverage    # Coverage report
npm run lint             # Lint code
npm run type-check       # Type check
npm run db:health-check  # Database health
npm run migration:run    # Run migrations
```

---

**Status:** ✅ Production Ready
**Last Updated:** 2026-01-28
**Version:** 2.0.0
