## 背景

本变更用于建立内部运营 / 管理员系统的前端基础框架。应用需要支持 RBAC、后端驱动菜单、按钮权限、以表格为主的 CRUD 页面、中英文文案、HttpOnly Cookie 认证，并支持以 Nginx 静态资源或 Docker 镜像的方式部署。

后端所有服务接口统一使用 POST。由于认证使用 HttpOnly Cookie，前端无法直接读取 token，必须通过当前会话接口恢复登录态。

## 目标 / 非目标

**目标：**

- 建立 Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、Axios 和 vue-i18n 基础。
- 使用基于 HttpOnly Cookie 的认证，并通过独立的当前会话 API 恢复登录态。
- 根据后端提供的菜单数据生成授权路由和侧边栏菜单。
- 通过指令和工具函数同时支持 RBAC 按钮级权限。
- 提供多标签页导航，以及由菜单元数据控制的路由级 keep-alive。
- 提供查询、表格、分页和表单弹窗的 CRUD 页面约定。
- 提供 Nginx 和 Docker 部署文件。

**非目标：**

- 第一版不构建低代码 CRUD 平台。
- 第一版不增加表格列设置、数据导出或高级表格个性化能力。
- 第一版不支持暗色模式或租户级主题。
- 第一版不实现数据范围权限或字段级权限。
- 第一版不支持微前端。

## 决策

### 登录后使用独立的会话接口

`POST /auth/login` 只负责认证账号密码，并让后端写入 HttpOnly Cookie。它不需要返回菜单或权限码。登录后以及应用启动时，前端调用 `POST /auth/session` 获取当前用户、角色、菜单和权限。

考虑过的替代方案：登录接口直接返回菜单和权限。该方案不采用，因为页面刷新仍然需要恢复会话，并且权限变更应在不强制重新登录的情况下通过会话刷新体现出来。

### 由一个会话 API 返回用户、角色、菜单和权限

第一版使用聚合的会话响应：

```ts
{
  user: UserInfo
  roles: string[]
  menus: MenuNode[]
  permissions: string[]
}
```

考虑过的替代方案：将用户信息、菜单和权限拆成多个接口。第一版没有必要这样做，因为它会增加更多启动状态。后续如果菜单体积很大、权限需要按模块获取，或后端服务被拆分，可以再重新评估。

### 通过白名单将后端菜单节点转换为前端路由

后端菜单节点提供 `path`、`name`、`component`、`meta.title`、`meta.icon`，以及可选的 `meta.keepAlive`。前端将 `component` key 映射到已知页面模块，并将 `icon` key 映射到图标白名单。

这样可以避免任意动态组件加载，让后端驱动导航保持安全且可预测。

### 将权限上下文存入 Pinia

认证 / 权限 store 负责维护当前用户、角色、菜单树、权限码、动态路由注册状态和会话就绪状态。按钮授权通过以下方式暴露：

- 面向模板的 `v-permission` 指令
- 面向脚本逻辑的 `hasPermission(code)` 工具函数或 composable

### 使用路由元数据控制标签页和 keep-alive

路由元数据控制布局行为：

```ts
{
  title: 'menu.user',
  icon: 'User',
  keepAlive: true,
  permission: 'system:user:list'
}
```

标签页 store 记录已访问路由。keep-alive include 列表来自启用缓存的路由元数据，并要求组件名称稳定。

### 使用统一的 POST-only API 客户端

所有服务调用都经过 Axios 客户端。该客户端默认使用 POST，携带 HttpOnly Cookie 会话所需的 credentials，解包标准响应结构，并统一处理未授权响应。

预期响应结构为：

```ts
{
  code: number
  message: string
  data: unknown
}
```

### 保持 CRUD 抽象轻量

第一版应提供实用的 CRUD 构建块，而不是重型 schema-driven 平台：

- 查询表单模式
- 数据表格模式
- 分页模式
- 表单弹窗模式
- 在合适场景使用 `useTable` / `useCrud` 风格的 composable

这样既能保持业务页面灵活，又能减少重复样板代码。

### 在前端路由和菜单元数据中使用 i18n key

菜单标签和通用 UI 文案使用 `menu.system`、`common.search` 等 i18n key。后端菜单元数据应提供 i18n 标题 key，而不是硬编码中文文本。

### 同时支持 Nginx 和 Docker 部署

构建产物输出为可由 Nginx 服务的静态资源。Docker 使用 Node 编译阶段和 Nginx 运行阶段。history 模式路由需要 Nginx fallback 到 `index.html`。

## 风险 / 取舍

- 后端菜单组件 key 可能与前端白名单不一致 -> 维护共享契约，遇到未知组件 key 时默认不注册。
- 活跃会话期间的权限更新可能不会立即生效 -> 页面刷新时重新拉取会话，并可在角色管理变更后主动刷新。
- keep-alive 可能缓存过期表单状态 -> 通过 `meta.keepAlive` 显式选择是否缓存。
- HttpOnly Cookie 依赖正确的 CORS 和 Cookie 属性 -> 按环境统一配置 `withCredentials`、`SameSite`、`Secure`、domain 和 path。
- 统一 POST 接口会降低 HTTP 语义清晰度 -> 保持接口命名明确，并严格约束请求 / 响应类型。

## 迁移计划

1. 增加基础依赖和项目结构。
2. 实现 API 客户端、认证 store、会话启动流程和路由守卫。
3. 实现布局、动态菜单渲染、标签页和 keep-alive。
4. 实现权限指令和权限工具函数。
5. 增加 i18n 资源，并集成路由 / 菜单标题。
6. 增加 CRUD 模式和示例管理页面。
7. 增加 Nginx 和 Docker 部署文件。

如需回滚，可以移除新的动态启动流程并回到静态路由，因为第一版不要求后端 schema 迁移。

## 待确认问题

- 后端 API 前缀具体使用什么，例如 `/api/auth/session` 还是 `/auth/session`？
- 哪些响应 `code` 分别表示成功、未登录、无权限和业务错误？
- 会话接口是否需要包含组织或部门字段，为未来数据范围权限预留？
