# 🧪 PROPUESTA TESTING DESDE 0 - GRANTER V2

**Test-Driven Development + Testing Pyramid desde Sprint 1** | v1.0 | 2026-01-27

> **Objetivo:** Evitar los errores críticos de GRANTER v1 (3% coverage, LoginPage sin tests) mediante una estrategia de testing obligatoria desde Sprint 0.
>
> **Principio:** **Escribir tests ANTES que código** (TDD) y mantener mínimo 70% coverage en cada módulo.

---

## 📋 Índice

- [1. Filosofía de Testing](#1-filosofía-de-testing)
- [2. Testing Pyramid](#2-testing-pyramid)
- [3. Estructura de Directorios](#3-estructura-de-directorios)
- [4. Unit Tests (80%)](#4-unit-tests-80)
- [5. Integration Tests (15%)](#5-integration-tests-15)
- [6. E2E Tests (5%)](#6-e2e-tests-5)
- [7. TDD Workflow](#7-tdd-workflow)
- [8. Coverage Targets](#8-coverage-targets)
- [9. CI/CD Bloqueante](#9-cicd-bloqueante)
- [10. Ejemplos Completos](#10-ejemplos-completos)

---

## 1. Filosofía de Testing

### 1.1 Principios No-Negociables

```
🔴 CRÍTICO: NO PASAR A PRODUCCIÓN SIN:
  - Todos los módulos con >70% coverage
  - Tests para 100% de casos críticos (auth, grants, security)
  - CI/CD BLOQUEANTE (tests fallan = no merge)
  - Manual testing checklist antes de go-live
```

### 1.2 Testing First, Code Second

**Orden de trabajo (TDD):**
```
1. Escribir test FALLANDO (RED)       ← test que describe el comportamiento
2. Implementar mínimo código (GREEN)  ← hacer que test pase
3. Refactorizar (REFACTOR)            ← mejorar sin romper test
```

**NUNCA al revés** (escribir código primero y tests después).

### 1.3 Tipos de Tests Permitidos

| Tipo | Nivel | Coverage | Stack |
|------|-------|----------|-------|
| **Unit** | Función/clase individual | 80% | Jest (TS), pytest (Python) |
| **Integration** | Múltiples módulos + BD | 15% | Jest (TS), pytest (Python) |
| **E2E** | Flujos completos usuario | 5% | Playwright, Cypress |
| **Security** | Inyección, auth, CORS | Parte de unit+integration | Mismo stack |

---

## 2. Testing Pyramid

```
                    ▲
                   /.\
                  / E2E\        5% - Manual flows, user journeys
                 /______\       (5-10 tests, ~1h total)
                /        \
               /          \
              / Integration \  15% - Multiple modules, DB
             /              \  (20-30 tests, ~2h total)
            /________________\
           /                  \
          /                    \
         /     Unit Tests       \ 80% - Single functions/classes
        /                        \(100+ tests, <5min total)
       /__________________________\
```

**Inversión de tiempo:**
- Unit: 50% of time (rápidos, detectan 80% de bugs)
- Integration: 30% of time (medianos, detectan 15% de bugs)
- E2E: 20% of time (lentos, detectan 5% de bugs)

---

## 3. Estructura de Directorios

### 3.1 Backend (NestJS)

```
apps/backend-core/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── __tests__/
│   │   │   ├── auth.service.spec.ts      ← Unit test
│   │   │   └── auth.controller.spec.ts   ← Unit test
│   │   └── auth.module.ts
│   ├── grants/
│   │   ├── grants.service.ts
│   │   ├── grants.controller.ts
│   │   └── __tests__/
│   │       ├── grants.service.spec.ts    ← Unit test
│   │       └── grants.controller.spec.ts ← Unit test
│   └── common/
│       ├── guards/
│       │   ├── jwt.guard.ts
│       │   └── __tests__/
│       │       └── jwt.guard.spec.ts
│       └── pipes/
│           ├── validation.pipe.ts
│           └── __tests__/
│               └── validation.pipe.spec.ts
├── test/
│   ├── auth.e2e-spec.ts                  ← E2E tests
│   ├── grants.e2e-spec.ts                ← E2E tests
│   └── fixtures/
│       ├── users.fixture.ts
│       └── grants.fixture.ts
└── jest.config.js
```

### 3.2 Data Service (FastAPI)

```
apps/data-service/
├── src/
│   ├── services/
│   │   ├── ia_service.py
│   │   ├── scraper_service.py
│   │   └── discovery_service.py
│   ├── models/
│   │   ├── grant.py
│   │   └── source.py
│   └── __init__.py
├── src/tests/
│   ├── conftest.py                       ← Pytest fixtures
│   ├── test_ia_service.py                ← Unit + integration
│   ├── test_scraper_service.py           ← Unit + integration
│   ├── test_discovery_service.py         ← Unit + integration
│   ├── unit/                             ← Unit tests only
│   │   └── test_models.py
│   ├── integration/                      ← Integration tests (con BD)
│   │   └── test_database_queries.py
│   └── e2e/                              ← E2E tests
│       └── test_scraper_flow.py
├── pytest.ini                            ← Configuración pytest
└── pyproject.toml
```

### 3.3 Frontend (Next.js)

```
apps/web-frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.module.css
│   │   │   └── __tests__/
│   │   │       └── LoginForm.test.tsx    ← Component unit test
│   │   ├── GrantSearch/
│   │   │   ├── GrantSearch.tsx
│   │   │   └── __tests__/
│   │   │       └── GrantSearch.test.tsx
│   │   └── Button/
│   │       ├── Button.tsx
│   │       └── __tests__/
│   │           └── Button.test.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── __tests__/
│   │       └── useAuth.test.ts
│   └── pages/
│       ├── index.tsx
│       ├── login.tsx
│       └── __tests__/
│           └── index.test.tsx
├── e2e/                                   ← E2E tests with Playwright
│   ├── login.spec.ts
│   ├── search.spec.ts
│   └── scraper.spec.ts
├── jest.config.js
└── playwright.config.ts
```

---

## 4. Unit Tests (80%)

### 4.1 Backend Unit Tests (NestJS + Jest)

**Ejemplo: AuthService**

```typescript
// src/auth/__tests__/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret-32-chars-minimum!!';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('validateUser', () => {
    it('debe retornar usuario si credenciales son válidas', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const hashedPassword = await hashPassword(password);
      const mockUser = { id: '1', email, password: hashedPassword };

      usersService.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('debe lanzar error si usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('invalid@example.com', 'password'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('debe lanzar error si contraseña es incorrecta', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        password: 'hashed-wrong-password',
      };
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.validateUser('user@example.com', 'wrong-password'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('debe generar JWT válido al login', async () => {
      const user = { id: '1', email: 'user@example.com' };
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(result).toEqual({ accessToken: token });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('debe NO usar fallback si JWT_SECRET falla (FAIL SECURE)', async () => {
      configService.get.mockReturnValue(undefined); // JWT_SECRET no existe

      await expect(service.login({ id: '1', email: 'test@example.com' }))
        .rejects
        .toThrow();
    });
  });

  describe('verify', () => {
    it('debe validar JWT correctamente', async () => {
      const payload = { sub: '1', email: 'user@example.com' };
      jwtService.verify.mockReturnValue(payload);

      const result = service.verify('valid-token');

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('debe rechazar JWT inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new UnauthorizedException('Invalid token');
      });

      expect(() => service.verify('invalid-token')).toThrow(
        UnauthorizedException
      );
    });

    it('debe rechazar JWT expirado', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new UnauthorizedException('Token expired');
      });

      expect(() => service.verify('expired-token')).toThrow(
        UnauthorizedException
      );
    });
  });
});
```

### 4.2 Python Unit Tests (FastAPI + pytest)

**Ejemplo: IAService**

```python
# apps/data-service/src/tests/test_ia_service.py

import pytest
from unittest.mock import Mock, patch, AsyncMock
from src.services.ia_service import IAService
from src.models.grant import GrantData


class TestIAService:
    """Unit tests for IA extraction service."""

    @pytest.fixture
    def ia_service(self):
        """Crear instancia de IAService para tests."""
        return IAService(api_key="test-key-12345")

    @pytest.fixture
    def sample_html(self):
        """HTML de ejemplo para extracción."""
        return """
        <html>
            <h1>Grant Title</h1>
            <p>Grant description goes here</p>
            <span>Amount: €50,000</span>
            <div>Deadline: 2026-12-31</div>
        </html>
        """

    def test_extract_returns_valid_grant_data(self, ia_service, sample_html):
        """Debe extraer datos válidos del HTML."""
        with patch.object(ia_service, '_call_gemini') as mock_gemini:
            mock_gemini.return_value = {
                'title': 'Grant Title',
                'description': 'Grant description goes here',
                'amount': 50000,
                'deadline': '2026-12-31',
            }

            result = ia_service.extract_grant(sample_html)

            assert result.title == 'Grant Title'
            assert result.amount == 50000
            assert isinstance(result, GrantData)

    def test_extract_returns_empty_if_api_key_missing(self):
        """Debe fallar EXPLÍCITAMENTE si API key falta (no retornar [])."""
        service = IAService(api_key=None)

        with pytest.raises(ValueError) as exc_info:
            service.extract_grant("<html><body>Test</body></html>")

        assert "Gemini API key is required" in str(exc_info.value)

    def test_extract_handles_invalid_html_gracefully(self, ia_service):
        """Debe manejar HTML inválido sin crashes."""
        invalid_html = "<html><body>Texto sin estructura</body></html>"

        result = ia_service.extract_grant(invalid_html)

        # Debe retornar fallback heurístico o error explícito
        assert result is not None or isinstance(result, Exception)

    def test_extract_validates_required_fields(self, ia_service, sample_html):
        """Debe validar que campos críticos estén presentes."""
        with patch.object(ia_service, '_call_gemini') as mock_gemini:
            # Falta 'deadline' (campo requerido)
            mock_gemini.return_value = {
                'title': 'Grant Title',
                'description': 'Description',
                'amount': 50000,
                # 'deadline' missing
            }

            with pytest.raises(ValueError) as exc_info:
                ia_service.extract_grant(sample_html)

            assert "deadline" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_extract_async_with_timeout(self, ia_service):
        """Debe respetar timeout en llamadas async."""
        with patch.object(
            ia_service, '_call_gemini_async', new_callable=AsyncMock
        ) as mock_async:
            mock_async.side_effect = asyncio.TimeoutError()

            with pytest.raises(asyncio.TimeoutError):
                await ia_service.extract_grant_async(
                    "<html></html>", timeout=5
                )

    def test_extract_logs_performance(self, ia_service, sample_html, caplog):
        """Debe loguear tiempo de extracción."""
        with patch.object(ia_service, '_call_gemini') as mock_gemini:
            mock_gemini.return_value = {'title': 'Test'}

            ia_service.extract_grant(sample_html)

            # Verificar que se logueó
            assert any('extraction_time' in record.message for record in caplog.records)
```

### 4.3 Frontend Unit Tests (React + Jest)

**Ejemplo: LoginForm Component**

```typescript
// apps/web-frontend/__tests__/LoginForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('LoginForm Component', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  it('debe renderizar formulario de login', () => {
    render(<LoginForm />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('debe validar email vacío', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('debe validar email inválido', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('debe llamar login con credenciales válidas', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('debe mostrar loading state mientras se envía', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('debe mostrar error si login falla', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
    });

    render(<LoginForm />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('debe ser accesible (a11y)', () => {
    const { container } = render(<LoginForm />);

    // Verificar labels asociadas a inputs
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('id');

    // Verificar que no hay warnings de a11y
    const errors = container.querySelectorAll('[role="img"]:not([alt])');
    expect(errors).toHaveLength(0);
  });
});
```

---

## 5. Integration Tests (15%)

### 5.1 Backend Integration Tests

**Ejemplo: Auth E2E dentro de NestJS**

```typescript
// apps/backend-core/test/auth.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let db: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    db = moduleFixture.get<DatabaseService>(DatabaseService);
    await db.clearAllTables(); // Limpiar BD antes de tests
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('debe registrar usuario y crear en BD', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('newuser@example.com');
        });
    });

    it('debe rechazar email duplicado', async () => {
      // Registrar primer usuario
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'SecurePassword123!',
        });

      // Intentar registrar con mismo email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'AnotherPassword123!',
        })
        .expect(409) // Conflict
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('debe validar contraseña débil', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: '123', // Too weak
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password');
        });
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Crear usuario de prueba
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!',
        });
    });

    it('debe devolver JWT válido al login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).toMatch(/^eyJ/); // JWT format
        });
    });

    it('debe rechazar credenciales inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('Protected Routes with JWT', () => {
    let validToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'SecurePassword123!',
        });

      validToken = res.body.accessToken;
    });

    it('debe permitir acceso con JWT válido', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('protected@example.com');
        });
    });

    it('debe rechazar sin JWT', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('debe rechazar JWT inválido', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
```

### 5.2 Data Service Integration Tests

```python
# apps/data-service/src/tests/integration/test_database_queries.py

import pytest
from sqlalchemy.orm import Session
from src.models.grant import Grant
from src.models.source import Source
from src.services.discovery_service import DiscoveryService


@pytest.mark.integration
class TestDiscoveryServiceWithDatabase:
    """Integration tests con base de datos real."""

    @pytest.fixture
    def db_session(self, test_db):
        """Sesión de BD para tests."""
        yield test_db
        test_db.rollback()  # Deshacer cambios después del test

    def test_discover_and_save_sources(self, db_session: Session):
        """Debe descubrir fuentes y guardarlas en BD."""
        service = DiscoveryService(db=db_session)

        # Descubrir fuentes para España
        sources = service.discover(
            region="ES",
            scope="BDNS",
            limit=5
        )

        # Verificar que se encontraron
        assert len(sources) >= 0
        assert isinstance(sources, list)

        # Guardar en BD
        for source_data in sources:
            source = Source(
                name=source_data['name'],
                url=source_data['url'],
                region=source_data['region'],
            )
            db_session.add(source)

        db_session.commit()

        # Verificar que se guardaron
        saved_sources = db_session.query(Source).filter_by(region="ES").all()
        assert len(saved_sources) >= 0

    def test_avoid_duplicate_sources(self, db_session: Session):
        """Debe prevenir fuentes duplicadas."""
        # Crear primera fuente
        source1 = Source(
            name="BDNS Official",
            url="https://www.bdns.es",
            region="ES",
        )
        db_session.add(source1)
        db_session.commit()

        # Intentar crear duplicada
        source2 = Source(
            name="BDNS Official",
            url="https://www.bdns.es",
            region="ES",
        )
        db_session.add(source2)

        # Debe fallar por UNIQUE constraint
        with pytest.raises(Exception):  # SQLAlchemy integrity error
            db_session.commit()

    def test_query_grants_with_filters(self, db_session: Session):
        """Debe filtrar grants por región y sector."""
        # Crear grants de prueba
        grant1 = Grant(
            title="Grant A",
            region="Madrid",
            sector="technology",
            amount=50000,
        )
        grant2 = Grant(
            title="Grant B",
            region="Barcelona",
            sector="healthcare",
            amount=100000,
        )
        db_session.add_all([grant1, grant2])
        db_session.commit()

        # Filtrar por región
        madrid_grants = db_session.query(Grant).filter_by(region="Madrid").all()
        assert len(madrid_grants) == 1
        assert madrid_grants[0].title == "Grant A"

        # Filtrar por sector
        tech_grants = db_session.query(Grant).filter_by(sector="technology").all()
        assert len(tech_grants) == 1
```

---

## 6. E2E Tests (5%)

### 6.1 E2E con Playwright

```typescript
// apps/web-frontend/e2e/login.spec.ts

import { test, expect, Page } from '@playwright/test';

test.describe('Login E2E Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  });

  test('debe completar login flow completo', async () => {
    // 1. Rellenar formulario
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');

    // 2. Click en submit
    await page.click('button[type="submit"]');

    // 3. Esperar redirect a dashboard
    await page.waitForURL('http://localhost:3000/dashboard');

    // 4. Verificar que dashboard cargó
    expect(page.url()).toBe('http://localhost:3000/dashboard');
    await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async () => {
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    // Esperar mensaje de error
    const error = page.locator('text=Invalid credentials');
    await expect(error).toBeVisible();

    // NO debe navegar a dashboard
    expect(page.url()).toBe('http://localhost:3000/login');
  });
});
```

---

## 7. TDD Workflow

### 7.1 Ejemplo: Implementar nueva feature con TDD

**Paso 1: RED - Escribir test fallando**

```typescript
// Step 1: Write failing test FIRST
describe('GrantService.calculateDiscount', () => {
  it('debe aplicar 15% descuento para grants > €100k', () => {
    const service = new GrantService();
    const result = service.calculateDiscount(150000);

    expect(result).toBe(142500); // 150000 * 0.85
  });
});
```

**Paso 2: GREEN - Implementar código mínimo**

```typescript
// Step 2: Write minimal code to make test PASS
class GrantService {
  calculateDiscount(amount: number): number {
    if (amount > 100000) {
      return amount * 0.85; // 15% discount
    }
    return amount;
  }
}
```

**Paso 3: REFACTOR - Mejorar sin romper test**

```typescript
// Step 3: REFACTOR
class GrantService {
  private readonly LARGE_GRANT_THRESHOLD = 100000;
  private readonly LARGE_GRANT_DISCOUNT = 0.15;

  calculateDiscount(amount: number): number {
    if (amount > this.LARGE_GRANT_THRESHOLD) {
      return amount * (1 - this.LARGE_GRANT_DISCOUNT);
    }
    return amount;
  }
}
```

---

## 8. Coverage Targets

### 8.1 Mínimos por Módulo

```
CRÍTICOS (100% coverage):
  ✅ auth/auth.service.ts         → Auth token generation (security)
  ✅ grants/grants.service.ts     → Data integrity
  ✅ common/guards/jwt.guard.ts   → Authorization
  ✅ common/pipes/validation.pipe → Input validation

IMPORTANTES (>80% coverage):
  ✅ sources/sources.service.ts
  ✅ discovery/discovery.service.ts
  ✅ Frontend components (LoginForm, SearchPage, etc.)

REGULAR (>70% coverage):
  ✅ Todos los demás módulos
  ✅ Utilities y helpers
```

### 8.2 Medición de Coverage

```bash
# NestJS
npm run test:cov -w backend-core
# Genera: coverage/lcov-report/index.html

# Python
docker compose exec data-service pytest --cov=src --cov-report=html
# Genera: htmlcov/index.html

# Frontend
npm run test:coverage -w web-frontend
# Genera: coverage/lcov-report/index.html
```

### 8.3 Coverage Check en CI

```yaml
# .github/workflows/test.yml
- name: Check coverage threshold
  run: |
    npm run test:cov -w backend-core
    # Fail si coverage < 70%
    if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 70 ]; then
      echo "Coverage below 70%"
      exit 1
    fi
```

---

## 9. CI/CD Bloqueante

### 9.1 Tests DEBEN pasar para merge

```yaml
# .github/workflows/test.yml

name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: granter_test
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4

      # Backend tests
      - name: Backend unit tests
        run: npm run test -w backend-core
        env:
          NODE_ENV: test

      - name: Backend coverage
        run: npm run test:cov -w backend-core
        continue-on-error: false

      - name: Backend E2E tests
        run: npm run test:e2e -w backend-core

      # Data service tests
      - name: Data service tests
        run: |
          docker compose -f docker-compose.test.yml up -d
          docker compose -f docker-compose.test.yml exec -T \
            data-service pytest --cov=src

      # Frontend tests
      - name: Frontend unit tests
        run: npm test -w web-frontend -- --coverage --watchAll=false

      - name: Frontend E2E tests
        run: npm run test:e2e -w web-frontend

      # Fail si alguno falló
      - name: Verify all tests passed
        if: failure()
        run: exit 1
```

### 9.2 No merge sin tests

```bash
# .git/hooks/pre-push (git hook)

#!/bin/bash

# Prevenir push si tests fallan
npm run test -w backend-core || exit 1
npm run test -w web-frontend -- --watchAll=false || exit 1
docker compose exec data-service pytest || exit 1

echo "✅ All tests passed. Ready to push."
```

---

## 10. Ejemplos Completos

### 10.1 TDD Example: Completo

```typescript
// 1️⃣ RED: Write failing test
test('GrantValidator.isValidDeadline() debe rechazar fechas pasadas', () => {
  const validator = new GrantValidator();
  const pastDate = new Date('2025-01-01');

  expect(() => validator.isValidDeadline(pastDate)).toThrow(
    'Deadline must be in the future'
  );
});

// 2️⃣ GREEN: Write minimal code
class GrantValidator {
  isValidDeadline(date: Date): void {
    if (date < new Date()) {
      throw new Error('Deadline must be in the future');
    }
  }
}

// 3️⃣ REFACTOR: Improve
class GrantValidator {
  private readonly NOW = () => new Date();

  isValidDeadline(deadline: Date): void {
    if (deadline <= this.NOW()) {
      throw new Error('Deadline must be in the future');
    }
  }

  validateGrant(grant: GrantDTO): void {
    this.isValidDeadline(grant.deadline);
    // ... other validations
  }
}
```

### 10.2 Checklist Pre-Go-Live

```
🧪 TESTING CHECKLIST (PRE-PRODUCTION)

Auth & Security:
  ✅ JWT validation tests (valid, expired, invalid)
  ✅ Password hashing tests (bcrypt)
  ✅ X-Service-Token validation tests
  ✅ Rate limiting tests
  ✅ CORS validation tests

Grants & Data:
  ✅ Create grant tests (valid, invalid, edge cases)
  ✅ Update grant tests
  ✅ Delete grant tests
  ✅ List/filter grants tests
  ✅ Validation tests (amount > 0, deadline valid, etc.)

Frontend:
  ✅ LoginForm renders + validation
  ✅ LoginForm calls API + handles errors
  ✅ SearchPage filters work
  ✅ GrantDetail page loads data
  ✅ Responsive design (mobile, tablet, desktop)
  ✅ Accessibility (a11y) tests

E2E Flows:
  ✅ Register → Login → Dashboard flow
  ✅ Search grants flow
  ✅ Create grant flow
  ✅ Error handling (network errors, validation errors)

Coverage:
  ✅ Backend coverage > 70%
  ✅ Frontend coverage > 70%
  ✅ Data service coverage > 70%

CI/CD:
  ✅ All tests pass in CI
  ✅ Coverage checks pass
  ✅ Linting passes
  ✅ Type checking passes (mypy, tsc)
```

---

## Summary

| Aspecto | Target | Herramientas |
|---------|--------|--------------|
| **Unit Tests** | 80% de tests | Jest, pytest |
| **Integration Tests** | 15% de tests | Jest, pytest, supertest |
| **E2E Tests** | 5% de tests | Playwright, Cypress |
| **Coverage** | 70%+ global | nyc, pytest-cov |
| **TDD** | Escribir test PRIMERO | Red-Green-Refactor |
| **CI/CD** | BLOQUEANTE | GitHub Actions |

**Go-Live requiere:** Todos los tests pasando + Coverage > 70% + CI/CD OK

---

**Última actualización:** 2026-01-27
**Versión:** 1.0
**Status:** OBLIGATORIO desde Sprint 0
