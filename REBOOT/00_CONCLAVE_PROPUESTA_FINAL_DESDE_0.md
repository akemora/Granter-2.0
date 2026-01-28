# 🏛️ CONCLAVE: PROPUESTA FINAL DESDE 0 - GRANTER V2

**Consolidación de Arquitectura, Seguridad, Testing, Frontend y Roadmap** | v1.0 | 2026-01-27

---

## 📊 EJECUTIVO

| Aspecto | Valor |
|---------|-------|
| **Status** | Propuesta consolidada para implementación |
| **Duración** | 4 semanas (2 devs senior full-time) |
| **MVP Ready** | Semana 2 (Search + Grants CRUD) |
| **Production Ready** | Semana 4 (Security + Testing + Hardening) |
| **Enfoque** | Security-First + Test-Driven Development |
| **Stack** | Next.js 16 + NestJS 11 + FastAPI + PostgreSQL + Redis |
| **Coverage Target** | >70% (todos los servicios desde Sprint 1) |
| **Go-Live Gates** | 12 validaciones críticas (P0/P1) |
| **Riesgo de NO implementar** | CRÍTICO (auth fallos, seguridad, testing<5%) |

---

## 🎯 VISIÓN CONSOLIDADA

### Lecciones Aprendidas de GRANTER v1

```
❌ GRANTER V1 PROBLEMAS:
  1. JWT con fallback inseguro → 'secret_key_default'
  2. Auth inter-servicio NO existe → inyección masiva de datos
  3. Testing <5% → Bugs en producción
  4. IA sin fallback → Producto inútil sin API key
  5. Secretos en repo → Breach potencial
  6. No se respetan límites de código
  7. Deuda técnica acumulada desde día 1

✅ GRANTER V2 SOLUCIÓN:
  ✓ JWT FAIL SECURE (sin fallback, throw if missing)
  ✓ X-Service-Token obligatorio (inter-servicio auth)
  ✓ Testing-first desde Sprint 0 (>70% coverage)
  ✓ IA con fallback explícito (error o heurística)
  ✓ Secrets management desde inicio (.env.example, rotate)
  ✓ Arquitectura enforced (400-línea files, 30-línea functions)
  ✓ Security-first en cada decision
```

---

## 🏗️ ARQUITECTURA CONSOLIDADA

### Stack Elegido

```
FRONTEND:
  ├─ Next.js 16 (App Router, SSR/CSR)
  ├─ React 19 (Concurrent features)
  ├─ TypeScript (strict mode)
  ├─ Tailwind CSS (utility-first, design tokens)
  └─ React Testing Library (component tests)

BACKEND CORE:
  ├─ NestJS 11 (modular, DI, built-in validation)
  ├─ TypeORM (ORM with migrations)
  ├─ PostgreSQL 15 (SQL, ACID transactions)
  ├─ Jest (unit + E2E tests)
  └─ JWT (no fallback, FAIL SECURE)

DATA SERVICE:
  ├─ FastAPI (async, Pydantic)
  ├─ Python 3.11 (type hints required)
  ├─ Playwright (web scraping)
  ├─ Gemini AI (extraction, with fallback)
  └─ pytest (unit + integration)

INFRASTRUCTURE:
  ├─ Docker Compose (local dev)
  ├─ Docker (production containers)
  ├─ GitHub Actions (CI/CD bloqueante)
  ├─ PostgreSQL 15
  ├─ Redis 7 (caching, BullMQ queue)
  └─ Turbo (monorepo orchestration)
```

### Estructura Monorepo

```
GRANTER/
├── apps/backend-core/           # NestJS + Auth + Business Logic
├── apps/web-frontend/           # Next.js + React 19 + Tailwind
├── apps/data-service/           # FastAPI + Python
├── packages/shared/             # Shared TypeScript types
├── docker-compose.yml           # Local orchestration
├── .github/workflows/           # CI/CD pipeline
├── AGENTS_CUSTOMIZADO_GRANTER.md # ← Read this FIRST (agent instructions)
├── CONVENTIONS.md               # Python PEP 8 strict
├── CONVENTIONS_FRONTEND.md      # CSS + a11y standards
└── Documentation:
    ├── PROPUESTA_ARQUITECTURA_DESDE_0.md
    ├── PROPUESTA_SEGURIDAD_DESDE_0.md
    ├── PROPUESTA_TESTING_DESDE_0.md
    ├── PROPUESTA_FRONTEND_DESDE_0.md
    ├── ROADMAP_DESARROLLO_DESDE_0.md
    └── 00_CONCLAVE_PROPUESTA_FINAL_DESDE_0.md ← THIS FILE
```

---

## 🔐 SEGURIDAD: 4 PILARES

### P0-1: JWT sin Fallback (FAIL SECURE)

```typescript
// ✅ CORRECTO
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get('JWT_SECRET');

    // ❌ FAIL SECURE: If missing, throw error
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be >= 32 characters');
    }

    super({
      jwtFromRequest: extractJwtFromHeader(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: any) {
    if (!payload.sub || !payload.email || !payload.exp) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    return { id: payload.sub, email: payload.email };
  }
}

// ❌ INCORRECTO (v1 pattern)
super({
  secretOrKey: configService.get('JWT_SECRET') || 'secret_key_default', // FALLBACK! ❌
});
```

### P0-2: Auth Inter-Servicio (X-Service-Token)

```typescript
// ✅ Data-Service → Backend-Core
// Header: X-Service-Token: <secret>
// Guard validates with constant-time comparison

@Injectable()
export class XServiceTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.get('X-Service-Token');
    const expectedToken = this.configService.get('SERVICE_TOKEN');

    // ✅ Constant-time comparison (prevent timing attacks)
    return timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  }
}

// Uso:
@Controller('grants')
export class GrantsController {
  @Post()
  @UseGuards(XServiceTokenGuard)  // Protected by inter-service token
  async create(@Body() dto: CreateGrantDTO) {
    // Only data-service can call this
  }
}
```

### P0-3: Input Validation (Class Validators)

```typescript
// ✅ DTOs with decorators (class-validator)
export class CreateGrantDTO {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsISO8601()
  deadline: string;

  @IsEnum(['ES', 'EU', 'INT'])
  region: string;
}

// Global ValidationPipe with whitelist
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,               // Remove unknown properties
    forbidNonWhitelisted: true,    // Throw error if unknown
    transform: true,                // Transform to DTO class
    transformOptions: { enableImplicitConversion: true },
  })
);
```

### P0-4: IA Service with Fallback

```python
# ✅ FastAPI + Gemini with explicit fallback
async def extract_grant(html: str) -> dict:
    """Extract grant data from HTML using Gemini."""
    api_key = os.getenv('GEMINI_API_KEY')

    # FAIL SECURE: If API key missing, raise error
    if not api_key:
        raise ValueError('GEMINI_API_KEY not configured')

    try:
        # Try Gemini extraction
        result = await call_gemini_api(html, api_key)
        return result
    except asyncio.TimeoutError:
        # Fallback 1: Heuristic extraction
        return extract_heuristic(html)
    except Exception as e:
        # Fallback 2: Explicit error (never return [] silently)
        logger.error(f'Extraction failed: {e}')
        raise HTTPException(status_code=500, detail='Extraction unavailable')
```

---

## 🧪 TESTING: PYRAMID + TDD

### Testing Pyramid

```
         /\
        /E2E\        5% - Manual flows (Playwright)
       /     \       ~5 tests, <1h total
      /       \
     /Integration\ 15% - Multiple modules + DB
    /           \  ~20 tests, ~2h total
   /             \
  /  Unit Tests   \ 80% - Single functions
 /                 \(100+ tests, <5min total)
/__________________\

Inversión de Tiempo:
- Unit: 50% (rápidos, coverage 80%)
- Integration: 30% (medianos, coverage 15%)
- E2E: 20% (lentos, coverage 5%)
```

### TDD Workflow

```
1️⃣ RED: Escribe test fallando
   describe('GrantService', () => {
     it('debe crear grant con validación', () => {
       const result = service.create(validDTO);
       expect(result.id).toBeDefined();
     });
   });

2️⃣ GREEN: Implementa mínimo código
   async create(dto: CreateGrantDTO): Promise<Grant> {
     return this.repository.save(dto);
   }

3️⃣ REFACTOR: Mejora sin romper tests
   async create(dto: CreateGrantDTO): Promise<Grant> {
     this.validate(dto);
     const grant = new Grant(dto);
     return this.repository.save(grant);
   }
```

### Coverage Targets

```
CRÍTICO (100% coverage):
  ✅ auth.service.ts (JWT generation/verification)
  ✅ jwt.guard.ts (JWT validation)
  ✅ validation.pipe.ts (DTO validation)
  ✅ x-service-token.guard.ts (inter-service auth)

IMPORTANTE (>80% coverage):
  ✅ grants.service.ts
  ✅ sources.service.ts
  ✅ LoginForm.tsx, SearchPage.tsx

REGULAR (>70% coverage):
  ✅ Todos los demás módulos

Medición en CI:
  npm run test:cov    # Backend
  npm test:coverage   # Frontend
  pytest --cov        # Data service
```

---

## 🎨 FRONTEND: DESIGN TOKENS + A11Y

### Arquitectura Tailwind + Design Tokens

```javascript
// tailwind.config.js - SINGLE SOURCE OF TRUTH

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { 50: '#F0F9FF', ..., 900: '#0C3B66' },
        secondary: { 50: '#F0FDF4', ..., 900: '#145231' },
        danger: '#EF4444',
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px'
      },
      // fonts, shadows, radius, etc.
    }
  }
};

// ❌ NUNCA ESTO:
<div style={{ padding: '16px', backgroundColor: '#3B82F6' }}>
  {/* CSS inline = PROHIBIDO */}
</div>

// ✅ SIEMPRE ESTO:
<div className="p-md bg-primary-500 rounded-lg">
  {/* Utilities + Design tokens */}
</div>
```

### Atomic Design

```
Atoms (primitivos):
  └─ Button, Input, Label, Badge, Icon

Molecules (combinations):
  └─ FormField (Label + Input + Error)
  └─ SearchBox (Input + Icon + Button)
  └─ Card

Organisms (page-level):
  └─ LoginForm (multiple molecules)
  └─ GrantsList
  └─ SearchPage

Layouts:
  └─ AuthLayout, AppLayout
```

### Accesibilidad (WCAG 2.1 AA)

```
✅ HTML Semántico:
  <header>, <nav>, <main>, <article>, <aside>, <footer>
  (No solo <div>)

✅ ARIA Attributes:
  <button aria-label="Close modal" onClick={onClose}>✕</button>
  <div role="dialog" aria-modal="true" aria-labelledby="title">

✅ Form Labels:
  <label htmlFor="email">Email:</label>
  <input id="email" type="email" required />

✅ Image Alt Text:
  <img src="logo.png" alt="Company logo" />

✅ Focus Management:
  <input style={{ outline: '2px solid #0EA5E9' }} />

Testeo:
  npm run test -- --coverage
  Axe accessibility scanner
```

---

## 📅 ROADMAP: 4 SEMANAS

### Sprint 0: Setup & Boilerplate (3 días)

```
Lunes-Miércoles (24 horas)

Deliverables:
  ✅ Monorepo setup (turbo)
  ✅ 5 servicios en Docker Compose
  ✅ CI/CD pipeline (GitHub Actions)
  ✅ Database schema + migrations
  ✅ Boilerplate tests (empty, ready to fill)
  ✅ Design tokens en tailwind.config.js

Success Criteria:
  ✅ docker compose up -d && all healthy
  ✅ npm run dev works
  ✅ CI/CD green
  ✅ All boilerplate tests pass
```

### Sprint 1: MVP Auth & Security (40 horas)

```
Lunes-Viernes (40 horas)

Lunes-Martes:
  ├─ JWT (FAIL SECURE) - 3h
  ├─ Password bcrypt + validation - 2h
  ├─ Register/Login endpoints - 2h
  └─ Tests (100% coverage) - 1h

Miércoles:
  ├─ X-Service-Token guard - 2h
  ├─ DTOs + class validators - 2h
  ├─ ValidationPipe global - 1h
  └─ Tests - 1h

Jueves:
  ├─ Database constraints - 2h
  ├─ Audit tables - 1h
  ├─ LoginForm component + tests - 2h
  └─ E2E flow tests - 1h

Viernes:
  ├─ QA + debugging - 3h
  ├─ Coverage validation - 1h
  └─ Merge to develop - 1h

Deliverables:
  ✅ Registration & login working E2E
  ✅ JWT without fallback
  ✅ X-Service-Token functional
  ✅ Class validators + ValidationPipe
  ✅ Backend & frontend >70% coverage
  ✅ All P0 security tests passing

Release Gate: ✅ P0-1, P0-2
```

### Sprint 2: MVP Features (32 horas)

```
Lunes-Viernes (32 horas)

Lunes-Martes:
  ├─ Grants CRUD (create, read, update, delete) - 3h
  ├─ Search + filters - 2h
  ├─ Database indices - 1h
  └─ Tests - 2h

Miércoles:
  ├─ IA Service + fallback - 2h
  ├─ Retries + exponential backoff - 2h
  ├─ Frontend components (search, list, detail) - 2h
  └─ Tests - 1h

Jueves:
  ├─ Sources CRUD - 1h
  ├─ Pagination - 1h
  ├─ Performance optimization - 1h
  ├─ E2E tests - 2h
  └─ Tests - 1h

Viernes:
  ├─ Coverage validation - 1h
  ├─ Code review - 1h
  ├─ Final QA - 1h
  └─ Merge - 1h

Deliverables:
  ✅ Grants CRUD working
  ✅ Search + filters functional
  ✅ IA Service with fallback
  ✅ Retries + exponential backoff
  ✅ All services >70% coverage

Release Gate: ✅ P0-3, P0-4, P1-1 to P1-4
```

### Sprint 3: Data & Integration (24 horas)

```
Lunes-Jueves (24 horas)

Lunes-Martes:
  ├─ SmartScraper + GenericScraper - 2h
  ├─ Discovery engine - 2h
  ├─ Sources management - 1h
  └─ Tests - 1h

Miércoles-Jueves:
  ├─ Performance optimization - 2h
  ├─ Structured logging (Pino) - 1h
  ├─ Health checks - 1h
  ├─ Monitoring setup - 1h
  ├─ E2E tests - 1h
  └─ Documentation - 1h

Deliverables:
  ✅ Scraper integration working
  ✅ Sources + discovery functional
  ✅ Performance baseline
  ✅ Health checks + monitoring

Release Gate: ✅ P1-5 to P1-8
```

### Sprint 4: Hardening & Go-Live (20 horas)

```
Lunes-Jueves (20 horas)

Lunes-Martes:
  ├─ Security audit - 3h
  ├─ Penetration testing - 2h
  ├─ Code scanning (npm audit, snyk) - 1h
  └─ Load testing - 2h

Miércoles-Jueves:
  ├─ Release gates validation - 2h
  ├─ Manual testing checklist - 2h
  ├─ Deployment runbook - 1h
  ├─ Monitoring setup - 1h
  └─ Knowledge transfer - 1h

Viernes: GO-LIVE!
  ├─ Pre-deployment checks - 1h
  ├─ Deploy to production - 1.5h
  ├─ Smoke tests - 0.5h
  ├─ Monitor (24/7) - ongoing
  └─ Celebrate! 🎉

Deliverables:
  ✅ All security checks passed
  ✅ All release gates validated
  ✅ Production deployment successful
```

---

## 📋 RELEASE GATES (12 Validaciones)

### MUST PASS para Go-Live

```
P0 - CRITICAL (BLOQUEANTE):
  ✅ P0-1: JWT without fallback (FAIL SECURE)
  ✅ P0-2: Auth inter-service (X-Service-Token)
  ✅ P0-3: Tests >70% coverage (all services)
  ✅ P0-4: IA with explicit fallback

P1 - IMPORTANT (BLOQUEANTE):
  ✅ P1-1: DTOs + class validators
  ✅ P1-2: ValidationPipe whitelist: true
  ✅ P1-3: Timeouts on all requests (10s max)
  ✅ P1-4: Retries + exponential backoff
  ✅ P1-5: /scrape protected with auth
  ✅ P1-6: Database indices created
  ✅ P1-7: CI/CD bloqueante (no overrides)
  ✅ P1-8: Paginación (max 100 items)

Si alguno FALLA:
  ❌ NO ir a producción
  ❌ Riesgo crítico de breach/crash
```

---

## 📊 TRANSFORMACIÓN ESPERADA

### Antes (GRANTER v1) vs Después (GRANTER v2)

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Security** | 4/10 | 8.5/10 | +112% |
| **Testing** | 3/10 | 8/10 | +167% |
| **Performance** | 6/10 | 8/10 | +33% |
| **Código** | 5/10 | 8.5/10 | +70% |
| **Operación** | 4/10 | 7.5/10 | +87% |
| **PROMEDIO** | **5.2/10** | **8.1/10** | **+55%** |

### Veredicto

```
ANTES:  ❌ NO APTO PRODUCCIÓN
        (Críticos: auth fallido, testing ausente, deuda técnica)

DESPUÉS: ✅ APTO PRODUCCIÓN BETA LIMITADA
        (Security + Testing + Observability)

Próxima Semana: Monitoreo 24/7 + hardening post-go-live
```

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| IA API key missing | Media | Crítica | Fallback heurístico, test sin key |
| DB migration fails | Baja | Crítica | Test rollbacks, backup strategy |
| Performance issues | Media | Alta | Load test en Sprint 3, índices |
| Security audit fails | Media | Crítica | Daily reviews, pen testing |
| Team burnout | Baja | Media | Realistic estimates, day off |

---

## ✅ PRÓXIMOS PASOS

### TODAY (2026-01-27)

```
1. Team meeting (30 min)
   ├─ Review this document
   ├─ Confirm 2 devs dedicated (no context switching)
   ├─ Confirm target go-live date (Semana 4)
   └─ Clarify any blockers

2. Setup inicial (2-4 horas)
   ├─ Create GitHub repo (granter-v2)
   ├─ Setup issues for Sprint 0
   ├─ Setup CI/CD pipeline (template)
   ├─ Create Slack channel #granter-development
   └─ Distribute AGENTS.md + CONVENTIONS.md

3. Daily standups (Lunes-Viernes 10:00)
   ├─ What got done
   ├─ What's blocking
   ├─ Help needed
   └─ Max 15 min
```

### WEEK 1-4

```
Sprint 0 (3 días): Setup
Sprint 1 (5 días): Auth + Security + Testing
Sprint 2 (5 días): Features + Integration
Sprint 3 (4 días): Data + Performance
Sprint 4 (4 días): Hardening + Go-Live

Gate Review (Viernes Semana 2):
  ├─ All P0 gates passing?
  ├─ Coverage > 70%?
  ├─ Decision: Proceed to Sprints 3-4?

GO-LIVE (Viernes Semana 4):
  ├─ All P0/P1 gates passing?
  ├─ Monitoring setup?
  ├─ Team trained on runbook?
  └─ Deploy to production!

Post-Launch (Semana 5+):
  ├─ 24/7 monitoring
  ├─ Incident response plan
  ├─ User feedback collection
  └─ Hardening based on issues found
```

---

## 📚 DOCUMENTACIÓN GENERADA

```
Leer en este orden:

1. AGENTS_CUSTOMIZADO_GRANTER.md         (Agent instructions - READ FIRST)
2. CONVENTIONS.md                         (Python standard)
3. CONVENTIONS_FRONTEND.md               (CSS + a11y standard)
4. PROPUESTA_ARQUITECTURA_DESDE_0.md    (Architecture overview)
5. PROPUESTA_SEGURIDAD_DESDE_0.md       (Security implementation)
6. PROPUESTA_TESTING_DESDE_0.md         (Testing strategy)
7. PROPUESTA_FRONTEND_DESDE_0.md        (Frontend architecture)
8. ROADMAP_DESARROLLO_DESDE_0.md        (Sprint breakdown)
9. 00_CONCLAVE_PROPUESTA_FINAL_DESDE_0.md (THIS FILE - Consolidation)
```

---

## 🎓 Conclusión

```
GRANTER v2 NO es un refactor de v1.
GRANTER v2 es un REBUILD desde 0 que evita TODOS los errores de v1.

Principios fundamentales:
  ✅ Security-First (JWT FAIL SECURE, auth inter-servicio)
  ✅ Test-Driven Development (>70% coverage desde Sprint 1)
  ✅ Design Tokens Centralizados (no CSS inline)
  ✅ Arquitectura Enforced (400 líneas, 30 líneas funciones)
  ✅ DDD Bounded Contexts (modular, escalable)
  ✅ CI/CD Bloqueante (no bad code merges)

Si se sigue esta propuesta al pie de la letra:
  ✅ Go-live viable en 4 semanas
  ✅ 8.1/10 score (vs. 5.2/10 de v1)
  ✅ Security + Testing + Performance sólidos
  ✅ Deuda técnica CERO

Si se corta scope o se ignoran gates:
  ❌ Riesgo crítico de breach
  ❌ Bugs en producción
  ❌ Reputación dañada

La decisión es del equipo. Pero esta propuesta es la forma CORRECTA de hacerlo.
```

---

**Última actualización:** 2026-01-27 13:00
**Versión:** 1.0 FINAL
**Status:** LISTO PARA IMPLEMENTACIÓN
**Confianza:** ALTA (basado en análisis de 3 MCPs independientes + best practices)

---

**Para comenzar:** Lee `AGENTS_CUSTOMIZADO_GRANTER.md` ahora.

**¿Preguntas?** Slack > #granter-development o Escalate a Lead Arquitecto.

**¿Aprobación?** Contacta a Product Owner para green-light en Sprint 0.

---

🚀 **Vamos a construir GRANTER v2 de forma CORRECTA.**
