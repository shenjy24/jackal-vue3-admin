#!/bin/bash

# ========================================
# jackal-vue3-admin 联网构建部署脚本
# 功能：git fetch 拉取最新代码 -> Docker 构建 Nginx 运行镜像 -> Docker Compose 启动容器
# 前提：宿主机已安装 Docker 和 Git，项目已 clone
# ========================================

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# ----- 加载环境配置 -----
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/deploy.env}"
if [ -f "$ENV_FILE" ]; then
    set -a
    . "$ENV_FILE"
    set +a
fi

# ----- 默认值 -----
APP_NAME="${APP_NAME:-jackal-vue3-admin}"
ENV="${ENV:-prod}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
BRANCH_NAME="${BRANCH_NAME:-main}"
NODE_IMAGE="${NODE_IMAGE:-node:24.17.0-slim}"
NGINX_IMAGE="${NGINX_IMAGE:-nginx:1.30.2-alpine}"
APP_PORT="${APP_PORT:-18080}"
IMAGE_KEEP_COUNT="${IMAGE_KEEP_COUNT:-5}"

APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"
BUILD_CONTEXT="${BUILD_CONTEXT:-$PACKAGE_ROOT/.deploy-build-context/online}"

export APP_CONTAINER_NAME APP_PORT NODE_IMAGE NGINX_IMAGE

# ----- 颜色输出 -----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ----- 前置检查 -----
check_prerequisites() {
    if ! command -v docker &>/dev/null; then
        log_error "未安装 Docker，请先安装 Docker"
        exit 1
    fi

    if ! docker compose version &>/dev/null; then
        log_error "未检测到 Docker Compose v2，请先安装或升级 Docker Compose"
        exit 1
    fi

    if ! command -v git &>/dev/null; then
        log_error "未安装 Git，请先安装 Git"
        exit 1
    fi

    if [ ! -d "$PACKAGE_ROOT/.git" ]; then
        log_error "当前目录不是 Git 仓库: $PACKAGE_ROOT"
        exit 1
    fi
}

# ----- 清理临时构建上下文 -----
cleanup_build_context() {
    if [ -n "${BUILD_CONTEXT:-}" ] && [ -d "$BUILD_CONTEXT" ]; then
        case "$BUILD_CONTEXT" in
            "$PACKAGE_ROOT"/.deploy-build-context/*)
                rm -rf "$BUILD_CONTEXT"
                ;;
            *)
                log_warn "跳过构建上下文清理，路径不在预期目录: $BUILD_CONTEXT"
                ;;
        esac
    fi
}

trap cleanup_build_context EXIT

# ----- 拉取最新代码 -----
pull_code() {
    log_info "拉取最新代码..."
    cd "$PACKAGE_ROOT"

    local old_commit
    old_commit="$(git rev-parse --short HEAD)"
    log_info "当前提交: $old_commit"

    git fetch --prune "$GIT_REMOTE" 2>&1 | while IFS= read -r line; do
        echo "  $line"
    done

    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        git checkout "$BRANCH_NAME"
    else
        git checkout -b "$BRANCH_NAME" "$GIT_REMOTE/$BRANCH_NAME"
    fi

    git merge --ff-only "$GIT_REMOTE/$BRANCH_NAME" || {
        log_error "快进合并失败，请手动处理冲突"
        log_info "建议: git pull $GIT_REMOTE $BRANCH_NAME"
        exit 1
    }

    local new_commit
    new_commit="$(git rev-parse --short HEAD)"
    GIT_COMMIT="$new_commit"
    log_info "构建提交: $GIT_COMMIT"
}

# ----- 准备 Docker 构建上下文 -----
prepare_build_context() {
    log_info "准备 Docker 构建上下文: $BUILD_CONTEXT"

    case "$BUILD_CONTEXT" in
        "$PACKAGE_ROOT"/.deploy-build-context/*) ;;
        *)
            log_error "构建上下文必须位于 $PACKAGE_ROOT/.deploy-build-context 下: $BUILD_CONTEXT"
            exit 1
            ;;
    esac

    rm -rf "$BUILD_CONTEXT"
    mkdir -p "$BUILD_CONTEXT"

    cd "$PACKAGE_ROOT"

    cp -a package.json package-lock.json index.html vite.config.js tsconfig.json env.d.ts "$BUILD_CONTEXT/"
    cp -a src "$BUILD_CONTEXT/src"

    if [ -d public ]; then
        cp -a public "$BUILD_CONTEXT/public"
    fi

    if [ -f .env.production ]; then
        cp -a .env.production "$BUILD_CONTEXT/.env.production"
    fi

    cp -a "$SCRIPT_DIR/Dockerfile" "$BUILD_CONTEXT/Dockerfile"
    cp -a "$SCRIPT_DIR/nginx.conf" "$BUILD_CONTEXT/nginx.conf"

    APP_BUILD_CONTEXT="$BUILD_CONTEXT"
    APP_DOCKERFILE="Dockerfile"
    export APP_BUILD_CONTEXT APP_DOCKERFILE
}

# ----- 构建镜像 -----
build_image() {
    local image_version
    image_version="${ENV}-$(date +%Y%m%d%H%M%S)-${GIT_COMMIT:-unknown}"
    APP_IMAGE="${APP_NAME}:${image_version}"
    export APP_IMAGE

    log_info "开始 Docker 构建..."
    log_info "Node 镜像: $NODE_IMAGE"
    log_info "Nginx 镜像: $NGINX_IMAGE"
    log_info "应用镜像: $APP_IMAGE"

    prepare_build_context
}

# ----- 部署容器 -----
deploy_container() {
    log_info "启动容器: $APP_CONTAINER_NAME"
    log_info "对外端口: $APP_PORT -> 80"

    DOCKER_BUILDKIT=1 docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" up -d --build || {
        log_error "Docker Compose 启动失败"
        exit 1
    }
}

# ----- 清理历史镜像 -----
cleanup_old_images() {
    log_info "保留最新 $IMAGE_KEEP_COUNT 个 ${APP_NAME}:${ENV}-* 镜像版本..."

    mapfile -t old_image_refs < <(
        docker image ls "$APP_NAME" --format "{{.Repository}}:{{.Tag}}" \
            | awk -v env="$ENV" -v keep="$IMAGE_KEEP_COUNT" '$1 ~ ":" env "-" { count++; if (count > keep) print $1 }'
    )

    for image_ref in "${old_image_refs[@]}"; do
        docker image rm "$image_ref" || log_warn "镜像删除失败，可能仍被容器使用: $image_ref"
    done

    log_info "清理悬空镜像..."
    docker image prune -f
}

# ========================================
echo ""
echo "=========================================="
echo "  $APP_NAME - 联网容器部署"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  分支: $BRANCH_NAME"
echo "=========================================="
echo ""

check_prerequisites
pull_code
build_image
deploy_container
cleanup_old_images

echo ""
echo "=========================================="
log_info "部署完成!"
log_info "容器: $APP_CONTAINER_NAME"
log_info "镜像: ${APP_IMAGE:-unknown}"
log_info "访问端口: $APP_PORT"
echo "=========================================="
