# admin-deployment Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: 静态资源通过 Nginx 部署
系统 SHALL 支持构建可由 Nginx 服务的静态资源。

#### Scenario: 用户打开 history 模式路由
- **WHEN** 用户在浏览器中直接打开后台路由
- **THEN** Nginx fallback 到 `index.html`，以前端路由可以解析该路由

### Requirement: 应用可以打包为 Docker 镜像
系统 SHALL 支持使用构建阶段和 Nginx 运行阶段进行 Docker 部署。

#### Scenario: Docker 镜像运行
- **WHEN** 构建后的 Docker 镜像启动
- **THEN** Nginx 服务已编译的前端应用

