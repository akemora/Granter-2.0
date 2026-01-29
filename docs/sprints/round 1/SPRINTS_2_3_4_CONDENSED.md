# ⚡ SPRINTS 2-4 CONDENSED - Quick Reference

**Condensed plans for Sprints 2, 3, 4** | Use with ROADMAP_DESARROLLO_DESDE_0.md for full details

---

## 🟢 SPRINT 2: MVP Features (5 days, 32h)

**Goal:** Grants CRUD + Search + IA Integration

### Day 1-2: Grants CRUD & Pagination (16h)

| Task | MCP | Model | Tokens | Status |
|------|-----|-------|--------|--------|
| S2-D1-1: GrantsService (create, read, update, delete) | claude | sonnet | 3,500 | 🟡 |
| S2-D1-2: GrantsController endpoints | claude | sonnet | 2,500 | 🟡 |
| S2-D1-3: Pagination (limit 100) | claude | haiku | 1,500 | 🟡 |
| S2-D2-1: Database indices (BTREE, UNIQUE) | claude | sonnet | 1,500 | 🟡 |
| S2-D2-2: Grants E2E tests | claude | sonnet | 3,000 | 🟡 |

**MCP Logic:**
- Use Sonnet for service/controller (complex business logic)
- Use Haiku for pagination (simple limit/offset)
- Use Gemini for test review (code review)

---

### Day 2-3: Search & Filters (12h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S2-D2-3: SearchService (full-text, filters) | claude | sonnet | 3,000 |
| S2-D3-1: SearchPage component | claude | sonnet | 2,500 |
| S2-D3-2: FilterPanel component | claude | haiku | 1,500 |
| S2-D3-3: Integration tests (search) | claude | sonnet | 2,000 |

**Key Features:**
- Full-text search on title + description
- Filter by: region, sector, amount range, deadline
- Pagination with limit 100
- Database indices improve query time < 100ms

---

### Day 3-4: IA Service & Retries (12h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S2-D3-4: IA Service with fallback | claude | sonnet | 2,500 |
| S2-D4-1: Retries + exponential backoff | claude | sonnet | 2,000 |
| S2-D4-2: useGrants hook + error handling | claude | haiku | 1,500 |
| S2-D4-3: Performance validation | manual | n/a | 0 |

**Fallback Logic:**
```
1. Try: Gemini extraction with API key
2. Fallback: Heuristic extraction if timeout
3. Fallback: Explicit error (never return [])
```

---

### Success Criteria (Sprint 2 End)

```
✅ Grants CRUD working
✅ Search + filters functional
✅ IA Service with fallback
✅ Retries implemented
✅ All services >70% coverage
✅ CI/CD green
✅ Manual testing passed
```

**Token Budget Sprint 2:** ~35,000 tokens (~$0.82)

---

## 🟡 SPRINT 3: Data & Integration (4 days, 24h)

**Goal:** Scraper integration + Performance optimization

### Day 1-2: Scraper Integration (12h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S3-D1-1: SmartScraper (multi-page) | claude | sonnet | 2,500 |
| S3-D1-2: GenericScraper (fallback) | claude | haiku | 1,500 |
| S3-D2-1: Scraper E2E test | claude | sonnet | 2,000 |
| S3-D2-2: ScrapeButton component | claude | haiku | 1,500 |

**Scraper Logic:**
- SmartScraper: Multi-page navigation, max 5 pages, 2 levels depth
- Timeout: 30s per page
- Fallback: GenericScraper if SmartScraper fails

---

### Day 2-3: Performance & Monitoring (8h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S3-D3-1: Performance optimization (N+1 queries) | claude | sonnet | 2,000 |
| S3-D3-2: Structured logging (Pino JSON) | claude | haiku | 1,500 |
| S3-D3-3: Health checks endpoint | claude | haiku | 1,000 |

**Checklist:**
- [ ] All queries < 100ms
- [ ] N+1 problem solved (eager loading)
- [ ] Logs in JSON format (no console.log)
- [ ] Health checks on DB, Redis, IA

---

### Day 4: Integration & QA (4h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S3-D4-1: Gemini code review (all Sprint 3) | gemini | n/a | 3,000 |
| S3-D4-2: Manual testing + validation | manual | n/a | 0 |
| S3-D4-3: Merge to develop | manual | n/a | 0 |

---

### Success Criteria (Sprint 3 End)

```
✅ Scraper working (SmartScraper + fallback)
✅ Sources CRUD + discovery
✅ Performance: query time < 100ms
✅ Structured logging
✅ Health checks functional
✅ All >70% coverage
✅ Ready for hardening (Sprint 4)
```

**Token Budget Sprint 3:** ~30,000 tokens (~$0.67)

---

## 🔴 SPRINT 4: Hardening & Go-Live (4 days + deploy)

**Goal:** Security audit + Release validation + Production deployment

### Day 1-2: Security Audit (12h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S4-D1-1: Security checklist validation | claude | haiku | 1,000 |
| S4-D1-2: Penetration testing (manual) | manual | n/a | 0 |
| S4-D1-3: npm audit + snyk scan | manual | n/a | 0 |
| S4-D2-1: Gemini security review (deep) | gemini | n/a | 3,000 |

**Security Checklist:**
```
✅ JWT: No fallback, FAIL SECURE
✅ Passwords: Bcrypt 12 rounds
✅ Auth inter-service: X-Service-Token working
✅ DTOs: All with class validators
✅ ValidationPipe: Whitelist enabled
✅ Secrets: None in repo (detect-secrets scan)
✅ CORS: FAIL SECURE, no '*'
✅ Rate limiting: All endpoints limited
✅ SQL Injection: Parameterized queries
✅ XSS: React escaping enabled
✅ CSRF: Next.js protection
```

---

### Day 2-3: Release Validation (8h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S4-D2-2: Release gates validation | manual | n/a | 0 |
| S4-D2-3: Manual smoke tests | manual | n/a | 0 |
| S4-D3-1: Load testing (Apache Bench) | manual | n/a | 0 |
| S4-D3-2: Final code review (Gemini) | gemini | n/a | 3,000 |

**12 Release Gates (ALL MUST PASS):**
```
P0 (Critical):
  ✅ JWT FAIL SECURE
  ✅ Auth inter-service functional
  ✅ Tests >70% coverage
  ✅ IA with fallback

P1 (Important):
  ✅ DTOs + ValidationPipe
  ✅ Timeouts (10s max)
  ✅ Retries + backoff
  ✅ Secrets rotated
  ✅ /scrape protected
  ✅ Indices created
  ✅ CI/CD bloqueante
  ✅ Pagination (max 100)
```

---

### Day 4: Deployment Readiness (4h)

| Task | MCP | Model | Tokens |
|------|-----|-------|--------|
| S4-D4-1: Deployment runbook | claude | haiku | 1,500 |
| S4-D4-2: Monitoring setup | manual | n/a | 0 |
| S4-D4-3: Team training | manual | n/a | 0 |
| S4-D4-4: Backup verification | manual | n/a | 0 |

**Runbook Contents:**
```
├─ Pre-deploy checklist
├─ Deployment steps (step-by-step)
├─ Database migration procedure
├─ Rollback plan
├─ Smoke tests (post-deploy)
├─ Monitoring dashboard setup
├─ On-call escalation
└─ Post-incident review (if needed)
```

---

### FRIDAY: GO-LIVE!

**Deployment Schedule:**
```
13:00 - Pre-deployment checks
  ├─ All services healthy locally
  ├─ CI/CD pipeline green
  ├─ Team in video call
  └─ Final backup taken

14:00 - Start deployment
  ├─ Deploy backend-core
  ├─ Run migrations
  ├─ Deploy data-service
  ├─ Deploy web-frontend
  └─ DNS cutover (if needed)

16:00 - Smoke tests + monitoring
  ├─ Health checks passing
  ├─ Manual smoke tests (5 critical flows)
  ├─ Monitor logs (0 errors expected)
  └─ User acceptance testing

18:00 - Go-live complete
  ├─ Status page updated
  ├─ Team celebration 🎉
  ├─ 24/7 monitoring begins
  └─ Post-go-live standby (on-call)
```

---

### Success Criteria (Sprint 4 / Go-Live)

```
✅ ALL 12 release gates passed
✅ 0 critical security issues
✅ All manual tests passed
✅ Deployment successful
✅ No rollback needed
✅ Monitoring alerts configured
✅ Team trained
✅ Go-live metrics collected
```

**Token Budget Sprint 4:** ~20,000 tokens (~$0.51)

---

## 📊 Total Budget Summary

| Sprint | Focus | Budget | Cost | MCPs Used |
|--------|-------|--------|------|-----------|
| S0 | Setup | 24,000 | $0.25 | Haiku (75%), Sonnet (17%), Gemini (8%) |
| S1 | Auth | 47,500 | $1.35 | Sonnet (88%), Gemini (6%), Haiku (6%) |
| S2 | Features | 35,000 | $0.82 | Sonnet (63%), Haiku (23%), Gemini (14%) |
| S3 | Data | 30,000 | $0.67 | Sonnet (60%), Haiku (17%), Gemini (23%) |
| S4 | Go-Live | 20,000 | $0.51 | Gemini (30%), Haiku (15%), Manual (55%) |
| **TOTAL** | **All** | **~157,500** | **~$4.60** | **All MCPs optimized** |

---

## 🎯 MCP Usage by Sprint

```
Sprint 0: HAIKU-HEAVY (setup)
  ├─ Boilerplate: Haiku ✅ (cheapest)
  ├─ Database: Sonnet ⚠️ (necessary complexity)
  └─ Review: Gemini ✅ (after implementation)

Sprint 1: SONNET-HEAVY (security-critical)
  ├─ Auth code: Sonnet ✅ (only for security)
  ├─ Tests: Sonnet ✅ (complex test cases)
  └─ Review: Gemini ✅ (security focus)

Sprint 2: BALANCED (features)
  ├─ Services: Sonnet ✅
  ├─ Components: Mix (Sonnet + Haiku)
  └─ Review: Gemini ✅

Sprint 3: SONNET + GEMINI (performance)
  ├─ Scrapers: Sonnet ✅
  ├─ Performance: Sonnet ✅
  └─ Review: Gemini ✅ (optimizations)

Sprint 4: GEMINI-HEAVY (validation)
  ├─ Security audit: Gemini ✅ (specializes)
  ├─ Code review: Gemini ✅ (final gate)
  └─ Manual: Testing team (smoke tests)
```

---

## 🔗 Cross-References

For detailed task-by-task breakdowns, see:
- Sprint 0: `SPRINT_0_PLAN.md`
- Sprint 1: `SPRINT_1_PLAN.md`
- Orchestration: `ORCHESTRATOR_MASTER_PLAN.md`
- Full roadmap: `ROADMAP_DESARROLLO_DESDE_0.md`
- Architecture: `PROPUESTA_ARQUITECTURA_DESDE_0.md`
- Security: `PROPUESTA_SEGURIDAD_DESDE_0.md`
- Testing: `PROPUESTA_TESTING_DESDE_0.md`

---

## ✅ Using This Document

**If you need:**
1. **Day-by-day tasks** → Read `SPRINT_0_PLAN.md` + `SPRINT_1_PLAN.md`
2. **Full sprint details** → Read `ROADMAP_DESARROLLO_DESDE_0.md`
3. **MCP assignments** → Check ORCHESTRATOR_MASTER_PLAN.md (decision matrix)
4. **Quick overview** → This document (Sprints 2-4)
5. **How to start** → Read GETTING_STARTED.md (next file to create)

---

**Total Project: 4 weeks, ~$4.60 token cost, Production-Ready GRANTER v2**

Go live: Friday, March 3, 2026 ✅
