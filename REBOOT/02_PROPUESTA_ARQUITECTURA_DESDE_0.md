# 🏗️ PROPUESTA: ARQUITECTURA GRANTER DESDE 0
**Desarrollo Seguro, Testeable y Escalable** | 2026-01-27

---

## 📋 TABLA DE CONTENIDOS

1. Principios Arquitectónicos
2. Stack Tecnológico Óptimo
3. Estructura de Monorepo
4. Domain-Driven Design (Bounded Contexts)
5. Límites Arquitectónicos
6. Seguridad desde el Diseño
7. Testing Pyramid desde Sprint 1
8. Checklist de Implementación

---

## 1. PRINCIPIOS ARQUITECTÓNICOS (DESDE 0)

### ❌ ERRORES DE GRANTER A EVITAR

```
GRANTER actual:
- Sin modulación clara → Servicios acoplados
- Sin testing desde inicio → Frontend <5% coverage
- Auth frágil → JWT fallback inseguro
- Sin validación → DTOs como tipos, no clases
- Monolítico → Difícil de mantener y escalar
```

### ✅ PRINCIPIOS PROPUESTOS

| Principio | Descripción | Beneficio |
|-----------|-------------|----------|
| **Modularidad** | DDD + Bounded Contexts | Escalable, mantenible |
| **Security-First** | Auth segura desde arquitectura | 0 breaches, JWT sin fallbacks |
| **Testing-First** | TDD desde Sprint 1 | 70%+ coverage siempre |
| **Automation** | CI/CD bloqueante, linters enforced | Calidad garantizada |
| **Observability** | Logs + métricas desde inicio | Debugging fácil, SLA medible |

---

## 2. STACK TECNOLÓGICO ÓPTIMO

### Backend (NestJS + Python)

```yaml
API Principal (TypeScript/NestJS):
  - NestJS 11+ (modular, DDD-friendly)
  - TypeORM 0.3+ (ORM con migrations)
  - PostgreSQL 15+ (BD robusta)
  - Redis 7+ (caching, queues)
  - Class Validator (DTO validation)
  - Passport.js (auth estrategias)

Data Service (Python):
  - FastAPI 0.130+ (async, auto-docs)
  - Pydantic V2 (validation, serialization)
  - SQLAlchemy 2.0+ (ORM Python)
  - Playwright (scraping con browser)
  - Gemini 2.0 Flash (IA extraction)

Herramientas Calidad:
  - ruff (linting Python, 100-char limit)
  - black (formatter Python)
  - mypy (type checking, --strict)
  - pytest (testing Python)

CI/CD:
  - GitHub Actions bloqueante
  - Docker multi-stage
  - Terraform/Helm para infra
```

### Frontend (Next.js + React)

```yaml
Framework:
  - Next.js 16+ (App Router)
  - React 19+ (hooks, suspense)
  - TypeScript strict
  - Tailwind CSS 4 (utility-first)

Componentes:
  - Radix UI (accesibilidad built-in)
  - Atomic Design (atoms → molecules → organisms)

Testing:
  - Vitest (unit tests)
  - Testing Library (component tests)
  - Playwright (E2E tests)

Quality:
  - ESLint + TypeScript strict
  - Prettier (formatter JS)
  - PostCSS con design tokens

Accesibilidad:
  - WCAG 2.1 AA compliance
  - Axe DevTools en CI
```

---

## 3. ESTRUCTURA DE MONOREPO

### Árbol Completo

```
/granter-v2
├── /packages
│   └── /shared
│       ├── /types (interfaces TypeScript compartidas)
│       ├── /constants
│       └── /utils

├── /apps
│   ├── /backend
│   │   ├── /src
│   │   │   ├── /shared (cross-cutting)
│   │   │   ├── /auth (Bounded Context)
│   │   │   │   ├── /domain
│   │   │   │   ├── /application
│   │   │   │   ├── /infrastructure
│   │   │   │   └── /interfaces
│   │   │   ├── /grants (Bounded Context)
│   │   │   ├── /sources (Bounded Context)
│   │   │   └── /discovery (Bounded Context)
│   │   ├── /test
│   │   │   ├── /unit
│   │   │   ├── /integration
│   │   │   └── /e2e
│   │   ├── pyproject.toml
│   │   ├── Dockerfile
│   │   └── README.md

│   ├── /data-service
│   │   ├── /src
│   │   │   ├── /scrapers (Playwright)
│   │   │   ├── /extractors (IA + heurístico)
│   │   │   ├── /normalizers (deduplicación)
│   │   │   ├── /queue (BullMQ worker)
│   │   │   └── /services (API client, logging)
│   │   ├── /tests
│   │   ├── pyproject.toml
│   │   ├── Dockerfile
│   │   └── README.md

│   └── /frontend
│       ├── /src
│       │   ├── /app (Next.js routes)
│       │   ├── /components
│       │   │   ├── /atoms (Button, Input, etc)
│       │   │   ├── /molecules (SearchBox, Card, etc)
│       │   │   └── /organisms (Header, Layout, etc)
│       │   ├── /hooks (custom React hooks)
│       │   ├── /services (API calls)
│       │   ├── /styles
│       │   │   ├── /tokens (colors, spacing, typography)
│       │   │   ├── /globals.css
│       │   │   └── /components (CSS modules)
│       │   └── /utils
│       ├── /__tests__
│       │   ├── /unit
│       │   ├── /integration
│       │   └── /e2e
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── README.md

├── /infrastructure
│   ├── /docker
│   │   └── docker-compose.yml
│   ├── /k8s (opcional, para deploy)
│   └── /terraform (opcional, IaC)

├── /.github
│   └── /workflows
│       ├── ci.yml (lint, test, build - bloqueante)
│       ├── security.yml (secrets scan, audit)
│       └── deploy.yml (manual o automático)

├── /docs
│   ├── /adr (Architecture Decision Records)
│   │   ├── 001_auth_strategy.md
│   │   ├── 002_modular_structure.md
│   │   └── ...
│   ├── /api (OpenAPI specs generadas)
│   ├── /design (Design System)
│   └── /deployment

├── AGENTS.md (protocolo IA-assisted development)
├── CONVENTIONS.md (estándares Python)
├── CONVENTIONS_FRONTEND.md (estándares CSS/JS)
├── turbo.json (monorepo config)
├── package.json (root)
└── README.md
```

---

## 4. DOMAIN-DRIVEN DESIGN (Bounded Contexts)

### Contextos Identificados

```
┌─────────────────────────────────────────────────┐
│              GRANTER DOMAIN MODEL                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  AUTH CONTEXT    │  │  USER CONTEXT    │   │
│  ├──────────────────┤  ├──────────────────┤   │
│  │ • Users          │  │ • Profiles       │   │
│  │ • Sessions       │  │ • Preferences    │   │
│  │ • Permissions    │  │ • Notifications  │   │
│  └──────────────────┘  └──────────────────┘   │
│           │ publishes                 │       │
│           │ UserAuthenticated         │       │
│           └────────────────────────────┘       │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │ GRANT CONTEXT    │  │ SOURCE CONTEXT   │   │
│  ├──────────────────┤  ├──────────────────┤   │
│  │ • Grants         │  │ • Sources        │   │
│  │ • Search         │  │ • Health         │   │
│  │ • Filtering      │  │ • Scheduling     │   │
│  └──────────────────┘  └──────────────────┘   │
│           ▲                     ▲              │
│           │ subscribes          │              │
│           └─────────────────────┘              │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │DISCOVERY CONTEXT │  │ SCRAPER CONTEXT  │   │
│  ├──────────────────┤  ├──────────────────┤   │
│  │ • Discovery      │  │ • Scraping       │   │
│  │ • Validation     │  │ • Extraction     │   │
│  │ • Ranking        │  │ • Normalization  │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Contextos Detallados

**1. AUTH CONTEXT** (Backend)
```
Entidades:
  - User: email, hashedPassword, roles
  - Session: token, expiresAt, refreshToken
  - Permission: resource, action

Invariantes:
  - JWT debe tener issuer y audience válido
  - Password > 12 chars, salt + hash seguro
  - Token debe expirar y rotarse
  - No fallbacks inseguros
```

**2. GRANT CONTEXT** (Backend + DB)
```
Entidades:
  - Grant: title, description, amount, deadline, source
  - GrantFingerprint: hash para deduplicación
  - GrantSearch: índices para búsqueda rápida

Invariantes:
  - amount > 0 y UNIQUE(source, officialLink)
  - deadline > hoy
  - Nunca duplicados (fingerprint validation)
```

**3. SOURCE CONTEXT** (Backend)
```
Entidades:
  - Source: name, baseUrl, type, isActive
  - ScrapeRun: audit trail de cada ejecución
  - SourceStatus: health, lastSuccess, failureCount

Invariantes:
  - baseUrl UNIQUE y válida
  - lastSuccess <= ahora
  - failureCount auto-trigger de disable
```

**4. SCRAPER CONTEXT** (Data Service)
```
Entidades:
  - ScraperJob: source, status, result
  - ExtractedGrant: raw HTML → structured data
  - NormalizedGrant: deduplicated, validated

Invariantes:
  - Job debe tener timeout
  - Extraction debe tener fallback
  - Normalization debe detectar duplicados
```

---

## 5. LÍMITES ARQUITECTÓNICOS

### Tamaños Máximos (Anti-Spaghetti Code)

| Elemento | Límite | Razón |
|----------|--------|-------|
| **Archivo** | 400 líneas | Procesable por IA, mantenible |
| **Función** | 30 líneas | Testeable, comprensible |
| **Clase** | 300 líneas | SRP claro |
| **Método** | 20 líneas | Propósito único |
| **Indentación** | 3 niveles | Evita nesting profundo |

### Modularidad Enforced

```typescript
// ❌ MAL: Archivo > 400 líneas
// src/grants.service.ts (800 líneas)

// ✅ BIEN: Dividido en módulos
src/grants/
├── grants.service.ts (200 líneas)
├── grants.repository.ts (150 líneas)
├── grants.validator.ts (100 líneas)
└── grants.controller.ts (180 líneas)
```

---

## 6. SEGURIDAD DESDE EL DISEÑO

### Auth Strategy (DESDE 0)

```typescript
// ✅ JWT Seguro (SIN fallback)
export class AuthModule {
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET invalid');  // FAIL SECURE
        }
        return {
          secret,
          signOptions: {
            expiresIn: '1d',
            algorithm: 'HS256',
            issuer: 'granter-api',
            audience: 'granter-web'
          }
        };
      }
    })
  ]
}

// ✅ Inter-Service Auth (X-Service-Token)
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-service-token'];

    if (!token || !this.validateToken(token)) {
      throw new UnauthorizedException('Invalid service token');
    }
    return true;
  }
}

// ✅ Validación de DTOs (Class + Validator)
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)  // Minimum password strength
  password!: string;
}

// ✅ Validación Global (en main.ts)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Rechaza campos extra
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true }
}));
```

### Secrets Management

```yaml
# ✅ .env.example (NUNCA .env en repo)
JWT_SECRET=<generate: openssl rand -base64 32>
DATABASE_URL=postgresql://user:pass@localhost/granter
GEMINI_API_KEY=<your-key>
DATA_SERVICE_TOKEN=<generate: openssl rand -hex 32>

# ✅ Docker/K8s: Usar secret managers
- AWS Secrets Manager
- HashiCorp Vault
- K8s Secrets (con RBAC)
```

---

## 7. TESTING PYRAMID DESDE SPRINT 1

### Estructura de Tests

```
     △
    △ △        E2E Tests (5%) - Playwright
   △   △       Integration Tests (15%) - Vitest + @testing-library
  △     △      Unit Tests (80%) - Vitest
 △       △
△━━━━━━━△

Coverage Target: 70%+ desde Sprint 1
```

### Ejemplo: Testing Grant Context

```typescript
// ✅ Unit Test (80%)
describe('GrantService', () => {
  it('should create grant with valid data', () => {
    const service = new GrantService(mockRepository);
    const dto = { title: 'Test', amount: 1000, deadline: '2026-12-31' };

    const result = service.create(dto);

    expect(result).toHaveProperty('id');
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Grant));
  });
});

// ✅ Integration Test (15%)
describe('Grant API Integration', () => {
  it('should create grant via POST /grants with auth', async () => {
    const response = await request(app.getHttpServer())
      .post('/grants')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Service-Token', serviceToken)
      .send({ title: 'Test', amount: 1000 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});

// ✅ E2E Test (5%)
describe('Grant E2E', () => {
  it('user should find grant via search', async () => {
    await browser.goto('http://localhost:3000');
    await page.fill('[aria-label="search"]', 'subsidio');
    await page.click('button[type="submit"]');

    await page.waitForSelector('[data-testid="grant-card"]');
    const grants = await page.$$('[data-testid="grant-card"]');

    expect(grants.length).toBeGreaterThan(0);
  });
});
```

---

## 8. CHECKLIST DE IMPLEMENTACIÓN

### Sprint 0 (Setup - 1 semana)
- [ ] Monorepo setup (Turbo)
- [ ] Backend scaffold (NestJS)
- [ ] Frontend scaffold (Next.js)
- [ ] Docker compose
- [ ] AGENTS.md + CONVENTIONS.md customizados
- [ ] CI/CD pipeline (GitHub Actions bloqueante)
- [ ] Auth context design (JWT + service token)

### Sprint 1 (MVP Security - 2 semanas)
- [ ] Auth module (login, JWT, refresh token)
- [ ] User model + validation (class-validator)
- [ ] Grant CRUD + validación DTOs
- [ ] Search básico con índices
- [ ] Unit tests 80%+ coverage
- [ ] API documentation (OpenAPI)

### Sprint 2 (MVP Feature - 2 semanas)
- [ ] Source management
- [ ] Discovery engine (básico)
- [ ] Frontend login page + protected routes
- [ ] Search UI + integration tests
- [ ] 70%+ overall coverage

### Sprint 3 (MVP Data - 2 semanas)
- [ ] Scraper basic (sin IA)
- [ ] Queue setup (BullMQ)
- [ ] Data-service integration
- [ ] E2E tests
- [ ] Documentation completa

### Sprint 4+ (Refinement)
- [ ] IA integration (Gemini fallback)
- [ ] Performance optimization
- [ ] Observability (logs, métricas)
- [ ] Design system UI
- [ ] Production readiness

---

## 📊 COMPARATIVA: GRANTER ACTUAL vs PROPUESTA DESDE 0

| Aspecto | GRANTER Actual | Propuesta v2 |
|---------|----------------|--------------|
| **Auth** | JWT fallback | ✅ FAIL SECURE |
| **Validación** | Tipos TypeScript | ✅ Class validators |
| **Testing** | 5% coverage | ✅ 70%+ desde inicio |
| **Modularidad** | Débil | ✅ DDD + Bounded Contexts |
| **CI/CD** | No bloqueante | ✅ Bloqueante (linter, tests, audit) |
| **Security** | 4/10 | ✅ 9/10 |
| **Observability** | Mínima | ✅ Logs + métricas desde inicio |
| **Timeline MVP** | 6+ semanas | ✅ 4 semanas (seguro y testeable) |

---

## 🎯 CONCLUSIÓN

Esta arquitectura DESDE 0 **aprende de los errores de GRANTER** y establece:

✅ **Seguridad primera** (Auth, validación, no fallbacks)
✅ **Testing primera** (70%+ coverage desde Sprint 1)
✅ **Modularidad clara** (DDD + Bounded Contexts)
✅ **Automation enforced** (CI/CD bloqueante)
✅ **Escalable y mantenible** (límites arquitectónicos)

**Timeline:** 4 semanas MVP seguro, 8 semanas producción.

