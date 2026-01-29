# 📋 SPRINT 4 - DEPLOYMENT RUNBOOK
**Task: S4-D4-1** | **Assigned: SONNET** | **Final Deployment Guide**

---

## 🚀 PRODUCTION DEPLOYMENT PROCEDURE

Reference: See `DEPLOYMENT.md` in repo root for CI/CD flow and migration strategy.

### PRE-DEPLOYMENT CHECKLIST (13:00 - 2 hours before)

```
Checklist (Must complete ALL before proceeding):

[ ] 1. Database Backup
      - Full backup taken
      - Backup verified & downloadable
      - Backup time: ___________

[ ] 2. Infrastructure Check
      - All services healthy
      - Monitoring enabled
      - Logging operational
      - Alerts configured

[ ] 3. Team Coordination
      - All team members online
      - Video call active
      - Communication channel ready
      - Escalation contacts confirmed

[ ] 4. Final Code Verification
      - Latest code pulled
      - All tests passing
      - No uncommitted changes
      - Version tag ready

[ ] 5. Environment Validation
      - Staging deployment successful
      - Staging smoke tests passed
      - Production secrets ready
      - Database migration scripts ready

[ ] 6. Rollback Preparation
      - Rollback scripts prepared
      - Previous version identified
      - Rollback tested (on staging)
      - Estimated rollback time: 15 minutes

[ ] 7. Monitoring & Alerting
      - Dashboards prepared
      - Alert thresholds set
      - On-call staff ready
      - Error rate baseline established

[ ] 8. Load Balancer Check
      - Configuration validated
      - Health check settings correct
      - Routing rules configured
      - TLS certificates valid

Status: ☑️ ALL COMPLETE → Proceed
```

---

### DEPLOYMENT STEPS (14:00 - Deployment Start)

#### Phase 1: Pre-Deployment (14:00-14:15)

```
Step 1.1: Final Database Backup
  $ docker exec postgres pg_dump -U granter granter_db > backup-$(date +%Y%m%d-%H%M%S).sql
  ✅ Backup created and verified

Step 1.2: Notify Operations Team
  Send message: "Starting production deployment at 14:15"
  ✅ Team acknowledged

Step 1.3: Drain Existing Connections
  $ kubectl scale deployment/backend-core --replicas=0
  ✅ Wait for graceful shutdown (30 seconds)

Step 1.4: Verify No Active Connections
  $ ps aux | grep node
  ✅ No node processes running
```

#### Phase 2: Database Migration (14:15-14:25)

```
Step 2.1: Run Pending Migrations
  $ npm run migration:run -- --env=production
  ✅ Migrations execute without errors

  Expected output:
  ✅ Migration 20260127000050 complete
  ✅ Migration 20260127000100 complete
  ✅ Migration 20260127000200 complete
  ✅ Migration 20260127000300 complete
  ✅ Migration 20260127000400 complete
  ✅ Migration 20260128001000 complete

Step 2.2: Verify Migration Success
  $ npm run migration:status
  ✅ All migrations in "success" state

Step 2.3: Test Database Connection
  $ npm run db:health-check
  ✅ Database responding normally
```

#### Phase 3: Deploy Services (14:25-14:40)

```
Step 3.1: Deploy Backend Service
  $ kubectl set image deployment/backend-core backend-core=granter/backend-core:v2.0.0
  ✅ Image updated

Step 3.2: Wait for Rollout
  $ kubectl rollout status deployment/backend-core --timeout=5m
  ✅ Rollout complete (pods should be ready in 30-60s)

Step 3.3: Verify Backend Health
  $ curl http://backend:3001/health
  Expected: {"status":"healthy","services":{"database":"up","api":"up"}}
  ✅ Backend healthy

Step 3.4: Deploy Data Service
  $ kubectl set image deployment/data-service data-service=granter/data-service:v2.0.0
  ✅ Image updated
  $ kubectl rollout status deployment/data-service --timeout=5m
  ✅ Data service healthy

Step 3.5: Deploy Frontend
  $ kubectl set image deployment/web-frontend web-frontend=granter/web-frontend:v2.0.0
  ✅ Image updated
  $ kubectl rollout status deployment/web-frontend --timeout=5m
  ✅ Frontend healthy
```

#### Phase 4: Post-Deployment Validation (14:40-15:00)

```
Step 4.1: Run Smoke Tests
  $ npm run test:smoke

  Must pass all 5 flows:
  ✅ Auth flow (register, login)
  ✅ Search flow (query + filters)
  ✅ Scraper flow (multi-page)
  ✅ IA flow (extraction + fallback)
  ✅ Health flow (all probes)

Step 4.2: Check Logs for Errors
  $ kubectl logs -l app=backend-core --tail=50 | grep ERROR
  ✅ No ERROR level logs

Step 4.3: Verify Health Checks
  $ curl http://frontend.example.com/health
  $ curl http://api.example.com/health
  ✅ All services returning HTTP 200

Step 4.4: Spot Check Critical Endpoints
  $ curl -H "Authorization: Bearer {token}" http://api.example.com/auth/me
  ✅ Returns user data (HTTP 200)

  $ curl http://api.example.com/search?query=test
  ✅ Returns search results (HTTP 200)

  $ curl http://api.example.com/health
  ✅ Returns health data (HTTP 200)

Step 4.5: Monitor Error Rate
  Check dashboard: Error Rate should be < 0.1%
  ✅ Error rate normal
```

---

### MONITORING PHASE (15:00 - Next 4 hours)

```
Monitoring Checklist:

[ ] First 30 minutes (15:00-15:30)
    - Monitor every 5 minutes
    - Check application logs
    - Watch error rate dashboard
    - Watch latency dashboard

[ ] Second 30 minutes (15:30-16:00)
    - Monitor every 10 minutes
    - Check user logins working
    - Check search functionality
    - Check no spike in errors

[ ] Hours 2-4 (16:00-19:00)
    - Monitor every 30 minutes
    - Check database performance
    - Check API response times
    - Verify all systems stable

Key Metrics to Watch:
  - Error rate: < 0.1%
  - API response time: < 200ms (p95)
  - Database query time: < 100ms
  - Memory usage: stable
  - CPU usage: < 70%
  - Active connections: < 100
```

---

### ROLLBACK PROCEDURE (If Issues Found)

```
⛔ Only if critical issues (> 1% error rate or core functionality broken)

Step 1: Notify Team
  Send message: "ROLLBACK IN PROGRESS"

Step 2: Scale Down New Deployment
  $ kubectl scale deployment/backend-core --replicas=0
  $ kubectl scale deployment/web-frontend --replicas=0
  $ kubectl scale deployment/data-service --replicas=0

Step 3: Rollback Database (If Needed)
  $ kubectl scale deployment/backend-core --replicas=0 (already done)
  $ psql granter_db < backup-20260303-140000.sql
  ✅ Database restored

Step 4: Restore Previous Version
  $ kubectl set image deployment/backend-core backend-core=granter/backend-core:v1.9.0
  $ kubectl set image deployment/data-service data-service=granter/data-service:v1.9.0
  $ kubectl set image deployment/web-frontend web-frontend=granter/web-frontend:v1.9.0

Step 5: Verify Rollback
  $ kubectl rollout status deployment/backend-core --timeout=5m
  $ kubectl rollout status deployment/web-frontend --timeout=5m
  $ kubectl rollout status deployment/data-service --timeout=5m

Step 6: Run Smoke Tests
  $ npm run test:smoke
  ✅ All tests should pass on previous version

Step 7: Notify Stakeholders
  Send message: "ROLLBACK COMPLETE - System stable on v1.9.0"
  Escalate for post-mortem analysis
```

---

## 🕒 TIMELINE SUMMARY

```
13:00 - Pre-deployment checklist (2 hours)
14:00 - Begin deployment
  14:00-14:15  Phase 1: Pre-deployment
  14:15-14:25  Phase 2: Database migration
  14:25-14:40  Phase 3: Deploy services
  14:40-15:00  Phase 4: Validation
15:00 - Begin 4-hour monitoring
  15:00-15:30  First 30 min (intensive)
  15:30-16:00  Second 30 min (intensive)
  16:00-19:00  Hours 2-4 (standard)
19:00 - Deployment complete, go-live confirmed
```

---

## ✅ SUCCESS CRITERIA

```
Deployment is SUCCESSFUL if:

✅ All services deployed without errors
✅ Database migrations completed
✅ All health checks passing
✅ All 5 smoke tests passing
✅ Error rate < 0.1%
✅ No critical alerts triggered
✅ Users can register/login
✅ Users can search grants
✅ All API endpoints responding
✅ No SQL errors in logs
✅ Monitoring shows stable metrics

If ALL above are true → GO-LIVE APPROVED ✅
```

---

## 📞 ESCALATION CONTACTS

```
On-call Engineer:        [Name] [Phone]
Tech Lead:              [Name] [Phone]
Database Admin:         [Name] [Phone]
Infrastructure Lead:    [Name] [Phone]
Product Manager:        [Name] [Phone]
Executive Sponsor:      [Name] [Phone]
```

---

**Status:** Deployment Runbook READY ✅
**Task:** S4-D4-1 (Deployment Runbook) - DONE
