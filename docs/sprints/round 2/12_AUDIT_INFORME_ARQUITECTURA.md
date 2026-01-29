# INFORME DE AUDITORÍA DE PLANIFICACIÓN - GRANTER 2.0 Round 2

**Auditor:** Gemini Advanced
**Fecha:** 2026-01-29

---

## 1. VALIDACIÓN DE GAPS (`01_ANALISIS_FALTANTES.md`)

*   **CORRECTO:** La identificación y categorización de gaps es exhaustiva y parece precisa. Los documentos `01_ANALISIS_FALTANTES.md` y `11_AUDIT_TECNICA.md` son consistentes al señalar problemas críticos como la falta de seguridad (`SEC-01`, `SEC-02`), el perfil de usuario global (`PRF-01`) y el modelo de datos incompleto (`MDL-01`). La severidad asignada a la mayoría de los gaps (ej. `CRITICAL` para `SEC-01` Rate Limiting) es apropiada.

*   **INCORRECTO:** No se ha encontrado nada incorrecto en la identificación de gaps. El análisis parece acertado.

*   **FALTANTE:**
    1.  **Validación de Entrada (Input Validation):** No se menciona explícitamente la falta de validación y sanitización de entradas en los DTOs del backend (ej. `class-validator`, `class-sanitizer`) para prevenir inyección de NoSQL, XSS reflejado en errores, o abuso de parámetros. Este es un gap de seguridad **CRÍTICO**.
    2.  **Gestión de Secretos:** No se especifica cómo se gestionan los secretos de la aplicación (claves de API, tokens de servicio, credenciales de BD). Debería haber una mención a usar un `ConfigService` y variables de entorno (`.env`), y nunca tener valores hardcodeados.
    3.  **CORS:** No se menciona la configuración de CORS. Una configuración demasiado permisiva (`origin: '*'`) es un riesgo de seguridad.

*   **RECOMENDACIÓN:**
    1.  Reclasificar la severidad de `SEC-03` (Token en localStorage) de `HIGH` a `CRITICAL` si la aplicación maneja datos sensibles. Aunque se mitiga con CSP, el riesgo inherente es muy alto.
    2.  Añadir los gaps de "Validación de Entrada", "Gestión de Secretos" y "Configuración CORS" al documento `01_ANALISIS_FALTANTES.md` y crear tareas asociadas en la FASE 1.

---

## 2. REVISIÓN DE SEGURIDAD (`04_FASE_1_SEGURIDAD.md`)

*   **CORRECTO:** La propuesta de usar `helmet` para cabeceras de seguridad y `@nestjs/throttler` para rate limiting es el estándar de la industria para NestJS y es una solución excelente. La configuración específica para el endpoint de login es un acierto.

*   **INCORRECTO:** La propuesta de `contentSecurityPolicy` en el checklist 6 es demasiado restrictiva para una aplicación Next.js, que a menudo necesita `'unsafe-eval'` en modo de desarrollo o scripts inline. La política propuesta (`scriptSrc: ["'self'"]`) probablemente romperá la aplicación.

*   **FALTANTE:**
    1.  **Invalidación de JWT:** El plan no aborda cómo invalidar un token activo (ej. al cambiar contraseña o cerrar sesión). El token sigue siendo válido hasta que expira. Se necesita una estrategia de blacklist (ej. en Redis) o el uso de refresh tokens con una vida útil del token de acceso muy corta.
    2.  **Protección CSRF:** Si se elige la estrategia de `httpOnly` cookies (ADR-002), es **mandatorio** implementar protección contra CSRF (ej. con el paquete `csurf` o una implementación manual de "double submit cookie").
    3.  **Pruebas de Seguridad:** No se mencionan pruebas de seguridad automatizadas (SAST/DAST) en el pipeline de QA.

*   **RECOMENDACIÓN:**
    1.  Modificar la `contentSecurityPolicy` para que sea compatible con Next.js, permitiendo los hashes de scripts que genera el framework o usando un `nonce`.
    2.  Añadir una decisión arquitectónica (ADR) para la "Estrategia de Invalidación de JWT" en `10_ADR_REGISTRO.md`.
    3.  Añadir una tarea en FASE 1 para implementar protección CSRF si se usan cookies.

---

## 3. VALIDACIÓN DE ARQUITECTURA (`10_ADR_REGISTRO.md`)

*   **CORRECTO:** La adopción del formato ADR es una excelente práctica. Las decisiones propuestas (Estrategia para `SourceHandler`, `user_id` en perfiles) son soluciones estándar y robustas para los problemas planteados. La separación de decisiones en documentos específicos (`ADR-XXX`) es clara y mantenible.

*   **INCORRECTO:** La dependencia de `FASE 4` sobre `FASE 3` en el diagrama de `00_MASTER_ORCHESTRATOR.md` es incorrecta, como bien señala `11_AUDIT_TECNICA.md`. El scraping es una actividad de backend que no depende de la UI o perfiles de usuario. Esto podría bloquear el desarrollo innecesariamente.

*   **FALTANTE:**
    1.  **ADR para Queues/Jobs:** El gap `AUT-02` indica la existencia de un módulo `queue/` no integrado. No hay un ADR que defina cómo se deben usar los trabajos en segundo plano (ej. para scraping, notificaciones), qué proveedor usar (BullMQ, RabbitMQ), y cuál es la estrategia de reintentos y manejo de fallos.
    2.  **ADR para Testing:** No hay un ADR que defina la estrategia de testing (unit, integration, e2e), las herramientas a usar (Jest, Cypress, Playwright), y los umbrales de cobertura de código.

*   **RECOMENDACIÓN:**
    1.  Corregir el diagrama de dependencias en `00_MASTER_ORCHESTRATOR.md` para que `FASE 4` solo dependa de `FASE 2`.
    2.  Crear nuevos ADRs para "Gestión de Trabajos en Segundo Plano" y "Estrategia de Pruebas" para formalizar estas áreas.

---

## 4. MODELO DE DATOS (`05_FASE_2_MODELO_DATOS.md`)

*   **CORRECTO:** La elección de `simple-array` para `sectors` y `beneficiaries` es un buen compromiso para el MVP, evitando la sobre-ingeniería de tablas de unión. La migración propuesta es reversible, lo cual es una práctica excelente. La creación de un índice en el campo `status` es una optimización de rendimiento necesaria.

*   **INCORRECTO:** La migración en `06_FASE_3_PERFIL_USUARIO.md` (`UP... UPDATE user_profiles SET user_id = (SELECT id FROM users LIMIT 1) WHERE id = 'default-profile'`) es peligrosa. Asigna el perfil global al "primer" usuario, que puede ser arbitrario dependiendo de la base de datos. Si no hay usuarios, el perfil queda huérfano.

*   **FALTANTE:**
    1.  **Tipos de datos:** No se especifica la longitud máxima para los `string[]` en `GrantEntity`. Esto podría llevar a entradas excesivamente largas. Se debe considerar una validación de longitud en el DTO.
    2.  **Relación con Scraper:** El modelo `GrantEntity` no tiene un campo para trazar qué `Source` y qué ejecución de scraping la creó. Esto dificulta la depuración y la trazabilidad (Gap `MDL-05` lo menciona pero no se refleja en el checklist de FASE 2).

*   **RECOMENDACIÓN:**
    1.  Replantear la migración del perfil. Una mejor estrategia sería crear perfiles por defecto para *todos* los usuarios existentes a través de un script, o manejar la creación del perfil de manera "lazy" en la lógica de la aplicación la primera vez que un usuario accede a su perfil.
    2.  Añadir `sourceId` (FK a `SourceEntity`) y `scrapeJobId` a `GrantEntity` para mejorar la trazabilidad de los datos.

---

## 5. INTEGRACIÓN

*   **CORRECTO:** El plan de fases está bien secuenciado en general, comenzando por el contrato (FASE 0) y la seguridad (FASE 1) antes de abordar la lógica de negocio. Las dependencias están mayormente bien identificadas.

*   **INCORRECTO:** Como se mencionó, la dependencia de FASE 4 en FASE 3 es incorrecta y debería eliminarse para permitir el trabajo en paralelo.

*   **FALTANTE:**
    1.  **Contrato de Servicio a Servicio:** La FASE 4 menciona la integración con un `data-service` de Python. No se define un contrato claro ni un token de autenticación (`X-Service-Token`) para esta comunicación, lo cual es un riesgo de seguridad y de integración.
    2.  **Integración de CI/CD:** La FASE 6 planea integrar pruebas, pero no se menciona cómo se integrarán las migraciones de base de datos o los despliegues en el pipeline de CI/CD.

*   **RECOMENDACIÓN:**
    1.  Añadir una tarea en FASE 0 para definir formalmente el contrato API entre `backend-core` y `data-service`, incluyendo autenticación.
    2.  Añadir tareas en FASE 6 para documentar e implementar la estrategia de "Continuous Deployment", incluyendo cómo se ejecutan las migraciones en los diferentes entornos (staging, production).

---

## Tareas Adicionales Propuestas y Asignación de MCP

| Fase | Tarea | Descripción | MCP Asignado | Razón |
| :--- | :--- | :--- | :--- | :--- |
| **FASE 1** | **Añadir Validación de DTOs** | Implementar `class-validator` y `class-sanitizer` en todos los DTOs de entrada para proteger contra datos maliciosos. | **Codex** | Tarea de implementación de código repetitiva y basada en patrones. |
| **FASE 1** | **Implementar Gestión de Secretos** | Refactorizar el código para usar `ConfigModule` de NestJS y asegurar que no haya secretos hardcodeados. | **Codex** | Refactorización de código siguiendo un patrón estándar. |
| **FASE 1** | **Definir Estrategia de Invalidación de JWT** | Crear un ADR para decidir entre blacklist (Redis) o refresh tokens para la invalidación de sesiones. | **Claude** | Requiere razonamiento arquitectónico y evaluación de trade-offs. |
| **FASE 1** | **Implementar Protección CSRF** | Si se usan cookies, añadir un middleware de CSRF. | **Codex** | Implementación de una librería de seguridad estándar. |
| **FASE 3** | **Revisar Script de Migración de Perfil** | Reescribir la migración para crear perfiles para todos los usuarios existentes en lugar de asignar el global a uno solo. | **Claude** | Requiere lógica compleja y pensar en casos borde (migración segura). |
| **FASE 4** | **Definir Contrato con Data-Service** | Crear un documento OpenAPI/Swagger para la comunicación entre `backend-core` y `data-service`, incluyendo el `X-Service-Token`. | **Gemini** | Generación de documentación y definición de contratos, bueno en formatos estructurados. |
| **FASE 6** | **Añadir Pruebas de Seguridad (SAST)** | Integrar una herramienta de análisis estático de seguridad como `Snyk` o `CodeQL` en el pipeline de CI. | **Gemini** | Puede generar la configuración YAML para el pipeline de CI/CD basándose en la documentación de la herramienta. |
