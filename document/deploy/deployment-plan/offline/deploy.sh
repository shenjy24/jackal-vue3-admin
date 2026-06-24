#!/bin/bash

# ========================================
# jackal-vue3-admin 内网构建部署脚本
# 功能：Docker 构建 → 输出到发布目录 → 更新 current 软链接 → 重启 Nginx
# 前提：宿主机已安装 Docker 和 Nginx
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
RELEASES_DIR="${RELEASES_DIR:-$PACKAGE_ROOT/releases}"
CURRENT_LINK="${CURRENT_LINK:-$RELEASES_DIR/current}"
BACKUP_DIR="${BACKUP_DIR:-$PACKAGE_ROOT/backup}"
NODE_IMAGE="${NODE_IMAGE:-node:24.17.0-slim}"
NGINX_CONF_FILE="${NGINX_CONF_FILE:-/etc/nginx/conf.d/jackal-vue3-admin.conf}"
RESTART_NGINX="${RESTART_NGINX:-1}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
BUILD_TIMEOUT="${BUILD_TIMEOUT:-300}"

# ----- 时间戳与路径 -----
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"
DIST_DIR="$RELEASE_DIR/dist"

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

    if ! docker image inspect "$NODE_IMAGE" &>/dev/null; then
        log_warn "未找到镜像 $NODE_IMAGE，尝试拉取..."
        docker pull "$NODE_IMAGE" || {
            log_error "拉取 $NODE_IMAGE 失败，请确认网络或离线镜像是否已加载"
            exit 1
        }
    fi

    if [ -z "${SKIP_NGINX_CHECK:-}" ] && [ "$RESTART_NGINX" = "1" ]; then
        if ! command -v nginx &>/dev/null; then
            log_warn "未检测到 Nginx 命令，跳过重启 Nginx"
            RESTART_NGINX=0
        fi
    fi
}

# ----- 构建 -----
build_frontend() {
    log_info "创建发布目录: $RELEASE_DIR"
    mkdir -p "$RELEASE_DIR"

    log_info "开始 Docker 构建..."
    log_info "镜像: $NODE_IMAGE"
    log_info "输出目录: $DIST_DIR"

    cd "$PACKAGE_ROOT"

    # 使用 docker buildx 直接将构建产物输出到宿主机
    DOCKER_BUILDKIT=1 docker buildx build \
        --file "$SCRIPT_DIR/Dockerfile" \
        --build-arg NODE_IMAGE="$NODE_IMAGE" \
        --output type=local,dest="$RELEASE_DIR" \
        --progress=plain \
        "$PACKAGE_ROOT" 2>&1 | while IFS= read -r line; do
            echo "  $line"
        done

    if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
        log_error "构建产物 dist/ 目录为空，构建失败"
        exit 1
    fi

    log_info "构建产物大小: $(du -sh "$DIST_DIR" | cut -f1)"
}

# ----- 部署 -----
deploy() {
    log_info "更新 current 软链接: $CURRENT_LINK -> $TIMESTAMP"

    # 创建 releases 目录下的软链接
    cd "$RELEASES_DIR"
    ln -sfn "$TIMESTAMP" current

    log_info "当前版本: $(readlink current)"
}

# ----- 清理历史版本 -----
cleanup_old_releases() {
    local release_dirs
    release_dirs="$(find "$RELEASES_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*' | sort)"
    local count
    count="$(echo "$release_dirs" | grep -c . || true)"

    if [ "$count" -le "$KEEP_RELEASES" ]; then
        log_info "当前版本数 $count，无需清理（保留 $KEEP_RELEASES 个）"
        return
    fi

    local to_delete=$((count - KEEP_RELEASES))
    log_info "清理 $to_delete 个历史版本..."

    echo "$release_dirs" | head -n "$to_delete" | while IFS= read -r dir; do
        log_info "  删除: $dir"
        rm -rf "$dir"
    done
}

# ----- 重启 Nginx -----
restart_nginx() {
    if [ "$RESTART_NGINX" != "1" ]; then
        log_info "跳过 Nginx 重启（RESTART_NGINX=0）"
        return
    fi

    log_info "测试 Nginx 配置..."
    if nginx -t; then
        log_info "重新加载 Nginx..."
        nginx -s reload
        log_info "Nginx 重新加载完成"
    else
        log_error "Nginx 配置测试失败，请检查 ${NGINX_CONF_FILE}"
        exit 1
    fi
}

# ----- 备份 -----
backup_current() {
    if [ -L "$CURRENT_LINK" ] && [ -d "$CURRENT_LINK" ]; then
        local current_target
        current_target="$(readlink "$CURRENT_LINK")"
        log_info "备份当前版本: $current_target"

        mkdir -p "$BACKUP_DIR"
        local backup_path="$BACKUP_DIR/${TIMESTAMP}_predeploy"
        cp -a "$RELEASES_DIR/$current_target" "$backup_path"
        log_info "备份完成: $backup_path"
    else
        log_info "无当前版本需要备份"
    fi
}

# ========================================
echo ""
echo "=========================================="
echo "  $APP_NAME — 内网构建部署"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  版本: $TIMESTAMP"
echo "=========================================="
echo ""

check_prerequisites
backup_current
build_frontend
deploy
restart_nginx
cleanup_old_releases

echo ""
echo "=========================================="
log_info "构建部署完成!"
log_info "当前版本: $TIMESTAMP"
echo "=========================================="
