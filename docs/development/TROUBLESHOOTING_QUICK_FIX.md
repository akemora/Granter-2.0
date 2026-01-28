# 🔧 GRANTER 2.0 - TROUBLESHOOTING QUICK FIX

**Version:** 2.0.0 | **Last Updated:** 2026-01-28

---

## Setup Issues

### ❌ npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### ❌ Node version wrong
```bash
node --version  # Need 18+
nvm install 18 && nvm use 18
```

### ❌ Port already in use (3000/3001/5432)
```bash
lsof -i :3000   # Find process
kill -9 <PID>   # Kill it
# Or change port in .env
```

---

## Database Issues

### ❌ Cannot connect to PostgreSQL
```bash
docker ps | grep postgres  # Check if running
docker logs postgres_container  # Check logs
psql $DATABASE_URL -c "SELECT version();"  # Test connection
```

### ❌ Migration fails
```bash
npm run migration:status   # Check status
npm run migration:revert   # Revert last
npm run migration:run      # Try again
```

### ❌ Database locked
```bash
docker exec postgres_container psql -U granter_user -d granter_db \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='granter_db';"
```

---

## Frontend Issues

### ❌ API requests failing (CORS)
```bash
curl http://localhost:3001/health  # Backend running?
# Check .env: REACT_APP_API_URL=http://localhost:3001
# Backend should have CORS enabled for localhost:3000
```

### ❌ React component not rendering
```bash
npm run type-check        # Type errors?
npm run lint             # Linting errors?
# Open F12 DevTools → Console for errors
```

### ❌ useGrants hook undefined
```typescript
// ✅ CORRECT: Top level
const MyComponent = () => {
  const { grants } = useGrants();
  return <div>{grants.map(g => ...)}</div>;
};

// ❌ WRONG: In condition
if (condition) {
  const { grants } = useGrants();  // Will fail
}
```

---

## Backend Issues

### ❌ Backend won't start
```bash
node --version         # Need 18+
npm ls --depth=0      # Check dependencies
npm run type-check    # TypeScript errors?
echo $JWT_SECRET      # Set? 32+ chars?
cat .env              # All variables set?
```

### ❌ 401 Unauthorized
```bash
echo $JWT_SECRET              # Set in .env?
# Must be 32+ characters
# Check token being sent in Authorization header
```

### ❌ Scraper timeout
```bash
curl https://example.com/grants  # URL valid?
# Timeouts: SmartScraper 30s, GenericScraper 15s
# Check network connectivity: ping example.com
```

---

## Testing Issues

### ❌ Tests timeout
```bash
jest.setTimeout(10000);  # Increase timeout
npm run test -- --runInBand  # Run serially
```

### ❌ Database locked in tests
```typescript
afterEach(async () => {
  await database.clearDatabase();
});
```

### ❌ Coverage too low
```bash
npm run test:coverage
open coverage/lcov-report/index.html
# Add tests for uncovered sections
```

---

## Docker Issues

### ❌ Container won't start
```bash
docker logs postgres_container  # Check logs
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### ❌ Port conflict
```yaml
# Edit docker-compose.yml
services:
  postgres:
    ports:
      - "5433:5432"  # Change port
```

---

## Performance Issues

### ❌ API slow (> 200ms)
```bash
curl http://localhost:3001/health
npm run db:health-check
docker stats  # Check resources
# Check for N+1 queries via query logs
```

### ❌ Frontend slow to load
```bash
npm run build:analyze -- --project=web-frontend
# F12 Network tab → Check file sizes
# Enable gzip compression
# Use code splitting
```

---

## Quick Health Check

```bash
# Run all checks
npm run type-check      # ✅ No type errors
npm run lint           # ✅ No linting errors
npm run test           # ✅ All tests pass
npm run db:health-check  # ✅ DB connected
curl http://localhost:3001/health  # ✅ Backend healthy
curl http://localhost:3000  # ✅ Frontend running
```

---

## If Still Stuck

1. Check TROUBLESHOOTING_FULL.md for detailed solutions
2. Slack: #granter-development
3. GitHub Issues
4. Review DEVELOPMENT.md for context

---

**Status:** ✅ Quick Fix Guide Complete
**Last Updated:** 2026-01-28
**Version:** 2.0.0
