# GRANTER 2.0 - ROUND 2 MASTER ORCHESTRATOR

Status: DONE
Last update: 2026-01-29

---

## Purpose

This folder contains the Round 2 remediation plan and phase-by-phase checklists. It is designed to be followed by humans and AI agents in a strict, repeatable order.

---

## Mandatory Reference

- Read and follow AGENTS.md before any work. It defines MCP/tool usage and non-negotiable rules.
- Link: [AGENTS.md](../../../AGENTS.md)

---

## Progress Dashboard

| Phase | Status | Checklist | Tests | Docs |
|-------|--------|-----------|-------|------|
| 0 - API Contract | DONE | 11/11 | - | ✅ |
| 1 - Security | IN PROGRESS | 16/16 | - | ✅ |
| 2 - Data Model | DONE | 11/11 | - | ✅ |
| 3 - User Profile | DONE | 11/11 | - | ✅ |
| 4 - Scraping/IA | DONE | 10/10 | - | ✅ |
| 5 - UX | DONE | 10/10 | - | ✅ |
| 6 - QA/Ops | DONE | 10/10 | lint/type/test ✅; smoke/cov ✅ | ✅ |

---

## Execution Order (read in this exact order)

1. `01_ANALISIS_FALTANTES.md` - Gap analysis
2. `02_PLAN_GENERAL.md` - Executive summary
3. `03_FASE_0_CONTRATO_API.md` - API contract & docs
4. `04_FASE_1_SEGURIDAD.md` - Security implementation
5. `05_FASE_2_MODELO_DATOS.md` - Data model completion
6. `06_FASE_3_PERFIL_USUARIO.md` - User profile personalization
7. `07_FASE_4_SCRAPING_IA.md` - Scraping & AI integration
8. `08_FASE_5_UX.md` - UX completion
9. `09_FASE_6_QA_OPS.md` - QA & Operations
10. `10_ADR_REGISTRO.md` - Architecture Decision Records
11. `11_AUDIT_TECNICA.md` - Technical audit results

---

## Phase Dependencies

```
FASE 0 ─────────────────────────────────────────────────────────┐
   │                                                             │
   ▼                                                             │
FASE 1 ─────────────────────────────────────────────────────────┤
   │                                                             │
   ▼                                                             │
FASE 2 ──────────────┬──────────────────────────────────────────┤
   │                  │                                          │
   ▼                  ▼                                          │
FASE 3             FASE 4                                        │
   │                  │                                          │
   └─────────┬────────┴───────────────────────────────────────── │
             │                                                   │
             ▼                                                   │
          FASE 5 ────────────────────────────────────────────────┤
             │                                                   │
             ▼                                                   │
          FASE 6 ◄───────────────────────────────────────────────┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 0 | - | 1, 2, 3, 4, 5, 6 |
| 1 | 0 | 6 |
| 2 | 0, 1 | 3, 4, 5, 6 |
| 3 | 2 | 5, 6 |
| 4 | 2 | 5, 6 |
| 5 | 3, 4 | 6 |
| 6 | 0-5 | - |

---

## Global Rules (must be followed)

1. Use AGENTS.md to select the correct MCP for each task type.
2. Do not skip checklists. Mark items as [x] only when done.
3. Keep tests and lint green before closing any phase.
4. If a task changes API behavior, update docs in the same phase.
5. If a task changes security/auth, perform a Gemini review per AGENTS.md.

---

## Definition of Done (for each phase)

- [ ] All checklist items are completed and validated.
- [ ] Tests and lint pass for affected areas.
- [ ] Docs updated to reflect the actual behavior.
- [ ] Any new env vars or configs added to .env.example.
- [ ] ADR documented for any architectural decisions made.

---

## How to Use the Checklists

- Each phase document contains a numbered checklist of tasks.
- Tasks have priority (P1/P2/P3) and size (S/M/L/XL) indicators.
- Mark items in order. If blocked, add a note under "Blockers" in that phase doc.
- Do not start the next phase until the current one is fully complete.

---

## Status Tracking

Update the top of each phase doc with:
```
Status: NOT STARTED | IN PROGRESS | BLOCKED | DONE
Start date: YYYY-MM-DD
End date: YYYY-MM-DD
```

---

## Quick Links

- [AGENTS.md](../../../AGENTS.md) - MCP assignments & rules
- [API_REFERENCE.md](../../development/API_REFERENCE.md) - Current API docs
- [CONVENTIONS.md](../../../CONVENTIONS.md) - Backend code standards
- [CONVENTIONS_FRONTEND.md](../../../CONVENTIONS_FRONTEND.md) - Frontend code standards

---
