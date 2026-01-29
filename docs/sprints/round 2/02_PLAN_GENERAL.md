# ROUND 2 - GENERAL PLAN (EXECUTIVE SUMMARY)

Status: DONE
Last update: 2026-01-29

---

## Mandatory Reference

- [AGENTS.md](../../../AGENTS.md)

---

## Goal

Close all gaps between what is promised in docs/README/GRANTER v1 and what is implemented in GRANTER 2.0. Focus is consistency, real security, and functional parity.

---

## Phases & Scope

| Phase | Focus | Gap Count | Estimated Effort |
|-------|-------|-----------|------------------|
| **FASE 0** | API Contract & docs coherence | 7 | M |
| **FASE 1** | Real security (rate limiting, headers, JWT storage) | 5 | L |
| **FASE 2** | Complete data model (sector/status/beneficiaries) | 5 | L |
| **FASE 3** | Per-user profile + personalized recommendations/notifications | 5 | L |
| **FASE 4** | Advanced Scraping/IA (real source types, IA integration) | 7 | XL |
| **FASE 5** | Complete UX (filters, details, scraping logs) | 6 | L |
| **FASE 6** | QA/OPS (real smoke tests, data-service tests, cleanup) | 5 | M |

**Size Legend:** S = 1-2 days, M = 3-5 days, L = 1-2 weeks, XL = 2+ weeks

---

## Global Checklist

1. [x] Align API docs with real endpoints or implement standard response wrapper.
2. [x] Execute FASE 1 completely and validate security checklist.
3. [x] Complete data model and activate real filters (sector/status/beneficiaries).
4. [x] Implement per-user profile and update recommendations/notifications.
5. [x] Integrate IA extraction in real flow and support API/RSS/PDF sources.
6. [x] Complete UX (filters, grant detail, scraping per source, logs).
7. [x] Integrate data-service tests and real smoke tests in pipeline.
8. [x] Validate everything with test + lint + type-check (2026-01-29).

---

## Key Notes

- **Order is mandatory.** Each phase unlocks the next.
- If API contract changes, update docs, UI, and examples.
- If auth/security is touched, use Gemini per AGENTS.md.
- **Document all architectural decisions** in 10_ADR_REGISTRO.md.

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Security gaps exploited before FASE 1 | LOW | CRITICAL | Prioritize FASE 1 |
| Data model changes break existing data | MEDIUM | HIGH | Write reversible migrations |
| Profile migration loses user data | LOW | HIGH | Backup before migration |
| IA integration fails | MEDIUM | MEDIUM | Keep fallback to generic scraper |

---

## Success Criteria

- [x] All 40 gaps from 01_ANALISIS_FALTANTES.md resolved
- [x] 100% tests passing
- [x] >70% code coverage maintained
- [x] Zero critical security gaps
- [x] API docs match implementation exactly

---
