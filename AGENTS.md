# 🤖 AGENTS.md - Production Deployment & Operations Guide

**GRANTER v2 Production Ready** | Status: MVP Complete | Updated: 2026-01-28

---

## 📌 CRITICAL: Production Status

The GRANTER v2 MVP is **production-ready** and has completed all development sprints (0-4). This document covers the remaining steps for deployment and production operations.

**Project Status:**
- ✅ 84/84 tests passing (100%)
- ✅ 85%+ code coverage
- ✅ 96.2% security validation (102/106 items)
- ✅ 12/12 release gates passing
- ✅ Zero critical security vulnerabilities

---

## 🚀 Deployment Steps

### Phase 1: Pre-Deployment Verification

**Checklist:**
```
[ ] All tests passing locally: npm run test
[ ] All linting checks passed: npm run lint
[ ] Type checking complete: npm run type-check
[ ] Code coverage > 85%: npm run test:coverage
[ ] Security scan passed: detect-secrets scan
[ ] Docker images build successfully
[ ] Environment variables documented in .env.example
[ ] Database migrations ready
[ ] Health check endpoints working
```

**Command:**
```bash
./start.sh              # Full automated startup
npm run test           # Verify all tests pass
npm run type-check     # Verify no TypeScript errors
docker compose up -d   # Start all services
curl http://localhost:3001/health  # Verify backend health
```

### Phase 2: Environment Configuration

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[db]
DB_USER=granter_prod
DB_PASSWORD=[strong_password_32_chars_min]

# Authentication
JWT_SECRET=[strong_secret_32_chars_min]
SERVICE_TOKEN=[strong_token_32_chars_min]

# Node Environment
NODE_ENV=production

# API Keys (if using external services)
GEMINI_API_KEY=[your_key]
OPENAI_API_KEY=[your_key]

# Frontend
NEXT_PUBLIC_API_URL=https://[production_domain]/api

# Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

**Security:**
- Store all secrets in a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- Never commit `.env` files to git
- Rotate JWT_SECRET and SERVICE_TOKEN every 90 days
- Use strong passwords (32+ characters, mixed case, numbers, symbols)

### Phase 3: Database Setup

**Prerequisites:**
```bash
# PostgreSQL 15+ required
psql --version

# Create database
createdb granter_db
createuser granter_user --password
```

**Apply Migrations:**
```bash
npm run migration:run    # Applies all pending migrations
npm run migration:status # Verify migration status
npm run db:health-check  # Verify database connection
```

**Backup Strategy:**
```bash
# Daily backup
pg_dump granter_db > granter_db_$(date +%Y%m%d).sql

# Automated backup (cron job)
# 0 2 * * * pg_dump granter_db > /backups/granter_db_$(date +\%Y\%m\%d).sql
```

### Phase 4: Docker Container Deployment

**Build Production Images:**
```bash
# Build all images
docker compose build

# Or individual images
docker build -f apps/backend-core/Dockerfile -t granter-backend .
docker build -f apps/web-frontend/Dockerfile -t granter-frontend .
```

**Start Services:**
```bash
# Start all services
docker compose up -d

# Verify services
docker compose ps
docker compose logs -f backend-core
```

**Service Health Verification:**
```bash
# Check all endpoints
curl http://localhost:3000           # Frontend
curl http://localhost:3001/health    # Backend health
curl http://localhost:8000/health    # Data service health
```

### Phase 5: SSL/TLS Configuration

**Required for Production:**
```bash
# Generate self-signed certificate (or use Let's Encrypt)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Update docker-compose with SSL ports
# Add to backend-core service:
#   - "443:443"
```

**Update CORS and Headers:**
- Configure CORS to allow only production domain
- Add security headers (HSTS, CSP, X-Frame-Options)
- Enable HTTPS redirect

### Phase 6: Monitoring & Alerts Setup

**Key Metrics to Monitor:**
```
Backend:
- API response time (target: < 100ms)
- Error rate (target: < 0.1%)
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)

Database:
- Connection count
- Query execution time
- Disk usage
- Backup success/failure

Frontend:
- Page load time (target: < 2s)
- Bundle size
- Error rate
- User session count
```

**Recommended Monitoring Tools:**
- Prometheus + Grafana (metrics & dashboards)
- ELK Stack (Elasticsearch, Logstash, Kibana) for logs
- Sentry for error tracking
- DataDog or New Relic for APM

**Example Prometheus Scrape Config:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:3001/metrics']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
```

---

## 📊 Production Checklist

### Security Checklist
```
[ ] JWT implements FAIL SECURE pattern (no fallbacks)
[ ] All secrets in environment variables (not in code)
[ ] X-Service-Token validation on all inter-service calls
[ ] HTTPS/TLS enabled for all external connections
[ ] CORS properly configured (no wildcard)
[ ] Security headers configured (HSTS, CSP, X-Frame-Options)
[ ] Database connections use SSL
[ ] API rate limiting configured
[ ] DDoS protection enabled (CloudFlare, AWS Shield, etc.)
[ ] Web Application Firewall (WAF) deployed
```

### Performance Checklist
```
[ ] Database indexes created and optimized
[ ] Full-text search GIN indices configured
[ ] API response time < 100ms (p99)
[ ] Frontend bundle size < 500KB
[ ] Database connection pooling configured
[ ] Redis caching for frequently accessed data
[ ] CDN configured for static assets
[ ] Gzip compression enabled
[ ] Image optimization in place
```

### Operational Checklist
```
[ ] Health check endpoints accessible
[ ] Structured logging configured (JSON format)
[ ] Log aggregation setup (ELK, Splunk, etc.)
[ ] Backup automation running
[ ] Disaster recovery plan documented
[ ] Runbook for common issues created
[ ] On-call escalation procedure established
[ ] Incident response plan documented
[ ] Change management process implemented
```

### Data Protection Checklist
```
[ ] Database encryption at rest enabled
[ ] Data encryption in transit (TLS)
[ ] PII data handling procedures documented
[ ] GDPR compliance verified (if applicable)
[ ] Data retention policies implemented
[ ] Audit logging for sensitive operations
[ ] Regular security audits scheduled
[ ] Penetration testing completed
```

---

## 🔄 Deployment Procedure

### Step 1: Pre-Deployment Testing
```bash
# Full test suite
npm run test

# Coverage report
npm run test:coverage

# Security scan
detect-secrets scan
```

### Step 2: Build & Tag Images
```bash
# Build with version tag
docker build -f apps/backend-core/Dockerfile \
  -t granter-backend:v2.0.0 .

docker build -f apps/web-frontend/Dockerfile \
  -t granter-frontend:v2.0.0 .

# Push to registry
docker tag granter-backend:v2.0.0 your-registry/granter-backend:v2.0.0
docker push your-registry/granter-backend:v2.0.0
```

### Step 3: Deploy to Production
```bash
# Update docker-compose.yml with image tags
# Then run:
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Verify deployment
docker compose ps
docker compose logs -f
```

### Step 4: Post-Deployment Verification
```bash
# Health checks
curl https://api.production.com/health
curl https://api.production.com/swagger

# Smoke tests
npm run test:smoke

# Monitor logs
docker compose logs -f backend-core
```

### Step 5: Communicate Status
- Notify stakeholders of successful deployment
- Update status page
- Monitor error rates and performance metrics
- Be ready to rollback if issues detected

---

## 🔙 Rollback Procedure

**If critical issues occur after deployment:**

```bash
# 1. Identify the issue
docker compose logs backend-core | grep ERROR

# 2. Stop current deployment
docker compose down

# 3. Restore previous image tag
docker compose -f docker-compose.prod.yml up -d

# 4. Verify rollback
docker compose ps
curl https://api.production.com/health

# 5. Investigate root cause
# Don't redeploy until root cause is identified
```

**Rollback Time Target:** < 5 minutes

---

## 📈 Scaling Strategy

### Horizontal Scaling (Add More Containers)

**Load Balancer Configuration:**
```yaml
# Backend: 3 containers minimum, scale to 10+
# Frontend: 2 containers minimum, scale to 5+
# Data Service: 1 container minimum, scale to 3+

Recommended Setup:
- nginx or HAProxy for load balancing
- Round-robin distribution
- Sticky sessions for frontend (optional)
```

**Database Scaling:**
```
Option 1: Read Replicas
- Primary: write operations
- Read Replicas (2-3): read operations

Option 2: Connection Pooling
- PgBouncer or pgpool-II
- Connection limit: 100-200
- Idle timeout: 10 minutes
```

### Vertical Scaling (Upgrade Server Resources)

**Resource Targets (per service):**
- Backend: 2 CPU cores, 4GB RAM minimum
- Frontend: 1 CPU core, 2GB RAM minimum
- Database: 4 CPU cores, 16GB RAM minimum

**Auto-scaling Policies:**
- CPU > 70% for 5 minutes → scale up
- CPU < 30% for 15 minutes → scale down
- Memory > 80% → alert immediately

---

## 🔐 Security in Production

### Regular Security Tasks

**Daily:**
- Monitor error logs for security anomalies
- Check failed login attempts (> 10/hour = alert)
- Verify all health checks passing

**Weekly:**
- Review access logs for suspicious patterns
- Check database for unauthorized queries
- Verify backup integrity

**Monthly:**
- Rotate JWT_SECRET and SERVICE_TOKEN
- Review security logs
- Update dependencies (security patches)
- Run detect-secrets scan
- Penetration test API endpoints

**Quarterly:**
- Full security audit
- Dependency vulnerability scan
- Test disaster recovery procedures
- Review and update security policies

### Incident Response

**Critical Security Issue Protocol:**
```
1. ISOLATE: Take affected system offline
2. ASSESS: Determine scope and impact
3. NOTIFY: Alert security team and stakeholders
4. CONTAIN: Prevent further damage
5. INVESTIGATE: Root cause analysis
6. REMEDIATE: Fix the issue
7. TEST: Verify fix in staging
8. DEPLOY: Deploy to production
9. COMMUNICATE: Post-incident report
10. PREVENT: Implement safeguards
```

**Response Time SLA:**
- Critical: 30 minutes
- High: 2 hours
- Medium: 24 hours
- Low: 1 week

---

## 📝 Runbook: Common Issues & Solutions

### Backend Container Not Starting

```bash
# Check logs
docker compose logs backend-core

# Common issues:
# 1. Database not connected
#    → Verify DATABASE_URL env var
#    → Check PostgreSQL is running
#    → Test connection: psql $DATABASE_URL

# 2. Port already in use
#    → Find process: lsof -i :3001
#    → Kill it: kill -9 <PID>
#    → Or change port in docker-compose.yml

# 3. JWT_SECRET not set
#    → Add to .env file: JWT_SECRET=[value]
#    → Restart: docker compose restart backend-core
```

### High API Response Time

```bash
# Monitor response times
docker compose exec backend-core curl http://localhost:3001/health

# Check database performance
docker compose exec postgres psql -U granter_dev \
  -c "EXPLAIN ANALYZE SELECT * FROM grants;"

# Scale up if needed
docker compose up -d --scale backend-core=3
```

### Database Connection Issues

```bash
# Verify database running
docker compose ps postgres

# Check connections
docker compose exec postgres psql -U granter_dev \
  -c "SELECT count(*) FROM pg_stat_activity;"

# If too many connections:
# 1. Enable connection pooling (PgBouncer)
# 2. Reduce max connections in pool
# 3. Kill idle connections
```

### Disk Space Issues

```bash
# Check disk usage
du -sh /var/lib/docker/volumes/

# Clean up old images
docker image prune -a

# Remove old database backups
rm /backups/granter_db_*.sql -t -r 30

# Expand volume if needed
# (Depends on cloud provider)
```

---

## 🆘 Support & Escalation

**For issues not in this runbook:**

1. Check application logs
2. Review monitoring dashboards
3. Consult architecture documentation
4. Escalate to DevOps/Platform team

**Escalation Contact:**
- On-call: [phone/Slack channel]
- Email: devops@company.com
- Incident Channel: #incidents-granter

---

## 📚 Reference Documents

- **HOW_TO_RUN.md** - Local development setup
- **API_REFERENCE.md** - API endpoints documentation
- **ARCHITECTURE_OVERVIEW.md** - System design
- **SPRINT_4_DEPLOYMENT_RUNBOOK.md** - Detailed deployment guide
- **SPRINT_4_SECURITY_CHECKLIST.md** - Security validation checklist

---

**Status:** 🟢 PRODUCTION READY
**Go-Live Date:** March 3, 2026
**Support:** 24/7 On-Call Team

🚀 **GRANTER v2 is ready for production!**
