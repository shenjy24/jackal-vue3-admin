#!/bin/bash

# ========================================
# jackal-vue3-admin 联网环境停止脚本
# 功能：读取 app.env -> Docker Compose 停止并移除前端容器
# ========================================

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ----- 加载环境配置 -----
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/app.env}"
if [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi

# ----- 默认值 -----
APP_NAME="${APP_NAME:-jackal-vue3-admin}"
ENV="${ENV:-prod}"
APP_PORT="${APP_PORT:-18080}"
APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"

export APP_CONTAINER_NAME APP_PORT

# ----- 颜色输出 -----
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if ! command -v docker &>/dev/null; then
    log_error "未安装 Docker，请先安装 Docker"
    exit 1
fi

if ! docker compose version &>/dev/null; then
    log_error "未检测到 Docker Compose v2，请先安装或升级 Docker Compose"
    exit 1
fi

log_info "停止容器: $APP_CONTAINER_NAME"
docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" down || {
    log_error "Docker Compose 停止失败"
    exit 1
}

log_info "停止完成: $APP_CONTAINER_NAME"
