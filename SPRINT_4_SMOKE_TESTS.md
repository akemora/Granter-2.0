# 🔥 SPRINT 4 - SMOKE TESTS (5 Critical Flows)
**Task: S4-D2-3** | **Assigned: SONNET** | **Manual Execution Guide**

---

## 🎯 5 CRITICAL FLOWS - MUST ALL WORK

### Flow 1: Complete User Registration & Login
**Time: 5 minutes** | **Status: ✅ READY**

```
Step 1: Open application
  → curl http://localhost:3000/
  ✅ Page loads (HTTP 200)

Step 2: Register new user
  POST /auth/register
  {
    "email": "smoketest@example.com",
    "password": "Test@Password123"
  }
  ✅ Response: HTTP 201 + JWT token

Step 3: Try login with same credentials
  POST /auth/login
  {
    "email": "smoketest@example.com",
    "password": "Test@Password123"
  }
  ✅ Response: HTTP 200 + JWT token

Step 4: Access protected endpoint
  GET /users/me
  Header: Authorization: Bearer {token}
  ✅ Response: HTTP 200 + user data
```

---

### Flow 2: Search Grants & Apply Filters
**Time: 5 minutes** | **Status: ✅ READY**

```
Step 1: Search without filters
  GET /search
  ✅ Response: HTTP 200 + grants array

Step 2: Search by query
  GET /search?query=research
  ✅ Response: HTTP 200 + filtered grants

Step 3: Search with region filter
  GET /search?regions=ES
  ✅ Response: HTTP 200 + ES grants only

Step 4: Search with combined filters
  GET /search?query=research&regions=ES&minAmount=10000
  ✅ Response: HTTP 200 + combined results

Step 5: Test pagination
  GET /search?skip=0&take=20
  GET /search?skip=20&take=20
  ✅ Response: Correct pagination data
```

---

### Flow 3: Scraper Integration
**Time: 10 minutes** | **Status: ✅ READY**

```
Step 1: Prepare test URL (must have grants-like content)
  URL: https://example-grants.com/page

Step 2: Call scraper endpoint (with JWT)
  POST /scraper/scrape
  Header: Authorization: Bearer {token}
  Body: {"url": "https://example-grants.com/page"}
  ✅ Response: HTTP 200 + scraped data

Step 3: Verify scraped grants
  - Check grants have title, description
  - Check extraction method (smart or generic)
  - Check no empty responses
  ✅ Data is valid

Step 4: Test fallback (simulate SmartScraper timeout)
  - System should fallback to GenericScraper
  ✅ Result still valid
```

---

### Flow 4: IA Extraction
**Time: 5 minutes** | **Status: ✅ READY**

```
Step 1: Prepare test HTML
  HTML with: <h1>Test Grant</h1> + description

Step 2: Call IA extraction
  POST /api/ia/extract
  Body: {
    "html": "<html>...</html>",
    "url": "https://example.com",
    "source": "Test"
  }
  ✅ Response: HTTP 200 + extracted grant data

Step 3: Verify extraction
  - title extracted
  - description extracted
  - method shows (gemini or heuristic)
  ✅ Data complete

Step 4: Test fallback
  - Send HTML that Gemini might fail on
  - Should fallback to heuristic
  ✅ Fallback works
```

---

### Flow 5: Health Checks & Monitoring
**Time: 5 minutes** | **Status: ✅ READY**

```
Step 1: Check health endpoint
  GET /health
  ✅ Response: HTTP 200
  ✅ Response includes:
     - status: "healthy"
     - timestamp: ISO date
     - uptime: seconds
     - services: {database: "up", api: "up"}

Step 2: Check readiness probe (Kubernetes)
  GET /health/ready
  ✅ Response: HTTP 200 + {"ready": true}

Step 3: Check liveness probe (Kubernetes)
  GET /health/live
  ✅ Response: HTTP 200 + {"alive": true}

Step 4: Verify memory metrics
  GET /health
  ✅ Response includes memory usage

Step 5: Check database connectivity
  - Health endpoint should show database: "up"
  ✅ Database connected
```

---

## 🚀 SMOKE TEST EXECUTION PROCEDURE

### Pre-Test Setup
```bash
# Start application
npm run start:prod

# Wait for startup
sleep 5

# Verify application is responding
curl http://localhost:3000/health
# Should return: {"status":"healthy",...}
```

### Execute Tests (Manual)
```bash
# Test 1: Auth Flow (5 min)
./scripts/smoke-tests/test-auth.sh

# Test 2: Search Flow (5 min)
./scripts/smoke-tests/test-search.sh

# Test 3: Scraper Flow (10 min)
./scripts/smoke-tests/test-scraper.sh

# Test 4: IA Flow (5 min)
./scripts/smoke-tests/test-ia.sh

# Test 5: Health Flow (5 min)
./scripts/smoke-tests/test-health.sh
```

### Post-Test Verification
```bash
# Check application logs for errors
tail -f logs/app.log
# Should have NO ERROR level messages

# Check performance metrics
GET /health
# Response time should be < 50ms

# Check database state
# All user data should persist
# All grants searchable
```

---

## 📊 SMOKE TEST RESULTS TEMPLATE

```
╔═══════════════════════════════════════════════════════╗
║          SMOKE TEST RESULTS - {DATE} {TIME}          ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Flow 1: Registration & Login                        ║
║  Status: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED               ║
║  Time: ___ minutes                                  ║
║  Notes: _________________________________           ║
║                                                       ║
║  Flow 2: Search & Filters                           ║
║  Status: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED               ║
║  Time: ___ minutes                                  ║
║  Notes: _________________________________           ║
║                                                       ║
║  Flow 3: Scraper Integration                        ║
║  Status: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED               ║
║  Time: ___ minutes                                  ║
║  Notes: _________________________________           ║
║                                                       ║
║  Flow 4: IA Extraction                              ║
║  Status: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED               ║
║  Time: ___ minutes                                  ║
║  Notes: _________________________________           ║
║                                                       ║
║  Flow 5: Health Checks                              ║
║  Status: ⬜ PASS / ⬜ FAIL / ⬜ BLOCKED               ║
║  Time: ___ minutes                                  ║
║  Notes: _________________________________           ║
║                                                       ║
║  ═══════════════════════════════════════════        ║
║  OVERALL: ⬜ ALL PASS / ⬜ SOME FAILURES            ║
║  Total Time: ___ minutes                            ║
║  Tested By: ___________                             ║
║  Date: __________                                   ║
║                                                       ║
║  ✅ GO-LIVE APPROVED / ⛔ BLOCKING ISSUES           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## ⚠️ IF TESTS FAIL

### Immediate Actions
1. **Screenshot the error**
2. **Check application logs** (`logs/app.log`)
3. **Check database logs** (if DB error)
4. **Check network** (if connectivity issue)
5. **DO NOT proceed** - fix immediately

### Common Issues & Fixes
```
Issue: HTTP 401 on /users/me
Fix: Ensure JWT token is fresh (not expired)

Issue: HTTP 500 on /search
Fix: Check database is running and connected

Issue: Scraper timeout
Fix: Check network access to test URLs

Issue: IA extraction returns error
Fix: Check HTML content meets minimum requirements

Issue: Health check returns unhealthy
Fix: Check database connectivity and services
```

---

## ✅ GO-LIVE APPROVAL

```
All 5 flows passing?
✅ YES → Proceed to deployment
❌ NO → Fix issues and retest
```

---

**Status:** Smoke Tests Framework READY ✅
**Task:** S4-D2-3 (Smoke Tests) - DONE
