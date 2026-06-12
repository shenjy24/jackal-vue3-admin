# Jackal Vue3 Admin

与 `jackal-java-template` 配套的 Vue 3 管理后台，使用 Vite、TypeScript、Pinia、Vue Router、Element Plus、Vue I18n 和 Axios。

## 启动

```sh
npm install
npm run local
npm run build
```

接口基础地址由 `VITE_API_BASE_URL` 配置，默认 `/admin/api`。所有请求统一经过 `src/api/client.ts`，使用 POST 和 `withCredentials: true`。认证依赖后端 HttpOnly Cookie，前端不保存 Token。

共 4 个运行环境，前端只需 3 份 env 配置：

| 环境 | 命令 | env 文件 | 代理方式 |
| --- | --- | --- | --- |
| 本地环境 local | `npm run local` | `.env.local` | Vite 代理到 `VITE_DEV_PROXY_TARGET`（默认 `http://localhost:8080`） |
| 开发环境 development | `npm run dev` | `.env.development` | Vite 代理到开发服务器后端 |
| 测试环境 test | `npm run build` | `.env.production` | Nginx 代理 `/admin/api/` |
| 线上环境 production | `npm run build` | `.env.production` | Nginx 代理 `/admin/api/` |

test 与 production 使用相同构建产物，区别在部署时 Nginx 的后端代理目标。开发服务器会移除 `/admin/api` 前缀后转发；部署时 Nginx 使用相同语义，将 `/admin/api/` 代理到后端。

## Admin 接口契约

前端只对接 `jackal-java-template` 的 `/admin/auth/*`：

- 认证：`loginByAccount`、`logoff`、`getUser`、`updateUser`、`updatePassword`
- 会话权限：`listAuthMenu`、`listAuthButton`
- 用户：查询、详情、新增、修改、删除和 `resetPassword`
- 角色：查询、详情、新增、修改、删除和 `listRolePerm`
- 权限：查询、详情、完整权限树、新增、修改和删除

统一响应中的 `2000` 表示成功，`2001` 表示未登录，`2002` 表示无权限。未登录时清理会话并跳转登录页；其他业务错误保留后端消息。

分页请求使用 `pageNum/pageSize`，响应结构为 `{ total, content }`。

## 会话与权限

登录或刷新时并行调用 `getUser` 和 `listAuthMenu`。动态路由注册完成后，进入业务页前使用路由元数据中的菜单 ID 调用 `listAuthButton`。按钮权限按菜单缓存，`v-permission` 和 `hasPermission` 读取当前页面权限。

退出、密码修改成功或会话失效会清理用户、角色、菜单、按钮缓存、动态路由和标签页。

## 新增管理功能

1. 在 `src/views` 创建页面，例如 `src/views/order/OrderManageView.vue`。
2. 后端新增菜单权限，分别配置浏览器 `path` 和稳定权限 `code`。
3. 菜单 `component` 配置为相对 `src/views` 的无扩展名路径，例如权限模块使用 `auth/UserManageView`，订单模块使用 `order/OrderManageView`。
4. 为角色绑定菜单及按钮权限，并在页面中使用后端按钮权限码。
5. 需要菜单翻译时，在 `src/i18n/locales` 的 `menuCode` 中用菜单 code 添加文案。

页面通过 `import.meta.glob("/src/views/**/*.vue")` 构建期白名单解析，无需维护组件映射。包含 `..`、绝对路径或无法匹配本地页面的 component 会被拒绝并输出诊断警告。

后端图标 key 支持 `setting`、`user`、`team`、`lock`，未知图标使用默认图标。

## 部署

构建产物输出到 `dist`，test 与 production 共用同一份 `npm run build` 产物。

前端 `VITE_API_BASE_URL=/admin/api` 是相对路径，浏览器会请求**当前访问站点**下的 `/admin/api/...`，不会写死后端 IP 或域名。test / production 的后端差异由**各自服务器上的 Nginx** 决定：

```
用户访问 test-admin.example.com
  → 请求 test-admin.example.com/admin/api/admin/auth/login
  → 测试机 Nginx 代理到 http://test-backend:8080/admin/auth/login

用户访问 admin.example.com
  → 请求 admin.example.com/admin/api/admin/auth/login
  → 线上机 Nginx 代理到 http://prod-backend:8080/admin/auth/login
```

`deploy/nginx.conf` 已配置 history 路由回退；部署到不同环境时，只需修改该机器 Nginx 中 `location /admin/api/` 的 `proxy_pass` 指向对应后端即可。

本地 / 开发环境没有 Nginx，通过 `.env.local`、`.env.development` 中的 `VITE_DEV_PROXY_TARGET` 指定 Vite 开发代理目标。
