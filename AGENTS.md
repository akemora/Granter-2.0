# 🤖 AGENTS.md - Work Guidelines for Team & AI Agents

**GRANTER v2 Post-MVP Phase** | Status: Production Ready | Updated: 2026-01-28

---

## 📌 CRITICAL: Read This First

This document tells you:
1. **How to work on GRANTER v2 maintenance & improvements**
2. **Which MCP/Model to use for each task type**
3. **Non-negotiable rules you MUST follow**
4. **How to report progress and blockers**

---

## 🚀 NEW SESSION ONBOARDING (REQUIRED READING)

**If you're starting work on GRANTER v2 for the first time in this session, you MUST read these documents in order:**

### Phase 1: Project Overview (15 minutes)
```
1. README.md (root)
   → Project vision, key features, current status
   → Go-live date: March 3, 2026
   → Status: Production Ready, 84/84 tests passing

2. HOW_TO_RUN.md (root)
   → How to start the application locally
   → Prerequisites & quick start
   → Troubleshooting common issues
```

### Phase 2: Architecture & Design (20 minutes)
```
3. docs/development/ARCHITECTURE_OVERVIEW.md
   → System components (backend, frontend, data-service)
   → How services communicate
   → Database schema overview
   → 2-tier scraper architecture

4. API_REFERENCE.md (from docs/development/)
   → All 13 API endpoints
   → Request/response formats
   → Authentication patterns
   → Error responses
```

### Phase 3: Code Standards & Conventions (15 minutes)
```
5. CONVENTIONS.md (root)
   → Backend code style & standards
   → NestJS patterns
   → Database conventions
   → Testing patterns for backend

6. CONVENTIONS_FRONTEND.md (root)
   → Frontend code style & standards
   → React/Next.js patterns
   → Component structure (atoms, molecules, organisms)
   → CSS/Tailwind conventions
```

### Phase 4: Security & Testing (10 minutes)
```
7. docs/development/TESTING_GUIDE.md
   → Testing strategy (80% unit, 15% integration, 5% E2E)
   → How to run tests locally
   → Coverage requirements (>70%)

8. docs/sprints/round 1/SPRINT_4_SECURITY_CHECKLIST.md
   → Security requirements (96.2% complete)
   → JWT FAIL SECURE pattern
   → Token rotation requirements
   → Critical security rules
```

### Phase 5: Deployment & Operations (5 minutes)
```
9. docs/sprints/round 1/SPRINT_4_DEPLOYMENT_RUNBOOK.md
   → How to deploy to production
   → Pre-deployment checklist
   → Rollback procedures

10. AGENTS.md (this file)
    → Work guidelines & MCP assignments
    → How to classify and execute tasks
    → Escalation procedures
```

### ✅ First Session Checklist
```
[ ] Read README.md
[ ] Read HOW_TO_RUN.md
[ ] Read ARCHITECTURE_OVERVIEW.md
[ ] Read API_REFERENCE.md
[ ] Read CONVENTIONS.md
[ ] Read CONVENTIONS_FRONTEND.md
[ ] Read TESTING_GUIDE.md
[ ] Read docs/sprints/round 1/SPRINT_4_SECURITY_CHECKLIST.md
[ ] Read docs/sprints/round 1/SPRINT_4_DEPLOYMENT_RUNBOOK.md
[ ] Read AGENTS.md (this file)
[ ] Ready to work? → Proceed to task assignment
```

**Total Reading Time:** ~75 minutes
**Frequency:** First time only (bookmark this for quick reference on future sessions)

### 📂 Project Documentation Organization

All documentation is organized in the GRANTER 2.0 root directory:

```
GRANTER 2.0/
├── README.md                          ← START HERE
├── HOW_TO_RUN.md                      ← How to run locally
├── AGENTS.md                          ← This file (work guidelines)
├── CONVENTIONS.md                     ← Backend code standards (REQUIRED)
├── CONVENTIONS_FRONTEND.md            ← Frontend code standards (REQUIRED)
│
├── docs/
│   ├── README.md                      ← Documentation index
│   ├── development/                   ← Developer guides
│   │   ├── ARCHITECTURE_OVERVIEW.md
│   │   ├── API_REFERENCE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── DEVELOPMENT_GUIDE.md
│   │   └── TROUBLESHOOTING_QUICK_FIX.md
│   ├── sprints/                       ← Sprint reports & deployment
│   │   ├── SPRINT_4_FINAL_REPORT.md
│   │   ├── round 1/
│   │   │   ├── SPRINT_4_SECURITY_CHECKLIST.md
│   │   │   ├── SPRINT_4_DEPLOYMENT_RUNBOOK.md
│   │   │   └── SPRINT_4_GO_LIVE_GUIDE.md
│   ├── audits/                        ← Security & architecture audits
│   ├── proposals/                     ← Initial design proposals
│   └── project/                       ← Project summaries & conventions
│
└── apps/                              ← Source code
    ├── backend-core/                  ← NestJS backend
    ├── web-frontend/                  ← Next.js frontend
    └── data-service/                  ← FastAPI data service
```

**Rule:** If you're unsure where a document is, check `docs/README.md` for the full index.

---

## ⏱️ Quick Reference (Returning Users)

If you've already read the onboarding documents, use this quick checklist:

```
1. Know your task type (A-F)?
   → Use MCP Decision Matrix below
   → Check if it's security → Use Gemini
   → Check if it's simple → Use Haiku
   → Otherwise → Use Sonnet

2. Review critical rules?
   → JWT, tokens, secrets, coverage, reviews

3. Check code quality checklist?
   → Before marking task DONE

→ GO! 🚀
```

**Bookmark these for this session:**
- **Task Help:** See "📋 Task Classification & Workflow" section
- **MCP Choice:** See "📊 MCP Decision Matrix" section
- **Rules:** See "🔐 Critical Rules" section
- **Conventions:** Check CONVENTIONS.md or CONVENTIONS_FRONTEND.md

---

## 🎯 Your Role

### If You're an AI Agent:
- Receive task/issue assignment
- Identify task type (see classification below)
- Check "MCP Assignment" for your task type
- **Use that MCP. Don't deviate from it.**
- Complete the work
- Report status with metrics

### If You're a Human Developer:
- Same process, coordinate with AI agents
- AI agents handle complex tasks, you focus on integration/testing
- Always follow MCP assignments for consistency
- Use this document as the source of truth for work guidelines

---

## 🏗️ MCP Assignment Rules (NON-NEGOTIABLE)

### Rule 1: Security Code ALWAYS Uses Gemini
```
IF task involves:
  - JWT implementation or changes
  - Password hashing modifications
  - Token validation updates
  - Authentication guards
  - Inter-service auth (X-Service-Token)
  - Secrets or credentials handling
  - Security vulnerability fixes

THEN: Use Gemini (gemini-2.0-flash)
NO EXCEPTIONS.
```

### Rule 2: Boilerplate/Setup Uses Haiku
```
IF task is:
  - Configuration file updates
  - Simple bug fixes (one-liners)
  - Documentation generation
  - Dockerfile/docker-compose modifications
  - Simple component changes (no logic)
  - Environment setup

THEN: Use Claude Haiku
REASON: 75% cheaper, sufficient for simple tasks
```

### Rule 3: Complex Logic Uses Sonnet
```
IF task requires:
  - Business logic implementation
  - Service layer modifications
  - Bug investigation & fixes
  - Performance optimization
  - Database schema changes
  - Complex refactoring

THEN: Use Claude Sonnet
REASON: Best cost-benefit for complex reasoning
```

### Rule 4: Code Review/Audit Uses Gemini
```
IF task is:
  - Security audit of changes
  - Code review (any PR)
  - Architecture validation
  - Test coverage analysis
  - Performance profiling
  - Vulnerability assessment

THEN: Use Gemini
REASON: Specialized in security & architecture analysis
```

---

## 📋 Task Classification & Workflow

### Task Types

**TYPE A: Security/Auth Changes** → Gemini (5-10K tokens)
- JWT modifications
- Password/token handling
- Permission/authorization logic
- Security vulnerability fixes

**TYPE B: Bug Fixes** → Sonnet (2-5K tokens)
- Logic errors in services
- Database query issues
- API response formatting
- Data transformation bugs

**TYPE C: Simple Fixes** → Haiku (1-2K tokens)
- One-line fixes
- Config changes
- Documentation updates
- Simple UI tweaks

**TYPE D: New Features** → Sonnet (5-10K tokens)
- New API endpoints
- New database entities
- New service functionality
- Complex UI components

**TYPE E: Testing/Validation** → Sonnet (3-5K tokens)
- Test writing
- Test coverage improvement
- Integration testing
- E2E test scenarios

**TYPE F: Performance/Optimization** → Sonnet (5-8K tokens)
- Query optimization
- Caching implementation
- API performance tuning
- Memory/CPU optimization

---

## 📊 MCP Decision Matrix (Quick Reference)

| Task Type | MCP | Model | Use When | Budget |
|-----------|-----|-------|----------|--------|
| **Security Fix** | gemini | gemini-2.0-flash | Auth, JWT, tokens, secrets | 5-10K |
| **Bug Fix (complex)** | claude | sonnet | Logic errors, hard-to-find bugs | 3-5K |
| **Bug Fix (simple)** | claude | haiku | One-liner fixes, obvious issues | 1-2K |
| **New Feature** | claude | sonnet | New APIs, entities, complex logic | 5-10K |
| **Configuration** | claude | haiku | .env, docker-compose, simple updates | 1-2K |
| **Testing** | claude | sonnet | Test writing, coverage improvement | 3-5K |
| **Performance** | claude | sonnet | Optimization, caching, tuning | 5-8K |
| **Code Review** | gemini | gemini-2.0-flash | Security review, architecture check | 2-5K |
| **Documentation** | claude | haiku | Docs, README, guides | 1-2K |
| **Refactoring** | claude | sonnet | Code cleanup, maintainability | 3-5K |

---

## 🔐 Critical Rules (MUST FOLLOW)

### Rule 1: JWT Implementation
```
✅ DO:
   - Implement JWT FAIL SECURE (no fallback)
   - Validate token on EVERY request
   - Return 401 Unauthorized on invalid token
   - Store JWT secret in environment (never in code)
   - Use RS256 asymmetric signing for inter-service

❌ DON'T:
   - Add fallback if JWT fails
   - Skip validation on any endpoint
   - Return 200 with error message
   - Hardcode JWT secret
   - Use HS256 for inter-service communication
```

### Rule 2: Inter-Service Authentication
```
✅ DO:
   - Use X-Service-Token header for service-to-service calls
   - Validate this header on ALL public endpoints
   - Use different token for each service
   - Rotate tokens every 90 days

❌ DON'T:
   - Allow calls without X-Service-Token
   - Use same token for all services
   - Store tokens in code
   - Skip validation for "internal" endpoints
```

### Rule 3: No Hardcoded Secrets
```
✅ DO:
   - Use environment variables for all secrets
   - Run detect-secrets before every commit
   - Store secrets in secure vault (AWS Secrets Manager, etc.)
   - Rotate credentials regularly

❌ DON'T:
   - Commit .env files
   - Hardcode API keys
   - Put passwords in code comments
   - Leave test credentials in code
```

### Rule 4: Code Coverage Maintenance
```
✅ DO:
   - Maintain >70% coverage minimum
   - Write tests for all new code
   - Test happy path + error cases
   - Use mocks for external services

❌ DON'T:
   - Merge code with <70% coverage
   - Skip tests for "obvious" code
   - Commit untested new functionality
   - Test without proper mocks
```

### Rule 5: Security Review Before Merge
```
✅ DO:
   - Have Gemini review ALL auth code BEFORE merge
   - Have Gemini review ALL secret handling
   - Run detect-secrets scan before commit
   - Have Gemini review security-related changes

❌ DON'T:
   - Merge auth code without Gemini review
   - Commit secrets to repo
   - Skip detect-secrets scan
   - Merge security changes without review
```

### Rule 6: File & Function Size Limits
```
✅ DO:
   - Keep files under 400 lines
   - Keep functions under 30 lines
   - Keep indentation under 3 levels
   - Split large components into smaller ones

❌ DON'T:
   - Create files > 400 lines
   - Create functions > 30 lines
   - Nest more than 3 levels
   - Put multiple concerns in one file
```

### Rule 7: Token Budget Discipline
```
✅ DO:
   - Track tokens used per task
   - Report overages immediately
   - Choose cheaper models when possible
   - Stop and escalate at 95% budget

❌ DON'T:
   - Ignore token budget
   - Continue past budget without escalating
   - Use premium models for simple tasks
```

---

## 📋 Standard Task Workflow

### Step 1: Receive Assignment
```
✅ Task assigned: "Fix JWT validation in grants service"
✅ Identify type: Security/Auth Change → Gemini
✅ Token budget: 5,000 tokens
✅ Success criteria: All security tests pass, no coverage decrease
```

### Step 2: Analyze Requirements
```
1. Read full task description
2. Understand context:
   - Which service is affected?
   - What's the impact scope?
   - Are there dependent services?
3. Check related tests
4. Identify critical rules that apply
```

### Step 3: Execute Task
```
1. Create branch: git checkout -b task-description
2. Implement changes following conventions
3. Write/update tests (maintain >70% coverage)
4. Run linting & type-check: npm run lint && npm run type-check
5. Verify tests pass: npm run test
6. Commit with clear message
7. Open PR for review
```

### Step 4: Report Status

**When DONE:**
```
✅ Task "Fix JWT validation" COMPLETED
   Type: Security (Gemini)
   Tokens used: 4,200/5,000
   Tests: All passing
   Coverage: 85% (maintained)
   Ready for review
```

**When BLOCKED:**
```
🔴 Task BLOCKED: "Database migration script"
   Reason: PostgreSQL version mismatch
   Escalating to: DevOps team
   Need: Database environment upgrade
```

**When NEEDS CLARIFICATION:**
```
⚠️ Task IN PROGRESS: "Add search filters"
   Current: 60% complete
   Question: Should filters be additive or exclusive?
   Waiting on: Product team decision
```

---

## 🚨 Escalation Rules

### When to Escalate

```
ESCALATE IF:
1. Task blocked for > 30 minutes
2. Token budget exceeded by > 20%
3. Need to change MCP assignment
4. Test coverage can't reach 70%
5. Security concern detected
6. Conflicting requirements
7. Need clarification on acceptance criteria
```

### Escalation Triggers

```
🔴 AUTO-ESCALATE TO SONNET IF:
   - Haiku fails 3 times on same task
   - Token budget exceeded by 50%
   - Critical bug in Haiku code
   - Complex logic discovered mid-task

🔴 AUTO-ESCALATE TO GEMINI IF:
   - 3 MCPs fail on same task
   - Security vulnerability suspected
   - Code review detects security issues
   - Authorization logic needed

🔴 AUTO-ESCALATE TO HUMAN IF:
   - No MCP can resolve
   - Manual testing required
   - Architecture decision needed
   - Business logic clarification needed
```

---

## 📈 Status Reporting

### Daily Report Template

```
📊 GRANTER v2 Daily Status - [Date]

Tasks Completed: [n]
  ✅ Fix JWT validation in grants service
  ✅ Update database indexes

Tasks In Progress: [n]
  🟡 Implement search filters (60% done)
  🟡 Performance optimization (40% done)

Blockers: [n]
  🔴 Database migration (awaiting DevOps)

Tokens Used: [X]/10,000 ([Y]%)
  ├─ Haiku: [X] tokens ($0.XX)
  ├─ Sonnet: [X] tokens ($0.XX)
  └─ Gemini: [X] tokens ($0.XX)

Issues for Next Day:
  - [Issue 1]
  - [Issue 2]
```

### Weekly Report Template

```
📊 GRANTER v2 Weekly Summary

Week Of: [Date]
Status: ON TRACK / BEHIND / AT RISK

✅ Tasks Completed: [n]/[n] ([X]%)
✅ Tokens Used: [X]/50,000 ([Y]%)
✅ Code Coverage: [Z]%
✅ Critical Blockers: [0/n]
✅ Security Issues: [0/n]

Top Accomplishments:
  1. [Achievement]
  2. [Achievement]
  3. [Achievement]

Next Week Priority:
  1. [Priority 1]
  2. [Priority 2]
  3. [Priority 3]
```

---

## ✅ Pre-Task Checklist

Before starting ANY work, verify:

```
[ ] Task type identified (A-F from classification)
[ ] MCP assignment confirmed
[ ] Token budget understood
[ ] Success criteria clear
[ ] Related documentation reviewed
[ ] No conflicting work in progress
[ ] Ready to start? → GO! 🚀
```

---

## 🔍 Code Quality Checklist

Before marking any task DONE, verify:

```
✅ Code Quality:
  [ ] Code passes linting: npm run lint
  [ ] No unused imports/variables
  [ ] Functions < 30 lines
  [ ] Files < 400 lines
  [ ] Max 3 levels of indentation
  [ ] Clear naming conventions

✅ Testing:
  [ ] Unit tests written for new code
  [ ] All tests passing: npm run test
  [ ] Coverage >= 70%
  [ ] No test skips (except @slow)

✅ Security:
  [ ] No hardcoded secrets
  [ ] No SQL injection risks
  [ ] Gemini review completed (if auth code)
  [ ] No authentication bypasses

✅ Performance:
  [ ] No N+1 database queries
  [ ] API responses < 100ms
  [ ] No memory leaks

✅ Compliance:
  [ ] Follows CONVENTIONS.md
  [ ] Follows CONVENTIONS_FRONTEND.md
  [ ] Follows security rules
  [ ] MCP assignment followed
```

---

## 🚫 Red Lines (Automatic Rejection)

These violations cause automatic rejection. NO EXCEPTIONS.

```
❌ AUTOMATIC REJECTION IF:
   1. Test coverage < 70%
   2. Security code without Gemini review
   3. Secrets in code (detect-secrets failure)
   4. No unit tests for new code
   5. Auth code without FAIL SECURE pattern
   6. X-Service-Token not implemented (if needed)
   7. Any critical security rule violated
   8. Linting/type-check fails

→ PR automatically rejected
→ Must fix before re-submission
→ No exceptions to these rules
```

---

## 📚 Complete Reference Documents

### 🏃 Getting Started
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **README.md** | Project overview, key features, status | First session only |
| **HOW_TO_RUN.md** | Local setup, troubleshooting, quick start | First session, then bookmark |

### 🏗️ Architecture & Design
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **ARCHITECTURE_OVERVIEW.md** | System components, service communication, database design | First session + before major changes |
| **API_REFERENCE.md** | All 13 API endpoints, auth patterns, error handling | Before API work |
| **PROPUESTA_ARQUITECTURA_DESDE_0.md** | Initial architecture design decisions (deep dive) | If architecture questions arise |

### 📝 Code Standards (REQUIRED FOR ALL CODE)
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **CONVENTIONS.md** | Backend: NestJS patterns, TypeORM, testing, error handling | Before writing any backend code |
| **CONVENTIONS_FRONTEND.md** | Frontend: React patterns, component structure, styling, testing | Before writing any frontend code |

### 🧪 Testing & Quality
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **TESTING_GUIDE.md** | Testing strategy, how to write tests, coverage requirements | Before writing tests |
| **PROJECT_COMPLETION_SUMMARY.md** | Overall project stats (84/84 tests, 85%+ coverage) | Reference |

### 🔐 Security & Compliance
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **docs/sprints/round 1/SPRINT_4_SECURITY_CHECKLIST.md** | Security requirements, JWT patterns, token rotation | Before security work |
| **PROPUESTA_SEGURIDAD_DESDE_0.md** | Detailed security implementation guide (deep dive) | If security questions arise |

### 🚀 Deployment & Operations
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **docs/sprints/round 1/SPRINT_4_DEPLOYMENT_RUNBOOK.md** | Step-by-step deployment procedures | Before deploying |
| **docs/sprints/round 1/SPRINT_4_GO_LIVE_GUIDE.md** | Go-live procedures and schedule | Before go-live |

### 📋 Development Documentation (Historical Reference)
| Document | What It Contains | When to Read |
|----------|-----------------|--------------|
| **SPRINT_4_FINAL_REPORT.md** | Final project status and deliverables | Optional, historical context |
| **docs/README.md** | Full documentation index | If you need to find something specific |

### 📚 Additional Resources
| Resource | Location | Purpose |
|----------|----------|---------|
| **Audit Reports** | docs/audits/ | Security & architecture analysis (optional deep dives) |
| **Proposals** | docs/proposals/ | Initial design proposals (historical reference) |
| **Sprint Reports** | docs/sprints/ | Sprint-by-sprint progress (historical reference) |

---

## 📞 Support & Escalation

**For questions not answered here:**

1. Check the reference documents above
2. Review recent commits for similar work
3. Ask team lead for clarification
4. Document the gap for improvement

**Escalation Contact:**
- Technical Lead: [contact]
- DevOps Team: [contact]
- Security Team: [contact]

---

**Status:** 🟢 PRODUCTION READY - MVP COMPLETE
**Current Phase:** Post-MVP (Maintenance & Improvements)
**Last Updated:** 2026-01-28

🚀 **GRANTER v2 Guidelines - Follow These Rules!**
