# 🚀 GETTING STARTED - How to Use Everything

**Your roadmap to implement GRANTER v2 using AI coordinators** | v1.0 | 2026-01-27

---

## 📂 ⭐ ALL DOCUMENTATION IS IN YOUR PROJECT FOLDER

### Location

```
GRANTER v2 Project Folder
└── dev_plan/
    ├── AGENTS.md                      ← Instructions for IAs & developers
    ├── CONVENTIONS.md                 ← Backend code style guide
    ├── CONVENTIONS_FRONTEND.md        ← Frontend code style guide
    ├── GIT_WORKFLOW.md               ← Commit strategy guide
    ├── GETTING_STARTED.md            ← You are here! 👈
    ├── SUMMARY_NEW_DOCS.md           ← Quick reference
    ├── ORCHESTRATOR_MASTER_PLAN.md   ← MCP routing & coordination
    ├── SPRINT_0_PLAN.md              ← Day-by-day: Setup phase (3 days)
    ├── SPRINT_1_PLAN.md              ← Day-by-day: Auth phase (5 days)
    ├── SPRINTS_2_3_4_CONDENSED.md   ← Quick ref: Features, Data, Go-Live
    └── INDEX_ALL_DOCUMENTS.md        ← Complete document index
```

### Everything You Need

```
✅ You have 12 comprehensive documents (150+ KB of content)
✅ All in ONE folder (dev_plan/)
✅ NO external documentation needed
✅ All referenced files are local
✅ Works offline (no internet required)
```

### How to Access

```bash
# Clone the project
git clone [repository-url] granter-v2
cd granter-v2

# Go to documentation
cd dev_plan/

# Start reading
cat GETTING_STARTED.md      # You are here
cat AGENTS.md              # Read next
cat SPRINT_0_PLAN.md       # Task details
```

---

## 🔍 ⚠️  CRITICAL PRE-SESSION CHECKLIST (Before Writing ANY Code)

**READ THIS EVERY TIME YOU START A NEW CODING SESSION** - Takes 10 minutes

```
Every developer (human and AI) MUST do this before touching code:

✅ STEP 1: Know Your Task (2 min)
   [ ] Read: SPRINT_X_PLAN.md (your sprint)
   [ ] Search: Your Task ID (ej: S0-D1-1)
   [ ] Read: Full task description + checklist
   [ ] Understand: Success criteria

✅ STEP 2: Know Your Rules (3 min)
   [ ] Read: AGENTS.md (§MCP Assignment Rules)
   [ ] Check: Which MCP to use (already specified?)
   [ ] Read: Relevant CONVENTIONS document
       → Backend? → CONVENTIONS.md
       → Frontend? → CONVENTIONS_FRONTEND.md
   [ ] Review: Critical rules for this task type

✅ STEP 3: Know Your Code Style (3 min)
   [ ] Backend Task?
       → Read: CONVENTIONS.md (§File Organization)
       → Read: Relevant pattern (Service/Controller/etc)
   [ ] Frontend Task?
       → Read: CONVENTIONS_FRONTEND.md (§Component Pattern)
       → Read: Styling conventions
   [ ] Python Task?
       → Read: CONVENTIONS.md (§Python Conventions)

✅ STEP 4: Know Your Tests (2 min)
   [ ] Read: Testing section in CONVENTIONS
   [ ] Plan: What tests will I write?
   [ ] Target: 70%+ code coverage
   [ ] Remember: Tests BEFORE code (TDD)

✅ READY TO CODE?
   [ ] All questions answered
   [ ] No confusion about task
   [ ] Understand code style
   [ ] Tests planned
   
   → YES? Start coding! 🚀
   → NO? Escalate via Orchestrator
```

### 📚 Quick Reference: Which Doc to Read?

| I'm about to... | Read This | Section |
|---|---|---|
| **Start any task** | AGENTS.md | Task Workflow |
| **Backend feature** | CONVENTIONS.md | NestJS Conventions |
| **Python service** | CONVENTIONS.md | Python Conventions |
| **React component** | CONVENTIONS_FRONTEND.md | Component Pattern |
| **Choose MCP** | AGENTS.md | MCP Decision Matrix |
| **Write tests** | CONVENTIONS.md | Testing Conventions |
| **Style component** | CONVENTIONS_FRONTEND.md | Styling Conventions |
| **Need help?** | AGENTS.md | Escalation Rules |

---


You now have a **complete, AI-orchestrated development plan** for GRANTER v2:

```
✅ 9 Documents (170+ pages, 300k+ lines of content)
✅ 4 Sprints fully planned (day-by-day, task-by-task)
✅ MCP assignments for every task (token-optimized)
✅ Central Orchestrator (Haiku) coordinating everything
✅ Security-first architecture with test-driven development
✅ Budget: ~$4.60 total token cost
✅ Timeline: 4 weeks (8h/day, 2 devs)
```

---

## 🤖 QUICK START PARA IAs (5 MINUTOS)

**Si eres una IA y comienzan a asignarte una tarea, LEE ESTO PRIMERO:**

### Paso 1: Identifica tu Tarea (30 segundos)
```
Alguien te dice: "Haz la tarea S0-D1-1"

→ Busca: SPRINT_0_PLAN.md
→ Busca: "S0-D1-1"
→ Lee la fila completa
```

### Paso 2: Extrae la Información (1 minuto)
```
Tienes esta información:

Task ID: S0-D1-1
Description: [Qué hacer]
MCP Assignment: [Cuál usar - CRÍTICO]
Tokens: [Presupuesto]
Checklist: [Items a completar]
Success Criteria: [Criterios de aceptación]
```

### Paso 3: Verifica el MCP (1 minuto)
```
¿Es MCP = "claude / haiku"?       → Úsalo
¿Es MCP = "claude / sonnet"?      → Úsalo
¿Es MCP = "gemini"?               → Úsalo

NO CAMBIES EL MCP ASIGNADO.

Si no está asignado, usa la matriz de decisión:
→ Seguridad? → Gemini
→ Boilerplate? → Haiku
→ Complejo? → Sonnet
```

### Paso 4: Ejecuta (Variable)
```
1. Lee la descripción completa
2. Completa cada item del checklist
3. Verifica los "Success Criteria"
4. Mantén tokens < presupuesto
5. Documenta el código
6. Reporta cuando termines
```

### Paso 5: Reporta Status (30 segundos)
```
Cuando termines, reporta:

"Tarea S0-D1-1: ✅ COMPLETADA
Tokens usados: 1,800/2,000
Status: Ready for review"

O si está bloqueada:

"Tarea S0-D1-1: 🔴 BLOQUEADA
Razón: [Problema específico]
Escalando a: Orchestrator"
```

---

## 📖 Reading Order for Humans (15 minutes)

Read in this order to understand the full plan:

### 1️⃣ ORCHESTRATOR_MASTER_PLAN.md (5 min)
**What:** How AI agents coordinate + MCP decision matrix
**Key Takeaway:** Haiku routes tasks → Sonnet implements → Gemini reviews

### 2️⃣ SPRINT_0_PLAN.md (5 min)
**What:** First 3 days - Setup everything
**Action:** Start here on Monday, Feb 3, 2026

### 3️⃣ SPRINT_1_PLAN.md (5 min)
**What:** Next 5 days - Auth + Security (critical)
**Action:** Follow day-by-day after Sprint 0

---

## 🏃 Quick Start (Today - Jan 27)

### Right Now (30 minutes)

```
1. ✅ Read this file (GETTING_STARTED.md)
2. ✅ Read ORCHESTRATOR_MASTER_PLAN.md
3. ✅ Skim SPRINT_0_PLAN.md (understand structure)
4. ✅ Show to your tech lead/CEO
```

### Tomorrow (Team Meeting - 1 hour)

```
Agenda:
  1. Review GRANTER v2 vision (this document)
  2. Confirm 2 senior devs (no context switching)
  3. Confirm timeline (4 weeks to go-live)
  4. Confirm start date (Feb 3, 2026)
  5. Setup: Slack channel, GitHub repo, CI/CD
  6. Distribute: AGENTS.md, CONVENTIONS.md

Decision: GO / NO-GO for Sprint 0?
```

### Monday, Feb 3 - Sprint 0 Begins

```
08:00 - Daily standup (15 min)
        Orchestrator reports: Today's tasks queued

08:15 - Task S0-D1-1: Turbo setup
        Assigned to: Human dev
        MCP: Haiku (via Orchestrator)

Repeat for each day (3 days total)
```

---

## 📚 GUÍA DE DOCUMENTOS - Dónde Buscar Cada Cosa

### 🤖 Si eres una IA, usa esta tabla:

| Necesito... | Documento | Sección |
|-------------|-----------|---------|
| **Saber qué tarea hacer hoy** | `SPRINT_X_PLAN.md` | Busca tu Task ID (ej: S0-D1-1) |
| **Entender el MCP correcto** | `ORCHESTRATOR_MASTER_PLAN.md` | §2. Task Classification & MCP Routing |
| **Reglas de seguridad (JWT, auth)** | `PROPUESTA_SEGURIDAD_DESDE_0.md` | §1. JWT Implementation |
| **Estándares de código** | `AGENTS_CUSTOMIZADO_GRANTER.md` | §4. Code Conventions |
| **Estructura de testing** | `PROPUESTA_TESTING_DESDE_0.md` | §2. Testing Pyramid |
| **Arquitectura del sistema** | `PROPUESTA_ARQUITECTURA_DESDE_0.md` | § Bounded Contexts |
| **Frontend guidelines** | `PROPUESTA_FRONTEND_DESDE_0.md` | § Design System |
| **Cómo consultar MCPs** | `ORCHESTRATOR_MASTER_PLAN.md` | §2. Decision Matrix |
| **Referencias rápidas** | Este documento (`GETTING_STARTED.md`) | Estás aquí 👈 |

### Core Documents (Read These First)

| Document | Purpose | Read When | Time |
|----------|---------|-----------|------|
| **GETTING_STARTED.md** | YOU ARE HERE - Start here! | Before everything | 10 min |
| **ORCHESTRATOR_MASTER_PLAN.md** | How MCPs coordinate + Decision matrix | Day 0 | 15 min |
| **SPRINT_0_PLAN.md** | First 3 days (setup) | Day 0 | 20 min |
| **SPRINT_1_PLAN.md** | Next 5 days (auth) | Day 3 (start of Sprint 1) | 25 min |
| **AGENTS_CUSTOMIZADO_GRANTER.md** | Agent instructions (critical!) | Day 0 (before tasks) | 30 min |

### Reference Documents (Use Daily)

| Document | Purpose | Use Case |
|----------|---------|----------|
| **PROPUESTA_ARQUITECTURA_DESDE_0.md** | Full architecture | When making design decisions |
| **PROPUESTA_SEGURIDAD_DESDE_0.md** | Security implementation | Before Sprint 1 |
| **PROPUESTA_TESTING_DESDE_0.md** | Testing strategy | Before Sprint 0 (read TDD section) |
| **PROPUESTA_FRONTEND_DESDE_0.md** | Frontend architecture | During frontend tasks (Sprint 0) |
| **ROADMAP_DESARROLLO_DESDE_0.md** | Complete 4-week timeline | Weekly planning |
| **SPRINTS_2_3_4_CONDENSED.md** | Sprints 2, 3, 4 (quick ref) | End of Sprint 1 |
| **CONVENTIONS.md** | Python code standards | During implementation |
| **CONVENTIONS_FRONTEND.md** | Frontend standards | During frontend work |

---

---

## 🤖 INSTRUCCIONES PARA IAs (CRITICAL - LEE ESTO PRIMERO)

### ¿Eres una IA? Esto es para ti.

**Tu trabajo:** Leer el documento del sprint correspondiente y hacer las tareas asignadas.

**Regla de oro:** Cada tarea tiene un MCP asignado. **DEBES usar ese MCP y ese modelo.** No cambies asignaciones.

### Paso 1: Identifica Tu Tarea

```
1. Busca tu ID de tarea (ej: S0-D1-1, S1-D2-3)
2. Busca la fila con ese ID en el documento del sprint
3. Lee la columna "MCP Assignment"
4. ESE es el MCP y modelo que DEBES usar
```

### Paso 2: Comprende la Estructura de Tareas

Cada tarea tiene este formato en los documentos de sprint:

```
| Task ID | Description | MCP | Model | Tokens | Status |
|---------|-------------|-----|-------|--------|--------|
| S0-D1-1 | Setup Turbo monorepo | claude | haiku | 2,000 | 🟡 |
```

**Leyenda:**
- `Task ID`: Identificador único (Sprint-Day-Number)
- `MCP`: El servicio a usar (claude, sonnet, gemini)
- `Model`: El modelo específico (haiku, sonnet, opus, gemini-2.0-flash)
- `Tokens`: Presupuesto máximo de tokens para esta tarea
- `Status`: 🟢 Done, 🟡 In-Progress, 🔴 Blocked, ⚪ Todo

### Paso 3: Matriz de Decisión de MCP (si necesitas asignar)

**Usa esta matriz si NO está especificado en el documento:**

| Tipo de Tarea | MCP | Modelo | Razón |
|---------------|-----|--------|-------|
| **Boilerplate** (setup, scaffolding) | claude | haiku | 75% más barato, suficiente para código simple |
| **Implementación compleja** (auth, services) | claude | sonnet | Necesita razonamiento avanzado |
| **Code Review** (auditoría, análisis) | gemini | gemini-2.0-flash | Especializado en análisis de código |
| **Debugging** (error analysis) | claude | sonnet | Razonamiento paso-a-paso |
| **Documentación** (README, comentarios) | claude | haiku | Generación simple de texto |
| **Testing** (test writing) | claude | sonnet | Casos complejos, coverage |
| **UI/Frontend** (React components) | claude | haiku | Componentes simples, Sonnet si complejos |
| **Performance** (optimización) | claude | sonnet | Análisis profundo necesario |
| **Security Review** (auth, tokens, secrets) | gemini | gemini-2.0-flash | SIEMPRE Gemini para seguridad |

### Paso 4: Cómo Leer los Documentos de Sprint

**Archivo a leer:** `SPRINT_X_PLAN.md` (donde X = 0, 1, 2, 3 ó 4)

**Estructura del documento:**

```
# SPRINT X PLAN

## Day 1: [Tema principal]

### Task S0-D1-1: [Descripción corta]

**MCP Assignment:** claude / haiku
**Tokens:** 2,000
**Timeline:** 2h

**Descripción:**
[Qué hacer]

**Checklist:**
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

**Success Criteria:**
- Output esperado
```

**TU JOB:**
1. Lee el título de la tarea
2. Lee la descripción completa
3. Consulta "MCP Assignment"
4. **USA ESE MCP**
5. Completa todos los items del checklist
6. Verifica que los "Success Criteria" se cumplan

### Paso 5: Ejemplos de Asignación Correcta

#### Ejemplo 1: Task S0-D1-1 (Boilerplate)
```
Task: Setup Turbo monorepo
Description: Create Turbo configuration for GRANTER v2
MCP Assignment: claude / haiku ✅
Tokens Budget: 2,000

✅ CORRECTO: Usar Haiku (es boilerplate simple)
❌ INCORRECTO: Usar Sonnet (desperdicia tokens)
❌ INCORRECTO: Usar Gemini (no es para esto)
```

#### Ejemplo 2: Task S1-D1-1 (Security-Critical)
```
Task: JWT Implementation (FAIL SECURE)
Description: Implement JWT validation without fallback
MCP Assignment: claude / sonnet ✅
Tokens Budget: 3,500

✅ CORRECTO: Usar Sonnet (seguridad crítica)
❌ INCORRECTO: Usar Haiku (muy riesgoso para auth)
❌ INCORRECTO: Usar Gemini (no es para implementación)
```

#### Ejemplo 3: Task S1-D5-1 (Code Review)
```
Task: Security Review - All Sprint 1 Code
Description: Gemini deep review of JWT, auth guards, DTOs
MCP Assignment: gemini / gemini-2.0-flash ✅
Tokens Budget: 5,000

✅ CORRECTO: Usar Gemini (review especializado)
❌ INCORRECTO: Usar Sonnet (no está optimizado para esto)
```

### Paso 6: Checklist de Verificación (Antes de Terminar Tarea)

Antes de marcar una tarea como completada, verifica:

```
✅ Usé el MCP correcto (claude, gemini)?
✅ Usé el modelo correcto (haiku, sonnet, gemini-2.0-flash)?
✅ Completé TODOS los items del checklist?
✅ Se cumplen todos los "Success Criteria"?
✅ Usé menos de X tokens (presupuesto de la tarea)?
✅ Escribí código limpio y documentado?
✅ Los tests pasan (si aplica)?
✅ No violé ninguna "Critical Rule"?
```

Si algo no se cumple: **NO MARQUES COMO DONE.** Reporta el blocker.

---

## 🤖 How to Use the Orchestrator

### The Orchestrator is Your Coordinator

```
Role: Haiku-based AI agent
Function: Route tasks to right MCP, monitor progress
Cost: Free (Haiku is ~75% cheaper than Sonnet)
Availability: Check in daily
```

### Daily Workflow

```
🟢 MORNING (Orchestrator initializes)
   └─ Orchestrator queues today's tasks
   └─ Assigns to Haiku (simple), Sonnet (complex), Manual (tests)
   └─ You start with first task

🟡 MIDDAY (Progress check)
   └─ Orchestrator monitors token usage
   └─ If blockers detected → escalates
   └─ Continues assigned tasks

🔴 EVENING (Daily report)
   └─ Orchestrator: Tasks completed ✅
   └─ Status: [completed, in-progress, blocked]
   └─ Tomorrow's queue: [T1, T2, T3]
```

### When Blocked

```
You: "Task S1-D1-1 is blocked, stuck on JWT validation"
Orchestrator: (escalates to Sonnet for deeper dive)
Sonnet: (analyzes, provides solution)
Orchestrator: (queues solution for tomorrow)
Next day: Problem fixed, continue
```

---

## 📊 Token Budget (Don't Exceed)

### Daily Budget: 30,000 tokens/day

```
💰 Cost breakdown:
  Haiku:  15,000 tokens = $0.02
  Sonnet: 10,000 tokens = $0.30
  Gemini:  5,000 tokens = $0.03
  ─────────────────────────────
  Total:  30,000 tokens ≈ $0.35/day
```

### Sprint Budget: 150,000 tokens/sprint

```
Sprints:
  S0: 24,000   ($0.25)
  S1: 47,500   ($1.35)
  S2: 35,000   ($0.82)
  S3: 30,000   ($0.67)
  S4: 20,000   ($0.51)
  ───────────────────────
  Total: 157,500 (~$4.60)
```

### Budget Alerts

```
⚠️  Yellow: 80% of daily budget used
    Action: Slow down, consolidate tasks

🔴 Red: 95% of daily budget used
    Action: STOP, wait for next day, escalate
```

---

## ✅ Checkpoints: How to Know You're On Track

### End of Day Checklist

```
Each day, verify:
  ✅ Task started (in-progress status)
  ✅ Task checklist filled
  ✅ Tokens used < daily budget
  ✅ No critical blockers
  ✅ Ready for next day
```

### End of Sprint Checklist

### Sprint 0 (Wednesday, Feb 5)

```
✅ Docker Compose up -d → all services healthy
✅ npm run test → all pass
✅ npm run lint → 0 errors
✅ CI/CD pipeline → green
✅ Coverage baseline: established
```

### Sprint 1 (Friday, Feb 14)

```
✅ JWT implemented without fallback (FAIL SECURE)
✅ Auth inter-service working (X-Service-Token)
✅ Tests > 70% coverage (all services)
✅ E2E: Register → Login → Dashboard flow
✅ Manual testing: all auth scenarios
```

### Sprint 2 (Friday, Feb 21)

```
✅ Grants CRUD working
✅ Search + filters functional
✅ IA Service with fallback
✅ Retries implemented
✅ All services > 70% coverage
```

### Sprint 3 (Thursday, Feb 27)

```
✅ Scraper integration working
✅ Performance: all queries < 100ms
✅ Health checks functional
✅ Structured logging in place
✅ Ready for hardening
```

### Sprint 4 + Go-Live (Friday, Mar 3)

```
✅ ALL 12 release gates passed
✅ 0 critical security issues
✅ Deployment successful
✅ Monitoring alerts configured
✅ Team trained on runbook
```

---

## 🚨 If Something Goes Wrong

### Blocker Detected

```
Your task: S1-D1-1 (JWT implementation)
Problem: "Unsure how to implement FAIL SECURE pattern"

Action:
  1. Note: "JWT FAIL SECURE unclear" in task status
  2. Escalate: Report to Orchestrator
  3. Orchestrator escalates to Sonnet
  4. Sonnet: Deep dive + solution provided
  5. Next: Resume with solution
```

### Deadline Slip

```
Sprint 0 Day 2: Behind schedule
  Docker Compose taking longer than expected

Action:
  1. Report: "S0-D2-1 behind 2 hours"
  2. Orchestrator replan: Adjust Day 2 + 3 tasks
  3. Continue: Reduced scope or Sonnet assist
  4. Next: Monitor daily for catch-up
```

### Token Budget Exceeded

```
Situation: 28,000/30,000 tokens used by 16:00 (still 2h left in day)

Action:
  1. STOP new tasks
  2. Report: "Daily budget 93%, stopping tasks"
  3. Queue: Remaining tasks for tomorrow
  4. Next: Continue fresh tomorrow
```

---

## 🎯 Success Metrics

### Weekly Metrics (Every Friday)

```
📊 GRANTER v2 Weekly Status Report

✅ Tasks Completed: X/Y (target 90%+)
✅ Tokens Used: X/150,000 (target: on budget)
✅ Code Coverage: >70% (target: maintain)
✅ Blockers: X (target: 0-1)
✅ Security Issues: X (target: 0 critical)
✅ CI/CD: Green (target: always)

Status: ON TRACK / BEHIND / RISK
Next Week: [Priority 1, 2, 3]
```

### Final Metrics (End of Project - Mar 3)

```
📈 GRANTER V2 LAUNCH METRICS

✅ Code Coverage: 72% (target: >70%) ✅
✅ Security Score: 8.5/10 (was 4/10) ✅
✅ Testing Coverage: 8/10 (was 3/10) ✅
✅ Performance: p99 < 500ms (target met) ✅
✅ Go-Live: On schedule (Friday, Mar 3) ✅
✅ Downtime: 0 minutes (target met) ✅
✅ Critical Issues: 0 (target met) ✅

Result: 🎉 PRODUCTION READY 🎉
```

---

## 📞 Who to Ask

### Technical Decisions

```
Q: "Should we use Redis or just PostgreSQL caching?"
A: Check PROPUESTA_ARQUITECTURA_DESDE_0.md (§3.1)
   Decision already made: Redis (for BullMQ queue)
```

### Implementation Details

```
Q: "How do I implement JWT FAIL SECURE?"
A: Read PROPUESTA_SEGURIDAD_DESDE_0.md (§1)
   If unclear: Escalate via Orchestrator → Sonnet
```

### MCP Assignment (Para IAs: Cómo elegir el MCP correcto)

```
Q: "¿Qué MCP debo usar para esta tarea?"
A: Usa esta matriz (en orden de prioridad):

1. ¿Está especificado en SPRINT_X_PLAN.md?
   → ÚSALO ESE (fin de la historia)

2. ¿Es seguridad (auth, JWT, passwords, secrets)?
   → Gemini (gemini-2.0-flash)

3. ¿Es boilerplate/setup (scaffolding, config)?
   → Claude Haiku (75% más barato)

4. ¿Es implementación compleja (lógica, algoritmos)?
   → Claude Sonnet (mejor razonamiento)

5. ¿Es review de código o auditoría?
   → Gemini (especializado)

6. Cuando dudes:
   → Claude Sonnet (seguro pero más caro)
   → Nunca uses Haiku para seguridad
```

### Progress Status

```
Q: "Are we on track?"
A: Check ORCHESTRATOR_MASTER_PLAN.md (monitoring section)
   Daily report shows: Completed, In-Progress, Blocked
```

---

---

## ✅ VERIFICACIÓN DE MCP ASSIGNMENT (Para IAs)

### Antes de Empezar una Tarea

**Haz estas preguntas:**

```
1. ¿Encontré la tarea en SPRINT_X_PLAN.md?
   SÍ ✅ → Continúa al paso 2
   NO ❌ → La tarea no existe. Reporta al Orchestrator

2. ¿Está especificado el "MCP Assignment"?
   SÍ ✅ → Úsalo exactamente
   NO ❌ → Usa la matriz de decisión (arriba)

3. ¿Es seguridad (auth, JWT, passwords, tokens)?
   SÍ ✅ → DEBE ser Gemini (nunca Haiku)
   NO ❌ → Continúa

4. ¿Es boilerplate o setup?
   SÍ ✅ → Usa Haiku (más barato)
   NO ❌ → Continúa

5. ¿Necesita implementación compleja?
   SÍ ✅ → Usa Sonnet
   NO ❌ → Haiku está bien

6. ¿Es review o auditoría de código?
   SÍ ✅ → Usa Gemini
   NO ❌ → Continúa
```

### Durante la Tarea: Monitoreo de Tokens

```
⚠️ ALERTA: Si usas más de X tokens (presupuesto):
   → Nota el sobrante
   → Continúa la tarea (no la abandones)
   → Reporta al Orchestrator al terminar
   → El Orchestrator decidirá si replan

📊 Ejemplo:
   Presupuesto: 2,000 tokens
   Usado: 2,300 tokens
   → Reportar: "S0-D1-1: 300 tokens over budget"
```

### Después de Terminar

```
✅ Checklist final:
  [ ] Tarea completada según descripción
  [ ] TODOS los items de checklist ✓
  [ ] Todos los "Success Criteria" cumplidos
  [ ] Tests pasan (si aplica)
  [ ] Código documentado
  [ ] Tokens usados <= presupuesto (o reportado sobrante)
  [ ] Status: Actualizar a "✅ Done"
```

---

## 🔐 Critical Reminders (NON-NEGOTIABLE)

### NEVER Deviate From - These are HARD Rules

```
🔴 MUST FOLLOW (Sin excepciones):
  1. JWT FAIL SECURE (no fallback) - Gemini review required
  2. X-Service-Token required (inter-service) - No exceptions
  3. All DTOs with validators (no validation = no merge)
  4. >70% coverage minimum (no exceptions)
  5. All auth code reviewed by Gemini (before merge)
  6. No secrets in code (detect-secrets scan required)
  7. All 12 release gates must pass (before go-live)
  8. MCP assignments CANNOT be changed without Orchestrator approval

If ANY violated:
  → Pull request automatically rejected
  → Escalate to lead architect
  → No merge until fixed

🚨 CRITICAL FOR IAs:
  → If you can't follow these rules, STOP and report
  → Don't try to work around them
  → Ask Orchestrator for exception (rare)
```

---

## 🚀 Timeline at a Glance

```
📅 GRANTER V2 TIMELINE

Week 1 (Jan 30 - Feb 5):
  Sprint 0: Setup + Boilerplate
  Status: Foundation locked

Week 2 (Feb 6 - Feb 14):
  Sprint 1: Auth + Security
  Status: Security gates validated

Week 3 (Feb 15 - Feb 21):
  Sprint 2: Features + MVP
  Status: MVP ready for beta

Week 4 (Feb 22 - Mar 3):
  Sprint 3-4: Hardening + Go-Live
  Status: Production deployment

🎯 Go-Live: Friday, March 3, 2026
🎉 PRODUCTION READY
```

---

## ✨ What Makes This Different

```
vs. Traditional Approach:
  ❌ One developer writes everything (slow, expensive)
  ✅ AI agents coordinate specialized tasks (fast, cheap)

vs. All-Sonnet Approach:
  ❌ Every task uses Sonnet (expensive: $5-10/sprint)
  ✅ Haiku for simple, Sonnet for complex (cheap: $4.60 total)

vs. No Orchestration:
  ❌ Chaos, conflicting changes, untracked progress
  ✅ Central coordinator ensures alignment + efficiency

Result:
  ✅ 4 weeks (not 8-12)
  ✅ $4.60 (not $20-50)
  ✅ Production-ready (not 50% done)
```

---

## 📋 Your First Action

### TODAY (Jan 27)

```
1. Read: ORCHESTRATOR_MASTER_PLAN.md (15 min)
2. Read: SPRINT_0_PLAN.md (20 min)
3. Review: 00_CONCLAVE_PROPUESTA_FINAL_DESDE_0.md (20 min)
4. Share: These documents with tech lead/CEO
5. Email: "GRANTER v2 plan ready for review"
```

### TOMORROW (Jan 28)

```
1. Team meeting (1 hour)
   ├─ Confirm 2 devs available (Feb 3 - Mar 3)
   ├─ Confirm timeline (4 weeks)
   ├─ Confirm budget ($4.60 tokens)
   └─ Decision: GO / NO-GO

2. If GO:
   ├─ Create GitHub repo
   ├─ Create #granter-development Slack channel
   ├─ Setup CI/CD template
   └─ Distribute documents to team
```

### MONDAY, FEB 3 (Sprint 0 Begins)

```
1. 08:00 - Daily standup (15 min)
2. 08:15 - Start S0-D1-1 (Turbo setup via Haiku)
3. Follow SPRINT_0_PLAN.md day by day
4. 17:00 - Daily report from Orchestrator
```

---

## ✅ Conclusion

```
You have:
  ✅ Complete architecture (security-first, scalable)
  ✅ Day-by-day sprint plans (4 weeks detailed)
  ✅ MCP assignments (token-optimized)
  ✅ Central coordinator (Haiku Orchestrator)
  ✅ Quality gates (12 release criteria)
  ✅ Token budget (~$4.60 total)
  ✅ Timeline (Feb 3 - Mar 3, 2026)

What's next:
  ✅ Get approval from leadership
  ✅ Confirm 2 senior devs
  ✅ Start Sprint 0 on Monday
  ✅ Follow the Orchestrator daily
  ✅ Deploy to production Friday, Mar 3
  ✅ Celebrate! 🎉

Ready to start?
  → YES ✅ → Read SPRINT_0_PLAN.md
  → NO ❌ → Ask questions (see § Contact)
```

---

**Status:** 🟢 READY TO LAUNCH
**Start Date:** Monday, February 3, 2026
**Go-Live Date:** Friday, March 3, 2026

**Questions?** → Check AGENTS_CUSTOMIZADO_GRANTER.md (§13. Ownership & Contact)

🚀 **Let's build GRANTER v2!**
