# 🚀 HOW TO RUN GRANTER 2.0

**Version:** 2.0.0 | **Status:** Production Ready | **Date:** 2026-01-28

---

## ⚡ QUICK START (EASIEST)

```bash
cd "GRANTER 2.0"
./start.sh
```

The script does everything automatically and starts the application in ~5-10 minutes.

---

## 📋 WHAT YOU NEED

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Docker** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (comes with Docker)

Verify installation:
```bash
node --version    # Should be v18+
npm --version     # Should be 9+
docker --version  # Should be installed
```

---

## 🔧 THE STARTUP SCRIPT (AUTOMATED)

### What It Does

```bash
./start.sh
```

Automatically:
1. ✅ Checks prerequisites
2. ✅ Creates `.env` file (if missing)
3. ✅ Installs npm dependencies
4. ✅ Starts PostgreSQL in Docker
5. ✅ Runs database migrations
6. ✅ Starts the application

### What You See

```
════════════════════════════════════════════════════════════
🚀 GRANTER 2.0 - INICIADOR AUTOMÁTICO
════════════════════════════════════════════════════════════

📋 Verificando prerequisitos...

✅ Node.js: v18.x.x
✅ npm: 9.x.x
✅ Docker installed
✅ Docker Compose installed

⚙️ Configurando variables de entorno...
✅ Archivo .env ya existe

📦 Instalando dependencias...
✅ node_modules ya existe

🐳 Iniciando servicios Docker...
✅ PostgreSQL está corriendo

🗄️ Ejecutando migraciones de base de datos...
✅ Migraciones completadas

════════════════════════════════════════════════════════════
🎉 ¡LISTO PARA INICIAR!
════════════════════════════════════════════════════════════

📍 Acceso a la aplicación:
   🌐 Frontend:  http://localhost:3000
   🔌 Backend:   http://localhost:3001
   📊 Health:    http://localhost:3001/health

🚀 Iniciando servidor de desarrollo...
```

---

## 📖 MANUAL SETUP (IF YOU PREFER)

### Step 1: Configuration

```bash
cd "GRANTER 2.0"
cp .env.example .env

# Edit .env with your values
nano .env
```

Required variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/granter_db
JWT_SECRET=your_32_char_secret_string
NODE_ENV=development
```

Optional maintenance variables:
```env
REFRESH_TOKEN_CLEANUP_ENABLED=true
REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES=1440
REFRESH_TOKEN_RETENTION_DAYS=30
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Database

```bash
docker compose up -d
sleep 5  # Wait for PostgreSQL to start
```

### Step 4: Database Migrations

```bash
npm run migration:run
npm run db:health-check
```

### Step 5: Start Application

```bash
npm run dev
```

---

## 🌐 ACCESSING THE APP

Once running (via script or manual setup):

| What | URL |
|------|-----|
| Frontend (React UI) | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Health | http://localhost:3001/health |
| API Documentation | http://localhost:3001/swagger |

### First Use

1. Open http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Explore available grants

---

## 🛠️ USEFUL COMMANDS

### Running

```bash
./start.sh              # Easiest way - automatic startup
npm run dev             # Start all services manually
npm run dev -- --watch # Watch mode
```

### Testing

```bash
npm run test            # Run all tests
npm run test --watch    # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Code Quality

```bash
npm run lint            # Check code style
npm run type-check      # Check TypeScript
npm run format          # Format code
```

### Database

```bash
npm run migration:run      # Run migrations
npm run migration:status   # Check status
npm run db:health-check    # Check connection
```

### Docker

```bash
docker compose up -d       # Start services
docker compose down        # Stop services
docker compose logs -f     # View logs
docker ps                  # List running containers
```

---

## 🆘 TROUBLESHOOTING

### Problem: "./start.sh: permission denied"

```bash
chmod +x start.sh
./start.sh
```

### Problem: Port already in use

```bash
# Find process
lsof -i :3000    # Frontend
lsof -i :3001    # Backend
lsof -i :5432    # Database

# Kill it
kill -9 <PID>
```

### Problem: Database won't connect

```bash
# Restart Docker
docker compose down
docker compose up -d postgres
sleep 5
npm run migration:run
```

### Problem: npm install fails

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problem: Tests fail

```bash
# Run just unit tests (skip E2E)
npm run test -- --testPathIgnorePatterns='(e2e|integration)'

# See logs
npm run test -- --verbose
```

### Problem: Can't create .env file

```bash
# Create manually
cp .env.example .env

# Edit it
nano .env

# Or just edit .env.example and rename it
```

---

## ✅ VERIFY SETUP

After running the startup script:

```bash
# Check if backend is healthy
curl http://localhost:3000/health

# Should return something like:
# {
#   "status":"healthy",
#   "timestamp":"2026-01-28T14:00:00Z",
#   "uptime":100,
#   "services":{"database":"up","api":"up"}
# }
```

If you see `"status":"healthy"` - Everything works! ✅

---

## 🔄 STOPPING THE APP

```bash
# Stop npm dev server
Ctrl + C  (in terminal where npm run dev is running)

# Stop Docker services
docker compose down
```

---

## 📚 MORE INFORMATION

See these files for detailed info:

- **[README.md](./README.md)** - Project overview
- **[DEVELOPMENT_GUIDE.md](./docs/development/DEVELOPMENT_GUIDE.md)** - Development workflow
- **[API_REFERENCE.md](./docs/development/API_REFERENCE.md)** - API endpoints
- **[ARCHITECTURE_OVERVIEW.md](./docs/development/ARCHITECTURE_OVERVIEW.md)** - System design
- **[TESTING_GUIDE.md](./docs/development/TESTING_GUIDE.md)** - Testing procedures

All in: `docs/development/`

---

## 🚀 THAT'S IT!

You're ready to run GRANTER 2.0!

**Start:** `./start.sh`

**Enjoy!** 🎉
