# GRANTER 2.0 - GAP ANALYSIS

Status: DONE
Date: 2026-01-29

---

## Purpose

This document consolidates the gap analysis between GRANTER 1.0 (expected functionality) and GRANTER 2.0 (current state). It serves as a reference for all Round 2 phases.

---

## Mandatory Reference

- Read and follow AGENTS.md before any work.
- Link: [AGENTS.md](../../../AGENTS.md)

---

## How to Use This Document

- Read completely before executing phases.
- Use this list to validate that the phase plan covers all gaps.
- If a new gap is discovered, add it here and link it in the corresponding phase.

---

## 1) API Contract & Documentation

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| API-01 | API docs indicate `/users/me` but implementation is `/auth/me` | HIGH | 0 |
| API-02 | API docs describe wrapper `{ data, meta, error }` but responses are direct | HIGH | 0 |
| API-03 | API_REFERENCE says "15 Total" endpoints but lists only 12 | MEDIUM | 0 |
| API-04 | Example shows `data.token` but code returns `accessToken` | MEDIUM | 0 |
| API-05 | Swagger/OpenAPI not published (README says /swagger exists) | MEDIUM | 0 |
| API-06 | Error response format inconsistent with docs | MEDIUM | 0 |
| API-07 | Rate limiting documented (100 req/15min) but not implemented | HIGH | 1 |

**Impact:** Unstable contract, difficult frontend/third-party integration.

---

## 2) Authentication, Sessions & Security

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| SEC-01 | Rate limiting not implemented in main.ts | CRITICAL | 1 |
| SEC-02 | Security headers (helmet/CSP/HSTS) not implemented | CRITICAL | 1 |
| SEC-03 | Token stored in localStorage (XSS risk) without mitigation | HIGH | 1 |
| SEC-04 | No refresh token endpoint | MEDIUM | 1 |
| SEC-05 | AuthService.spec is placeholder with `expect(true).toBe(true)` | HIGH | 6 |
| SEC-06 | JWT expiration correctly set to 1h (verified in auth.module.ts:21) | OK | - |

**Impact:** Security risks and behavior inconsistent with documentation.

---

## 3) User Profile & Personalization

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| PRF-01 | Profile is global (`default-profile`) not per-user | CRITICAL | 3 |
| PRF-02 | UserProfileEntity has no FK to UserEntity | CRITICAL | 3 |
| PRF-03 | Recommendations not linked to authenticated user | HIGH | 3 |
| PRF-04 | Notifications not linked to authenticated user | HIGH | 3 |
| PRF-05 | ProfileService.getProfile() doesn't receive userId | HIGH | 3 |

**Impact:** Personalization non-functional; poor UX for real users.

---

## 4) Search, Filters & Results

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| SRC-01 | Sector filter commented out in search.service.ts:91-98 | HIGH | 2 |
| SRC-02 | Status filter commented out in search.service.ts:162-168 | HIGH | 2 |
| SRC-03 | FilterPanel.tsx has no UI for deadline filters | MEDIUM | 5 |
| SRC-04 | FilterPanel.tsx has no UI for status filter | MEDIUM | 5 |
| SRC-05 | No grant detail page exists (/grants/[id]) | MEDIUM | 5 |

**Impact:** Limited search without parity with GRANTER 1.0.

---

## 5) Data Model & Metadata

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| MDL-01 | GrantEntity lacks `status` field | CRITICAL | 2 |
| MDL-02 | GrantEntity lacks `sector` field | HIGH | 2 |
| MDL-03 | GrantEntity lacks `beneficiaries` field | MEDIUM | 2 |
| MDL-04 | SourceEntity has type but no specific handlers | HIGH | 4 |
| MDL-05 | No traceability of extraction strategy/version | LOW | 4 |

**Impact:** Difficulty filtering, auditing, and explaining results.

---

## 6) Scraping & Ingestion

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| SCR-01 | Only generic scrapers (smart/generic) exist | MEDIUM | 4 |
| SCR-02 | ScraperService doesn't differentiate by SourceType | HIGH | 4 |
| SCR-03 | Data-service IA extraction not integrated in flow | HIGH | 4 |
| SCR-04 | No real handling of API/RSS/PDF sources (only metadata) | MEDIUM | 4 |

**Impact:** Incomplete ingestion and low source coverage.

---

## 7) UX/UI & Modules

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| UX-01 | Filter UI incomplete (deadline/status) | HIGH | 5 |
| UX-02 | No grant detail page | HIGH | 5 |
| UX-03 | No UI for source management or scraping traceability | MEDIUM | 5 |
| UX-04 | Recommendations/monitoring modules not connected to real data | MEDIUM | 5 |

**Impact:** UI doesn't reflect promised GRANTER 1.0 functionality.

---

## 8) QA, Ops & Observability

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| QA-01 | No global smoke test script (`npm run test:smoke:all`) | HIGH | 6 |
| QA-02 | Data-service tests not integrated in main pipeline | MEDIUM | 6 |
| QA-03 | AuthService.spec is placeholder | HIGH | 6 |
| QA-04 | No deployment checklist with automated verification | MEDIUM | 6 |

**Impact:** Deployment risk and lower reliability.

---

## 9) Frontend-Backend Integration

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| INT-01 | Frontend doesn't consume endpoints with consistent contract | HIGH | 0 |
| INT-02 | UI filters sent but not applied in backend (commented) | HIGH | 2, 5 |
| INT-03 | Notifications and recommendations not unified with user profile | HIGH | 3 |

**Impact:** Final experience doesn't meet GRANTER 1.0 functional scope.

---

## 10) Automation & Queues (NEW - discovered in audit)

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| AUT-01 | `automation/` module exists but not documented | MEDIUM | 4 |
| AUT-02 | `queue/` module exists but not integrated in phases | MEDIUM | 4 |
| AUT-03 | Background job processing not documented | LOW | 6 |

**Impact:** Undocumented functionality that may cause confusion.

---

## 11) Security (Additional Gaps from Audit)

**Gaps detected:**

| ID | Gap | Severity | Phase |
|----|-----|----------|-------|
| SEC-07 | No input validation/sanitization in DTOs | CRITICAL | 1 |
| SEC-08 | No secret management strategy (hardcoded values risk) | HIGH | 1 |
| SEC-09 | CORS policy not defined or overly permissive | HIGH | 1 |
| SEC-10 | No JWT invalidation strategy (logout ineffective) | HIGH | 1 |

**Impact:** Critical security vulnerabilities not covered in the original plan.

---

## Summary by Phase

| Phase | Gap Count | Critical | High | Medium | Low |
|-------|-----------|----------|------|--------|-----|
| 0 | 7 | 0 | 2 | 5 | 0 |
| 1 | 9 | 3 | 6 | 1 | 0 |
| 2 | 5 | 1 | 3 | 1 | 0 |
| 3 | 5 | 2 | 3 | 0 | 0 |
| 4 | 7 | 0 | 3 | 3 | 1 |
| 5 | 6 | 0 | 3 | 3 | 0 |
| 6 | 5 | 0 | 2 | 2 | 1 |

---

## Notes

- This analysis is used as the basis for phases 0-6.
- If the scope of a gap changes, update this list and the phase plan.
- Gaps marked OK have been verified as resolved.

---
