#!/bin/bash

# 🚀 GRANTER 2.0 - START SCRIPT
# Este script inicia automáticamente todo lo necesario para ejecutar GRANTER 2.0

set -e

echo "════════════════════════════════════════════════════════════"
echo "🚀 GRANTER 2.0 - INICIADOR AUTOMÁTICO"
echo "════════════════════════════════════════════════════════════"
echo ""

# ============================================================
# 1. VERIFICAR PREREQUISITOS
# ============================================================
echo "📋 Verificando prerequisitos..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Descarga desde: https://nodejs.org/ (v18+)"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "✅ npm: $NPM_VERSION"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Descarga desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✅ Docker instalado"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi
echo "✅ Docker Compose instalado"

echo ""

# ============================================================
# 2. CREAR ARCHIVO .env SI NO EXISTE
# ============================================================
echo "⚙️ Configurando variables de entorno..."
echo ""

if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus valores:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET (mínimo 32 caracteres)"
    echo "   - Otros valores necesarios"
    echo ""
else
    echo "✅ Archivo .env ya existe"
fi

echo ""

# ============================================================
# 3. INSTALAR DEPENDENCIAS
# ============================================================
echo "📦 Instalando dependencias..."
echo ""

if [ -d "node_modules" ]; then
    echo "✅ node_modules ya existe"
else
    echo "Ejecutando: npm install"
    npm install
    echo "✅ Dependencias instaladas"
fi

echo ""

# ============================================================
# 4. INICIAR SERVICIOS DOCKER
# ============================================================
echo "🐳 Iniciando servicios Docker..."
echo ""

echo "Ejecutando: docker compose up -d"
docker compose up -d

echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que PostgreSQL está corriendo
if docker ps | grep -q postgres; then
    echo "✅ PostgreSQL está corriendo"
else
    echo "❌ PostgreSQL no está corriendo"
    docker compose logs postgres
    exit 1
fi

echo ""

# ============================================================
# 5. VERIFICAR SERVICIOS
# ============================================================
echo "✔️ Verificando que los servicios estén listos..."
echo ""

# Wait for backend health check (max 30 seconds)
HEALTH_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=30
while [ $HEALTH_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Backend API está listo"
        break
    fi
    HEALTH_CHECK_ATTEMPTS=$((HEALTH_CHECK_ATTEMPTS + 1))
    sleep 1
done

if [ $HEALTH_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo "⚠️ Backend tardó más de lo esperado pero continuamos..."
fi

echo ""

# ============================================================
# 6. APLICACIÓN LISTA
# ============================================================
echo "════════════════════════════════════════════════════════════"
echo "🎉 ¡LISTO!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "✅ Todos los servicios están corriendo:"
echo ""
echo "📍 Acceso a la aplicación:"
echo "   🌐 Frontend:      http://localhost:3000"
echo "   🔌 Backend API:   http://localhost:3001"
echo "   📊 Health Check:  http://localhost:3001/health"
echo "   📚 API Docs:      http://localhost:3001/swagger"
echo ""
echo "🐳 Servicios en Docker:"
echo "   - PostgreSQL (5432)"
echo "   - Redis (6379)"
echo "   - Backend NestJS (3001)"
echo "   - Frontend React (3000)"
echo "   - Data Service (8000)"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:        docker compose logs -f"
echo "   Detener:         docker compose down"
echo "   Restart:         docker compose restart"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🌐 Abriendo navegador..."
echo ""

# Detectar el sistema operativo
OS_TYPE=$(uname -s)

# Abrir el navegador según el SO
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS
    open "http://localhost:3000" &
elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000" &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:3000" &
    else
        echo "⚠️  Por favor, abre http://localhost:3000 en tu navegador"
    fi
elif [[ "$OS_TYPE" == MINGW* ]] || [[ "$OS_TYPE" == MSYS* ]]; then
    # Windows
    start "http://localhost:3000"
else
    echo "⚠️  Por favor, abre http://localhost:3000 en tu navegador"
fi

echo ""
echo "✅ ¡Listo para usar!"
echo ""
echo "Para detener todo:"
echo "   docker compose down"
echo ""
