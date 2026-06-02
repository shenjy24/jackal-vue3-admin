# Jackal Vue3 Admin

Vue 3 + Vite 管理后台基础框架，包含 HttpOnly Cookie 会话、RBAC、后端菜单动态路由、Element Plus 后台 shell、i18n、CRUD 页面模式和 Nginx/Docker 部署约定。

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Environment

API base URL is configured with `VITE_API_BASE_URL`.

```sh
# .env.development / .env.production
VITE_API_BASE_URL=/api
```

服务接口统一通过 POST 调用。认证接口约定为：

- `POST /auth/login`
- `POST /auth/session`
- `POST /auth/logout`

`/auth/session` 返回当前用户、角色、菜单和权限码，用于恢复会话、注册动态路由和渲染侧边栏。

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Nginx Deployment

Build output is served from `dist`. The included [deploy/nginx.conf](deploy/nginx.conf) supports history mode fallback with `try_files $uri $uri/ /index.html`.

```sh
npm run build
```

Copy `dist` to the Nginx web root and use `deploy/nginx.conf` as the site config. Update the `/api/` upstream proxy target for your backend.

## Docker Deployment

The included [Dockerfile](Dockerfile) uses a Node build stage and an Nginx runtime stage.

```sh
docker build -t jackal-vue3-admin .
docker run --rm -p 8080:80 jackal-vue3-admin
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
