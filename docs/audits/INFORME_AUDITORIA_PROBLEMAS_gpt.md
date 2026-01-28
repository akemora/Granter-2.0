# 🔍 INFORME DE PROBLEMAS — PROYECTO GRANTER (Auditoría super a fondo)
**Fecha:** 2026-01-27  
**Alcance:** Backend (NestJS), Data Service (FastAPI), Frontend (Next.js), Infra/CI, Seguridad, Datos, Observabilidad  
**Metodología:** revisión de código, configs, docs, CI y flujos end‑to‑end (sin ejecución en runtime)

---

## ✅ Resumen ejecutivo
GRANTER tiene un MVP funcional con buena separación por servicios, pero **no es seguro ni operativo para producción pública** en su estado actual. Los riesgos más graves son **seguridad inter‑servicio**, **credenciales por defecto**, **secrets expuestos en documentación**, **endpoints públicos costosos** y **validación inexistente en el backend**.  

**Diagnóstico global:** 5.6/10 (No apto para producción abierta)  

### Top‑5 riesgos críticos (P0)
1. **Inter‑servicio sin autenticación**: cualquier actor puede inyectar grants/sources.  
2. **Usuario admin por defecto** creado automáticamente con contraseña conocida.  
3. **Secrets expuestos en documentación** (API key real en texto claro).  
4. **JWT con fallback inseguro** (`secret_key_default`).  
5. **Endpoints `/scrape` y `/discover` públicos** (coste y DoS).

---

## 🧯 Hallazgos CRÍTICOS (P0)

### P0‑1. Endpoints inter‑servicio sin autenticación
**Evidencia:**  
- `apps/backend-core/src/infrastructure/controllers/grant.controller.ts` (POST /grants sin guard)  
- `apps/backend-core/src/infrastructure/controllers/source.controller.ts` (GET /sources público)  
- `apps/data-service/src/core/backend_client.py` (requests sin token)

**Impacto:** inyección masiva de grants, manipulación de fuentes, corrupción de datos.  
**Recomendación:** autenticar inter‑servicio (mTLS o `X-Service-Token`), restringir rutas internas y moverlas a red privada.

---

### P0‑2. Usuario admin por defecto creado en cada arranque
**Evidencia:**  
- `apps/backend-core/src/application/source.service.ts` (`seedUsers()` en `onModuleInit`)  
- `apps/backend-core/src/scripts/seed-user.ts`  
- `CREDENCIALES.md`

**Impacto:** acceso no autorizado inmediato si el sistema se despliega públicamente.  
**Recomendación:** eliminar seed automático o exigir `SEED_ADMIN_ON_BOOT=true` + password aleatoria; forzar cambio al primer login.

---

### P0‑3. Secrets expuestos en documentación
**Evidencia:**  
- `RESUMEN_SESION_COMPLETA.md`  
- `RESUMEN_SCRAPER_IA.md`

**Impacto:** compromiso de API keys; posible abuso de cuentas externas.  
**Recomendación:** eliminar claves reales del repo, rotar secretos y añadir escaneo automático de secrets en CI.

---

### P0‑4. JWT con fallback inseguro
**Evidencia:**  
- `apps/backend-core/src/application/auth/auth.module.ts`  
- `apps/backend-core/src/infrastructure/auth/strategies/jwt.strategy.ts`

**Impacto:** si `JWT_SECRET` falta o falla el loader, cualquier atacante puede firmar tokens.  
**Recomendación:** eliminar fallback, fallar seguro si no hay secret.

---

### P0‑5. Endpoints `/scrape` y `/discover` públicos
**Evidencia:**  
- `apps/data-service/src/main.py` (sin auth ni rate limit)  
- `apps/web-frontend/src/components/ScrapeButton.tsx`  
- `apps/web-frontend/src/app/discover/page.tsx`

**Impacto:** DoS, costes de IA y scraping no controlados, abuso externo.  
**Recomendación:** proteger con auth + rate‑limit + cola de trabajos.

---

## 🔶 Hallazgos ALTOS (P1)

### P1‑1. Token en cookie accesible por JS (sin HttpOnly/secure)
**Evidencia:** `apps/web-frontend/src/lib/auth.ts`  
**Impacto:** robo de token vía XSS y sesiones comprometidas.  
**Recomendación:** mover auth a cookie HttpOnly/secure emitida por el backend o BFF.

---

### P1‑2. Validación de input inexistente en backend
**Evidencia:**  
- `apps/backend-core/src/main.ts` (no `ValidationPipe`)  
- DTOs son interfaces (`packages/shared/src/index.ts`)

**Impacto:** entrada no validada, errores de integridad y superficie de ataque mayor.  
**Recomendación:** DTOs con `class-validator` + `ValidationPipe` global.

---

### P1‑3. URLs hardcodeadas en frontend (login/scrape/discover)
**Evidencia:**  
- `apps/web-frontend/src/app/login/page.tsx`  
- `apps/web-frontend/src/components/ScrapeButton.tsx`  
- `apps/web-frontend/src/app/discover/page.tsx`

**Impacto:** fallos en producción, tráfico a hosts incorrectos, difícil despliegue multi‑entorno.  
**Recomendación:** usar `NEXT_PUBLIC_API_URL` y un BFF para llamadas internas.

---

### P1‑4. Cliente HTTP bloqueante y sin timeouts en Data Service
**Evidencia:** `apps/data-service/src/core/backend_client.py` (requests sin timeout)  
**Impacto:** bloqueo del event loop, latencias altas y timeouts en cascada.  
**Recomendación:** migrar a `httpx.AsyncClient` + timeouts + retries.

---

### P1‑5. Cola de scraping no funcional en Docker
**Evidencia:**  
- `apps/backend-core/src/infrastructure/queue/scraper.processor.ts` (`DATA_SERVICE_URL` → localhost)  
- `apps/data-service/src/main.py` (/scrape ignora payload)

**Impacto:** jobs fallan silenciosamente; scraping no escalable.  
**Recomendación:** corregir URL interna (`http://data-service:8000`) y endpoint por source.

---

### P1‑6. CI no refleja runtime real y permite fallos
**Evidencia:** `.github/workflows/ci.yml` (Node 18, `continue-on-error`)  
**Impacto:** bugs pasan a producción, falsa sensación de calidad.  
**Recomendación:** Node 20 + tests/lint bloqueantes.

---

### P1‑7. Sin rate‑limit ni auth en Data Service
**Evidencia:** `apps/data-service/src/main.py`  
**Impacto:** abuso de scraping/IA, costes impredecibles.  
**Recomendación:** autenticación + throttling + cuotas por usuario/servicio.

---

### P1‑8. Seeding de fuentes en cada arranque
**Evidencia:** `apps/backend-core/src/application/source.service.ts`  
**Impacto:** mutaciones no controladas de datos en producción.  
**Recomendación:** seed controlado por flag de entorno.

---

## 🟡 Hallazgos MEDIOS (P2)

### P2‑1. Sin paginación en listados principales
**Evidencia:** `apps/backend-core/src/infrastructure/controllers/grant.controller.ts`, `source.controller.ts`  
**Impacto:** respuestas grandes, timeouts, consumo de memoria.  
**Recomendación:** paginación y límites por defecto.

---

### P2‑2. Duplicados en grants/sources
**Evidencia:** entidades sin constraints (`apps/backend-core/src/infrastructure/persistence/*.ts`)  
**Impacto:** datos repetidos, búsquedas ruidosas.  
**Recomendación:** índices únicos (baseUrl, fingerprint de grant).

---

### P2‑3. Búsqueda lenta (ILike sin índices)
**Evidencia:** `apps/backend-core/src/infrastructure/persistence/grant.repository.impl.ts`  
**Impacto:** performance degradada al crecer el dataset.  
**Recomendación:** `pg_trgm` + índices GIN; FTS.

---

### P2‑4. Discovery con filtro de dominios desactivado por defecto
**Evidencia:** `apps/data-service/src/main.py` (`skip_domain_filter=True`)  
**Impacto:** fuentes no oficiales, menor calidad.  
**Recomendación:** activar filtro por defecto y permitir override.

---

### P2‑5. Falta trazabilidad de ejecuciones de scraping
**Evidencia:** no existe entidad `scrape_run` ni auditoría.  
**Impacto:** difícil depurar, medir y optimizar.  
**Recomendación:** tabla de runs + métricas por fuente.

---

### P2‑6. Configuración `.env` con rutas inconsistentes
**Evidencia:** `apps/backend-core/src/app.module.ts` (`envFilePath: '../../.env'`)  
**Impacto:** variables no cargan en algunos entornos.  
**Recomendación:** normalizar carga por entorno o usar `dotenv` centralizado.

---

### P2‑7. Data Service usa Playwright por fuente sin pool
**Evidencia:** `apps/data-service/src/services/*scraper*.py`  
**Impacto:** alto consumo de CPU/RAM; scraping lento.  
**Recomendación:** pool de browsers y concurrencia controlada.

---

### P2‑8. Falta control de coste IA (Gemini)
**Evidencia:** `apps/data-service/src/services/ia_service_v2.py`  
**Impacto:** costes impredecibles, límites de cuota.  
**Recomendación:** cache, throttling, budget diario y fallback heurístico.

---

### P2‑9. Inconsistencias entre servicios (contratos)
**Evidencia:** backend espera `officialLink`, data-service envía `official_link` y hace mapping manual.  
**Impacto:** riesgo de bugs silenciosos.  
**Recomendación:** contrato OpenAPI + clientes generados.

---

### P2‑10. Observabilidad limitada (sin métricas/tracing)
**Evidencia:** falta Prometheus/OTel/Sentry.  
**Impacto:** difícil detectar fallos y degradaciones.  
**Recomendación:** métricas, traces, alertas.

---

## 🟢 Hallazgos BAJOS (P3)

### P3‑1. `venv` y artefactos locales en el repo
**Evidencia:** `apps/data-service/venv` (no ignorado)  
**Impacto:** ruido en el repo y commits accidentales.  
**Recomendación:** añadir a `.gitignore`.

---

### P3‑2. `print()` en lugar de logging estructurado
**Evidencia:** `apps/data-service/src/core/backend_client.py`  
**Impacto:** trazas inconsistentes.  
**Recomendación:** usar logger común.

---

### P3‑3. `except: pass` que oculta errores
**Evidencia:** `apps/data-service/src/services/generic_scraper.py`  
**Impacto:** fallos silenciosos.  
**Recomendación:** capturar excepción y loggear.

---

### P3‑4. User‑Agents hardcodeados
**Evidencia:** scrapers (`generic_scraper.py`, `smart_scraper.py`)  
**Impacto:** mantenimiento y bloqueo por sites.  
**Recomendación:** centralizar y rotar UA.

---

### P3‑5. Frontend solo valida “presencia” del token
**Evidencia:** `apps/web-frontend/src/middleware.ts`  
**Impacto:** UX inconsistente con tokens expirados.  
**Recomendación:** validar sesión vía backend o refresh.

---

## 📌 Recomendaciones inmediatas (quick wins 48‑72h)
1. Eliminar seed admin automático y rotar credenciales.  
2. Proteger `/grants` y `/sources` con auth inter‑servicio.  
3. Bloquear `/scrape` y `/discover` con auth + rate‑limit.  
4. Quitar fallback inseguro de JWT.  
5. Pasar URLs a configuración por entorno.

---

## 🧭 Riesgos si no se actúa
- **Pérdida de integridad de datos** (grants falsos).  
- **Compromiso de cuentas** (credenciales por defecto + tokens expuestos).  
- **Costes elevados e impredecibles** por IA/scraping.  
- **Degradación de performance** al crecer la base.  
