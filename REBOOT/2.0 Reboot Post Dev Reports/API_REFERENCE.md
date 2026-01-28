# 📡 GRANTER 2.0 - API REFERENCE

**Version:** 2.0.0 | **Base URL:** http://localhost:3001 | **Last Updated:** 2026-01-28

---

## Authentication

All protected endpoints require JWT:

```http
Authorization: Bearer <token>
```

---

## Endpoints (13 Total)

### Authentication (3)
- `POST /auth/register` - Register user → Returns JWT
- `POST /auth/login` - Login → Returns JWT
- `GET /users/me` - Current user (auth required)

### Grants CRUD (5)
- `GET /grants` - List grants (paginated)
- `GET /grants/:id` - Get grant by ID
- `POST /grants` - Create grant (auth required)
- `PUT /grants/:id` - Update grant (auth required)
- `DELETE /grants/:id` - Delete grant (auth required)

### Search & Scraping (3)
- `GET /search?query=...&regions=...&skip=0&take=20` - Search grants
- `POST /scraper/scrape` - Scrape website (auth required)
- `POST /scraper/scrape-async` - Async scrape (service token)

### Health (2)
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
  "timestamp": "2026-01-28T14:00:00Z"
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
  "timestamp": "2026-01-28T14:00:00Z"
}
```

---

## Key Features

- **Pagination:** skip/take parameters
- **Filtering:** region, sector, amount, deadline
- **Rate Limiting:** 100 req/15min (default)
- **Response Time:** < 200ms (p95)
- **Search Performance:** < 100ms

---

## Usage Examples

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3001/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
const { data } = await response.json();
const token = data.token;
```

### TypeScript/Axios
```typescript
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:3001'
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const { data } = await api.get('/search', {
  params: { query: 'research' }
});
```

---

**Status:** ✅ API Reference Complete
**Version:** 2.0.0 Production Ready
