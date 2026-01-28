# 📝 CONVENTIONS.md - Backend Code Style Guide

**For GRANTER v2 Backend (NestJS + Python)** | Effective: Feb 3, 2026 | v1.0

---

## 📋 Table of Contents

1. [General Principles](#general-principles)
2. [NestJS Conventions](#nestjs-conventions)
3. [Python Conventions](#python-conventions)
4. [Database Conventions](#database-conventions)
5. [API Conventions](#api-conventions)
6. [Testing Conventions](#testing-conventions)
7. [Security Conventions](#security-conventions)
8. [File Organization](#file-organization)

---

## 🎯 General Principles

### Consistency Over Cleverness
```
✅ DO:
   - Write code that's easy to understand
   - Use clear naming conventions
   - Follow the pattern others have used

❌ DON'T:
   - Write clever one-liners if they're hard to read
   - Invent new patterns
   - Deviate from established conventions
```

### DRY (Don't Repeat Yourself)
```
✅ DO:
   - Extract common logic to shared functions
   - Create utility modules for repeated code
   - Use base classes for common patterns

❌ DON'T:
   - Copy-paste code across files
   - Duplicate logic in multiple services
```

### SOLID Principles
```
Single Responsibility:
   - One class = One responsibility
   - Services handle business logic
   - Controllers handle HTTP
   - Guards handle authorization

Open/Closed:
   - Open for extension, closed for modification
   - Use inheritance/composition

Liskov Substitution:
   - Subtypes must be substitutable

Interface Segregation:
   - Many specific interfaces > One general interface

Dependency Inversion:
   - Depend on abstractions, not implementations
```

---

## 🏗️ NestJS Conventions

### File Naming

```
✅ Pattern: [feature].[type].ts

Controllers:    users.controller.ts
Services:       users.service.ts
Modules:        users.module.ts
DTOs:          create-user.dto.ts
Entities:      user.entity.ts
Decorators:    custom-decorator.decorator.ts
Guards:        jwt.guard.ts
Pipes:         validation.pipe.ts
Interceptors:  logging.interceptor.ts
Middleware:    cors.middleware.ts
```

### Directory Structure

```
src/
├── auth/
│   ├── auth.controller.ts       (HTTP endpoints)
│   ├── auth.service.ts          (Business logic)
│   ├── auth.module.ts           (DI configuration)
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── jwt-payload.dto.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── service-token.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── pipes/
│   ├── interceptors/
│   └── filters/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── environment.ts
└── main.ts
```

### Class Naming

```
✅ DO:
   - Controllers: suffix with "Controller"
     Example: UsersController, AuthController

   - Services: suffix with "Service"
     Example: UsersService, AuthService

   - DTOs: suffix with "Dto"
     Example: CreateUserDto, LoginDto

   - Entities: suffix with nothing or "Entity"
     Example: User, UserEntity

   - Guards: suffix with "Guard"
     Example: JwtGuard, ServiceTokenGuard
```

### Method Naming

```
✅ DO:
   - Controllers: use HTTP verbs
     get(), post(), put(), delete(), patch()
     Example: getUser(), createUser()

   - Services: use action verbs
     create, update, delete, find, validate
     Example: createUser(), findById()

   - Validators: prefix with "is" or "validate"
     Example: isValidEmail(), validatePassword()
```

### DTO Conventions

```
✅ REQUIRED:
   - Every endpoint accepts a DTO (no raw data)
   - Use class-validator decorators
   - Use @ApiProperty for Swagger docs
   - Set validation messages

Example:

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

### Service Implementation Pattern

```typescript
// ✅ CORRECT PATTERN

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  // Get operations (multiple)
  async getAll(skip: number, take: number): Promise<User[]> {
    return this.usersRepository.find({ skip, take });
  }

  // Get operations (single)
  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Create operations
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('User already exists');

    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  // Update operations
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.getById(id); // Verify exists
    await this.usersRepository.update(id, dto);
    return this.getById(id);
  }

  // Delete operations
  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
```

### Controller Implementation Pattern

```typescript
// ✅ CORRECT PATTERN

@Controller('users')
@UseGuards(JwtGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAll(
    @Query('skip', ParseIntPipe) skip: number = 0,
    @Query('take', ParseIntPipe) take: number = 100,
  ): Promise<User[]> {
    return this.usersService.getAll(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getById(@Param('id') id: string): Promise<User> {
    return this.usersService.getById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }
}
```

### Guard Implementation Pattern

```typescript
// ✅ CORRECT PATTERN FOR SECURITY GUARDS

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn('No JWT token provided');
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('JWT validation failed', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') return null;

    return token;
  }
}
```

---

## 🐍 Python Conventions

### File Naming

```
✅ Pattern: snake_case for files

Services:      ia_service.py
Models:        scraper_model.py
Utilities:     text_utils.py
Tests:         test_ia_service.py
Config:        config.py
```

### Class Naming

```
✅ PascalCase for classes:
   - IAService
   - SmartScraper
   - GenericScraper
   - PlaywrightHelper
```

### Function/Method Naming

```
✅ snake_case for functions:
   - extract_data()
   - validate_input()
   - parse_html()
   - await_element()
```

### Python Code Style (Black + Flake8)

```
✅ DO:
   - Line length: 88 characters (Black default)
   - Use type hints
   - 4-space indentation
   - Use dataclasses for config objects
   - Use f-strings for formatting

❌ DON'T:
   - Lines > 88 characters
   - No type hints
   - 2-space indentation
   - Use % formatting
   - Use string concatenation
```

### FastAPI Service Pattern

```python
# ✅ CORRECT PATTERN

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List, Optional

app = FastAPI()

class ItemSchema(BaseModel):
    """Item response schema"""
    id: str = Field(..., description="Item ID")
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "1",
                "name": "Item",
                "price": 9.99,
            }
        }

    @validator('price')
    def validate_price(cls, v):
        if v < 0:
            raise ValueError('Price must be positive')
        return v

@app.get("/items/{item_id}", response_model=ItemSchema)
async def get_item(item_id: str):
    """Get item by ID"""
    item = await fetch_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.post("/items", response_model=ItemSchema)
async def create_item(item: ItemSchema):
    """Create new item"""
    return await save_item(item)
```

### Environment Variables

```
✅ CORRECT:
   import os
   from dotenv import load_dotenv

   load_dotenv()
   DB_HOST = os.getenv('DB_HOST', 'localhost')
   API_KEY = os.getenv('API_KEY')

   if not API_KEY:
       raise ValueError('API_KEY environment variable required')
```

---

## 🗄️ Database Conventions

### TypeORM Entity Pattern

```typescript
// ✅ CORRECT PATTERN

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('users')
@Index('idx_email', ['email'], { unique: true })
@Index('idx_created_at', ['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 128 })
  password: string; // bcrypt hash

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Index Requirements

```
✅ CREATE INDEXES FOR:
   - Primary keys (automatic)
   - Foreign keys
   - Unique columns (email, username)
   - Frequently queried columns
   - Columns used in WHERE clauses

Example:
   @Index('idx_user_email', ['email'])
   @Index('idx_grant_status', ['status'])
   @Index('idx_source_url', ['sourceUrl'], { unique: true })
```

### Migration Pattern

```typescript
// ✅ CORRECT PATTERN

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1643462400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          { columnNames: ['email'] },
          { columnNames: ['created_at'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

---

## 📡 API Conventions

### URL Naming

```
✅ DO:
   - Use plural nouns: /users, /grants, /sources
   - Use hyphens for multi-word: /api/data-services, /api/ia-results
   - Use nested resources: /users/:id/grants
   - Use query params for filtering: /grants?status=active&region=MADRID

❌ DON'T:
   - Use verbs in URLs: /getUsers, /createGrant
   - Use underscores: /get_users
   - Use singular: /user/:id
   - Use arbitrary nesting: /users/:id/grants/:grantId/details/info
```

### HTTP Status Codes

```
✅ USE:
   200 OK              - Successful GET, PUT, PATCH
   201 Created         - Successful POST
   204 No Content      - Successful DELETE
   400 Bad Request     - Invalid input (validation error)
   401 Unauthorized    - Missing/invalid authentication
   403 Forbidden       - Valid auth but insufficient permissions
   404 Not Found       - Resource doesn't exist
   409 Conflict        - Resource conflict (duplicate, etc.)
   422 Unprocessable   - Valid format but semantic error
   429 Too Many        - Rate limit exceeded
   500 Server Error    - Unexpected error
   503 Service Error   - Service temporarily unavailable
```

### Response Format

```json
// ✅ SUCCESSFUL RESPONSE (200, 201)

{
  "data": {
    "id": "uuid",
    "name": "Name",
    "email": "email@example.com"
  },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z",
    "version": "1.0"
  }
}

// ✅ ERROR RESPONSE (4xx, 5xx)

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be valid email"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z",
    "requestId": "req-uuid"
  }
}

// ✅ LIST RESPONSE (200)

{
  "data": [
    { ... },
    { ... }
  ],
  "pagination": {
    "skip": 0,
    "take": 100,
    "total": 1,234,
    "pages": 13
  },
  "meta": {
    "timestamp": "2026-01-27T10:00:00Z"
  }
}
```

---

## 🧪 Testing Conventions

### Test File Naming

```
✅ Pattern: [module].spec.ts or test_[module].py

TypeScript:  users.service.spec.ts
Python:      test_ia_service.py
```

### Jest Test Pattern

```typescript
// ✅ CORRECT PATTERN

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getById', () => {
    it('should return a user when found', async () => {
      const userId = 'test-id';
      const mockUser = { id: userId, email: 'test@example.com' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getById(userId);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### Pytest Pattern

```python
# ✅ CORRECT PATTERN

import pytest
from unittest.mock import Mock, patch
from src.services.ia_service import IAService

@pytest.fixture
def ia_service():
    return IAService(api_key='test-key')

class TestIAService:
    def test_extract_data_success(self, ia_service):
        """Test successful data extraction"""
        html = "<h1>Title</h1>"

        result = ia_service.extract_data(html)

        assert result is not None
        assert result['title'] == 'Title'

    def test_extract_data_invalid_html(self, ia_service):
        """Test extraction with invalid HTML"""
        with pytest.raises(ValueError):
            ia_service.extract_data('')

    @pytest.mark.asyncio
    async def test_async_extraction(self, ia_service):
        """Test async extraction"""
        result = await ia_service.async_extract('test')
        assert result is not None
```

### Coverage Requirements

```
✅ MINIMUM: 70% line coverage
✅ TARGET: 80%+ line coverage

Coverage breakdown:
   - 80% Unit tests (fast, isolated)
   - 15% Integration tests (database, services)
   - 5% E2E tests (full flow)

Excluded from coverage:
   - main.ts
   - Configuration files
   - Migration files
   - Type definitions
```

---

## 🔐 Security Conventions

### Password Handling

```
✅ DO:
   - Hash passwords with bcrypt (12 rounds minimum)
   - Never log passwords
   - Use environment variables for secrets
   - Implement password strength validation

❌ DON'T:
   - Store plaintext passwords
   - Use weak hashing (MD5, SHA1)
   - Hardcode secrets
   - Log sensitive data
```

### JWT Token Handling

```typescript
// ✅ CORRECT PATTERN

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

// Create JWT
const token = this.jwtService.sign(
  { userId: user.id, email: user.email },
  { expiresIn: '24h' },
);

// Validate JWT
try {
  const payload = this.jwtService.verify(token);
  // Token valid
} catch (error) {
  // Token invalid - FAIL SECURE
  throw new UnauthorizedException('Invalid token');
}

// Hash password
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);

// Compare password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### Environment Variables

```
✅ DO:
   - Use .env.example (committed)
   - Use .env (gitignored, never committed)
   - Validate required vars on startup
   - Use strong defaults

.env.example:
   JWT_SECRET=your-secret-here
   DB_HOST=localhost
   DB_PASSWORD=secure-password

❌ DON'T:
   - Commit .env file
   - Use weak defaults
   - Skip validation
```

### SQL Injection Prevention

```typescript
// ❌ WRONG (SQL Injection vulnerable)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT (Safe with parameterized queries)
const user = await this.usersRepository.findOne({
  where: { email },
});
```

---

## 📁 File Organization

### Monorepo Structure

```
GRANTER/
├── apps/
│   ├── backend-core/
│   │   ├── src/
│   │   │   ├── auth/           (Auth bounded context)
│   │   │   ├── users/          (Users bounded context)
│   │   │   ├── grants/         (Grants bounded context)
│   │   │   ├── common/         (Shared utilities)
│   │   │   ├── config/         (Configuration)
│   │   │   ├── filters/        (Exception filters)
│   │   │   └── main.ts
│   │   ├── test/               (E2E tests)
│   │   └── package.json
│   │
│   ├── web-frontend/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   ├── __tests__/
│   │   └── package.json
│   │
│   └── data-service/
│       ├── src/
│       │   ├── services/
│       │   ├── models/
│       │   ├── api/
│       │   ├── config/
│       │   └── main.py
│       ├── src/tests/
│       └── requirements.txt
│
└── packages/
    └── shared/
        ├── src/
        │   └── types/
        └── package.json
```

### Maximum File Sizes

```
✅ Guidelines:
   - Controllers: < 300 lines
   - Services: < 400 lines
   - Components: < 250 lines
   - Utils: < 200 lines

If file > limit:
   → Split into smaller files
   → Extract common logic
   → Create new sub-services
```

### Function Size

```
✅ Guidelines:
   - Keep functions < 30 lines
   - If > 30 lines, extract logic
   - Max 3 levels of indentation

Exceptions:
   - Configuration objects
   - Large data structures
   - (Request Haiku review if uncertain)
```

---

## 📊 Code Quality Tools

### NestJS/TypeScript

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testing
npm run test
npm run test:cov
npm run test:e2e

# Build
npm run build
```

### Python

```bash
# Formatting (Black)
black src/ --line-length=88

# Linting (Flake8)
flake8 src/ --max-line-length=88

# Type checking (mypy)
mypy src/

# Testing
pytest
pytest --cov=src --cov-report=html

# Package check (safety)
safety check
```

---

## ✅ Pre-Commit Checklist

Before committing code:

```
[ ] Code follows this guide
[ ] Linting passes
[ ] Tests written (> 70% coverage)
[ ] Tests passing
[ ] No hardcoded secrets
[ ] No console.log/print (except config)
[ ] No unused imports
[ ] Functions < 30 lines
[ ] Files < 400 lines
[ ] Git: git add -A && git commit -m "message"
```

---

**Questions or clarifications?** → Escalate via Orchestrator

🚀 **Keep code clean, tests strong, security tight!**
