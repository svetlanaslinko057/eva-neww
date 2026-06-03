#!/usr/bin/env bash
# =============================================================================
# EVA-X / ATLAS DevOS — One-shot bootstrap
# Sets up backend (FastAPI+MongoDB), mobile (Expo), and optionally web (CRA)
# Usage:  bash bootstrap.sh             # full stack
#         bash bootstrap.sh --no-web    # skip web build
#         bash bootstrap.sh --start     # also start supervisor services
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

NO_WEB=0
DO_START=0
for arg in "$@"; do
  case "$arg" in
    --no-web) NO_WEB=1 ;;
    --start)  DO_START=1 ;;
  esac
done

log()  { printf "\033[1;36m[bootstrap]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[bootstrap]\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m[bootstrap]\033[0m %s\n" "$*"; exit 1; }

# -------- 1. Prereqs ---------------------------------------------------------
log "Checking prerequisites..."
command -v python3 >/dev/null || fail "python3 not found"
command -v node    >/dev/null || fail "node not found"
command -v yarn    >/dev/null || fail "yarn not found (npm i -g yarn)"
command -v mongod  >/dev/null || warn "mongod not found locally (expecting external MONGO_URL)"

# -------- 2. Env files -------------------------------------------------------
log "Seeding .env from .env.example (if missing)..."
[ -f backend/.env  ] || { cp backend/.env.example  backend/.env;  log "  backend/.env  created"; }
[ -f frontend/.env ] || { cp frontend/.env.example frontend/.env; log "  frontend/.env created"; }

# -------- 3. Backend (FastAPI) ----------------------------------------------
log "Installing backend Python dependencies..."
python3 -m pip install --quiet -r backend/requirements.txt

# -------- 4. Mobile (Expo) ---------------------------------------------------
log "Installing mobile (Expo) dependencies..."
(cd frontend && yarn install --silent)

# -------- 5. Web (CRA) — optional -------------------------------------------
if [ "$NO_WEB" -eq 0 ] && [ -d web ]; then
  log "Installing web (CRA) dependencies..."
  (cd web && yarn install --silent) || warn "web install failed (non-fatal)"
fi

# -------- 6. Start services (optional) --------------------------------------
if [ "$DO_START" -eq 1 ]; then
  if command -v supervisorctl >/dev/null; then
    log "Restarting supervisor services..."
    sudo supervisorctl restart backend expo mongodb 2>/dev/null || \
      supervisorctl restart backend expo mongodb 2>/dev/null || \
      warn "supervisor restart failed"
  else
    warn "supervisorctl not available — start services manually:"
    echo "  - backend:  cd backend  && uvicorn server:app --host 0.0.0.0 --port 8001"
    echo "  - mobile:   cd frontend && yarn expo start --tunnel --port 3000"
    echo "  - web:      cd web      && yarn start"
  fi
fi

log "Bootstrap complete."
log "Smoke-test backend:  curl http://localhost:8001/api/healthz"
log "Preview frontend:    \$EXPO_PUBLIC_BACKEND_URL (or http://localhost:3000)"
