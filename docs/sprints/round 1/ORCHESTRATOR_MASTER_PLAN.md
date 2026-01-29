# 🎼 ORCHESTRATOR MASTER PLAN - Central AI Coordinator

**Master Orchestration for GRANTER v2 Development** | v1.0 | 2026-01-27

> **Purpose:** Define ONE AI (Orchestrator) that coordinates all other MCPs and agents
> **Goal:** Minimize tokens, maximize efficiency, catch blockers early
> **Cost Model:** Cheapest MCP for each task type, escalate only when needed

---

## 🏗️ Architecture: AI Task Distribution

```
                    ┌─────────────────────┐
                    │  ORCHESTRATOR ⚙️     │ ← Haiku (coordinator)
                    │  (Cheap, fast, busy) │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────┐         ┌─────────────┐         ┌─────────┐
   │ HAIKU   │◄────────│  SONNET     │────────►│ GEMINI  │
   │ Setup   │         │  Logic      │         │  Review │
   │ Config  │         │  Security   │         │  Search │
   │ Simple  │         │  Complex    │         │  Cheap  │
   └─────────┘         └─────────────┘         └─────────┘
```

---

## 📋 Task Classification & MCP Assignment

### Type 1: Boilerplate / Setup (Haiku - CHEAPEST)

**Examples:**
- Repository setup, Docker config, file creation
- Configuration templates (eslint, prettier, tailwind)
- Documentation, README, comments
- Folder structure creation

**Haiku Assignment:**
```
Cost: ~1000-2000 tokens per task
Speed: <1 min (fast)
Quality: Good (sufficient for templates)
When: Always use for setup tasks
```

**Token Budget:** 50% of Haiku tasks → Setup = ~25% of total

---

### Type 2: Complex Implementation (Sonnet - BALANCED)

**Examples:**
- Security-critical code (auth, JWT, validators)
- Business logic (services, controllers)
- Database schema, migrations
- API integration, retries, fallbacks
- Frontend components (complex logic)

**Sonnet Assignment:**
```
Cost: ~3000-5000 tokens per task
Speed: <3 min (medium)
Quality: Excellent (complex code)
When: Use for anything > 30 lines or security-critical
```

**Token Budget:** 60% of Sonnet tasks → Implementation = ~50% of total

---

### Type 3: Code Review / Quality (Gemini - CHEAP QUALITY)

**Examples:**
- Security code review (best Gemini forte!)
- Linting validation
- Performance analysis
- Test coverage verification
- Error detection

**Gemini Assignment:**
```
Cost: ~1500-2500 tokens (cheaper than Sonnet!)
Speed: <2 min (fast)
Quality: Very good for review (its strength)
When: After every implementation, before merge
```

**Token Budget:** Gemini review = ~15% of total

---

### Type 4: Testing & Validation (Manual + Gemini)

**Examples:**
- Running local tests
- Manual testing checklists
- Deployment validation
- Load testing
- Security audit

**Assignment:**
```
Manual: 0 tokens (human or CI/CD)
Gemini: For AI-assisted test generation
When: After implementation completes
```

---

## 🎯 Orchestrator Logic (Haiku Rules)

### Rule 1: Task Routing

```python
def route_task(task):
    if task.complexity == "SIMPLE":
        return "haiku"  # Boilerplate, config, docs

    elif task.complexity == "COMPLEX":
        if task.is_security_critical:
            return "sonnet"  # Auth, JWT, validation
        else:
            return "sonnet"  # But evaluate if Haiku sufficient

    elif task.type == "CODE_REVIEW":
        return "gemini"  # Gemini excellent at this + cheap

    elif task.type == "TESTING":
        return "manual"  # CI/CD or human

    return None  # Should never happen
```

---

### Rule 2: Escalation (Auto-Escalate on Failure)

```
IF Haiku can't handle (tokens exhausted or too complex):
  → Escalate to Sonnet automatically

IF Sonnet task takes too long or too many tokens:
  → Break into smaller tasks
  → Resubmit with clearer scope

IF Gemini review finds critical issues:
  → Return to Sonnet for fix
  → Resubmit to Gemini for re-review

IF 3 attempts fail:
  → Escalate to Opus (very rare)
  → Manual intervention required
```

---

### Rule 3: Parallel Execution

```
PARALLEL (can run at same time):
  ✅ Multiple Haiku tasks (boilerplate)
  ✅ Haiku + Sonnet + Gemini (different files)
  ❌ Same file → sequential (avoid merge conflicts)

SEQUENTIAL (must run in order):
  ├─ Setup (Haiku) THEN Implementation (Sonnet)
  ├─ Implementation (Sonnet) THEN Review (Gemini)
  ├─ Review (Gemini) THEN Tests (Manual)
  └─ Tests THEN Merge
```

---

### Rule 4: Cost Monitoring

```
Daily Budget Per Sprint:
  Haiku:  15,000 tokens  (60%)  = $0.02
  Sonnet: 10,000 tokens  (30%)  = $0.30
  Gemini: 5,000 tokens   (10%)  = $0.03
  ─────────────────────────────────────
  TOTAL:  30,000 tokens          ≈ $0.35/day

Sprint Budget (5 days): ~150,000 tokens ≈ $1.75

Alert thresholds:
  ⚠️  Yellow: 80% of daily budget used
  🔴 Red:    95% of daily budget used → Stop, escalate
```

---

## 🔄 Workflow: Daily Standup Pattern

### Morning (Orchestrator reviews status)

```
1. Check all blocked tasks
   └─ If blocked: escalate or reassign

2. Queue high-priority tasks
   └─ Assign to: Haiku (if setup) or Sonnet (if complex)

3. Assign code reviews
   └─ Send completed tasks to Gemini

4. Report status
   └─ List: completed, in-progress, blocked, failed
```

### Mid-Day (Task execution)

```
1. Haiku: Execute boilerplate tasks (fast)
2. Sonnet: Execute complex tasks (medium priority)
3. Gemini: Review completed tasks (async)
4. Monitor: Token usage, cost
```

### End-of-Day (Consolidation)

```
1. Merge completed tasks
2. Report blockers
3. Adjust tomorrow's plan
4. Update task status
```

---

## 📊 Token Budget Allocation (Per Sprint)

### Sprint 0 (Setup - Haiku-Heavy)

```
Total Budget: 24,000 tokens
├─ Haiku (setup):       18,000 tokens (75%)
├─ Sonnet (DB schema):   4,000 tokens (17%)
├─ Gemini (review):      2,000 tokens (8%)
└─ Manual (validation):      0 tokens

Cost: ~$0.25/sprint (very cheap!)
```

### Sprint 1 (Auth - Sonnet-Heavy)

```
Total Budget: 47,500 tokens
├─ Haiku (docs):        3,000 tokens (6%)
├─ Sonnet (security):  42,000 tokens (88%)
├─ Gemini (review):     2,500 tokens (6%)
└─ Manual (testing):        0 tokens

Cost: ~$1.35/sprint (critical, justifies cost)
```

### Sprint 2 (Features - Balanced)

```
Total Budget: 35,000 tokens
├─ Haiku (boilerplate):  8,000 tokens (23%)
├─ Sonnet (logic):      22,000 tokens (63%)
├─ Gemini (review):      5,000 tokens (14%)
└─ Manual (testing):         0 tokens

Cost: ~$0.82/sprint
```

### Sprint 3 (Data - Sonnet+Gemini)

```
Total Budget: 30,000 tokens
├─ Haiku (setup):       5,000 tokens (17%)
├─ Sonnet (services):  18,000 tokens (60%)
├─ Gemini (review):     7,000 tokens (23%)
└─ Manual (perf test):      0 tokens

Cost: ~$0.67/sprint
```

### Sprint 4 (Go-Live - Gemini-Heavy Review)

```
Total Budget: 20,000 tokens
├─ Haiku (checklists):   3,000 tokens (15%)
├─ Sonnet (fixes):       8,000 tokens (40%)
├─ Gemini (security):    9,000 tokens (45%)
└─ Manual (deploy):          0 tokens

Cost: ~$0.51/sprint
```

**TOTAL PROJECT: ~157,500 tokens ≈ $4.60**

---

## 🤖 Orchestrator Specifications

### Name & Role

```
🎼 ORCHESTRATOR (Haiku-based)
├─ Role: Central coordinator
├─ Responsibility: Route tasks, track progress, escalate blockers
├─ Speed: <1s per task (quick decisions)
├─ Cost: ~500 tokens/day (cheap!)
└─ Availability: 24/7 monitoring
```

### Daily Responsibilities

```
✅ 08:00 - Morning standup
   └─ Review overnight progress
   └─ Unblock any blocked tasks
   └─ Queue today's tasks

✅ 12:00 - Mid-day checkpoint
   └─ Monitor token usage
   └─ Check Gemini reviews
   └─ Reassign if behind

✅ 17:00 - End-of-day consolidation
   └─ Merge completed tasks
   └─ Report blockers
   └─ Plan tomorrow

✅ Anytime - Emergency escalation
   └─ If critical blocker detected
   └─ Escalate to Sonnet/Opus
   └─ Alert team on Slack
```

### Success Metrics

```
✅ Blocks detected < 2h (fast escalation)
✅ Gemini review turnaround < 4h
✅ Tasks completed on schedule (>90%)
✅ Token budget respected (>95%)
✅ Zero critical issues missed
```

---

## 🚨 Escalation Triggers

### Auto-Escalate to Sonnet

```
Trigger 1: Haiku response quality poor (>3 attempts)
  └─ → Assign to Sonnet + provide more context

Trigger 2: Task complexity underestimated
  └─ → Redefine task scope + reassign Sonnet

Trigger 3: Security concern detected
  └─ → Always escalate to Sonnet (never Haiku)

Trigger 4: Haiku tokens exhausted for day
  └─ → Queue for Sonnet (next priority)
```

### Auto-Escalate to Opus (Very Rare)

```
Trigger 1: 3 failed attempts across Haiku + Sonnet
  └─ → Manual intervention required

Trigger 2: Novel technical problem (no precedent)
  └─ → Architect review + Opus thinking

Trigger 3: Security audit critical finding
  └─ → Opus deep review + recommendation

Trigger 4: Critical production incident
  └─ → Immediate Opus + manual fix
```

---

## 📱 Communication Protocol

### Orchestrator → Task Assignment

```json
{
  "task_id": "S1-D1-1",
  "sprint": 1,
  "day": 1,
  "mcp_assignment": "claude-bridge",
  "model": "haiku",
  "prompt": "Setup Turbo monorepo...",
  "token_budget": 2000,
  "priority": "critical",
  "blockers_if_fail": ["S1-D1-2"],
  "success_criteria": ["docker compose up"],
  "deadline": "2026-02-03 10:30",
  "assigned_to": "human-dev-1"
}
```

### Task Completion → Status Update

```json
{
  "task_id": "S1-D1-1",
  "status": "completed",
  "tokens_used": 1800,
  "quality_score": 9.5,
  "issues": [],
  "completedAt": "2026-02-03 09:45",
  "next_task_id": "S1-D1-2",
  "ready_for_review": true
}
```

### Blocker Alert → Escalation

```json
{
  "alert_type": "blocker",
  "task_id": "S1-D2-1",
  "reason": "Complex security logic - Haiku insufficient",
  "recommended_escalation": "sonnet",
  "timestamp": "2026-02-04 11:23",
  "action_required": true,
  "priority": "high"
}
```

---

## 🎯 Decision Matrix: Which MCP for Each Task?

| Task Type | Complexity | Haiku | Sonnet | Gemini | Reason |
|-----------|-----------|-------|--------|--------|--------|
| Boilerplate setup | Low | ✅ | ❌ | ❌ | Haiku sufficient, cheapest |
| Config files | Low | ✅ | ❌ | ❌ | Template-based |
| Documentation | Low | ✅ | ❌ | ❌ | Haiku writes clearly |
| Database schema | High | ❌ | ✅ | ❌ | Complex, needs Sonnet |
| Auth implementation | Critical | ❌ | ✅ | ❌ | Security-critical, Sonnet only |
| Business logic | Medium | ⚠️ | ✅ | ❌ | Sonnet for complex, Haiku if simple |
| Code review | Medium | ❌ | ⚠️ | ✅ | Gemini specializes in review, cheaper |
| Performance analysis | Medium | ❌ | ⚠️ | ✅ | Gemini good at this |
| Tests generation | Medium | ⚠️ | ✅ | ❌ | Sonnet for complex tests |
| Error debugging | High | ❌ | ✅ | ❌ | Sonnet required |

---

## 🔐 Security-First Guardrails

```
✅ MANDATORY RULES:
  1. No Haiku on security-critical code
  2. No Haiku on auth, JWT, encryption
  3. All auth code reviewed by Gemini (post-Sonnet)
  4. Secrets NEVER in prompts
  5. All failing tests escalate immediately

❌ PROHIBITED:
  1. Using Haiku for security decisions
  2. Skipping Gemini review on auth
  3. Merging without Gemini approval
  4. Overriding security checklist
  5. Ignoring blockers > 2 hours
```

---

## 📈 Monitoring & Reporting

### Daily Report (Orchestrator → Team)

```
📊 GRANTER v2 DAILY STANDUP - 2026-01-30

✅ Completed Today:
   └─ S0-D1-1: Turbo setup (Haiku) - 1.8k tokens
   └─ S0-D1-2: Next.js boilerplate (Haiku) - 2.1k tokens

🟡 In Progress:
   └─ S0-D1-3: NestJS boilerplate (Haiku) - 60% done
   └─ S0-D2-1: Docker Compose (Haiku) - queued

🔴 Blocked:
   └─ None

📊 Token Usage:
   Daily: 3,900 / 30,000 (13% - on track)
   Sprint: 3,900 / 150,000 (3% - healthy)

⚠️ Alerts:
   └─ None

🎯 Tomorrow's Priority:
   1. Complete NestJS boilerplate
   2. Start Docker Compose (critical path)
   3. Begin TypeORM schema

✅ Green Light: Continue to next tasks
```

### Weekly Report (Orchestrator → Leadership)

```
📋 GRANTER v2 WEEKLY REPORT - Week 1 (Jan 27 - Jan 31)

Status: ON SCHEDULE ✅

Sprints Completed:
  └─ Sprint 0: 95% complete (1 task remaining)

Milestones:
  ✅ Monorepo setup
  ✅ 5 services dockerized
  ✅ CI/CD pipeline configured
  ⏳ Local environment validation (Friday)

Token Usage:
  Budget: 150,000
  Used: 42,300 (28%)
  Trajectory: ON TRACK

Cost: ~$0.98 (4% of $25 budget)

Risks: None identified
Blockers: None

Next Week:
  Sprint 1: Auth + Security (critical)
  Expected cost: ~$1.35

✅ APPROVED: Proceed to Sprint 1
```

---

## 🚀 Starting the Orchestrator

### Day 0: Orchestrator Initialization

```bash
# Create orchestrator config
cat > orchestrator_config.json << EOF
{
  "name": "GRANTER-V2-ORCHESTRATOR",
  "model": "haiku-4.5-20251001",
  "mcp": "claude-bridge",
  "token_budget_daily": 30000,
  "token_budget_sprint": 150000,
  "sprint_duration_days": 5,
  "sprints_total": 4,
  "escalation_to": "sonnet-3.5",
  "review_mcp": "gemini-bridge",
  "status": "initialized"
}
EOF

# Start orchestrator as background daemon
# (in real implementation, use actual scheduler)
echo "Orchestrator ready to coordinate GRANTER v2 development"
```

### First Task for Orchestrator

```
✅ Task: Initialize Sprint 0
├─ Queue: All S0 tasks
├─ Assign: Haiku for boilerplate, Sonnet for DB
├─ Review: Gemini on Day 3
└─ Deadline: Wednesday EOD

Ready to start? YES ✅
```

---

## 📚 Reference: Task Types Quick Guide

```
HAIKU TASKS (75% of Sprint 0, 10% of Sprint 1):
  ├─ Repository setup
  ├─ Folder structure
  ├─ Config files (eslint, prettier, tailwind)
  ├─ Docker configuration
  ├─ Documentation updates
  ├─ README creation
  └─ Cost: ~1-2k tokens each

SONNET TASKS (20% of Sprint 0, 85% of Sprint 1):
  ├─ Entity/DTO implementation
  ├─ Service layer logic
  ├─ Auth/security code
  ├─ Controller endpoints
  ├─ Component implementation
  ├─ Test implementation
  └─ Cost: ~3-5k tokens each

GEMINI TASKS (5% each sprint):
  ├─ Code review (security focus)
  ├─ Performance analysis
  ├─ Error detection
  ├─ Test coverage verification
  └─ Cost: ~1.5-2.5k tokens each

MANUAL TASKS (0 MCP tokens):
  ├─ Running tests locally
  ├─ Deployment validation
  ├─ Manual testing
  ├─ Git operations
  └─ Cost: 0 tokens
```

---

## ✅ Conclusion

```
The Orchestrator (Haiku) coordinates:
  ✅ Task routing (right MCP for each task)
  ✅ Token optimization (min 70% cost reduction vs. all-Sonnet)
  ✅ Blocker detection (escalate fast)
  ✅ Quality assurance (Gemini review)
  ✅ Schedule adherence (daily standup)
  ✅ Cost tracking (stay under budget)
  ✅ Team communication (clear status)

Expected Results:
  ✅ 4-week timeline maintained
  ✅ ~$4-5 total token cost
  ✅ 0 critical security issues
  ✅ >70% code coverage
  ✅ Production-ready GRANTER v2

Start: Monday, Feb 3, 2026
Go-Live: Friday, March 3, 2026
```

---

**Orchestrator Status:** 🟢 READY TO DEPLOY

**Next Step:** Assign Sprint 0 Day 1 tasks to Haiku via Orchestrator

---

**Última actualización:** 2026-01-27
**Versión:** 1.0 FINAL
**Status:** PRODUCTION-READY
