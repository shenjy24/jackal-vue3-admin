#!/bin/bash

set -Eeuo pipefail

# ================= Usage =================
# Offline deployment only depends on this directory and an uploaded dist artifact.
# Build dist locally, upload dist or dist tarball, then run:
#   bash up.sh
#   bash up.sh dist
#   bash up.sh jackal-vue3-admin-dist.tar.gz

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

resolve_deploy_path() {
    case "$1" in
        /*) printf '%s\n' "$1" ;;
        *) printf '%s\n' "$SCRIPT_DIR/$1" ;;
    esac
}

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
NGINX_IMAGE="${NGINX_IMAGE:-nginx:1.30.2-alpine}"
DIST_DIR="$(resolve_deploy_path "${DIST_DIR:-.}")"
IMAGE_KEEP_COUNT="${IMAGE_KEEP_COUNT:-3}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-$SCRIPT_DIR/Dockerfile}"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.yml}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-$SCRIPT_DIR/nginx.conf}"
PACKAGE_INPUT="${1:-${DIST_PACKAGE:-}}"

APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-${APP_NAME}-${ENV}}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-${APP_NAME}-${ENV}}"
BUILD_TIME="$(date +%Y%m%d%H%M%S)"
APP_IMAGE="${APP_IMAGE:-${APP_NAME}:${ENV}-${BUILD_TIME}}"
BUILD_CONTEXT=""
ARCHIVE_TMP_DIR=""
RELEASE_STATE_FILE="$SCRIPT_DIR/release-state"

export APP_CONTAINER_NAME APP_PORT APP_IMAGE APP_MEMORY_LIMIT APP_MEMORY_RESERVATION

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    if [ -n "${BUILD_CONTEXT:-}" ] && [ -d "$BUILD_CONTEXT" ]; then
        rm -rf "$BUILD_CONTEXT"
    fi
    if [ -n "${ARCHIVE_TMP_DIR:-}" ] && [ -d "$ARCHIVE_TMP_DIR" ]; then
        rm -rf "$ARCHIVE_TMP_DIR"
    fi
}
trap cleanup EXIT

check_prerequisites() {
    if ! command -v docker >/dev/null 2>&1; then
        log_error "未安装 Docker，请先安装 Docker"
        exit 1
    fi

    if ! docker compose version >/dev/null 2>&1; then
        log_error "未检测到 Docker Compose v2，请先安装或升级 Docker Compose"
        exit 1
    fi

    if [ ! -f "$DOCKERFILE_PATH" ]; then
        log_error "Dockerfile 不存在: $DOCKERFILE_PATH"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "docker-compose.yml 不存在: $COMPOSE_FILE"
        exit 1
    fi

    if [ ! -f "$NGINX_CONF_PATH" ]; then
        log_error "nginx.conf 不存在: $NGINX_CONF_PATH"
        exit 1
    fi

    if ! docker image inspect "$NGINX_IMAGE" >/dev/null 2>&1; then
        log_error "运行时基础镜像不存在: $NGINX_IMAGE"
        log_info "请先使用 docker load -i 加载对应 Nginx 镜像 tar。"
        exit 1
    fi
}

find_dist_package() {
    if [ -n "$PACKAGE_INPUT" ]; then
        PACKAGE_PATH="$(resolve_deploy_path "$PACKAGE_INPUT")"
        return
    fi

    mapfile -t candidates < <(
        find "$DIST_DIR" -maxdepth 1 -type f \
            \( -name 'dist.tar.gz' -o -name 'dist.tgz' -o -name 'jackal-vue3-admin-dist*.tar.gz' -o -name 'jackal-vue3-admin-dist*.tgz' -o -name 'dist.zip' -o -name 'jackal-vue3-admin-dist*.zip' \) \
            | sort
    )

    if [ -d "$DIST_DIR/dist" ]; then
        candidates=("$DIST_DIR/dist" "${candidates[@]}")
    fi

    if [ "${#candidates[@]}" -eq 1 ]; then
        PACKAGE_PATH="${candidates[0]}"
        return
    fi

    log_error "未能唯一定位 dist 部署包"
    echo "请将本地 npm run build 产生的 dist 目录或压缩包上传到: $DIST_DIR"
    echo "支持: dist/、dist.tar.gz、dist.tgz、dist.zip、jackal-vue3-admin-dist*.tar.gz、jackal-vue3-admin-dist*.zip"
    echo "也可以显式指定: bash up.sh <dist目录或压缩包>"
    if [ "${#candidates[@]}" -gt 1 ]; then
        echo "匹配到多个候选包:"
        printf '  %s\n' "${candidates[@]}"
    fi
    exit 1
}

resolve_dist_dir() {
    find_dist_package

    if [ -d "$PACKAGE_PATH" ]; then
        DIST_SOURCE="$PACKAGE_PATH"
    elif [ -f "$PACKAGE_PATH" ]; then
        ARCHIVE_TMP_DIR="$(mktemp -d)"
        case "$PACKAGE_PATH" in
            *.tar.gz|*.tgz)
                tar -xzf "$PACKAGE_PATH" -C "$ARCHIVE_TMP_DIR"
                ;;
            *.zip)
                if ! command -v unzip >/dev/null 2>&1; then
                    log_error "部署 zip 包需要安装 unzip，或改用 tar.gz 包"
                    exit 1
                fi
                unzip -q "$PACKAGE_PATH" -d "$ARCHIVE_TMP_DIR"
                ;;
            *)
                log_error "不支持的部署包格式: $PACKAGE_PATH"
                exit 1
                ;;
        esac

        if [ -f "$ARCHIVE_TMP_DIR/dist/index.html" ]; then
            DIST_SOURCE="$ARCHIVE_TMP_DIR/dist"
        elif [ -f "$ARCHIVE_TMP_DIR/index.html" ]; then
            DIST_SOURCE="$ARCHIVE_TMP_DIR"
        else
            log_error "部署包内未找到 dist/index.html 或 index.html: $PACKAGE_PATH"
            exit 1
        fi
    else
        log_error "部署包不存在: $PACKAGE_PATH"
        exit 1
    fi

    if [ ! -f "$DIST_SOURCE/index.html" ]; then
        log_error "dist 目录缺少 index.html: $DIST_SOURCE"
        exit 1
    fi
}

prepare_build_context() {
    resolve_dist_dir
    BUILD_CONTEXT="$(mktemp -d)"

    mkdir -p "$BUILD_CONTEXT/dist"
    cp -a "$DIST_SOURCE"/. "$BUILD_CONTEXT/dist/"
    cp "$DOCKERFILE_PATH" "$BUILD_CONTEXT/Dockerfile"
    cp "$NGINX_CONF_PATH" "$BUILD_CONTEXT/nginx.conf"

    log_info "部署包: $PACKAGE_PATH"
    log_info "构建上下文: $BUILD_CONTEXT"
    log_info "dist 大小: $(du -sh "$BUILD_CONTEXT/dist" | cut -f1)"
}

build_image() {
    log_info "构建应用镜像: $APP_IMAGE"
    docker build \
        --build-arg "NGINX_IMAGE=$NGINX_IMAGE" \
        -t "$APP_IMAGE" \
        "$BUILD_CONTEXT"
    cat > "$RELEASE_STATE_FILE" <<EOF
APP_IMAGE=$APP_IMAGE
DIST_PACKAGE=$PACKAGE_PATH
BUILD_TIME=$BUILD_TIME
EOF
}

deploy_container() {
    log_info "启动容器: $APP_CONTAINER_NAME"
    log_info "对外端口: $APP_PORT -> 80"

    docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" up -d --no-build app-web

    sleep 3
    if ! docker ps --filter "name=^/${APP_CONTAINER_NAME}$" --filter "status=running" --format "{{.Names}}" | grep -qx "$APP_CONTAINER_NAME"; then
        log_error "容器未处于运行状态，请查看日志: docker logs --tail=200 $APP_CONTAINER_NAME"
        exit 1
    fi

    if command -v curl >/dev/null 2>&1; then
        if ! curl -fsS "http://127.0.0.1:$APP_PORT/" >/dev/null; then
            log_error "前端页面探测失败: http://127.0.0.1:$APP_PORT/"
            exit 1
        fi
    else
        log_warn "未安装 curl，跳过前端页面探测"
    fi
}

cleanup_old_images() {
    log_info "保留最新 $IMAGE_KEEP_COUNT 个 ${APP_NAME}:${ENV}-* 镜像版本..."
    mapfile -t old_image_refs < <(
        docker image ls "$APP_NAME" --format "{{.Repository}}:{{.Tag}}" \
            | awk -v env="$ENV" -v keep="$IMAGE_KEEP_COUNT" '$1 ~ ":" env "-" { count++; if (count > keep) print $1 }'
    )

    for image_ref in "${old_image_refs[@]}"; do
        docker image rm "$image_ref" || log_warn "镜像删除失败，可能仍被容器使用: $image_ref"
    done

    docker image prune -f
}

echo ""
echo "=========================================="
echo "  $APP_NAME - 内网容器部署"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  镜像: $APP_IMAGE"
echo "=========================================="
echo ""

check_prerequisites
prepare_build_context
build_image
deploy_container
cleanup_old_images

echo ""
echo "=========================================="
log_info "部署完成"
log_info "容器: $APP_CONTAINER_NAME"
log_info "镜像: $APP_IMAGE"
log_info "访问端口: $APP_PORT"
echo "=========================================="
