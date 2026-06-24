# ========================================
# jackal-vue3-admin 构建镜像
# 用途：在 node:24.17.0-slim 环境中编译前端
# 产物：dist/ 目录输出到宿主机
# 构建方式：
#   docker buildx build --output type=local,dest=<输出目录>
# ========================================

FROM node:24.17.0-slim AS build

# 设置 npm 镜像（内网环境必配）
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 先安装依赖（利用 Docker 层缓存）
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ========================================
# output stage：只包含构建产物
# 配合 docker buildx --output type=local 使用
# ========================================
FROM scratch AS output
COPY --from=build /app/dist /dist
