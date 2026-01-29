# 📡 GRANTER 2.0 - API REFERENCE

**Version:** 2.0.0 | **Base URL:** http://localhost:3001 | **Last Updated:** 2026-01-29

---

## Authentication

Protected endpoints use an httpOnly `access_token` cookie. For non-GET requests, include the CSRF token:

```http
X-CSRF-Token: <csrf_token cookie value>
```

The `Authorization: Bearer <token>` header is still supported for service clients.

---

## Endpoints (29 Total)

### Authentication (5)
- `POST /auth/register` - Register user → Sets auth cookies
- `POST /auth/login` - Login → Sets auth cookies
- `POST /auth/refresh` - Rotate refresh token and issue new access token
- `POST /auth/logout` - Revoke refresh token and clear cookies
- `GET /auth/me` - Current user (auth required)

### Grants (5)
- `GET /grants` - List grants (paginated)
- `GET /grants/:id` - Get grant by ID
- `POST /grants` - Create grant (auth required)
- `PUT /grants/:id` - Update grant (auth required)
- `DELETE /grants/:id` - Delete grant (auth required)

### Search (1)
- `GET /search?query=...&regions=...&sectors=...&beneficiaries=...&minAmount=...&maxAmount=...&deadlineAfter=...&deadlineBefore=...&status=...&skip=0&take=20` - Search grants

### Scraper (5)
- `POST /scraper/scrape` - Scrape a URL (auth required)
- `POST /scraper/scrape-async` - Queue scrape by sourceId (service token)
- `POST /scraper/run` - Scrape all active sources (auth required)
- `POST /scraper/source/:id` - Scrape a single source (auth required)
- `GET /scraper/source/:id/logs?limit=10` - Recent scrape logs (auth required)

### Sources (6)
- `GET /sources` - List sources
- `GET /sources/:id` - Get source by ID
- `POST /sources` - Create source (auth required)
- `POST /sources/service` - Create source via service token
- `PUT /sources/:id` - Update source (auth required)
- `DELETE /sources/:id` - Delete source (auth required)

### Profile (2)
- `GET /profile` - Current user profile (auth required)
- `PUT /profile` - Update profile (auth required)

### Recommendations (1)
- `GET /recommendations?limit=10` - Personalized recommendations (auth required)

### Notifications (1)
- `GET /notifications?limit=20` - Latest notifications (auth required)

### Health (3)
- `GET /health` - Full health check
- `GET /health/ready` - Readiness probe (Kubernetes)
- `GET /health/live` - Liveness probe (Kubernetes)

---

## Response Format

### Success (HTTP 200-201)
```json
{
  "data": { /* payload */ },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### Error (HTTP 4xx-5xx)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  },
  "success": false,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

---

## Endpoint Examples

### POST /auth/register
Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "data": { "message": "Si el correo es válido, ya puedes iniciar sesión." },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```
Headers:
```
(no auth cookies set)
```

### POST /auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "data": { "id": "user-id", "email": "user@example.com" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```
Headers:
```
Set-Cookie: access_token=...; HttpOnly
Set-Cookie: refresh_token=...; HttpOnly
Set-Cookie: csrf_token=...
```

### POST /auth/refresh
Request:
```
POST /auth/refresh
```
Response:
```json
{
  "data": { "id": "user-id", "email": "user@example.com" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```
Headers:
```
Set-Cookie: access_token=...; HttpOnly
Set-Cookie: refresh_token=...; HttpOnly
Set-Cookie: csrf_token=...
```

### POST /auth/logout
Response:
```
204 No Content
```

### GET /auth/me
Response:
```json
{
  "data": { "id": "user-id", "email": "user@example.com" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /grants
Request:
```http
GET /grants?skip=0&take=20
```
Response:
```json
{
  "data": {
    "data": [{ "id": "grant-id", "title": "Grant A" }],
    "total": 1,
    "skip": 0,
    "take": 20,
    "currentPage": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false,
    "itemsOnPage": 1
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /grants/:id
Response:
```json
{
  "data": {
    "id": "grant-id",
    "title": "Grant A",
    "description": "Description",
    "region": "EU",
    "status": "open",
    "sectors": ["innovation"],
    "beneficiaries": ["startups"],
    "sourceId": "source-id"
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /grants
Request:
```json
{
  "title": "Grant A",
  "description": "Description",
  "amount": 50000,
  "deadline": "2026-12-31",
  "region": "EU",
  "status": "open",
  "sectors": ["innovation"],
  "beneficiaries": ["startups"],
  "sourceId": "source-id"
}
```
Response:
```json
{
  "data": { "id": "grant-id", "title": "Grant A", "status": "open" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### PUT /grants/:id
Request:
```json
{
  "title": "Updated Grant"
}
```
Response:
```json
{
  "data": { "id": "grant-id", "title": "Updated Grant", "status": "open" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### DELETE /grants/:id
Response:
```
204 No Content
```

### GET /search
Request:
```http
GET /search?query=research&regions=EU&sectors=innovation&beneficiaries=startups&status=open&skip=0&take=20
```
Response:
```json
{
  "data": {
    "data": [{ "id": "grant-id", "title": "Grant A" }],
    "total": 1,
    "skip": 0,
    "take": 20,
    "currentPage": 1,
    "totalPages": 1
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /scraper/scrape
Request:
```json
{ "url": "https://example.com/grants" }
```
Response:
```json
{
  "data": {
    "success": true,
    "method": "smart",
    "grantCount": 10,
    "pages": []
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /scraper/scrape-async
Request:
```json
{ "sourceId": "source-id" }
```
Response:
```json
{
  "data": {
    "taskId": "task-id",
    "sourceId": "source-id",
    "status": "queued",
    "message": "Scraping task queued for processing"
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /scraper/run
Response:
```json
{
  "data": {
    "sourcesProcessed": 2,
    "totalSaved": 5,
    "details": []
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /scraper/source/:id
Response:
```json
{
  "data": {
    "sourceId": "source-id",
    "sourceName": "Source A",
    "method": "smart",
    "success": true,
    "saved": 3,
    "grantCount": 3
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /scraper/source/:id/logs
Response:
```json
{
  "data": [
    {
      "id": "log-id",
      "status": "success",
      "result": { "method": "smart", "grantCount": 12, "savedCount": 8 },
      "timestamp": "2026-01-29T14:00:00Z"
    }
  ],
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /sources
Response:
```json
{
  "data": [{ "id": "source-id", "name": "Source A", "baseUrl": "https://example.com" }],
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /sources/:id
Response:
```json
{
  "data": { "id": "source-id", "name": "Source A" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /sources
Request:
```json
{
  "name": "Source A",
  "baseUrl": "https://example.com",
  "type": "HTML",
  "isActive": true
}
```
Response:
```json
{
  "data": { "id": "source-id", "name": "Source A" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### POST /sources/service
Request:
```json
{
  "name": "Source A",
  "baseUrl": "https://example.com",
  "type": "HTML",
  "isActive": false
}
```
Response:
```json
{
  "data": { "id": "source-id", "name": "Source A" },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### PUT /sources/:id
Request:
```json
{ "isActive": true }
```
Response:
```json
{
  "data": { "id": "source-id", "isActive": true },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### DELETE /sources/:id
Response:
```
204 No Content
```

### GET /profile
Response:
```json
{
  "data": { "id": "profile-id", "keywords": [], "regions": [] },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### PUT /profile
Request:
```json
{ "keywords": ["research"], "regions": ["EU"] }
```
Response:
```json
{
  "data": { "id": "profile-id", "keywords": ["research"], "regions": ["EU"] },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /recommendations
Response:
```json
{
  "data": [{ "grantId": "grant-id", "score": 0.92 }],
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /notifications
Response:
```json
{
  "data": [{ "id": "notification-id", "grantId": "grant-id" }],
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /health
Response:
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-29T14:00:00Z",
    "uptime": 3600,
    "services": { "database": "up", "api": "up" }
  },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /health/ready
Response:
```json
{
  "data": { "ready": true },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

### GET /health/live
Response:
```json
{
  "data": { "alive": true },
  "success": true,
  "timestamp": "2026-01-29T14:00:00Z"
}
```

---

## Key Features

- **Pagination:** skip/take parameters
- **Filtering:** region, sector, beneficiaries, amount, deadline, status
- **Rate Limiting:** planned (Phase 1)
- **Response Time:** < 200ms (p95)
- **Search Performance:** < 100ms

---

## Usage Examples

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
const { data } = await response.json();
const user = data;
```

### TypeScript/Axios
```typescript
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
});
api.interceptors.request.use(config => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];
  if (csrfToken && config.method && config.method !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
const { data } = await api.get('/search', {
  params: { query: 'research' }
});
```

---

**Status:** ✅ API Reference Updated
**Version:** 2.0.0
