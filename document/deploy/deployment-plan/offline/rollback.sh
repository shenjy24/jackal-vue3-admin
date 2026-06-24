#!/bin/bash

set -Eeuo pipefail

# ================= Usage =================
# Roll back to a local historical image:
#   bash rollback.sh
#   bash rollback.sh 2
#   bash rollback.sh jackal-vue3-admin:prod-20260624153000

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/deploy.env}"
if [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi

APP_NAME="${APP_NAME:-jackal-vue3-admin}"
ENV="${ENV:-prod}"
APP_PORT="${APP_PORT:-18080}"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"
APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"
TARGET_INPUT="${1:-}"

export APP_CONTAINER_NAME APP_PORT

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_prerequisites() {
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
}

load_images() {
    mapfile -t IMAGE_REFS < <(
        docker image ls "$APP_NAME" --format "{{.Repository}}:{{.Tag}}" \
            | awk -v env="$ENV" '$1 ~ ":" env "-" { print $1 }'
    )

    if [ "${#IMAGE_REFS[@]}" -eq 0 ]; then
        log_error "未找到可回滚镜像: ${APP_NAME}:${ENV}-*"
        exit 1
    fi
}

list_images() {
    local current_image=""
    if docker container inspect "$APP_CONTAINER_NAME" >/dev/null 2>&1; then
        current_image="$(docker container inspect -f '{{.Config.Image}}' "$APP_CONTAINER_NAME")"
    fi

    echo ""
    echo "可回滚镜像列表："
    echo "----------------------------------------"
    for i in "${!IMAGE_REFS[@]}"; do
        local image_ref="${IMAGE_REFS[$i]}"
        local marker=""
        if [ "$image_ref" = "$current_image" ]; then
            marker=" <- 当前镜像"
        fi
        echo -e "  ${CYAN}$((i + 1))${NC}) $image_ref$marker"
    done
    echo "----------------------------------------"
    echo ""
}

resolve_target() {
    local input="$1"
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        local idx=$((input - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#IMAGE_REFS[@]}" ]; then
            TARGET_IMAGE="${IMAGE_REFS[$idx]}"
        else
            log_error "序号超出范围: $input"
            exit 1
        fi
    else
        TARGET_IMAGE="$input"
    fi

    if ! docker image inspect "$TARGET_IMAGE" >/dev/null 2>&1; then
        log_error "目标镜像不存在: $TARGET_IMAGE"
        exit 1
    fi
}

rollback() {
    APP_IMAGE="$TARGET_IMAGE"
    export APP_IMAGE

    log_info "回滚到镜像: $APP_IMAGE"
    docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" up -d --no-build app-web

    sleep 3
    if ! docker ps --filter "name=^/${APP_CONTAINER_NAME}$" --filter "status=running" --format "{{.Names}}" | grep -qx "$APP_CONTAINER_NAME"; then
        log_error "容器未处于运行状态，请查看日志: docker logs --tail=200 $APP_CONTAINER_NAME"
        exit 1
    fi
}

echo ""
echo "=========================================="
echo "  $APP_NAME - 容器镜像回滚"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

check_prerequisites
load_images
list_images

if [ -n "$TARGET_INPUT" ]; then
    resolve_target "$TARGET_INPUT"
else
    echo -n "请输入要回滚的镜像序号或完整镜像名: "
    read -r user_input
    resolve_target "$user_input"
fi

rollback

echo ""
echo "=========================================="
log_info "回滚完成"
log_info "容器: $APP_CONTAINER_NAME"
log_info "镜像: $TARGET_IMAGE"
echo "=========================================="
