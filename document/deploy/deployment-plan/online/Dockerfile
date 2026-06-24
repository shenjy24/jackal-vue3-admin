# ========================================
# jackal-vue3-admin 运行镜像（联网环境）
# 用途：Node 构建前端产物，Nginx 容器内托管静态资源
# ========================================

ARG NODE_IMAGE=node:24.17.0-slim
ARG NGINX_IMAGE=nginx:1.30.2-alpine

FROM ${NODE_IMAGE} AS build

# 联网环境默认使用官方 registry，无需额外配置
# 如需使用镜像加速，取消下面注释
# RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 先安装依赖（利用 Docker 层缓存）
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 复制源码并构建
COPY index.html vite.config.js tsconfig.json env.d.ts .env.production ./
COPY src ./src
COPY public ./public
RUN npm run build

# ========================================
# runtime stage：容器内部使用 Nginx 提供静态文件服务
# ========================================
FROM ${NGINX_IMAGE} AS runtime

ARG APP_UID=1000
ARG APP_GID=1000

WORKDIR /usr/share/nginx/html

RUN set -eux; \
    if ! getent group "${APP_GID}" >/dev/null; then addgroup -g "${APP_GID}" -S app; fi; \
    if ! getent passwd "${APP_UID}" >/dev/null; then \
        APP_GROUP="$(getent group "${APP_GID}" | cut -d: -f1)"; \
        adduser -S -D -H -h /nonexistent -s /sbin/nologin -u "${APP_UID}" -G "${APP_GROUP}" app; \
    fi; \
    mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/run; \
    chown -R "${APP_UID}:${APP_GID}" /var/cache/nginx /var/run /usr/share/nginx/html /etc/nginx/conf.d

COPY --chown=${APP_UID}:${APP_GID} ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=${APP_UID}:${APP_GID} --from=build /app/dist/ /usr/share/nginx/html/

USER ${APP_UID}:${APP_GID}

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
