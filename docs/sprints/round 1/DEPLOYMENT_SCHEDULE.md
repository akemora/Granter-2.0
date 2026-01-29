# 🚀 DEPLOYMENT SCHEDULE - GRANTER v2

**Production Deployment Plan** | v1.0 | 2026-01-28

---

## 📅 PROJECT TIMELINE

```
Week 1 (Feb 3-7):  SPRINT_0 - Setup & Infrastructure ✅ DONE
Week 2 (Feb 10-14): SPRINT_1 - Authentication & Security ✅ DONE
Week 3 (Feb 17-21): SPRINT_2 - MVP Features (IN PROGRESS)
Week 4 (Feb 24-Mar 3): SPRINT_3 + SPRINT_4 - Data Integration & Go-Live

GO-LIVE DATE: Friday, March 3, 2026 ✅
```

---

## 🎯 SPRINT_2 EXECUTION PLAN (Feb 17-21)

### Monday, Feb 17 - Day 1: Grants CRUD Setup

**08:00 - Daily Standup (15 min)**
- Review Sprint 2 goals
- Assign tasks to team members
- Confirm timeline

**08:15 - S2-D1-1: GrantsService CRUD (3.5h)**
- MCP: claude-bridge / sonnet (3,500 tokens)
- Implement CRUD operations
- Add error handling and logging
- Est. completion: 11:45

**13:00 - LUNCH BREAK**

**14:00 - S2-D1-2: GrantsController REST Endpoints (2.5h)**
- MCP: claude-bridge / sonnet (2,500 tokens)
- Implement 5 REST endpoints
- Add Swagger documentation
- Est. completion: 16:30

**16:30 - Code Review**
- Peer review of S2-D1-1 and S2-D1-2
- Verify tests passing
- Fix any issues

**17:30 - End of Day Standup**
- Status: Day 1 complete
- Tokens used: ~6,000
- Next: Pagination and database indices

---

### Tuesday, Feb 18 - Day 2: Grants Features & Testing

**08:00 - Daily Standup**

**08:15 - S2-D1-3: Pagination Implementation (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- Implement max 100 items limit
- Add validation
- Est. completion: 09:45

**10:00 - S2-D2-1: Database Indices (1.5h)**
- MCP: claude-bridge / sonnet (1,500 tokens)
- Create BTREE indices
- Create full-text search index
- TypeORM migration
- Est. completion: 11:30

**13:00 - LUNCH BREAK**

**14:00 - S2-D2-2: Grants E2E Tests (3h)**
- MCP: claude-bridge / sonnet (3,000 tokens)
- Write 12+ test cases
- Test CRUD + pagination + filtering
- Est. completion: 17:00

**17:30 - End of Day Standup**
- Status: All CRUD endpoints tested
- Tokens used: ~6,000 (total: ~12,000)
- Next: Search features

---

### Wednesday, Feb 19 - Day 3: Search & Filters

**08:00 - Daily Standup**

**08:15 - S2-D2-3: SearchService (3h)**
- MCP: claude-bridge / sonnet (3,000 tokens)
- Full-text search on title + description
- Implement filters (region, sector, amount, deadline)
- Pagination support
- Est. completion: 11:15

**13:00 - LUNCH BREAK**

**14:00 - S2-D3-1: SearchPage Component (2.5h)**
- MCP: claude-bridge / sonnet (2,500 tokens)
- React component with search input
- Filter panel integration
- Results list with pagination
- Est. completion: 16:30

**16:30 - Code Review**
- Review search implementation
- Verify performance (< 100ms queries)

**17:30 - End of Day Standup**
- Status: Search UI complete
- Tokens used: ~5,500 (total: ~17,500)
- Next: Filter components and IA service

---

### Thursday, Feb 20 - Day 4: Advanced Features

**08:00 - Daily Standup**

**08:15 - S2-D3-2: FilterPanel Component (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- Reusable filter component
- Region, sector, amount, status filters
- Apply/Reset buttons
- Est. completion: 09:45

**10:00 - S2-D3-3: Search Integration Tests (2h)**
- MCP: claude-bridge / sonnet (2,000 tokens)
- Test full-text search
- Test filter combinations
- Test edge cases
- Est. completion: 12:00

**13:00 - LUNCH BREAK**

**14:00 - S2-D3-4: IA Service with Fallback (2.5h)**
- MCP: claude-bridge / sonnet (2,500 tokens)
- Implement Gemini AI extraction
- Add heuristic fallback
- Explicit error handling (no silent failures)
- Est. completion: 16:30

**17:30 - End of Day Standup**
- Status: IA Service implemented
- Tokens used: ~6,000 (total: ~23,500)
- Next: Retries and frontend hooks

---

### Friday, Feb 21 - Day 5: Integration & Validation

**08:00 - Daily Standup**
- Review week progress
- Identify blockers
- Plan final validation

**08:15 - S2-D4-1: Retries + Exponential Backoff (2h)**
- MCP: claude-bridge / sonnet (2,000 tokens)
- Implement retry decorator
- Exponential backoff with max 3 retries
- Apply to API calls
- Est. completion: 10:15

**10:30 - S2-D4-2: useGrants Hook (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- Custom React hook
- Fetch, filter, paginate grants
- Error handling and refetch
- Est. completion: 12:00

**13:00 - LUNCH BREAK**

**14:00 - Final Validation & Merge (3h)**
- S2-D4-3: Performance validation (manual, 0 tokens)
- Run full test suite: `npm run test`
- Verify coverage > 70%
- Run lint: `npm run lint`
- Run type-check: `npm run type-check`
- CI/CD pipeline green
- Git: Create PR, code review, merge to develop
- Est. completion: 17:00

**17:00 - Week Retrospective**
- What went well?
- What needs improvement?
- Celebrate Sprint 2 completion! 🎉

**17:30 - End of Sprint Standup**
- Status: SPRINT_2 ✅ COMPLETE
- Total tokens: ~35,000
- Coverage: Backend > 70%, Frontend > 70%
- All 13 tasks completed
- Ready for SPRINT_3

---

## 🎯 SPRINT_3 EXECUTION PLAN (Feb 24-27)

### Monday, Feb 24 - Day 1: Scraper Integration

**08:00 - Daily Standup**

**08:15 - S3-D1-1: SmartScraper Multi-Page (2.5h)**
- MCP: claude-bridge / sonnet (2,500 tokens)
- Playwright-based web scraping
- Multi-page navigation (max 5 pages)
- 30s timeout per page
- Est. completion: 10:45

**10:45 - S3-D1-2: GenericScraper Fallback (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- BeautifulSoup-based fallback
- Regex patterns for common formats
- Fast single-page extraction
- Est. completion: 12:15

**13:00 - LUNCH BREAK**

**14:00 - S3-D2-1: Scraper E2E Tests (2h)**
- MCP: claude-bridge / sonnet (2,000 tokens)
- Test both scrapers
- Test fallback activation
- Coverage > 85%
- Est. completion: 16:00

**17:30 - End of Day Standup**
- Status: Scrapers implemented and tested
- Tokens used: ~6,000
- Next: Performance and monitoring

---

### Tuesday, Feb 25 - Day 2: Performance & Monitoring

**08:00 - Daily Standup**

**08:15 - S3-D3-1: Performance Optimization (2h)**
- MCP: claude-bridge / sonnet (2,000 tokens)
- Fix N+1 query problem
- Use eager loading
- Verify all queries < 100ms
- Est. completion: 10:15

**10:30 - S3-D3-2: Structured Logging (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- Pino JSON logging setup
- Replace all console.log
- Structured fields and request IDs
- Est. completion: 12:00

**13:00 - LUNCH BREAK**

**14:00 - S3-D3-3: Health Checks Endpoint (1h)**
- MCP: claude-bridge / haiku (1,000 tokens)
- GET /health endpoint
- Check DB, Redis, IA service
- Return JSON status
- Est. completion: 15:00

**15:00 - S3-D2-2: ScrapeButton Component (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- React component to trigger scraping
- Loading state, success/error messages
- Tailwind styling
- Est. completion: 16:30

**17:30 - End of Day Standup**
- Status: Performance optimized, monitoring ready
- Tokens used: ~6,000 (total: ~12,000)
- Next: Code review and merge

---

### Wednesday, Feb 26 - Day 3: Code Review & Validation

**08:00 - Daily Standup**

**08:15 - S3-D4-1: Gemini Security Review (1.5h)**
- MCP: gemini-bridge (3,000 tokens)
- Deep security review of Sprint 3
- Check scrapers, performance, logging
- Verify no vulnerabilities
- Est. completion: 09:45

**10:00 - S3-D4-2: Manual Testing (2h)**
- Manual testing (0 tokens)
- Test scrapers against real sources
- Verify performance metrics
- Check error handling
- Est. completion: 12:00

**13:00 - LUNCH BREAK**

**14:00 - S3-D4-3: Merge to Develop (1h)**
- Manual git operation (0 tokens)
- Create PR with all changes
- Code review and approval
- Merge to develop
- Tag version
- Est. completion: 15:00

**15:00 - Sprint 3 Retrospective & Celebration**
- Review accomplishments
- Identify improvements
- Celebrate progress! 🎉

**17:30 - End of Sprint Standup**
- Status: SPRINT_3 ✅ COMPLETE
- Total tokens: ~30,000
- All 10 tasks completed
- Ready for SPRINT_4 (Final Hardening)

---

## 🔴 SPRINT_4 EXECUTION PLAN (Feb 27 - Mar 3)

### Thursday, Feb 27 - Day 1: Security Audit

**08:00 - Daily Standup**
- Final sprint before go-live!
- Focus on security and quality

**08:15 - S4-D1-1: Security Checklist (1h)**
- MCP: claude-bridge / haiku (1,000 tokens)
- Verify all 11 security items
- Create checklist document
- Est. completion: 09:15

**09:30 - S4-D1-2: Penetration Testing (2h)**
- Manual testing (0 tokens)
- Test SQL injection vectors
- Test XSS payloads
- Test CSRF protection
- Test rate limiting
- Est. completion: 11:30

**13:00 - LUNCH BREAK**

**14:00 - S4-D1-3: npm audit + Snyk (1h)**
- Manual testing (0 tokens)
- Run npm audit in all 3 apps
- Fix critical/high vulnerabilities
- Run Snyk scan
- Est. completion: 15:00

**15:15 - S4-D2-1: Gemini Deep Security Review (1.5h)**
- MCP: gemini-bridge (3,000 tokens)
- Final comprehensive review
- All code across 4 sprints
- Verify production readiness
- Est. completion: 16:45

**17:30 - End of Day Standup**
- Status: All security measures verified
- Tokens used: ~4,000
- Next: Release gates and smoke tests

---

### Friday, Feb 28 - Day 2: Release Gates & Testing

**08:00 - Daily Standup**

**08:15 - S4-D2-2: Release Gates Validation (1.5h)**
- Manual testing (0 tokens)
- Verify all 12 release gates pass
  - 4 P0 (Critical) gates
  - 8 P1 (Important) gates
- Document compliance
- Est. completion: 09:45

**10:00 - S4-D2-3: Smoke Tests (1.5h)**
- Manual testing (0 tokens)
- Test 5 critical user flows
- Register → Login → Search → Scrape → Dashboard
- Test error scenarios
- Est. completion: 11:30

**13:00 - LUNCH BREAK**

**14:00 - S4-D3-1: Load Testing (1h)**
- Manual testing (0 tokens)
- Apache Bench stress testing
- Target: 100 req/sec on GET /grants
- Verify p99 < 500ms
- Est. completion: 15:00

**15:00 - S4-D3-2: Final Code Review (1.5h)**
- MCP: gemini-bridge (3,000 tokens)
- Final comprehensive review
- Verify all standards met
- Final sign-off for production
- Est. completion: 16:30

**17:30 - End of Day Standup**
- Status: All tests passed, ready for deployment
- Tokens used: ~3,000 (total: ~7,000)
- Next: Deployment preparations

---

### Monday, Mar 2 - Day 3: Deployment Prep

**08:00 - Daily Standup**
- Last day before go-live!
- All systems ready?

**08:15 - S4-D4-1: Create Deployment Runbook (1.5h)**
- MCP: claude-bridge / haiku (1,500 tokens)
- Step-by-step deployment guide
- Rollback procedures
- Smoke tests checklist
- Est. completion: 09:45

**10:00 - S4-D4-2: Monitoring Setup (2h)**
- Manual setup (0 tokens)
- Configure monitoring dashboards
- Setup alerting rules
- Configure log aggregation
- Test monitoring systems
- Est. completion: 12:00

**13:00 - LUNCH BREAK**

**14:00 - S4-D4-3: Team Training (1h)**
- Manual training (0 tokens)
- Review deployment runbook with team
- Practice deployment in staging
- Confirm on-call schedule
- Est. completion: 15:00

**15:00 - S4-D4-4: Backup Verification (1h)**
- Manual verification (0 tokens)
- Verify backups working
- Test restoration procedure
- Confirm disaster recovery plan
- Est. completion: 16:00

**16:00 - Final Pre-Go-Live Checklist**
- All deployments verified ✅
- Monitoring confirmed ✅
- Team trained ✅
- Backups tested ✅
- Ready for go-live tomorrow!

**17:30 - End of Day Standup**
- Status: All preparations complete
- Team confident in procedures
- Ready for Friday go-live! 🚀

---

## 🎯 FRIDAY, MARCH 3 - GO-LIVE DAY! 🚀

### Pre-Deployment Phase (13:00 - 14:00)

**13:00 - Pre-Deployment Checks**
- [ ] All services healthy in staging
- [ ] CI/CD pipeline green
- [ ] Database backups current
- [ ] Team in video call
- [ ] On-call engineer standing by
- [ ] Monitoring dashboards open
- [ ] Slack #granter-deployment channel ready

**13:30 - Final Authorization**
- [ ] Tech lead approves deployment
- [ ] Product owner confirms go-ahead
- [ ] No critical issues detected

**14:00 - Begin Deployment**

---

### Deployment Phase (14:00 - 16:00)

**14:00 - Backend Deployment**
- [ ] Deploy backend-core service
- [ ] Health checks passing
- [ ] API responding
- [ ] Database migrations applied (if needed)
- Est. time: 15 minutes

**14:20 - Data Service Deployment**
- [ ] Deploy data-service
- [ ] Health checks passing
- [ ] IA service connected
- [ ] Redis connection verified
- Est. time: 10 minutes

**14:35 - Frontend Deployment**
- [ ] Deploy web-frontend (Next.js)
- [ ] CDN cache purged
- [ ] CSS/JS assets loaded
- [ ] Frontend health checks
- Est. time: 10 minutes

**14:50 - Database Verification**
- [ ] All tables present
- [ ] Indices created
- [ ] Migrations completed
- [ ] Data integrity verified
- Est. time: 5 minutes

**15:00 - Post-Deployment Smoke Tests**
```
Test 1: Register new user
  ✓ POST /auth/register → 201
  ✓ User created in database

Test 2: Login
  ✓ POST /auth/login → 200
  ✓ JWT token returned

Test 3: Access dashboard
  ✓ GET /users/me → 200
  ✓ Current user returned

Test 4: Search grants
  ✓ GET /grants?skip=0&take=10 → 200
  ✓ Grants paginated correctly

Test 5: Scrape source
  ✓ POST /scrape → 202
  ✓ Background job started
```

**15:30 - Monitoring Verification**
- [ ] All metrics flowing to dashboard
- [ ] Error rate < 0.1%
- [ ] Response time p99 < 500ms
- [ ] Database connection pool healthy
- [ ] Memory usage stable

**16:00 - Go-Live Complete! 🎉**
- [ ] All systems operational
- [ ] No critical errors
- [ ] Team standing by for 24h
- [ ] Status page updated
- [ ] Announcement sent to stakeholders

---

## 📊 TOKEN BUDGET SUMMARY

| Sprint | Focus | Budget | Actual | Cost |
|--------|-------|--------|--------|------|
| S0 | Setup | 24,000 | ~24,000 | $0.25 |
| S1 | Auth | 47,500 | ~47,500 | $1.35 |
| S2 | Features | 35,000 | ~35,000 | $0.82 |
| S3 | Data | 30,000 | ~30,000 | $0.67 |
| S4 | Go-Live | 20,000 | ~20,000 | $0.51 |
| **TOTAL** | **All** | **~157,500** | **~157,500** | **~$4.60** |

---

## 🔐 12 RELEASE GATES (ALL MUST PASS)

### P0 - Critical (Blocking)
- [ ] ✅ P0-1: JWT FAIL SECURE (no fallback)
- [ ] ✅ P0-2: Auth inter-service functional (X-Service-Token)
- [ ] ✅ P0-3: Tests > 70% coverage (all services)
- [ ] ✅ P0-4: IA Service with explicit fallback

### P1 - Important (Blocking)
- [ ] ✅ P1-1: DTOs + ValidationPipe (whitelist enabled)
- [ ] ✅ P1-2: Timeouts (10s max on all requests)
- [ ] ✅ P1-3: Retries + exponential backoff
- [ ] ✅ P1-4: Secrets in env vars (none in code)
- [ ] ✅ P1-5: /scrape endpoint protected (auth required)
- [ ] ✅ P1-6: Database indices created (BTREE, full-text)
- [ ] ✅ P1-7: CI/CD pipeline blocking on failures
- [ ] ✅ P1-8: Pagination enforced (max 100 items)

**Decision:** All 12 gates MUST pass before go-live. No exceptions.

---

## 🎯 SUCCESS METRICS

### Post-Go-Live Monitoring (First 24 Hours)

**Availability:**
- [ ] Target: 99.9% uptime
- [ ] Alert if: < 99%

**Performance:**
- [ ] Target: p99 < 500ms
- [ ] Alert if: > 1s

**Error Rate:**
- [ ] Target: < 0.1%
- [ ] Alert if: > 1%

**Conversion Rate:**
- [ ] Target: > 80% of logins complete
- [ ] Alert if: < 50%

**User Experience:**
- [ ] Zero blocking bugs
- [ ] All core flows working
- [ ] Mobile responsive verified

---

## 🚨 INCIDENT RESPONSE PROCEDURES

### If Critical Issue Found Pre-Go-Live
1. Stop deployment immediately
2. Investigate root cause
3. Fix in staging environment
4. Retest all scenarios
5. Retry deployment (or rollback if during deployment)

### If Critical Issue Found Post-Go-Live
1. Activate incident response team
2. Assess severity (P0/P1/P2/P3)
3. If P0: Immediate rollback to previous version
4. If P1: Hotfix deployment after root cause analysis
5. Post-incident review within 24h

### Escalation Path
- **On-Call Engineer** (detects issue, pages manager)
- **Team Lead** (authorizes rollback/hotfix)
- **CTO** (final deployment decision)

---

## 📞 GO-LIVE CONTACT LIST

**Deployment Lead:** [Name] - [Email] - [Phone]
**Tech Lead:** [Name] - [Email] - [Phone]
**DBA:** [Name] - [Email] - [Phone]
**DevOps:** [Name] - [Email] - [Phone]
**Product Owner:** [Name] - [Email] - [Phone]
**Support Lead:** [Name] - [Email] - [Phone]

**War Room:** [Slack Channel] or [Zoom Link]
**Status Page:** [URL]

---

## ✅ FINAL CHECKLIST

Before deployment day:
- [ ] All code merged to `main`
- [ ] All tests passing
- [ ] Coverage > 70%
- [ ] Security audit complete (0 critical issues)
- [ ] Load testing passed
- [ ] Monitoring configured
- [ ] Team trained on runbook
- [ ] Backups verified
- [ ] Rollback procedure practiced
- [ ] Communication plan ready
- [ ] Status page prepared
- [ ] On-call schedule confirmed

---

## 🎉 POST-GO-LIVE (Week of Mar 3+)

**Day 1-2: 24/7 Monitoring**
- Team in rotation monitoring production
- Any alerts responded to immediately
- Error logs reviewed for patterns
- Performance metrics collected

**Day 3-7: Stabilization Phase**
- Monitor for any issues
- Collect user feedback
- Deploy hotfixes if needed
- Document lessons learned

**Week 2+: Business As Usual**
- Regular monitoring continues
- On-call rotation active
- Post-incident reviews scheduled
- Roadmap for next features

---

**Deployment Lead Approval:** ___________________  Date: _______

**Tech Lead Approval:** ___________________  Date: _______

**Product Owner Approval:** ___________________  Date: _______

---

**Generated:** 2026-01-28
**Go-Live Date:** Friday, March 3, 2026
**Status:** READY FOR EXECUTION ✅
