#!/usr/bin/env bash
set -euo pipefail

# ==== CONFIGURATION ==== #
# Le chemin dépend du nom de l'utilisateur sur Hostinger, ajustez-le si besoin.
APP_ROOT="$HOME/yactao-antigravity-lab/smart-building"
FRONTEND_DIR="$APP_ROOT/frontend"
BACKEND_DIR="$APP_ROOT/backend"

# ==== FONCTIONS ==== #
function log() {
  echo -e "\e[32m[DEPLOY]\e[0m $1"
}

# ==== 1️⃣ Pull latest code ==== #
log "Mise à jour du dépôt"
cd "$APP_ROOT/.."
# git pull origin main 
# Si c'est un push depuis le local vers Hostinger directement, cette étape est optionnelle 
# car le code est mis à jour par le push lui-même dans un repo non-bare ("git reset --hard" est fait par le hook ou manuellement).

# ==== 2️⃣ Installer les dépendances ==== #
log "Installation des dépendances (npm ci)"
cd "$FRONTEND_DIR"
npm ci
cd "$BACKEND_DIR"
npm ci

# ==== 3️⃣ Build production ==== #
log "Compilation du frontend (Next.js)"
cd "$FRONTEND_DIR"
npm run build

log "Compilation du backend (NestJS)"
cd "$BACKEND_DIR"
npm run build

# ==== 4️⃣ Nettoyer les dépendances runtime ==== #
log "Élagage des dépendances de production"
cd "$FRONTEND_DIR"
npm prune --production
cd "$BACKEND_DIR"
npm prune --production

# ==== 5️⃣ (Re)Démarrer les services avec pm2 ==== #
log "Redémarrage des processus pm2"
cd "$APP_ROOT"
pm2 startOrRestart ecosystem.config.cjs --env production

log "Déploiement terminé 🎉"
