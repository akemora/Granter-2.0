# 🛡️ PROPUESTA: SEGURIDAD GRANTER DESDE 0
**Security-First Architecture** | 2026-01-27

---

## 📋 RESUMEN EJECUTIVO

**Principio:** Security-First, no Security-Later

GRANTER actual tiene 4 vulnerabilidades críticas que nos costaron auditoría completa. La propuesta DESDE 0 implementa seguridad en **cada capa arquitectónica**, desde el diseño hasta el deployment.

**Objetivo:** Score 9/10 en seguridad desde Sprint 1 (vs 4/10 actual).

---

## 1. AUTENTICACIÓN (JWT + Passports)

### ✅ Implementación Segura

```typescript
// 1. JWT_SECRET: FAIL SECURE (sin fallback)
// apps/backend/src/main.ts

import { ConfigService } from '@nestjs/config';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // FAIL SECURE: Si falta JWT_SECRET, crash inmediata
  const jwtSecret = config.getOrThrow<string>('JWT_SECRET');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be >= 32 characters');
  }

  // Validar que está en formato seguro (no es plaintext obvious)
  if (jwtSecret === 'secret_key_default' || jwtSecret === 'test') {
    throw new Error('JWT_SECRET uses insecure default value');
  }

  app.listen(3001);
}

// 2. JWT Module (sin fallback)
// apps/backend/src/auth/auth.module.ts

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');

        return {
          secret,
          signOptions: {
            expiresIn: '1d',
            algorithm: 'HS256',
            issuer: 'granter-api',
            audience: 'granter-web'
          },
          verifyOptions: {
            algorithms: ['HS256'],
            issuer: 'granter-api',
            audience: 'granter-web'
          }
        };
      },
      inject: [ConfigService],
    }),
    PassportModule
  ]
})
export class AuthModule {}

// 3. JWT Strategy (validación estricta)
// apps/backend/src/auth/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,  // ← IMPORTANTE: no ignorar expiración
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Validaciones obligatorias
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Validar que usuario sigue existiendo (revoke check)
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'USER',
      sessionId: payload.sessionId  // Track sessions
    };
  }
}

// 4. Password Hashing (bcrypt, 12 rounds mínimo)
// apps/backend/src/auth/auth.service.ts

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(email: string, password: string) {
    // Validar password strength
    if (password.length < 12) {
      throw new BadRequestException('Password must be >= 12 chars');
    }

    // Hash con bcrypt (12 rounds = balance seguridad/performance)
    const hashedPassword = await bcrypt.hash(password, 12);

    return this.userService.create({
      email,
      password: hashedPassword  // Store hash, NEVER plaintext
    });
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    // Constant-time comparison (previene timing attacks)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar JWT con claims seguros
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: crypto.randomUUID(),
      iat: Date.now(),
      exp: Date.now() + 86400000  // 1 día
    });

    return { access_token: token };
  }

  async refresh(oldToken: string) {
    // Validar que el token viejo existe en lista de revoke
    if (await this.tokenBlacklist.has(oldToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const decoded = this.jwtService.verify(oldToken);
    const newToken = this.jwtService.sign({...decoded, iat: Date.now()});

    // Agregar oldToken a blacklist
    await this.tokenBlacklist.add(oldToken, 86400);  // 1 día TTL

    return { access_token: newToken };
  }
}
```

---

## 2. INTER-SERVICE AUTHENTICATION

### ✅ Service-to-Service Auth (X-Service-Token)

```typescript
// Backend → Data-Service: Auth con X-Service-Token

// 1. Guard en Backend (valida que solo data-service puede llamar)
// apps/backend/src/auth/service.guard.ts

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-service-token'];

    if (!token) {
      throw new UnauthorizedException('X-Service-Token header missing');
    }

    const expectedToken = this.configService.getOrThrow('DATA_SERVICE_TOKEN');

    // Constant-time comparison (previene timing attacks)
    const isValid = this.constantTimeCompare(token, expectedToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid service token');
    }

    // Log de auditoría
    this.logger.log(`Service auth OK for X-Service-Token`);
    return true;
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// 2. Aplicar guard en endpoints críticos
// apps/backend/src/grants/grants.controller.ts

@Controller('grants')
export class GrantsController {
  @Post()
  @UseGuards(ServiceAuthGuard)  // ← Solo data-service puede crear grants
  async create(@Body() dto: CreateGrantDto) {
    return this.grantsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)  // ← Usuarios deben estar autenticados
  async search(@Query() query: SearchGrantsDto) {
    return this.grantsService.search(query);
  }
}

// 3. Data-Service: Enviar token en headers
// apps/data-service/src/backend_client.py

import os
import httpx

class BackendClient:
    def __init__(self):
        self.base_url = os.getenv('BACKEND_URL', 'http://backend-core:3001')
        self.service_token = os.getenv('DATA_SERVICE_TOKEN')

        if not self.service_token:
            raise ValueError('DATA_SERVICE_TOKEN env var required')

    async def save_grant(self, grant_data: dict):
        headers = {
            'X-Service-Token': self.service_token,
            'Content-Type': 'application/json'
        }

        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/grants",
                    json=grant_data,
                    headers=headers
                )

                if response.status_code == 401:
                    raise Exception('Service token invalid or expired')

                response.raise_for_status()
                return response.json()

            except httpx.TimeoutException:
                raise Exception('Backend request timeout')
            except httpx.HTTPError as e:
                raise Exception(f'Backend error: {e}')
```

---

## 3. INPUT VALIDATION (Class-Validator + ValidationPipe)

### ✅ DTOs Seguros (No tipos, clases reales)

```typescript
// ❌ GRANTER ACTUAL: DTOs como tipos (sin validación)
type CreateGrantDto = {
  title: string;
  amount: number;
};

// ✅ PROPUESTA: DTOs como clases (con validación)
// apps/backend/src/grants/dto/create-grant.dto.ts

import {
  IsString,
  IsNumber,
  IsUrl,
  IsISO8601,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsOptional
} from 'class-validator';

export class CreateGrantDto {
  @IsString()
  @MinLength(10, { message: 'Title must be >= 10 chars' })
  @MaxLength(500)
  title!: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Amount must be >= 0' })
  @Max(1000000000)
  amount!: number;

  @IsISO8601()
  deadline!: string;  // Must be future date

  @IsUrl()
  officialLink!: string;  // Must be valid URL

  @IsString()
  sourceId!: string;
}

// ✅ Validación Global (en main.ts)
// apps/backend/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global: rechaza datos inválidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  // Rechaza campos desconocidos
      forbidNonWhitelisted: true,  // Error si hay campos extra
      transform: true,  // Transforma a tipos correcto
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,  // Para en primer error
    })
  );

  app.listen(3001);
}

// ✅ Validaciones Custom
// apps/backend/src/grants/validators/future-date.validator.ts

import { ValidatorConstraint, ValidationArguments, registerDecorator } from 'class-validator';

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
export class IsFutureDateConstraint {
  validate(value: any): boolean {
    if (!value) return false;
    const date = new Date(value);
    return date > new Date();
  }

  defaultMessage(): string {
    return 'Deadline must be in the future';
  }
}

export function IsFutureDate() {
  return function (target: any, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName,
      validator: IsFutureDateConstraint,
    });
  };
}

// Usar en DTO:
export class CreateGrantDto {
  @IsFutureDate()
  deadline!: string;
}
```

---

## 4. DATABASE SECURITY

### ✅ Constraints + Índices

```sql
-- NO permite duplicados
ALTER TABLE grants ADD CONSTRAINT unique_official_link UNIQUE (official_link);

-- NO permite amount inválido
ALTER TABLE grants ADD CONSTRAINT check_amount CHECK (amount > 0);

-- NO permite deadline pasado
ALTER TABLE grants ADD CONSTRAINT check_deadline CHECK (deadline > NOW());

-- Índices para búsqueda rápida
CREATE INDEX idx_grants_title ON grants(title);
CREATE INDEX idx_grants_source ON grants(source_id);
CREATE INDEX idx_sources_active ON sources(is_active, last_run);

-- Auditoría: track cambios
CREATE TABLE grants_audit (
  id UUID PRIMARY KEY,
  grant_id UUID NOT NULL,
  action VARCHAR(20),  -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. SECRETS MANAGEMENT

### ✅ Never in Code

```bash
# ❌ MAL: .env en git
DATABASE_URL=postgresql://admin:secretpass@localhost/granter
JWT_SECRET=my-secret-key
GEMINI_API_KEY=AIza...

# ✅ BIEN: .env.example (sin valores reales)
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=<generate: openssl rand -base64 32>
GEMINI_API_KEY=<get from Google AI Studio>
DATA_SERVICE_TOKEN=<generate: openssl rand -hex 32>

# ✅ .gitignore
.env
.env.local
*.pem
*.key
.aws/
```

### ✅ Secret Rotation

```typescript
// Servicio para rotar secrets periodicamente
@Injectable()
export class SecretRotationService {
  constructor(
    private configService: ConfigService,
    private secretManager: SecretsManagerService  // AWS Secrets Manager, Vault, etc
  ) {}

  @Cron('0 0 * * 0')  // Cada domingo
  async rotateSecrets() {
    const jwtSecret = crypto.randomBytes(32).toString('base64');

    // Guardar en secret manager (no en código)
    await this.secretManager.update('jwt-secret', jwtSecret);

    // Log de auditoría
    this.logger.log('JWT_SECRET rotated');
  }
}
```

---

## 6. API SECURITY

### ✅ Rate Limiting + CORS Seguro

```typescript
// apps/backend/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS: FAIL SECURE (sin fallback a granter.app)
  const frontendUrl = config.getOrThrow('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,  // Específico, sin fallback
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token']
  });

  // Rate Limiting (Throttler)
  app.use(
    rateLimit({
      windowMs: 60 * 1000,  // 1 minuto
      max: {
        default: 30,  // Global: 30 req/min
        login: 5,     // POST /auth/login: 5 req/min
        grants: 100,  // POST /grants: 100 req/min (data-service)
        search: 50    // GET /grants?search: 50 req/min
      },
      message: 'Too many requests, please try again later',
      standardHeaders: true,  // Return rate limit info in headers
      legacyHeaders: false,
    })
  );

  // Helmet: Security headers
  app.use(helmet());

  app.listen(3001);
}
```

---

## 7. LOGGING + AUDITORÍA

### ✅ Structured Logging (Pino)

```typescript
// apps/backend/src/main.ts

async function bootstrap() {
  const logger = new Logger('GRANTER');

  // Pino logger (structured, JSON format)
  app.useLogger(
    new PinoLogger({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: false,
          },
        },
      },
    })
  );

  // Auditoría: quién hizo qué
  app.use((req, res, next) => {
    req.userId = req.user?.id;  // Set en JWT strategy
    req.timestamp = new Date();

    logger.log({
      level: 'info',
      event: 'http_request',
      method: req.method,
      path: req.path,
      userId: req.userId,
      timestamp: req.timestamp,
      ip: req.ip
    });

    next();
  });

  app.listen(3001);
}

// Loggear auth events
@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      this.logger.warn({
        event: 'login_failure',
        email,
        reason: 'invalid_password',
        ip: this.request.ip  // Injected
      });
      throw new UnauthorizedException();
    }

    this.logger.log({
      event: 'login_success',
      userId: user.id,
      email,
      timestamp: new Date()
    });

    return this.generateToken(user);
  }
}
```

---

## 8. SECURITY TESTING

### ✅ Tests de Seguridad

```typescript
// apps/backend/test/security.e2e-spec.ts

describe('Security Tests', () => {
  describe('JWT', () => {
    it('should reject invalid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/grants')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject expired JWT', async () => {
      const expiredToken = jwt.sign(
        { sub: '1', email: 'test@test.com' },
        secret,
        { expiresIn: '0s' }
      );

      await new Promise(r => setTimeout(r, 1000));

      const response = await request(app.getHttpServer())
        .get('/grants')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('should reject invalid amount', async () => {
      const response = await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', serviceToken)
        .send({ title: 'Test', amount: -1000 })
        .expect(400);

      expect(response.body.message).toContain('Amount must be >= 0');
    });

    it('should reject past deadline', async () => {
      const response = await request(app.getHttpServer())
        .post('/grants')
        .set('X-Service-Token', serviceToken)
        .send({
          title: 'Test',
          amount: 1000,
          deadline: '2020-01-01'
        })
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on login', async () => {
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });

        if (i < 5) {
          expect([401, 400]).toContain(response.status);
        } else {
          expect(response.status).toBe(429);  // Too Many Requests
        }
      }
    });
  });
});
```

---

## 📋 SECURITY CHECKLIST (Sprint 0-1)

### Pre-Development
- [ ] Generar JWT_SECRET seguro: `openssl rand -base64 32`
- [ ] Generar DATA_SERVICE_TOKEN: `openssl rand -hex 32`
- [ ] Crear .env.example sin valores reales
- [ ] Setup Secret Manager (AWS/Vault/K8s)

### Development
- [ ] JWT module SIN fallback
- [ ] Class validators en todos los DTOs
- [ ] ValidationPipe global en main.ts
- [ ] Service auth guard en endpoints inter-servicio
- [ ] Rate limiting configurado
- [ ] CORS específico (sin fallback a dominio)
- [ ] Password hashing bcrypt 12 rounds mínimo
- [ ] Structured logging (Pino)
- [ ] Auditoría en entidades críticas

### Testing
- [ ] Tests de JWT (valido, inválido, expirado)
- [ ] Tests de validación (DTOs rechazados)
- [ ] Tests de auth (login, logout, refresh)
- [ ] Tests de rate limiting
- [ ] Security scan en CI/CD (npm audit, pip-audit)

### Pre-Production
- [ ] Secrets rotados desde secret manager
- [ ] HTTPS enforced
- [ ] HSTS headers
- [ ] CSP (Content Security Policy)
- [ ] Penetration testing (si es posible)

---

**Score esperado:** 9/10 en seguridad desde Sprint 1.

