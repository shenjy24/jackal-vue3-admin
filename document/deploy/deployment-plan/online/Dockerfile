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
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY index.html vite.config.js tsconfig.json env.d.ts .env.production ./
COPY src ./src
COPY public ./public
RUN npm run build

# ========================================
# runtime stage：容器内部使用 Nginx 提供静态文件服务
# ========================================
FROM ${NGINX_IMAGE} AS runtime

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
