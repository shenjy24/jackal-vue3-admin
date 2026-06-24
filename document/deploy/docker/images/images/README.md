# Docker 离线镜像目录

执行 `../load-images.sh` 前，请先将 Docker 镜像 tar 文件放到当前目录。

默认文件名：

- `node-24.17.0-slim.tar` — Node.js 构建环境镜像

是否加载镜像，以及镜像文件名和镜像 tag，可在上级目录的 `../images.env` 中调整。

## 导出镜像（在可联网环境执行）

```bash
docker pull node:24.17.0-slim
docker save node:24.17.0-slim -o node-24.17.0-slim.tar
```

## 联网部署说明

联网部署时 Dockerfile 会自动从镜像仓库拉取 `node:24.17.0-slim`，无需手动加载 tar 文件。
