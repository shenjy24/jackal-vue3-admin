#!/bin/bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$PACKAGE_ROOT"

IMAGES_ENV_FILE="${IMAGES_ENV_FILE:-$SCRIPT_DIR/images.env}"
if [ -f "$IMAGES_ENV_FILE" ]; then
    set -a
    . "$IMAGES_ENV_FILE"
    set +a
fi

IMAGE_DIR="${IMAGE_DIR:-images}"
LOAD_NODE_IMAGE="${LOAD_NODE_IMAGE:-1}"
NODE_IMAGE="${NODE_IMAGE:-node:24.17.0-slim}"
NODE_IMAGE_TAR="${NODE_IMAGE_TAR:-$IMAGE_DIR/node-24.17.0-slim.tar}"
LOAD_NGINX_IMAGE="${LOAD_NGINX_IMAGE:-1}"
NGINX_IMAGE="${NGINX_IMAGE:-nginx:1.30.2-alpine}"
NGINX_IMAGE_TAR="${NGINX_IMAGE_TAR:-$IMAGE_DIR/nginx-1.30.2-alpine.tar}"

load_image() {
    local image_tar="$1"
    local label="$2"

    if [ ! -f "$image_tar" ]; then
        echo "未找到${label}镜像文件: $image_tar"
        exit 1
    fi

    echo "加载${label}镜像: $image_tar"
    docker load -i "$image_tar"
}

if [ "$LOAD_NODE_IMAGE" = "1" ]; then
    load_image "$NODE_IMAGE_TAR" "Node.js"
else
    echo "跳过 Node.js 镜像加载，LOAD_NODE_IMAGE=$LOAD_NODE_IMAGE"
fi

if [ "$LOAD_NGINX_IMAGE" = "1" ]; then
    load_image "$NGINX_IMAGE_TAR" "Nginx"
else
    echo "跳过 Nginx 镜像加载，LOAD_NGINX_IMAGE=$LOAD_NGINX_IMAGE"
fi

echo ""
echo "验证加载结果："
if [ "$LOAD_NODE_IMAGE" = "1" ]; then
    if docker image inspect "$NODE_IMAGE" >/dev/null 2>&1; then
        echo "  ✓ Node.js 镜像: $NODE_IMAGE"
    else
        echo "  ✗ Node.js 镜像未加载成功或镜像 tag 不匹配: $NODE_IMAGE"
        exit 1
    fi
fi

if [ "$LOAD_NGINX_IMAGE" = "1" ]; then
    if docker image inspect "$NGINX_IMAGE" >/dev/null 2>&1; then
        echo "  ✓ Nginx 镜像: $NGINX_IMAGE"
    else
        echo "  ✗ Nginx 镜像未加载成功或镜像 tag 不匹配: $NGINX_IMAGE"
        exit 1
    fi
fi

echo ""
echo "镜像加载完成。"
