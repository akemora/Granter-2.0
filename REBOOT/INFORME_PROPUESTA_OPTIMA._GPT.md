# 🏗️ INFORME DE PROPUESTA ÓPTIMA — Diseño, Arquitectura y Programación (GRANTER)
**Fecha:** 2026-01-27  
**Objetivo:** sistema confiable, seguro y escalable de descubrimiento, scraping y monitorización de subvenciones con IA.

---

## 🎯 Visión del sistema óptimo
1. **Seguro por defecto** (Zero‑Trust, secretos rotables, mínimos privilegios).  
2. **Pipeline de datos auditable** (trazabilidad completa de cada grant).  
3. **Escalable en scraping** (workers + colas + control de costes IA).  
4. **Calidad de datos alta** (deduplicación, validación y scoring).  
5. **Observabilidad end‑to‑end** (logs, métricas, trazas y alertas).

---

## 🧭 Arquitectura propuesta (alto nivel)

```
┌───────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Web Frontend │────▶│  API Gateway │────▶│   Backend Core   │
└───────────────┘     └──────────────┘     └────────┬─────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  Scheduler  │
                                              └─────┬───────┘
                                                    ▼
┌───────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Discovery Svc │────▶│  Queue/Bus   │────▶│  Scraper Workers │
└───────────────┘     └──────────────┘     └────────┬─────────┘
                                                     ▼
                                              ┌─────────────┐
                                              │ Extract/AI  │
                                              └─────┬───────┘
                                                    ▼
                                              ┌─────────────┐
                                              │ Normalizer  │
                                              └─────┬───────┘
                                                    ▼
                                              ┌─────────────┐
                                              │ PostgreSQL  │
                                              └─────────────┘
```

### Servicios principales
- **Backend Core (NestJS):** API pública, auth, RBAC, CRUD, orquestación.  
- **Discovery Service:** búsqueda y validación inicial de nuevas fuentes.  
- **Scraper Workers:** scraping paralelizado (Playwright/Scrapy).  
- **Extractor/AI:** extracción estructurada con fallback heurístico.  
- **Normalizer/Deduplicator:** limpieza, normalización, fingerprinting.  
- **Scheduler:** agenda scrapes, controla ventanas y prioridad.

---

## 🔐 Diseño de seguridad óptimo
1. **Service‑to‑Service Auth** (mTLS o `X-Service-Token` firmado + rotación).  
2. **JWT sin fallback** y validación de entorno obligatoria.  
3. **Credenciales iniciales seguras** (no seed automático; setup interactivo).  
4. **Tokens en HttpOnly cookies** y refresh‑token seguro.  
5. **Rate‑limiting y cuotas por endpoint** (especialmente scraping/IA).  
6. **Secret scanning** en CI + rotación automática.

---

## 🧱 Modelo de datos propuesto (mínimo)
**Nuevas entidades recomendadas:**
- `scrape_runs` (fuente, inicio/fin, status, errores, métricas)
- `grant_fingerprints` (hash para deduplicar)
- `source_status` (score, confianza, última ejecución, fallos)
- `raw_documents` (HTML/PDF bruto en storage)

**Mejoras a `Grant`:**
- `external_id`, `published_at`, `updated_at`, `source_id`, `fingerprint`

**Índices recomendados:**
- `GIN` para búsqueda full‑text  
- `pg_trgm` para búsquedas parciales  
- `unique` en `source.baseUrl` y `grant.fingerprint`

---

## 🧑‍💻 Programación óptima (patrones y estándares)
1. **DTOs reales + ValidationPipe** (backend).  
2. **Contrato OpenAPI** + clientes tipados para frontend/data‑service.  
3. **HTTP async con timeouts** (`httpx.AsyncClient`) y retries exponenciales.  
4. **Errores estandarizados** (Problem Details / RFC‑7807).  
5. **Idempotencia** en creación de grants/sources.  
6. **Test pyramid**: unit + integration + e2e con cobertura mínima 70‑80%.

---

## ⚙️ Infra y Observabilidad
- **CI/CD** con Node 20 + tests bloqueantes.  
- **Migrations** y no `synchronize` en producción.  
- **Prometheus + Grafana** + alertas SLO.  
- **Tracing distribuido** (OpenTelemetry).  
- **Sentry** para frontend y backend.

---

## 🧪 Control de costes de IA
- Cache por URL y contenido hash.  
- Presupuesto diario con corte automático.  
- Prioridad a heurísticas antes de IA.  
- Reintentos limitados con backoff.

---

## 🗓️ Roadmap sugerido (3 fases)

### Fase 0 (Semana 1‑2) — Seguridad y estabilidad inmediata
- Auth inter‑servicio  
- Eliminar admin por defecto  
- JWT sin fallback  
- Proteger `/scrape` y `/discover`  
- DTOs + ValidationPipe

### Fase 1 (Semana 3‑6) — Pipeline robusto
- Scheduler + queue reales  
- Scraper workers por source  
- Deduplicación y `scrape_runs`  
- Paginación + índices

### Fase 2 (Semana 7‑10) — Calidad, observabilidad y UX
- Search FTS y filtros avanzados  
- Observabilidad completa  
- Alertas y notificaciones  
- Optimización de IA

---

## ✅ Resultado esperado
Un sistema **seguro, escalable y auditable** que permite:
- scraping continuo con bajo coste  
- datos confiables y deduplicados  
- UX consistente en cualquier entorno  
- operación sostenible en producción

