#!/bin/bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/app.env}"
if [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi

APP_NAME="${APP_NAME:-jackal-vue3-admin}"
ENV="${ENV:-prod}"
APP_PORT="${APP_PORT:-18080}"
APP_MEMORY_LIMIT="${APP_MEMORY_LIMIT:-512M}"
APP_MEMORY_RESERVATION="${APP_MEMORY_RESERVATION:-256M}"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"
APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"

export APP_CONTAINER_NAME APP_PORT APP_MEMORY_LIMIT APP_MEMORY_RESERVATION

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if ! command -v docker >/dev/null 2>&1; then
    log_error "未安装 Docker，请先安装 Docker"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    log_error "未检测到 Docker Compose v2，请先安装或升级 Docker Compose"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "docker-compose.yml 不存在: $COMPOSE_FILE"
    exit 1
fi

log_info "停止容器: $APP_CONTAINER_NAME"
docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" down || {
    log_error "Docker Compose 停止失败"
    exit 1
}

log_info "停止完成: $APP_CONTAINER_NAME"
