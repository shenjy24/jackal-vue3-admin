# Jackal Vue3 Admin

与 `jackal-java-template` 配套的 Vue 3 管理后台，使用 Vite、TypeScript、Pinia、Vue Router、Element Plus、Vue I18n 和 Axios。

## 启动

```sh
npm install
npm run dev
npm run build
```

接口基础地址由 `VITE_API_BASE_URL` 配置，默认 `/api`。所有请求统一经过 `src/api/client.ts`，使用 POST 和 `withCredentials: true`。认证依赖后端 HttpOnly Cookie，前端不保存 Token。

开发服务器会将 `/api` 代理到 `VITE_DEV_PROXY_TARGET`，默认 `http://localhost:8080`，并移除 `/api` 前缀；生产 Nginx 使用同样的转发语义。

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
3. 菜单 `component` 配置为相对 `src/views` 的无扩展名路径，例如 `order/OrderManageView`。
4. 为角色绑定菜单及按钮权限，并在页面中使用后端按钮权限码。
5. 需要菜单翻译时，在 `src/i18n/locales` 的 `menuCode` 中用菜单 code 添加文案。

页面通过 `import.meta.glob("/src/views/**/*.vue")` 构建期白名单解析，无需维护组件映射。包含 `..`、绝对路径或无法匹配本地页面的 component 会被拒绝并输出诊断警告。

后端图标 key 支持 `setting`、`user`、`team`、`lock`，未知图标使用默认图标。

## 部署

构建产物输出到 `dist`。`deploy/nginx.conf` 已配置 history 路由回退，部署时按环境调整 `/api/` 的后端代理目标。
