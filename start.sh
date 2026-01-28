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
# 5. EJECUTAR MIGRACIONES
# ============================================================
echo "🗄️ Ejecutando migraciones de base de datos..."
echo ""

echo "Ejecutando: npm run migration:run"
npm run migration:run

echo "✅ Migraciones completadas"

echo ""

# ============================================================
# 6. VERIFICAR CONFIGURACIÓN
# ============================================================
echo "✔️ Verificando configuración..."
echo ""

echo "Ejecutando: npm run db:health-check"
npm run db:health-check

echo ""

# ============================================================
# 7. INICIAR APLICACIÓN
# ============================================================
echo "════════════════════════════════════════════════════════════"
echo "🎉 ¡LISTO PARA INICIAR!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Los servicios están configurados. Iniciando aplicación..."
echo ""
echo "📍 Acceso a la aplicación:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔌 Backend:   http://localhost:3001"
echo "   📊 Health:    http://localhost:3001/health"
echo ""
echo "Para detener los servicios:"
echo "   docker compose down"
echo ""
echo "Para ver logs:"
echo "   docker compose logs -f"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Iniciando servidor de desarrollo..."
echo ""

# Detectar el sistema operativo
OS_TYPE=$(uname -s)

# Iniciar npm dev en background
npm run dev &
DEV_PID=$!

echo ""
echo "⏳ Esperando a que la aplicación esté lista..."
sleep 10

echo ""
echo "🌐 Abriendo navegador..."
echo ""

# Abrir el navegador según el SO
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS
    open "http://localhost:3000"
elif [ "$OS_TYPE" = "Linux" ]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000"
    elif command -v gnome-open &> /dev/null; then
        gnome-open "http://localhost:3000"
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
echo "✅ Aplicación iniciada correctamente"
echo ""
echo "Para detener la aplicación:"
echo "   1. Presiona Ctrl+C en esta terminal"
echo "   2. Ejecuta: docker compose down"
echo ""

# Mantener el script corriendo
wait $DEV_PID
