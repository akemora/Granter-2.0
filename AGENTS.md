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

## 📚 Reference Documents

| Need | Document | Purpose |
|------|----------|---------|
| **How to run locally** | HOW_TO_RUN.md | Local development setup |
| **API documentation** | API_REFERENCE.md | All endpoints & examples |
| **System design** | ARCHITECTURE_OVERVIEW.md | System components & flow |
| **Backend conventions** | CONVENTIONS.md | Code style & standards |
| **Frontend conventions** | CONVENTIONS_FRONTEND.md | Frontend code style |
| **Testing guide** | TESTING_GUIDE.md | Testing strategy |
| **Security details** | PROPUESTA_SEGURIDAD_DESDE_0.md | Security implementation |
| **Deployment steps** | SPRINT_4_DEPLOYMENT_RUNBOOK.md | Production deployment |
| **Security checklist** | SPRINT_4_SECURITY_CHECKLIST.md | Security validation |

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
