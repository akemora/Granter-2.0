#!/bin/bash

# 🛑 GRANTER 2.0 - STOP SCRIPT
# Detiene todos los servicios Docker del proyecto.

set -e

echo "════════════════════════════════════════════════════════════"
echo "🛑 GRANTER 2.0 - DETENIENDO SERVICIOS"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "Ejecutando: docker compose down"
docker compose down

echo ""
echo "✅ Servicios detenidos."
echo ""
