#!/bin/bash

# ========================================
# jackal-vue3-admin 内网回滚脚本
# 功能：列出可回滚版本 → 选择目标版本 → 更新 current 软链接 → 重启 Nginx
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
RESTART_NGINX="${RESTART_NGINX:-1}"

# ----- 颜色输出 -----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ----- 列出可回滚版本 -----
list_releases() {
    local dirs
    dirs="$(find "$RELEASES_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*' | sort -r)"

    if [ -z "$dirs" ]; then
        log_error "未找到任何可回滚的版本"
        log_info "发布目录: $RELEASES_DIR"
        exit 1
    fi

    local current_target=""
    if [ -L "$CURRENT_LINK" ]; then
        current_target="$(readlink "$CURRENT_LINK")"
    fi

    echo ""
    echo "可回滚版本列表："
    echo "----------------------------------------"
    local i=1
    local names=()
    while IFS= read -r dir; do
        local name
        name="$(basename "$dir")"
        names+=("$name")
        local marker=""
        if [ "$name" = "$current_target" ]; then
            marker=" ← 当前版本"
        fi
        if [ -d "$dir/dist" ]; then
            local size
            size="$(du -sh "$dir/dist" 2>/dev/null | cut -f1)"
            echo -e "  ${CYAN}$i${NC}) $name  (${size})${marker}"
        else
            echo -e "  ${CYAN}$i${NC}) $name  (⚠ 无 dist/)${marker}"
        fi
        ((i++))
    done <<< "$dirs"
    echo "----------------------------------------"
    echo ""

    if [ "$i" -eq 1 ]; then
        log_error "未找到有效版本"
        exit 1
    fi
}

# ----- 回滚 -----
rollback() {
    local target="$1"

    if [ ! -d "$RELEASES_DIR/$target/dist" ]; then
        log_error "目标版本 $target 的构建产物 dist/ 不存在"
        exit 1
    fi

    log_info "回滚到版本: $target"

    cd "$RELEASES_DIR"
    ln -sfn "$target" current
    log_info "更新 current 软链接: $target"

    # 确认更新成功
    local now
    now="$(readlink current)"
    if [ "$now" = "$target" ]; then
        log_info "回滚成功：当前版本 $now"
    else
        log_error "回滚失败：current 指向 $now，预期 $target"
        exit 1
    fi
}

# ----- 重启 Nginx -----
restart_nginx() {
    if [ "$RESTART_NGINX" != "1" ]; then
        log_info "跳过 Nginx 重启（RESTART_NGINX=0）"
        return
    fi

    if ! command -v nginx &>/dev/null; then
        log_warn "未检测到 Nginx 命令，跳过重启"
        return
    fi

    log_info "测试 Nginx 配置..."
    if nginx -t; then
        log_info "重新加载 Nginx..."
        nginx -s reload
        log_info "Nginx 重新加载完成"
    else
        log_error "Nginx 配置测试失败，请手动检查"
        exit 1
    fi
}

# ========================================
echo ""
echo "=========================================="
echo "  $APP_NAME — 版本回滚"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

list_releases

# 检查输入
if [ $# -ge 1 ]; then
    # 检查参数是序号还是版本名
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        local dirs=()
        while IFS= read -r dir; do
            dirs+=("$(basename "$dir")")
        done < <(find "$RELEASES_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*' | sort -r)
        local idx=$((BASH_REMATCH[1] - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#dirs[@]}" ]; then
            TARGET="${dirs[$idx]}"
        else
            log_error "序号超出范围: $1"
            exit 1
        fi
    else
        TARGET="$1"
    fi
else
    echo -n "请输入要回滚的版本序号或版本名: "
    read -r user_input
    if [[ "$user_input" =~ ^[0-9]+$ ]]; then
        local dirs=()
        while IFS= read -r dir; do
            dirs+=("$(basename "$dir")")
        done < <(find "$RELEASES_DIR" -maxdepth 1 -type d -name '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*' | sort -r)
        local idx=$((user_input - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#dirs[@]}" ]; then
            TARGET="${dirs[$idx]}"
        else
            log_error "序号超出范围: $user_input"
            exit 1
        fi
    else
        TARGET="$user_input"
    fi
fi

# 检查目标版本
if [ ! -d "$RELEASES_DIR/$TARGET" ]; then
    log_error "版本 $TARGET 不存在于 $RELEASES_DIR"
    exit 1
fi

echo ""
rollback "$TARGET"
echo ""
restart_nginx

echo ""
echo "=========================================="
log_info "回滚完成!"
log_info "当前版本: $(readlink "$CURRENT_LINK")"
echo "=========================================="
