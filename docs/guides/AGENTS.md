# 🤖 AGENTS.md - Instructions for AI Agents & Developers

**For GRANTER v2 Development** | Effective: Feb 3, 2026 | v1.0

---

## 📌 CRITICAL: Read This First

This document tells you:
1. **How to work on GRANTER v2 tasks**
2. **Which MCP to use for each task**
3. **Non-negotiable rules you MUST follow**
4. **How to report progress and blockers**

---

## 🎯 Your Role

### If You're an AI Agent:
- Read the sprint document (SPRINT_X_PLAN.md)
- Find your assigned task (Task ID: S0-D1-1, etc.)
- Read "MCP Assignment" column
- **Use that MCP. Don't change it.**
- Complete the checklist
- Report status

### If You're a Human Developer:
- Same process, but you'll be paired with an AI orchestrator
- The orchestrator routes complex tasks to Sonnet/Gemini
- You focus on integration and testing
- Always follow the MCP assignments for consistency

---

## 🏗️ MCP Assignment Rules (NON-NEGOTIABLE)

### Rule 1: Security Code ALWAYS Uses Gemini
```
IF task involves:
  - JWT implementation
  - Password hashing
  - Token validation
  - Authentication guards
  - Inter-service auth (X-Service-Token)
  - Secrets or credentials

THEN: Use Gemini (gemini-2.0-flash)
NO EXCEPTIONS.
```

### Rule 2: Boilerplate Uses Haiku
```
IF task is:
  - Scaffolding (Turbo, monorepo setup)
  - Configuration files
  - Simple components (Atoms in Design System)
  - Documentation generation
  - Dockerfile/docker-compose setup

THEN: Use Claude Haiku
REASON: 75% cheaper, sufficient capability
```

### Rule 3: Complex Logic Uses Sonnet
```
IF task requires:
  - Algorithm design
  - Complex business logic
  - Service implementation (CRUD operations)
  - Error handling strategy
  - Performance optimization

THEN: Use Claude Sonnet
REASON: Best cost-benefit for complex reasoning
```

### Rule 4: Code Review Always Uses Gemini
```
IF task is:
  - Security audit
  - Code review (any PR)
  - Architecture validation
  - Test coverage analysis
  - Performance profiling

THEN: Use Gemini
REASON: Specialized in analysis
```

---

## 📋 Task Workflow

### Step 1: Receive Assignment
```
✅ You receive: "Task S0-D1-1"
✅ You find: SPRINT_0_PLAN.md
✅ You search: "S0-D1-1"
✅ You read: Full task description + MCP Assignment
```

### Step 2: Extract Task Details
```
Task ID: S0-D1-1
Description: "Setup Turbo monorepo with backend, frontend, data-service"
MCP Assignment: claude / haiku
Tokens Budget: 2,000
Checklist:
  - [ ] Install Turbo globally
  - [ ] Create monorepo structure
  - [ ] Setup package.json in root
  - [ ] Create apps/ and packages/

Success Criteria:
  - Turbo build works
  - All apps/packages properly configured
```

### Step 3: Verify MCP Selection
```
❓ Is MCP already assigned?
   YES → Use it exactly
   NO → Use decision matrix (below)

Decision Matrix:
┌─────────────────────────────────────────┐
│ Is it security-related?                 │
│ YES → Gemini (ALWAYS)                   │
│ NO → Continue to next question          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Is it boilerplate/setup?                │
│ YES → Haiku (75% cheaper)               │
│ NO → Continue to next question          │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Needs complex reasoning?                │
│ YES → Sonnet                            │
│ NO → Haiku (default)                    │
└─────────────────────────────────────────┘
```

### Step 4: Execute Task
```
1. Read full task description
2. Understand context (read related docs if needed)
3. Complete EVERY item in checklist
4. Verify SUCCESS CRITERIA are met
5. Keep token usage <= budget
6. Write clean, documented code
7. Add tests (if applicable)
```

### Step 5: Report Status
```
When DONE:
✅ "Task S0-D1-1 COMPLETED
   Tokens used: 1,850/2,000
   Status: Ready for review"

When BLOCKED:
🔴 "Task S0-D1-1 BLOCKED
   Reason: [Specific problem]
   Escalating to: Orchestrator"

When NEEDS HELP:
⚠️  "Task S0-D1-1 IN PROGRESS
   Need clarification on: [Question]
   Current progress: 60%"
```

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

### Rule 3: DTOs and Validation
```
✅ DO:
   - Create class-validator DTO for EVERY endpoint
   - Use @IsString, @IsEmail, @IsNumber decorators
   - Set whitelist: true in ValidationPipe
   - Validate nested objects
   - Document all fields with @ApiProperty

❌ DON'T:
   - Accept data without DTO
   - Use type hints alone (need runtime validation)
   - Skip whitelist validation
   - Accept nested objects without validation
```

### Rule 4: Code Coverage
```
✅ DO:
   - Maintain >70% coverage minimum
   - Write tests BEFORE implementation (TDD)
   - Test happy path + error cases
   - Test edge cases (empty, null, undefined)
   - Use mocks for external services

❌ DON'T:
   - Merge code with <70% coverage
   - Skip tests for "obvious" code
   - Test only happy path
   - Test without mocks (slow tests)
```

### Rule 5: Security Review
```
✅ DO:
   - Have Gemini review ALL auth code BEFORE merge
   - Have Gemini review ALL secret handling
   - Run detect-secrets scan before commit
   - Have Gemini review DTOs/ValidationPipe config

❌ DON'T:
   - Merge auth code without Gemini review
   - Commit secrets to repo
   - Skip detect-secrets scan
   - Merge security changes without review
```

### Rule 6: File Size Limits
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

### Rule 7: Token Budget
```
✅ DO:
   - Track tokens used per task
   - Report overages immediately
   - Consolidate tasks if approaching limit
   - Stop and escalate if 95% budget used

❌ DON'T:
   - Ignore token budget
   - Continue past budget without escalating
   - Use premium models for simple tasks
```

### Rule 8: Testing Requirements
```
✅ DO:
   - Write 80% unit tests (fast)
   - Write 15% integration tests
   - Write 5% E2E tests
   - Test database interactions with container
   - Use pytest fixtures for setup/teardown

❌ DON'T:
   - Write only E2E tests
   - Test without isolation
   - Skip database testing
   - Hardcode test data
```

---

## 📊 MCP Decision Matrix (Quick Reference)

| Task Type | MCP | Model | Reason | Budget |
|-----------|-----|-------|--------|--------|
| **Setup/Boilerplate** | claude | haiku | Simple, cheap | 1-2K |
| **Security (Auth, JWT)** | gemini | gemini-2.0-flash | Critical analysis | 2-5K |
| **Complex Logic** | claude | sonnet | Advanced reasoning | 2-4K |
| **Component (simple)** | claude | haiku | Straightforward | 1-2K |
| **Component (complex)** | claude | sonnet | Complex logic | 2-3K |
| **Service Implementation** | claude | sonnet | Complex business | 2-4K |
| **Code Review** | gemini | gemini-2.0-flash | Analysis | 1-5K |
| **Test Writing** | claude | sonnet | Complex cases | 2-3K |
| **Documentation** | claude | haiku | Simple text | 1K |
| **Database Schema** | claude | sonnet | Complex design | 1-2K |

---

## 🚨 Escalation Rules

### When to Escalate to Orchestrator

```
ESCALATE IF:
1. Task blocked for > 30 minutes
2. Token budget exceeded by > 20%
3. Need to change MCP assignment
4. Test coverage < 70% and can't fix
5. Security concern detected
6. Conflicting requirements
7. Need clarification on acceptance criteria

HOW TO ESCALATE:
→ Report: "Task S1-D1-1 blocked: [reason]"
→ Include: Current progress, what you tried
→ Orchestrator will: Reassign, clarify, or escalate to Sonnet
```

### Escalation Triggers

```
🔴 AUTO-ESCALATE TO SONNET IF:
   - Haiku fails 3 times on same task
   - Token budget exceeded by 50%
   - Critical bug in Haiku code

🔴 AUTO-ESCALATE TO GEMINI IF:
   - 3 MCPs fail on same task
   - Security vulnerability suspected
   - Code review detects issues

🔴 AUTO-ESCALATE TO HUMAN IF:
   - No MCP can resolve
   - Manual testing required
   - Business decision needed
```

---

## 📈 Progress Reporting

### Daily Report Template

```
📊 GRANTER v2 Daily Status

Date: [Date]
Sprint: S[0-4]
Day: D[1-5]

Tasks Completed: [n]
  ✅ S0-D1-1: Setup Turbo
  ✅ S0-D1-2: Frontend boilerplate

Tasks In Progress: [n]
  🟡 S0-D1-3: Backend boilerplate (60% done)

Tasks Blocked: [n]
  🔴 S0-D2-1: Docker setup (blocked on network config)

Tokens Used: [X]/30,000 ([Y]%)
  ├─ Haiku: [X] tokens ($0.XX)
  ├─ Sonnet: [X] tokens ($0.XX)
  └─ Gemini: [X] tokens ($0.XX)

Issues to Escalate:
  - [Issue 1]
  - [Issue 2]

Ready for Next Day: [YES/NO]
```

### Weekly Report Template

```
📊 GRANTER v2 Weekly Status

Week: 1 (Feb 3-7)
Sprint: 0

✅ Tasks Completed: 9/12 (75%)
✅ Tokens Used: 22,500/150,000 (15%)
✅ Code Coverage: 85% (+15%)
✅ Blockers: 0 (resolved all)
✅ Security Issues: 0
✅ CI/CD: 🟢 Green

Status: ON TRACK / BEHIND / RISK
  → ON TRACK (Ahead of schedule)

Next Week Priority:
  1. Complete remaining Sprint 0 tasks
  2. Begin Sprint 1 auth implementation
  3. Resolve [known issue]
```

---

## 🔍 Code Quality Checklist

Before marking any task DONE, verify:

```
✅ Code Quality:
  [ ] Code passes linting (npm run lint / black / flake8)
  [ ] No unused imports or variables
  [ ] Functions < 30 lines
  [ ] Files < 400 lines
  [ ] Max 3 levels of indentation
  [ ] Clear variable/function names

✅ Testing:
  [ ] Unit tests written (80% of test effort)
  [ ] Integration tests written (15%)
  [ ] E2E tests written (5%)
  [ ] Coverage > 70%
  [ ] All tests passing
  [ ] No test skips (except marked as @slow)

✅ Documentation:
  [ ] Code commented where non-obvious
  [ ] Functions have docstrings
  [ ] Complex logic explained
  [ ] Edge cases documented

✅ Security:
  [ ] No hardcoded secrets
  [ ] No SQL injection risks
  [ ] No XSS vulnerabilities
  [ ] No authentication bypasses
  [ ] Gemini review completed (if auth code)

✅ Performance:
  [ ] Database queries optimized
  [ ] No N+1 problems
  [ ] API responses < 100ms
  [ ] No memory leaks
  [ ] Load tested (if applicable)

✅ Compliance:
  [ ] Follows CONVENTIONS.md (Python/Backend)
  [ ] Follows CONVENTIONS_FRONTEND.md (Frontend)
  [ ] Follows architecture design
  [ ] Follows security rules
  [ ] MCP assignment followed
```

---

## 📚 Reference Documents

| Need | Document | Section |
|------|----------|---------|
| **Task details** | SPRINT_X_PLAN.md | Find your Task ID |
| **MCP routing** | ORCHESTRATOR_MASTER_PLAN.md | §2. Task Classification |
| **Code standards** | CONVENTIONS.md | Backend code style |
| **Frontend standards** | CONVENTIONS_FRONTEND.md | Frontend code style |
| **Architecture** | PROPUESTA_ARQUITECTURA_DESDE_0.md | System design |
| **Security** | PROPUESTA_SEGURIDAD_DESDE_0.md | Security implementation |
| **Testing** | PROPUESTA_TESTING_DESDE_0.md | Testing strategy |
| **Frontend design** | PROPUESTA_FRONTEND_DESDE_0.md | Design system |

---

## ✅ Checklist Before Starting Work

```
Before you start ANY task:

[ ] Read SPRINT_X_PLAN.md for your sprint
[ ] Found your Task ID (ej: S0-D1-1)
[ ] Read the full task description
[ ] Understood the MCP assignment
[ ] Reviewed the checklist items
[ ] Understood the success criteria
[ ] Checked relevant convention document (CONVENTIONS.md or CONVENTIONS_FRONTEND.md)
[ ] Confirmed token budget
[ ] Ready to start? → GO! 🚀
```

---

## 🚫 Red Lines (Automatic PR Rejection)

These violations cause automatic PR rejection. NO EXCEPTIONS.

```
❌ AUTOMATIC REJECTION IF:
   1. Test coverage < 70%
   2. JWT code without Gemini review
   3. Secrets in code (detect-secrets failure)
   4. DTOs without @validator decorators
   5. No unit tests
   6. Auth code without FAIL SECURE pattern
   7. X-Service-Token not implemented
   8. Any critical security rule violated

→ PR automatically rejected
→ Escalate to lead architect
→ No merge until fixed
→ Cannot override these rules
```

---

## 🎯 Success Criteria for Project

### Sprint 0 (End: Feb 5)
```
✅ Monorepo structure created
✅ All services boilerplate ready
✅ Docker Compose working
✅ CI/CD pipeline green
✅ Test structure in place
✅ Documentation baseline
```

### Sprint 1 (End: Feb 14)
```
✅ JWT implemented (FAIL SECURE)
✅ Auth inter-service working
✅ Tests > 70% coverage
✅ All critical security rules implemented
✅ E2E auth flow tested
✅ Gemini security review passed
```

### Sprint 2 (End: Feb 21)
```
✅ Grants CRUD working
✅ Search + filters functional
✅ IA service with fallback
✅ Retries implemented
✅ All services > 70% coverage
```

### Sprint 3 (End: Feb 27)
```
✅ Scraper integration working
✅ Performance < 100ms
✅ Health checks functional
✅ Structured logging in place
✅ Ready for hardening
```

### Sprint 4 + Go-Live (Mar 3)
```
✅ ALL 12 release gates passed
✅ 0 critical security issues
✅ Deployment successful
✅ Monitoring alerts configured
```

---

**Status:** 🟢 READY TO START
**Start Date:** Monday, February 3, 2026
**Questions?** → Escalate via Orchestrator

🚀 **Let's build GRANTER v2!**
