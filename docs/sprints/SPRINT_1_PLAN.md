# 🔐 SPRINT 1 PLAN - MVP Auth & Security

**Duration:** 5 días (Lunes-Viernes) | **Team:** 2 devs | **Hours:** 40 | **Status:** Critical Path

---

## 📊 Sprint Overview

```
Sprint Goal: JWT (FAIL SECURE) + Auth inter-servicio + Class validators + Testing
Duration: 5 días (8h/día)
Team: Frontend Dev (auth flow, components) + Backend Dev (JWT, guards, DTOs)
Success Criteria: End-to-end login, JWT validated, 100% auth coverage
```

---

## LUNES: JWT Implementation & Password Security

### Task S1-D1-1: JwtStrategy Implementation (8:00-11:00)

**MCP Assignment:** `claude-bridge` + Sonnet (Security-critical)
**Tokens Est.:** ~4,000 (code + tests required)

**Task Details:**
```
├─ Implement JwtStrategy extends PassportStrategy
├─ FAIL SECURE: Throw error if JWT_SECRET < 32 chars
├─ Verify payload: sub, email, exp, iat
├─ NO fallback to default secret
└─ Comprehensive error handling
```

**Code Location:** `apps/backend-core/src/auth/strategies/jwt.strategy.ts`

**Checklist:**
- [ ] JwtStrategy class created
- [ ] Constructor validates JWT_SECRET (throw if missing/short)
- [ ] extractJwtFromHeader() method
- [ ] validate(payload) method
- [ ] Payload validation (all required fields)
- [ ] UnauthorizedException on invalid payload
- [ ] Error messages are informative (not revealing secrets)

**MCP Prompt (Sonnet):**
```
Task: Implement JwtStrategy for NestJS with FAIL SECURE pattern
Requirements:
  1. Extends PassportStrategy from passport-jwt
  2. Constructor MUST validate JWT_SECRET:
     - Check if exists
     - Check if >= 32 characters
     - THROW error if missing/short (NO FALLBACK)
  3. extract JWT from Authorization header
  4. Implement validate(payload) method:
     - Verify payload has: sub (user id), email, exp, iat
     - Return { id: payload.sub, email: payload.email }
     - Throw UnauthorizedException if validation fails
  5. NO console.log() - use Logger instead

Output:
  - jwt.strategy.ts (complete implementation)
  - Include error messages

Security notes:
  - This is CRITICAL: if this fails, auth is broken
  - NEVER use 'any' type
  - All inputs validated
  - Error messages must NOT leak secrets

Token budget: 4000 max
```

**Success Criteria:**
```
✅ npm run test -- auth.service.spec.ts passes
✅ Invalid JWT rejected
✅ Expired JWT rejected
✅ Valid JWT accepted
✅ Coverage > 95%
```

---

### Task S1-D1-2: Password Hashing Service (11:00-13:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ Bcrypt hashing (12 rounds minimum)
├─ Password strength validation (12+ chars, uppercase, lowercase, number)
├─ Regex pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12,}$/
├─ Constant-time comparison
└─ Hash verification with constant-time comparison
```

**Code Location:** `apps/backend-core/src/auth/services/password.service.ts`

**Checklist:**
- [ ] hashPassword(password) → bcrypt with 12 rounds
- [ ] validatePassword(password, hash) → bcrypt.compare (constant-time)
- [ ] Password strength validation regex: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12,}$/`
  - [ ] Minimum 12 characters
  - [ ] At least one uppercase letter
  - [ ] At least one lowercase letter
  - [ ] At least one digit
- [ ] Error messages for weak passwords (e.g., "Password must contain uppercase, lowercase, and number")
- [ ] NO plain text passwords anywhere

**MCP Prompt (Sonnet):**
```
Task: Implement password service with bcrypt
Requirements:
  1. hashPassword(password: string): Promise<string>
     - Validate password strength using regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12,}$/
     - Must contain: 12+ chars, uppercase, lowercase, digit
     - Hash with bcrypt (rounds: 12)
     - Return hashed password
     - Throw BadRequestException with message: "Password must be at least 12 characters with uppercase, lowercase, and number"

  2. validatePassword(password: string, hash: string): Promise<boolean>
     - Use bcrypt.compare (constant-time)
     - Return true/false

  3. Error handling: Throw BadRequestException for weak passwords
  4. Use Logger for security events

Output: password.service.ts (complete)
Include: PasswordStrengthException, error messages, regex constant

Security notes:
  - Use bcrypt.compare for constant-time comparison
  - NEVER store plain text passwords
  - Use regex pattern exactly: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12,}$/
```

---

### Task S1-D1-3: JWT Tests (100% Coverage) (13:00-15:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,500

**Task Details:**
```
├─ Test valid JWT
├─ Test expired JWT
├─ Test invalid JWT
├─ Test missing JWT_SECRET (FAIL SECURE)
├─ Test payload validation
└─ Mock all dependencies
```

**Code Location:** `apps/backend-core/src/auth/__tests__/jwt.strategy.spec.ts`

**Test Cases:**
```typescript
describe('JwtStrategy', () => {
  // Test 1: Valid JWT accepted
  it('should validate correct JWT', async () => { ... });

  // Test 2: Expired JWT rejected
  it('should reject expired JWT', async () => { ... });

  // Test 3: Invalid signature rejected
  it('should reject invalid JWT signature', async () => { ... });

  // Test 4: Missing JWT_SECRET throws error (FAIL SECURE)
  it('should throw if JWT_SECRET missing', async () => { ... });

  // Test 5: Missing payload fields rejected
  it('should reject JWT without sub field', async () => { ... });

  // Test 6: Invalid payload structure
  it('should reject non-object payload', async () => { ... });
});
```

---

### Task S1-D1-4: Pair Programming - JWT Integration (15:30-17:30)

**MCP Assignment:** Manual code review + `gemini-bridge` for linting
**Tokens Est.:** ~2,000 (Gemini for code review = cheap!)

**Checklist:**
- [ ] JwtStrategy + PasswordService code review
- [ ] Security review:
  - [ ] No hardcoded secrets
  - [ ] No console.log()
  - [ ] Constant-time comparison used
  - [ ] All inputs validated
- [ ] Tests passing
- [ ] Coverage > 95%
- [ ] No TypeScript errors

**MCP Prompt (Gemini - cheap code review):**
```
Task: Code review for JWT security implementation
Files to review:
  - jwt.strategy.ts
  - password.service.ts
  - jwt.strategy.spec.ts

Security focus:
  1. No hardcoded secrets
  2. Constant-time comparison for tokens
  3. All inputs validated
  4. Error messages don't leak info
  5. No logging of sensitive data

Output: List of issues + severity (critical/high/medium/low)
Keep brief: < 1500 tokens
```

---

## MARTES: Auth Endpoints & Inter-Service Auth

### Task S1-D2-1: AuthService Implementation (8:00-10:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~4,000

**Task Details:**
```
├─ register(email, password) → User
├─ login(email, password) → JWT (24h expiry)
├─ validateUser(email, password) → User or throw
├─ getCurrentUser(userId) → User
└─ Dependency injection setup
```

**Code Location:** `apps/backend-core/src/auth/auth.service.ts`

**Checklist:**
- [ ] AuthService class with constructor DI
- [ ] register() method (validate, hash, save, return user)
- [ ] login() method (validate, generate JWT with expiresIn: '24h')
- [ ] validateUser() method (find, compare, return or throw)
- [ ] getCurrentUser() method (fetch from DB)
- [ ] All methods have error handling
- [ ] All methods have type hints
- [ ] JWT expiry set to 24 hours (expiresIn: '24h')

**MCP Prompt (Sonnet):**
```
Task: Implement AuthService for NestJS
Scope:
  - register(email: string, password: string): Promise<User>
    * Validate password strength using regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{12,}$/
    * Check email not duplicate (UNIQUE constraint)
    * Hash password with bcrypt (12 rounds)
    * Create user in DB
    * Return { id, email } (NO password in response)

  - login(email: string, password: string): Promise<{ accessToken: string }>
    * Call validateUser
    * Generate JWT with jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '24h' })
    * Return token with 24-hour expiry

  - validateUser(email, password): Promise<User>
    * Find user by email
    * Compare password with bcrypt (constant-time)
    * Return user if valid, throw UnauthorizedException if not

  - getCurrentUser(userId): Promise<User>
    * Fetch from DB
    * Return { id, email } (NO sensitive data)

Include:
  - Dependency injection (constructor)
  - Error handling (all methods)
  - Type safety (all params typed)
  - Logging (important events)
  - JWT expiry: 24 hours (expiresIn: '24h')

Security:
  - No console.log()
  - All errors are UnauthorizedException or BadRequestException
  - NO SQL injection (use ORM)
  - NO timing attacks (constant-time comparison)
```

---

### Task S1-D2-2: AuthController + Endpoints (10:30-12:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ POST /auth/register (public, returns JWT)
├─ POST /auth/login (public, returns JWT)
├─ GET /users/me (protected, requires JWT)
└─ Proper HTTP status codes
```

**Code Location:** `apps/backend-core/src/auth/auth.controller.ts`

**Checklist:**
- [ ] @Controller('/auth') decorator
- [ ] POST /auth/register endpoint
- [ ] POST /auth/login endpoint
- [ ] GET /users/me endpoint
- [ ] @UseGuards(JwtAuthGuard) on protected routes
- [ ] Proper status codes (201, 200, 401, 400)
- [ ] Request body validation via DTOs

---

### Task S1-D2-3: X-Service-Token Guard (12:30-14:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ Guard validates X-Service-Token header
├─ Constant-time comparison
├─ Throw ForbiddenException if invalid
└─ Apply to data-service protected routes
```

**Code Location:** `apps/backend-core/src/common/guards/x-service-token.guard.ts`

**Checklist:**
- [ ] XServiceTokenGuard implements CanActivate
- [ ] Read X-Service-Token from header
- [ ] Constant-time comparison with SERVICE_TOKEN env var
- [ ] Throw ForbiddenException if invalid
- [ ] Tests:
  - [ ] Valid token accepted
  - [ ] Invalid token rejected
  - [ ] Missing token rejected

**MCP Prompt (Sonnet):**
```
Task: Implement X-Service-Token Guard for NestJS
Requirements:
  - Implements CanActivate
  - Read header: 'X-Service-Token'
  - Compare with process.env.SERVICE_TOKEN using constant-time comparison
  - Constant-time: use crypto.timingSafeEqual or bcrypt.compare
  - NEVER use === or == for token comparison (timing attack vulnerable)
  - Throw ForbiddenException if invalid
  - Return true if valid

Output: x-service-token.guard.ts

Test cases:
  - Valid token: guard.canActivate(ctx) returns true
  - Invalid token: throws ForbiddenException
  - Missing header: throws ForbiddenException
  - Wrong header value: throws ForbiddenException
```

---

### Task S1-D2-4: X-Service-Token Tests (14:30-17:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~2,500

**Checklist:**
- [ ] Valid token test
- [ ] Invalid token test
- [ ] Missing header test
- [ ] Timing attack resistant (no timing leaks)
- [ ] Coverage > 95%

---

## MIÉRCOLES: DTOs & Validation Pipeline

### Task S1-D3-1: DTO Classes with Validators (8:00-10:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,500

**Task Details:**
```
├─ CreateUserDTO (@IsEmail, @MinLength, @Matches)
├─ CreateGrantDTO (@IsString, @IsNumber, @IsISO8601, @IsEnum)
├─ CreateSourceDTO (@IsUrl, @IsString)
└─ Global validation rules in each DTO
```

**Code Location:** `apps/backend-core/src/auth/dto/` + `src/grants/dto/` + etc.

**Checklist:**
- [ ] RegisterDTO: email (email), password (min 12, regex)
- [ ] LoginDTO: email, password
- [ ] CreateGrantDTO: title, description, amount, deadline, region
- [ ] CreateSourceDTO: name, url, region
- [ ] All use class-validator decorators
- [ ] All have proper error messages
- [ ] No `any` types

**MCP Prompt (Sonnet):**
```
Task: Generate DTO classes with class-validator decorators
DTOs needed:
  1. RegisterDTO
     - email: @IsEmail()
     - password: @MinLength(12), @Matches(/[A-Z]/, /[a-z]/, /[0-9]/)

  2. CreateGrantDTO
     - title: @IsString(), @MinLength(5), @MaxLength(200)
     - description: @IsString()
     - amount: @IsNumber(), @Min(0)
     - deadline: @IsISO8601()
     - region: @IsEnum(['ES', 'EU', 'INT'])

  3. CreateSourceDTO
     - name: @IsString()
     - url: @IsUrl()
     - region: @IsString()

Output: All DTOs as separate files
Include: imports, decorators, error messages
```

---

### Task S1-D3-2: Global ValidationPipe Setup (10:00-11:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~2,000

**Task Details:**
```
├─ Configure ValidationPipe in app.module.ts
├─ whitelist: true (remove unknown properties)
├─ forbidNonWhitelisted: true (throw on unknown)
├─ transform: true (auto-convert types)
└─ Global apply to all routes
```

**Checklist:**
- [ ] ValidationPipe configured in app.module.ts
- [ ] Set as global pipe: app.useGlobalPipes()
- [ ] whitelist: true
- [ ] forbidNonWhitelisted: true
- [ ] transform: true
- [ ] Tests pass with validation enabled

**Code:**
```typescript
// main.ts or app.module.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  })
);
```

---

### Task S1-D3-3: DTO Validation Tests (11:30-13:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~2,500

**Test Cases:**
```
✅ Valid DTO accepts
❌ Missing required field rejects
❌ Invalid email format rejects
❌ Weak password rejects
❌ Negative amount rejects
❌ Invalid date format rejects
❌ Unknown properties removed (whitelist)
```

**Checklist:**
- [ ] Test valid RegisterDTO
- [ ] Test invalid email
- [ ] Test weak password
- [ ] Test missing fields
- [ ] Test extra fields (should be removed, no error)
- [ ] Coverage > 90%

---

### Task S1-D3-4: Database Constraints & Audit (13:30-16:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ TypeORM migrations for constraints
├─ UNIQUE(email) on users
├─ CHECK(amount > 0) on grants
├─ UNIQUE(url) on sources
├─ Audit table for changes
└─ Triggers on INSERT/UPDATE/DELETE
```

**Checklist:**
- [ ] Migration created: `CreateUserTable`
  - [ ] email UNIQUE NOT NULL
  - [ ] password_hash NOT NULL (min 60 chars check)
  - [ ] created_at DEFAULT NOW()
- [ ] Migration: `CreateGrantTable`
  - [ ] amount CHECK (amount > 0)
  - [ ] source_id FK to sources
- [ ] Migration: `CreateSourceTable`
  - [ ] url UNIQUE NOT NULL
- [ ] Audit table: `AuditLog`
- [ ] Migrations run successfully
- [ ] Constraints enforced in tests

**MCP Prompt (Sonnet):**
```
Task: Create TypeORM migrations for database constraints
Migrations:
  1. CreateUsersTable
  2. CreateGrantsTable
  3. CreateSourcesTable
  4. CreateAuditTable

Constraints:
  - users.email: UNIQUE, NOT NULL
  - users.password_hash: NOT NULL
  - grants.amount: CHECK (amount > 0)
  - grants.source_id: FK
  - sources.url: UNIQUE, NOT NULL
  - audit_log: Track all changes

Output: Migration files (TypeORM format)
```

---

## JUEVES: Frontend Auth & E2E Testing

### Task S1-D4-1: useAuth Hook Implementation (8:00-10:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ useAuth() hook for React
├─ login(email, password) → Promise<void>
├─ register(email, password) → Promise<void>
├─ logout() → void
├─ getCurrentUser() → User | null
├─ isLoading, error state
```

**Code Location:** `apps/web-frontend/src/hooks/useAuth.ts`

**Checklist:**
- [ ] Hook created with useState + useEffect
- [ ] login() calls POST /auth/login
- [ ] register() calls POST /auth/register
- [ ] JWT stored in localStorage (for now)
- [ ] logout() clears localStorage + state
- [ ] Error handling (network, validation)
- [ ] Loading state managed
- [ ] getCurrentUser() calls GET /users/me

**MCP Prompt (Sonnet):**
```
Task: Implement useAuth React hook
Requirements:
  - export function useAuth(): {
      login: (email, password) => Promise<void>
      register: (email, password) => Promise<void>
      logout: () => void
      user: User | null
      isLoading: boolean
      error: string | null
    }
  - login: POST /auth/login, store JWT in localStorage['token']
  - register: POST /auth/register, store JWT
  - logout: clear localStorage, clear state
  - getCurrentUser: GET /users/me with JWT header
  - Error handling: catch errors, set error state
  - Loading state during requests

Output: useAuth.ts hook

Note: Sprint 2 will move JWT to HttpOnly cookies
```

---

### Task S1-D4-2: LoginForm Component (10:00-12:30)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ Form with email + password inputs
├─ Client-side validation
├─ Submit to useAuth.login()
├─ Error message display
├─ Loading state (disable button)
├─ Redirect on success
```

**Code Location:** `apps/web-frontend/src/components/organisms/LoginForm/LoginForm.tsx`

**Checklist:**
- [ ] Form renders email + password fields
- [ ] Client validation (email format, password length)
- [ ] Submit button disabled during loading
- [ ] Error message displayed on failure
- [ ] Redirect to /dashboard on success
- [ ] Accessibility: labels, aria-*, proper semantic HTML

---

### Task S1-D4-3: LoginForm Tests (12:30-14:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~2,500

**Test Cases:**
```
✅ Renders form with inputs
✅ Validates email format
✅ Validates password length
✅ Calls useAuth.login() with credentials
✅ Shows loading state during submission
✅ Shows error message on failure
✅ Redirects on success
✅ Accessibility requirements met
```

---

### Task S1-D4-4: E2E Auth Flow Test (14:00-16:00)

**MCP Assignment:** `claude-bridge` + Sonnet
**Tokens Est.:** ~3,000

**Task Details:**
```
├─ End-to-end: Register → Login → Dashboard
├─ Frontend → Backend integration
├─ Database persistence
└─ JWT validation end-to-end
```

**Test File:** `apps/backend-core/test/auth.e2e-spec.ts`

**Test Cases:**
```
✅ POST /auth/register with valid data creates user
❌ POST /auth/register with duplicate email rejects
✅ POST /auth/login with valid credentials returns JWT
❌ POST /auth/login with invalid credentials rejects
✅ GET /users/me with JWT returns user
❌ GET /users/me without JWT returns 401
❌ GET /users/me with invalid JWT returns 401
```

---

## VIERNES: Integration & QA

### Task S1-D5-1: Code Review & Security Audit (8:00-10:00)

**MCP Assignment:** `gemini-bridge` (Gemini cheap for code review!)
**Tokens Est.:** ~2,500

**Files to Review:**
```
- jwt.strategy.ts
- auth.service.ts
- auth.controller.ts
- x-service-token.guard.ts
- password.service.ts
- DTOs
- useAuth hook
- LoginForm component
```

**Gemini Prompt:**
```
Task: Security code review for auth implementation
Files:
  [All auth files listed above]

Focus:
  1. No hardcoded secrets
  2. Constant-time comparison used
  3. No console.log of sensitive data
  4. All inputs validated
  5. Error messages don't leak info
  6. No timing attacks possible
  7. SQL injection prevention
  8. XSS prevention (React)

Output: Security issues + severity
Keep brief (< 2000 tokens)
```

---

### Task S1-D5-2: Coverage Validation (10:00-11:30)

**MCP Assignment:** Manual (local testing)
**Tokens Est.:** 0

**Checklist:**
- [ ] `npm run test:cov -w backend-core`
  - [ ] auth.service > 95%
  - [ ] jwt.strategy > 95%
  - [ ] password.service > 95%
  - [ ] x-service-token.guard > 95%
  - [ ] Overall > 70%
- [ ] `npm run test:coverage -w web-frontend`
  - [ ] LoginForm > 80%
  - [ ] useAuth > 90%
  - [ ] Overall > 70%

---

### Task S1-D5-3: Manual Testing Checklist (11:30-13:30)

**Checklist:**
- [ ] Register new user → user created in DB
- [ ] Login as registered user → JWT returned
- [ ] JWT stored in localStorage
- [ ] Protected endpoint without JWT → 401
- [ ] Protected endpoint with JWT → 200
- [ ] Expired JWT → 401
- [ ] Invalid JWT → 401
- [ ] Logout → JWT cleared from localStorage
- [ ] Test on mobile (responsive)

---

### Task S1-D5-4: Merge to Develop (13:30-16:00)

**MCP Assignment:** Manual (git workflow)
**Tokens Est.:** 0

**Checklist:**
- [ ] All tests passing: `npm run test`
- [ ] All linting passing: `npm run lint`
- [ ] All type-checking passing: `npm run type-check`
- [ ] Coverage > 70%: verified
- [ ] CI/CD pipeline green
- [ ] Code review approved
- [ ] PR merged to develop
- [ ] Branch deleted

---

## 📊 Daily Summary & Token Budget

| Day | Tasks | MCP Usage | Tokens Est. | Status |
|-----|-------|-----------|------------|--------|
| D1 | JWT + Password + Tests + Review | Sonnet (4x) + Gemini | ~12,500 | 🟡 |
| D2 | AuthService + Controller + XToken | Sonnet (3x) | ~10,000 | 🟡 |
| D3 | DTOs + Validation + Constraints | Sonnet (4x) | ~11,000 | 🟡 |
| D4 | useAuth + LoginForm + Tests + E2E | Sonnet (4x) | ~11,500 | 🟡 |
| D5 | Review + Coverage + Merge | Gemini (1x) + Manual | ~2,500 | 🟡 |
| **TOTAL** | **20 Tasks** | **Mostly Sonnet + Gemini** | **~47,500** | |

**Cost Optimization:**
- Haiku for simple tasks: ✅ None in Sprint 1 (all critical)
- Sonnet for complex code: ✅ 16 tasks (security-critical)
- Gemini for code review: ✅ 1 task (cheap but effective)
- Manual for final validation: ✅ 3 tasks (free, fast)

---

## 🎯 Release Gates (Sprint 1 End)

```
✅ MUST PASS:
  □ JWT implemented with FAIL SECURE
  □ X-Service-Token guard working
  □ Auth endpoints: register, login, GET /users/me
  □ DTOs with validators + ValidationPipe
  □ Tests: backend > 95%, frontend > 80%
  □ E2E: full register → login → dashboard flow
  □ Manual testing: all edge cases
  □ Security review: 0 critical issues

❌ IF ANY FAIL:
  → DO NOT proceed to Sprint 2
  → Fix immediately (auth is critical)
```

---

**Sprint 1 Complete Structure Ready!** ✅
