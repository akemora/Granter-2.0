#!/bin/bash
set -euo pipefail

BASE_URL=${1:-http://localhost:3001}
COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT

EMAIL="smoke-$(date +%s)@test.com"
PASSWORD="TestPass123!"

log_step() {
  echo ""
  echo "==> $1"
}

log_step "1. Testing /health"
HEALTH=$(curl -sf "$BASE_URL/health")
echo "$HEALTH" | grep -q '"success":true' && echo "✓ Health OK" || exit 1

log_step "2. Testing /auth/register"
REGISTER=$(curl -sf -c "$COOKIE_JAR" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$BASE_URL/auth/register")
echo "$REGISTER" | grep -q '"success":true' && echo "✓ Register OK" || exit 1

log_step "3. Testing /auth/login"
LOGIN=$(curl -sf -c "$COOKIE_JAR" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$BASE_URL/auth/login")
echo "$LOGIN" | grep -q '"success":true' && echo "✓ Login OK" || exit 1

log_step "4. Testing /auth/me"
ME=$(curl -sf -b "$COOKIE_JAR" "$BASE_URL/auth/me")
echo "$ME" | grep -q "$EMAIL" && echo "✓ Auth/me OK" || exit 1

log_step "5. Testing /profile"
PROFILE=$(curl -sf -b "$COOKIE_JAR" "$BASE_URL/profile")
echo "$PROFILE" | grep -q '"success":true' && echo "✓ Profile OK" || exit 1

log_step "6. Testing /search"
SEARCH=$(curl -sf "$BASE_URL/search?take=5")
echo "$SEARCH" | grep -q '"success":true' && echo "✓ Search OK" || exit 1

log_step "7. Testing /grants"
GRANTS=$(curl -sf "$BASE_URL/grants?take=5")
echo "$GRANTS" | grep -q '"success":true' && echo "✓ Grants OK" || exit 1

log_step "8. Testing /sources"
SOURCES=$(curl -sf "$BASE_URL/sources?active=true")
echo "$SOURCES" | grep -q '"success":true' && echo "✓ Sources OK" || exit 1

echo ""
echo "All smoke tests passed!"
