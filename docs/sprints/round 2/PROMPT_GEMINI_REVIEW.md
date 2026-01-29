# PROMPT PARA REVISIÓN GEMINI

Copia y pega este prompt en Gemini junto con los archivos relevantes.

---

## PROMPT

```
Eres un arquitecto de software senior especializado en seguridad y revisión de código. Tu tarea es auditar un plan de desarrollo para identificar errores, omisiones y mejoras.

CONTEXTO:
- Proyecto: GRANTER 2.0 (plataforma de descubrimiento de subvenciones)
- Stack: NestJS (backend), Next.js (frontend), PostgreSQL, Python (data-service)
- Estado: MVP funcional con gaps de seguridad y funcionalidad

ARCHIVOS A REVISAR:
1. Los documentos de plan en docs/sprints/round 2/ (00 a 11)
2. El código actual del backend en apps/backend-core/src/
3. El código del frontend en apps/web-frontend/src/

TU TAREA:
Revisa los documentos de planificación y el código actual para responder:

1. VALIDACIÓN DE GAPS
   - ¿Los gaps identificados son reales? Verifica contra el código.
   - ¿Hay gaps críticos que no se hayan identificado?
   - ¿Algún gap está mal clasificado en severidad?

2. REVISIÓN DE SEGURIDAD
   - ¿Las propuestas de seguridad (FASE 1) son suficientes?
   - ¿Hay vulnerabilidades no mencionadas?
   - ¿La configuración de JWT es correcta?
   - ¿Faltan controles de seguridad críticos?

3. VALIDACIÓN DE ARQUITECTURA
   - ¿Las decisiones arquitectónicas propuestas (ADRs) son correctas?
   - ¿Hay alternativas mejores no consideradas?
   - ¿El orden de fases es óptimo?

4. MODELO DE DATOS
   - ¿Los campos propuestos para GrantEntity son correctos?
   - ¿Los tipos de datos elegidos son apropiados?
   - ¿Las migraciones propuestas son seguras y reversibles?

5. INTEGRACIÓN
   - ¿Las dependencias entre fases son correctas?
   - ¿Hay conflictos potenciales entre cambios?

FORMATO DE RESPUESTA:
Para cada sección, responde con:
- CORRECTO: [lo que está bien]
- INCORRECTO: [lo que necesita corrección]
- FALTANTE: [lo que debería añadirse]
- RECOMENDACIÓN: [mejoras sugeridas]

Sé específico. Incluye nombres de archivo y números de línea cuando sea relevante.
No propongas tareas específicas - solo valida el plan existente e identifica problemas.
```

---

## ARCHIVOS A ADJUNTAR

Adjunta estos archivos a Gemini:

**Documentos de plan:**
- `docs/sprints/round 2/01_ANALISIS_FALTANTES.md`
- `docs/sprints/round 2/10_ADR_REGISTRO.md`
- `docs/sprints/round 2/04_FASE_1_SEGURIDAD.md`
- `docs/sprints/round 2/05_FASE_2_MODELO_DATOS.md`
- `docs/sprints/round 2/06_FASE_3_PERFIL_USUARIO.md`

**Código crítico:**
- `apps/backend-core/src/main.ts`
- `apps/backend-core/src/auth/auth.service.ts`
- `apps/backend-core/src/auth/auth.module.ts`
- `apps/backend-core/src/auth/strategies/jwt.strategy.ts`
- `apps/backend-core/src/database/entities/grant.entity.ts`
- `apps/backend-core/src/database/entities/user-profile.entity.ts`
- `apps/backend-core/src/search/search.service.ts`
- `apps/backend-core/src/profile/profile.service.ts`

---

## COMANDO RÁPIDO

Para extraer los archivos en un solo bloque:

```bash
cd "/home/akenator/PROYECTOS/GRANTER 2.0"

echo "=== DOCUMENTOS DE PLAN ===" && \
cat docs/sprints/round\ 2/01_ANALISIS_FALTANTES.md && \
echo -e "\n\n=== ADR ===" && \
cat docs/sprints/round\ 2/10_ADR_REGISTRO.md && \
echo -e "\n\n=== FASE 1 SEGURIDAD ===" && \
cat docs/sprints/round\ 2/04_FASE_1_SEGURIDAD.md && \
echo -e "\n\n=== CÓDIGO: main.ts ===" && \
cat apps/backend-core/src/main.ts && \
echo -e "\n\n=== CÓDIGO: auth.service.ts ===" && \
cat apps/backend-core/src/auth/auth.service.ts && \
echo -e "\n\n=== CÓDIGO: auth.module.ts ===" && \
cat apps/backend-core/src/auth/auth.module.ts && \
echo -e "\n\n=== CÓDIGO: jwt.strategy.ts ===" && \
cat apps/backend-core/src/auth/strategies/jwt.strategy.ts && \
echo -e "\n\n=== CÓDIGO: grant.entity.ts ===" && \
cat apps/backend-core/src/database/entities/grant.entity.ts && \
echo -e "\n\n=== CÓDIGO: user-profile.entity.ts ===" && \
cat apps/backend-core/src/database/entities/user-profile.entity.ts && \
echo -e "\n\n=== CÓDIGO: search.service.ts ===" && \
cat apps/backend-core/src/search/search.service.ts && \
echo -e "\n\n=== CÓDIGO: profile.service.ts ===" && \
cat apps/backend-core/src/profile/profile.service.ts
```

Copia la salida y pégala junto con el prompt en Gemini.

---
