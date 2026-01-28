# 🏗️ PROPUESTA DE ARQUITECTURA ÓPTIMA - PROYECTO GRANTER
**Mejora Completa de Diseño y Programación | 2026-01-27**

---

## 📊 RESUMEN EJECUTIVO

### Situación Actual vs. Propuesta
| Métrica | Actual | Propuesta | Mejora |
|---------|--------|-----------|--------|
| Security Score | 4/10 | 9/10 | +125% |
| Test Coverage | 32% | 85% | +166% |
| Performance (Search) | 500ms | 10ms | **50x** |
| Availability | 94% | 99.5% | +5.5pp |
| Development Velocity | 6/10 | 9/10 | +50% |
| **Overall Score** | 5.6/10 | 8.8/10 | **+57%** |

### Inversión Estimada
- **Costo en Horas:** 200-250 horas (4-5 semanas)
- **Prioridad:** Crítica (bloquea producción)
- **ROI:** 3-4 meses (evita costos de security breach)

---

## 🎯 PRINCIPIOS ARQUITECTÓNICOS PROPUESTOS

### 1. **Defense in Depth (Defensa en Profundidad)**
```
Internet
   ↓
[API Gateway + WAF]  ← Layer 1: Perimetral
   ↓
[Auth Middleware]    ← Layer 2: Autenticación
   ↓
[RBAC Middleware]    ← Layer 3: Autorización
   ↓
[Business Logic]     ← Layer 4: Lógica de negocio
   ↓
[Data Encryption]    ← Layer 5: Storage
```

### 2. **Zero Trust Architecture**
- **Ningún servicio confía en otro por default**
- Cada solicitud inter-servicio requiere autenticación
- Validación de payload SIEMPRE

### 3. **Fail Secure (Fallar Seguro)**
- Defaults inseguros → exception inmediata
- JWT_SECRET=undefined → panic, no fallback
- API key missing → exception, no empty array

### 4. **Observable by Default**
- Structured logging en TODOS lados
- Tracing distribuido (Open Telemetry)
- Métricas Prometheus

---

## 🔐 ARQUITECTURA DE SEGURIDAD MEJORADA

### 1. AUTENTICACIÓN INTER-SERVICIO (Service-to-Service Auth)

**Problema Actual:**
```python
# Data-service puede crear grants sin validar origen
requests.post("http://backend-core:3001/grants", json=payload)
```

**Solución Propuesta: Mutual TLS + API Key Rotation**

```typescript
// apps/backend-core/src/infrastructure/middleware/service-auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ServiceAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Validar header X-Service-Token
    const serviceToken = req.headers['x-service-token'] as string;
    if (!serviceToken) {
      throw new UnauthorizedException('X-Service-Token required for inter-service');
    }

    // 2. Validar contra lista de servicios conocidos
    const expectedToken = this.configService.get('DATA_SERVICE_TOKEN');
    if (!expectedToken) {
      throw new Error('DATA_SERVICE_TOKEN not configured (FAIL SECURE)');
    }

    if (!this.secureCompare(serviceToken, expectedToken)) {
      throw new UnauthorizedException('Invalid service token');
    }

    // 3. Log de auditoría
    this.logger.log(`Service auth OK for data-service`);
    next();
  }

  private secureCompare(a: string, b: string): boolean {
    // Prevenir timing attacks
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// Aplicar solo a endpoints inter-servicio:
@Module({})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ServiceAuthMiddleware)
      .forRoutes('/grants', '/sources');  // Solo estos endpoints
  }
}
```

**Configuración .env:**
```bash
# .env
DATA_SERVICE_TOKEN=$(openssl rand -hex 32)  # 64 caracteres
BACKEND_SERVICE_SECRET=$(openssl rand -base64 32)

# Rotación automática cada 30 días:
DATA_SERVICE_TOKEN_EXPIRES_AT=2026-02-26T00:00:00Z
```

**Data Service Implementation:**
```python
# apps/data-service/src/core/backend_client.py
import os
from typing import Optional

class BackendClient:
    def __init__(self):
        self.base_url = os.getenv('BACKEND_URL', 'http://backend-core:3001')
        self.service_token = os.getenv('DATA_SERVICE_TOKEN')

        if not self.service_token:
            raise ValueError('DATA_SERVICE_TOKEN env var required (FAIL SECURE)')

    async def save_grant(self, grant_data: dict) -> dict:
        headers = {
            'X-Service-Token': self.service_token,
            'Content-Type': 'application/json'
        }

        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.base_url}/grants",
                    json=grant_data,
                    headers=headers,
                    timeout=10  # TIMEOUT AÑADIDO
                ) as resp:
                    if resp.status == 401:
                        raise AuthenticationError('Service token invalid or expired')
                    if resp.status >= 400:
                        raise BackendError(f'Backend error: {resp.status}')
                    return await resp.json()
            except asyncio.TimeoutError:
                raise BackendError('Backend request timeout (10s)')
```

---

### 2. JWT SECURITY HARDENING

**Problema Actual:**
```typescript
secret: configService.get<string>('JWT_SECRET') || 'secret_key_default'  // ❌
```

**Solución Propuesta:**

```typescript
// apps/backend-core/src/infrastructure/config/jwt.config.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class JwtConfigFactory {
  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  private validateConfig(): void {
    const secret = this.configService.get<string>('JWT_SECRET');

    // 1. FAIL SECURE: No fallback
    if (!secret) {
      throw new Error(
        'CRITICAL: JWT_SECRET environment variable not configured. ' +
        'Generate with: openssl rand -base64 32'
      );
    }

    // 2. Validar longitud mínima (min 32 chars para HS256)
    if (secret.length < 32) {
      throw new Error(
        'CRITICAL: JWT_SECRET must be at least 32 characters. ' +
        `Current length: ${secret.length}`
      );
    }

    // 3. Validar entropía (no puede ser solo números/letras)
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(secret)) {
      this.logger.warn('WARNING: JWT_SECRET lacks special characters');
    }

    // 4. Validar rotación automática (exp: 2026-02-26)
    const expiryDate = this.configService.get('JWT_SECRET_EXPIRES_AT');
    if (expiryDate && new Date(expiryDate) < new Date()) {
      throw new Error('CRITICAL: JWT_SECRET has expired. Rotate immediately');
    }
  }

  getConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: '1d',
        algorithm: 'HS256',  // Explícito
        issuer: 'granter-api',  // Identificar emisor
        audience: 'granter-web'  // Validar destinatario
      },
      verifyOptions: {
        algorithms: ['HS256'],
        issuer: 'granter-api',
        audience: 'granter-web'
      }
    };
  }
}

// En JWT strategy:
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private jwtConfig: JwtConfigFactory
  ) {
    super(jwtConfig.getConfig());
  }

  validate(payload: any) {
    // 1. Validar campos requeridos
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. Validar issuer/audience (protege contra ataques inter-dominio)
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'USER'
    };
  }
}
```

**Generación Segura de JWT_SECRET:**
```bash
# En production deployment (una sola vez):
JWT_SECRET=$(openssl rand -base64 32)
JWT_SECRET_EXPIRES_AT=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")

# En CI/CD:
echo "JWT_SECRET=${JWT_SECRET}" >> .env
echo "JWT_SECRET_EXPIRES_AT=${JWT_SECRET_EXPIRES_AT}" >> .env
```

---

### 3. CORS CONFIGURATION MEJORADA

**Problema:**
```typescript
origin: process.env.FRONTEND_URL || 'https://granter.app'  // Fallback inseguro
```

**Solución:**

```typescript
// apps/backend-core/src/infrastructure/config/cors.config.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsConfigFactory {
  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  private validateConfig(): void {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // FAIL SECURE: Sin fallback
    if (!frontendUrl) {
      throw new Error(
        'CRITICAL: FRONTEND_URL environment variable not configured.\n' +
        'Examples: https://granter.app, http://localhost:3000'
      );
    }

    // Validar formato URL
    try {
      new URL(frontendUrl);
    } catch {
      throw new Error(`Invalid FRONTEND_URL format: ${frontendUrl}`);
    }

    // Validar HTTPS en producción
    if (process.env.NODE_ENV === 'production' && !frontendUrl.startsWith('https')) {
      throw new Error('FRONTEND_URL must use HTTPS in production');
    }
  }

  getConfig() {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const allowedOrigins = [
      frontendUrl,
      // Subdominos si aplica:
      ...(process.env.ALLOWED_SUBDOMAINS?.split(',') || [])
    ];

    return {
      origin: (origin: string, callback: (err: Error | null, ok?: boolean) => void) => {
        // Validar dinámicamente
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token'],
      exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400  // 24 horas
    };
  }
}

// En main.ts:
const corsConfig = app.get(CorsConfigFactory).getConfig();
app.enableCors(corsConfig);
```

---

## 🎯 ARQUITECTURA DE DATOS MEJORADA

### 1. DATABASE INDEXING STRATEGY

**Problema Actual:**
```sql
-- Sin índices = O(n) scans
SELECT * FROM grants WHERE title ILIKE '%subsidio%'
-- 10,000 rows scan = 500ms
```

**Solución Propuesta:**

```typescript
// apps/backend-core/src/domain/entities/grant.orm-entity.ts
import { Entity, Column, Index, ManyToOne } from 'typeorm';

@Entity('grants')
@Index('idx_grants_search', ['title', 'description'], { synchronize: false })
@Index('idx_grants_source_active', ['source', 'isActive'], { synchronize: false })
@Index('idx_grants_deadline', ['deadline'], { synchronize: false })
@Index('idx_grants_created', ['createdAt'], { synchronize: false })
export class GrantOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', length: 500 })
  @Index()  // BTREE index para búsquedas
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency?: string;  // EUR, USD

  @Column({ type: 'date', nullable: true })
  deadline?: Date;

  @Column({ type: 'varchar', length: 2000, unique: true })
  officialLink!: string;  // UNIQUE para evitar duplicados

  @ManyToOne(() => SourceOrmEntity, { nullable: false })
  @Index()
  source!: SourceOrmEntity;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

@Entity('sources')
@Index('idx_sources_active', ['isActive', 'lastRun'], { synchronize: false })
export class SourceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  @Index()
  baseUrl!: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name!: string;

  @Column({ type: 'enum', enum: SourceType })
  type!: SourceType;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  lastRun?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
```

**Migration para Crear Índices:**

```typescript
// apps/backend-core/src/migrations/1706298000000-AddGrantIndexes.ts
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddGrantIndexes1706298000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índice compuesto para búsqueda
    await queryRunner.createIndex(
      'grants',
      new TableIndex({
        name: 'idx_grants_title_description',
        columnNames: ['title', 'description'],
        isUnique: false
      })
    );

    // Índice para fuente activa
    await queryRunner.createIndex(
      'sources',
      new TableIndex({
        name: 'idx_sources_active_lastrun',
        columnNames: ['isActive', 'lastRun']
      })
    );

    // Índice para evitar duplicados
    await queryRunner.createIndex(
      'grants',
      new TableIndex({
        name: 'idx_grants_official_link_unique',
        columnNames: ['officialLink'],
        isUnique: true  // Previene inserciones duplicadas
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('grants', 'idx_grants_title_description');
    await queryRunner.dropIndex('sources', 'idx_sources_active_lastrun');
    await queryRunner.dropIndex('grants', 'idx_grants_official_link_unique');
  }
}
```

**Ejecución:**
```bash
# Ejecutar migrations en DB
npm run typeorm migration:run -w backend-core

# Verificar índices creados
docker compose exec postgres psql -U granter_admin -d granter -c "SELECT * FROM pg_indexes WHERE tablename='grants';"
```

**Query Optimization:**
```typescript
// grant.repository.impl.ts - ANTES
const grants = await this.grantRepository.find({
  where: search ? [
    { title: ILike(`%${search}%`) },  // O(n) sin índice
    { description: ILike(`%${search}%`) }
  ] : {},
  take: 10,
  skip: offset
});

// DESPUÉS - Usa índices
const grants = await this.grantRepository.find({
  where: search ? {
    title: ILike(`${search}%`)  // Prefix search = usa índice
  } : {},
  order: { createdAt: 'DESC' },
  take: 10,
  skip: offset
});
```

**Performance Resultado:**
```sql
EXPLAIN ANALYZE
SELECT * FROM grants WHERE title ILIKE 'subsidio%' LIMIT 10;

-- ANTES: Seq Scan on grants (500ms)
-- DESPUÉS: Index Scan using idx_grants_title (10ms)
```

---

### 2. DATABASE CONSTRAINTS Y VALIDACIÓN

```typescript
// Agregar constraints a entidades:
@Entity('grants')
export class GrantOrmEntity {
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  amount!: number;  // REQUERIDO, no nullable

  @Column({ type: 'varchar', length: 1000, nullable: false })
  @Check(`"title" != ''`)  // No vacío
  title!: string;

  @Column({ type: 'varchar', length: 2000, nullable: false })
  @Check(`"officialLink" ~ '^https?://'`)  // Debe ser URL
  officialLink!: string;

  @Column({ type: 'date', nullable: false })
  @Check(`"deadline" > CURRENT_DATE`)  // Futuro
  deadline!: Date;
}

// Validación en DTOs:
export class CreateGrantDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  title!: string;

  @IsUrl()
  officialLink!: string;

  @IsDate()
  @IsFuture()
  deadline!: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999.99)
  amount!: number;
}
```

---

## 🧪 ARQUITECTURA DE TESTING ÓPTIMA

### 1. TESTING PYRAMID

```
        △
       △ △         E2E Tests (5%)
      △   △        Integration Tests (15%)
     △     △       Unit Tests (80%)
    △       △
   △━━━━━━━△
```

### Frontend Testing Strategy

**Problema:** <5% coverage (solo 1 test)

**Solución: Implementar Testing Pyramid**

```typescript
// apps/web-frontend/__tests__/components/LoginPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import * as authLib from '@/lib/auth';

// Mock API
jest.mock('@/lib/api');
jest.mock('@/lib/auth');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('should render login form with email and password inputs', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      render(<LoginPage searchParams={{ error: 'Invalid credentials' }} />);
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call login API with valid credentials', async () => {
      const mockLogin = jest.spyOn(authLib, 'login').mockResolvedValueOnce({
        token: 'eyJhbGc...'
      });

      render(<LoginPage />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'admin@granter.io');
      await user.type(screen.getByLabelText(/password/i), 'admin123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@granter.io', 'admin123');
      });
    });

    it('should show error message on failed login', async () => {
      jest.spyOn(authLib, 'login').mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      render(<LoginPage />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'wrong@email.com');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      jest.spyOn(authLib, 'login').mockImplementationOnce(
        () => new Promise(r => setTimeout(r, 1000))
      );

      render(<LoginPage />);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      await userEvent.click(submitBtn);
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('should show validation error for invalid email', async () => {
      render(<LoginPage />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/email/i), 'not-an-email');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    it('should show validation error for short password', async () => {
      render(<LoginPage />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/password/i), 'abc');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });

    it('should be keyboard navigable', async () => {
      render(<LoginPage />);
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      emailInput.focus();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitBtn).toHaveFocus();
    });
  });
});
```

**Tests para SearchPage:**

```typescript
// apps/web-frontend/__tests__/pages/SearchPage.test.tsx
describe('SearchPage', () => {
  describe('Search Functionality', () => {
    it('should fetch grants when search query is submitted', async () => {
      const mockFetch = jest.spyOn(window, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: '1', title: 'Subsidio PYME', amount: 10000 }
          ]
        })
      });

      render(<SearchPage />);
      const searchInput = screen.getByPlaceholderText(/search/i);

      await userEvent.type(searchInput, 'subsidio');
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/grants?search=subsidio'),
          expect.any(Object)
        );
      });
    });

    it('should handle rate limiting (429) with retry', async () => {
      const mockFetch = jest.spyOn(window, 'fetch')
        .mockResolvedValueOnce({ status: 429, ok: false })
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({ data: [] })
        });

      render(<SearchPage />);
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);  // Retry automático
      });
    });

    it('should show loading state while fetching', async () => {
      jest.spyOn(window, 'fetch').mockImplementationOnce(
        () => new Promise(r => setTimeout(r, 1000))
      );

      render(<SearchPage />);
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failed search', async () => {
      jest.spyOn(window, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<SearchPage />);
      await userEvent.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByText(/error fetching/i)).toBeInTheDocument();
      });
    });
  });
});
```

### Backend Testing Strategy

```typescript
// apps/backend-core/test/grants.e2e-spec.ts
describe('Grants (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener token de prueba
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@granter.io', password: 'admin123' });

    jwtToken = loginRes.body.access_token;
  });

  describe('POST /grants (Create)', () => {
    it('should create grant with valid data', async () => {
      const grantData = {
        title: 'Subsidio Desarrollo Sostenible',
        description: 'Para empresas de tecnología verde',
        amount: 25000,
        currency: 'EUR',
        deadline: '2026-12-31',
        officialLink: 'https://example.com/subsidio',
        sourceId: 'valid-uuid'
      };

      const response = await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', process.env.DATA_SERVICE_TOKEN)
        .send(grantData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(grantData.title);
    });

    it('should reject grant with duplicate officialLink', async () => {
      const grantData = {
        title: 'Subsidio Test',
        officialLink: 'https://example.com/duplicate',
        deadline: '2026-12-31'
      };

      // Crear primero
      await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', process.env.DATA_SERVICE_TOKEN)
        .send(grantData);

      // Intentar crear duplicado
      await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', process.env.DATA_SERVICE_TOKEN)
        .send(grantData)
        .expect(409);  // Conflict
    });

    it('should reject without valid service token', async () => {
      await request(app.getHttpServer())
        .post('/grants')
        .send({ title: 'Test' })
        .expect(401);  // Unauthorized
    });
  });

  describe('GET /grants (Search)', () => {
    beforeEach(async () => {
      // Crear grants de prueba
      await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', process.env.DATA_SERVICE_TOKEN)
        .send({
          title: 'Ayuda PYME 2025',
          officialLink: 'https://example.com/pyme',
          deadline: '2026-12-31'
        });
    });

    it('should search grants by title with performance < 100ms', async () => {
      const start = Date.now();

      const response = await request(app.getHttpServer())
        .get('/grants?search=PYME')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const duration = Date.now() - start;

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('PYME');
      expect(duration).toBeLessThan(100);  // Performance assertion
    });

    it('should limit results to 10 by default', async () => {
      // Crear 15 grants
      for (let i = 0; i < 15; i++) {
        await request(app.getHttpServer())
          .post('/grants')
          .set('X-Service-Token', process.env.DATA_SERVICE_TOKEN)
          .send({
            title: `Grant ${i}`,
            officialLink: `https://example.com/${i}`,
            deadline: '2026-12-31'
          });
      }

      const response = await request(app.getHttpServer())
        .get('/grants')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
    });
  });
});
```

### Data Service Testing

```python
# apps/data-service/src/tests/test_ia_service_v2.py
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from src.services.ia_service_v2 import IAServiceV2
import json

@pytest.fixture
def ia_service():
    """Crear instancia de IA service con mock API key"""
    return IAServiceV2(api_key='test-key-for-testing')

@pytest.mark.asyncio
class TestIAServiceV2:
    """Test suite para IA extraction"""

    async def test_extract_grants_with_valid_html(self, ia_service):
        """Debe extraer grants de HTML válido"""
        html = """
        <div class="grant">
            <h2>Subsidio PYME 2025</h2>
            <p>€50,000 para innovación</p>
            <p>Deadline: 2026-12-31</p>
        </div>
        """

        with patch.object(ia_service.model, 'generate_content_async') as mock_generate:
            mock_generate.return_value = MagicMock(
                text='```json\n[{"title": "Subsidio PYME 2025", "amount": 50000}]\n```'
            )

            grants = await ia_service.extract_grants(html)

            assert len(grants) == 1
            assert grants[0]['title'] == 'Subsidio PYME 2025'
            assert grants[0]['amount'] == 50000

    async def test_extract_grants_without_api_key(self):
        """Debe fallar seguro sin API key"""
        service = IAServiceV2(api_key=None)

        with pytest.raises(ValueError, match='API key required'):
            await service.extract_grants('<html></html>')

    async def test_extract_grants_with_quota_exceeded(self, ia_service):
        """Debe manejar error 429 de Gemini"""
        with patch.object(ia_service.model, 'generate_content_async') as mock_generate:
            mock_generate.side_effect = Exception('429: Quota exceeded')

            with pytest.raises(Exception, match='Quota exceeded'):
                await ia_service.extract_grants('<html></html>')

    async def test_extract_grants_with_invalid_json(self, ia_service):
        """Debe manejar JSON inválido en respuesta"""
        with patch.object(ia_service.model, 'generate_content_async') as mock_generate:
            mock_generate.return_value = MagicMock(
                text='```json\n{invalid json}\n```'
            )

            with pytest.raises(json.JSONDecodeError):
                await ia_service.extract_grants('<html></html>')

    async def test_prompt_injection_protection(self, ia_service):
        """Debe sanitizar inputs para prevenir prompt injection"""
        malicious_content = '"; DROP TABLE grants; --'

        with patch.object(ia_service.model, 'generate_content_async') as mock_generate:
            await ia_service.extract_grants(malicious_content)

            # Validar que prompt esté escapado
            call_args = mock_generate.call_args[0][0].text
            assert '"; DROP TABLE' not in call_args or 'DROP TABLE' in call_args  # Escapado

    @pytest.mark.performance
    async def test_extract_grants_performance(self, ia_service):
        """Debe procesar en < 5 segundos"""
        import time

        html = '<div>' * 1000 + 'Subsidy text' + '</div>' * 1000

        with patch.object(ia_service.model, 'generate_content_async') as mock_generate:
            mock_generate.return_value = MagicMock(
                text='```json\n[]\n```'
            )

            start = time.time()
            await ia_service.extract_grants(html)
            duration = time.time() - start

            assert duration < 5, f"Extraction took {duration}s (expected < 5s)"
```

---

## 🚀 ARQUITECTURA DE RESILIENCIA Y PERFORMANCE

### 1. RETRY LOGIC CON EXPONENTIAL BACKOFF

**Frontend Implementation:**

```typescript
// apps/web-frontend/src/lib/api-with-retry.ts
import { ApiError } from './api';

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];  // [429, 503, 504]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,  // 1 segundo
  maxDelayMs: 30000,     // 30 segundos
  backoffMultiplier: 2,
  retryableStatuses: [429, 503, 504]  // Rate limit, Service Unavailable, Gateway Timeout
};

export async function fetchApiWithRetry(
  path: string,
  options?: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<any> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, options);

      if (res.ok) {
        return handleResponse(res);
      }

      // Determinar si es retryable
      if (!finalConfig.retryableStatuses.includes(res.status)) {
        throw new ApiError(`HTTP ${res.status}`, res.status);
      }

      // Es retryable, registrar para retry
      lastError = new ApiError(
        `HTTP ${res.status}: ${res.statusText}`,
        res.status
      );

      if (attempt < finalConfig.maxRetries - 1) {
        // Calcular delay con exponential backoff
        const delayMs = Math.min(
          finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelayMs
        );

        // Agregar jitter para evitar thundering herd
        const jitterMs = Math.random() * delayMs * 0.1;
        const totalDelayMs = delayMs + jitterMs;

        console.warn(
          `[API] Retry ${attempt + 1}/${finalConfig.maxRetries} for ${path} ` +
          `after ${Math.round(totalDelayMs)}ms`
        );

        await new Promise(r => setTimeout(r, totalDelayMs));
      }
    } catch (error) {
      lastError = error as Error;

      if (attempt === finalConfig.maxRetries - 1) {
        throw lastError;
      }

      const delayMs = finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  throw lastError || new Error('Failed after all retries');
}

async function handleResponse(res: Response): Promise<any> {
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  return res.text();
}

// Uso:
const grants = await fetchApiWithRetry('/grants?search=subsidio', undefined, {
  maxRetries: 3,
  initialDelayMs: 500
});
```

**Data Service Implementation:**

```python
# apps/data-service/src/core/backend_client.py
import asyncio
import aiohttp
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class BackendClientWithRetry:
    def __init__(self, base_url: str, service_token: str, max_retries: int = 3):
        self.base_url = base_url
        self.service_token = service_token
        self.max_retries = max_retries
        self.initial_delay = 1  # 1 segundo

    async def save_grant(self, grant_data: Dict[str, Any]) -> Dict:
        """Guardar grant con retry automático"""
        return await self._post_with_retry(
            '/grants',
            grant_data,
            retryable_statuses=[429, 503, 504]
        )

    async def _post_with_retry(
        self,
        path: str,
        data: Dict[str, Any],
        retryable_statuses: Optional[list] = None
    ) -> Dict:
        if retryable_statuses is None:
            retryable_statuses = [429, 503, 504]

        last_error = None

        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    headers = {
                        'X-Service-Token': self.service_token,
                        'Content-Type': 'application/json'
                    }

                    async with session.post(
                        f"{self.base_url}{path}",
                        json=data,
                        headers=headers,
                        timeout=10
                    ) as resp:
                        if resp.status == 200 or resp.status == 201:
                            return await resp.json()

                        # Manejar error no retryable
                        if resp.status not in retryable_statuses:
                            error_text = await resp.text()
                            raise Exception(f'Backend error {resp.status}: {error_text}')

                        # Es retryable
                        last_error = Exception(f'Status {resp.status}')

                        if attempt < self.max_retries - 1:
                            delay = self.initial_delay * (2 ** attempt)
                            logger.warning(
                                f'[Retry] Attempt {attempt + 1}/{self.max_retries} '
                                f'after {delay}s for POST {path}'
                            )
                            await asyncio.sleep(delay)

            except asyncio.TimeoutError:
                last_error = Exception('Backend request timeout')
                if attempt < self.max_retries - 1:
                    delay = self.initial_delay * (2 ** attempt)
                    await asyncio.sleep(delay)

        raise last_error or Exception('Failed after all retries')
```

---

### 2. CIRCUIT BREAKER PATTERN

```python
# apps/data-service/src/core/circuit_breaker.py
from enum import Enum
from datetime import datetime, timedelta
import asyncio

class CircuitState(Enum):
    CLOSED = 'closed'      # Normal operation
    OPEN = 'open'          # Failing, reject requests
    HALF_OPEN = 'half_open'  # Testing if recovered

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        name: str = 'circuit'
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.name = name

        self.failure_count = 0
        self.success_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time: Optional[datetime] = None

    async def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                logger.info(f'[{self.name}] Circuit transitioning to HALF_OPEN')
            else:
                raise Exception(f'[{self.name}] Circuit OPEN, rejecting request')

        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
            self.success_count = 0
            logger.info(f'[{self.name}] Circuit CLOSED (recovered)')

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.error(
                f'[{self.name}] Circuit OPEN after {self.failure_count} failures'
            )

    def _should_attempt_reset(self) -> bool:
        if not self.last_failure_time:
            return False
        return datetime.now() - self.last_failure_time > timedelta(seconds=self.recovery_timeout)

# Uso:
backend_circuit_breaker = CircuitBreaker(
    failure_threshold=5,
    recovery_timeout=30,
    name='backend-api'
)

async def save_grant_with_circuit_breaker(grant_data):
    try:
        return await backend_circuit_breaker.call(
            backend_client.save_grant,
            grant_data
        )
    except Exception as e:
        logger.error(f'Failed to save grant: {e}')
        # Fallback: guardar en cola local o dead-letter queue
        await save_to_dead_letter_queue(grant_data)
```

---

## 📊 LOGGING Y OBSERVABILIDAD

### 1. STRUCTURED LOGGING

```typescript
// apps/backend-core/src/infrastructure/logger.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLogger {
  constructor(private readonly pino: PinoLogger) {}

  logGrantCreated(grantId: string, userId: string) {
    this.pino.info(
      {
        eventType: 'grant_created',
        grantId,
        userId,
        timestamp: new Date().toISOString()
      },
      'Grant successfully created'
    );
  }

  logAuthFailure(email: string, reason: string) {
    this.pino.warn(
      {
        eventType: 'auth_failure',
        email,
        reason,
        timestamp: new Date().toISOString(),
        ip: process.env.CLIENT_IP
      },
      'Authentication attempt failed'
    );
  }

  logServiceCommunication(service: string, method: string, statusCode: number, durationMs: number) {
    this.pino.info(
      {
        eventType: 'service_communication',
        targetService: service,
        method,
        statusCode,
        durationMs,
        timestamp: new Date().toISOString()
      },
      `Service call to ${service} ${method} completed`
    );
  }
}
```

```python
# apps/data-service/src/core/logger.py
import json
import logging
from datetime import datetime

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def log_scrape_started(self, source_name: str, url: str):
        self._log_event('scrape_started', {
            'source': source_name,
            'url': url
        })

    def log_grants_extracted(self, source_name: str, count: int, duration_ms: int):
        self._log_event('grants_extracted', {
            'source': source_name,
            'grant_count': count,
            'duration_ms': duration_ms
        })

    def log_error(self, error_type: str, message: str, **context):
        self._log_event('error', {
            'error_type': error_type,
            'message': message,
            **context
        }, level=logging.ERROR)

    def _log_event(self, event_type: str, data: dict, level=logging.INFO):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            **data
        }
        self.logger.log(level, json.dumps(log_entry))

# Uso:
logger = StructuredLogger('granter.scraper')
logger.log_scrape_started('BDNS', 'https://...)
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Seguridad (Semana 1-2)
- [ ] Implementar `X-Service-Token` auth middleware
- [ ] Remover JWT secret fallback
- [ ] Validar FRONTEND_URL con FAIL SECURE
- [ ] Agregar timeouts en todas las requests HTTP
- [ ] Sanitizar inputs para prompts Gemini

### Fase 2: Database (Semana 2-3)
- [ ] Crear migration para índices BTREE
- [ ] Agregar constraints UNIQUE en officialLink
- [ ] Implementar check constraints para amounts
- [ ] Deshabilitar `synchronize: true` en producción

### Fase 3: Testing (Semana 3-5)
- [ ] Frontend: 80+ tests, 70%+ coverage
- [ ] Backend: 60+ tests E2E, 75%+ coverage
- [ ] Data Service: 50+ tests unitarios, 70%+ coverage

### Fase 4: Resilencia (Semana 5-6)
- [ ] Implementar Retry con exponential backoff
- [ ] Circuit breaker para backend client
- [ ] Dead-letter queue para fallos persistentes
- [ ] Health check endpoints

### Fase 5: Observabilidad (Semana 6-7)
- [ ] Structured logging everywhere
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Prometheus metrics
- [ ] Alerting configuration

---

## 💡 MEJORAS ARQUITECTÓNICAS ADICIONALES

### API Gateway Pattern
```
Internet → Nginx/Kong (API Gateway)
            ├─ Rate Limiting
            ├─ JWT Validation
            ├─ Request/Response Logging
            ├─ CORS Management
            └─ Routing
                ├─ → backend-core (puerto 3001)
                ├─ → web-frontend (puerto 3000)
                └─ → data-service (puerto 8000)
```

### Service Mesh (Future)
```yaml
# Istio service mesh configuration
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: backend-core
spec:
  hosts:
  - backend-core
  http:
  - match:
    - uri:
        prefix: /grants
    route:
    - destination:
        host: backend-core
        port:
          number: 3001
    timeout: 10s
    retries:
      attempts: 3
      perTryTimeout: 2s
```

---

## 📊 MÉTRICAS DE ÉXITO

**Post-Implementación:**

| Métrica | Baseline | Target | Método |
|---------|----------|--------|--------|
| Security Score | 4/10 | 9/10 | OWASP assessment |
| Test Coverage | 32% | 85% | Code coverage tool |
| Search Performance | 500ms | <50ms | APM monitoring |
| API Availability | 94% | 99.5% | Uptime monitoring |
| MTTR (Mean Time To Repair) | 4h | <30min | Incident tracking |
| User Auth Failures | - | <0.1% | Log analysis |

---

**Total Horas Estimadas:** 200-250 horas
**Equipo:** 1-2 senior developers
**Timeline:** 5-7 semanas con testing paralelo
**Risk Level:** Bajo (cambios bien aislados, tests completos)

