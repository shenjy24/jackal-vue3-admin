# Jackal Vue3 Admin

`jackal-vue3-admin` 是与 `jackal-java-server` 配套的 Vue 3 管理后台前端，面向后端 admin 模块提供登录认证、会话恢复、动态菜单、动态路由、角色权限和按钮权限等基础能力。

技术栈：Vue 3、Vite、TypeScript、Pinia、Vue Router、Element Plus、Vue I18n、Axios。

## 环境要求

| 工具 | 最低版本 | 推荐版本 |
| --- | --- | --- |
| Node.js | 18.0.0 | 24.18.0 |

## 快速开始

```sh
npm install       # 安装依赖
npm run local     # 本地开发，Vite 代理到 localhost:8080
npm run dev       # 本地开发，Vite 代理到开发环境
npm run build     # 生产构建，产物输出到 dist/
```

所有请求均通过 `src/api/client.ts` 统一发送，默认使用 POST，并开启 `withCredentials: true`。认证依赖后端 HttpOnly Cookie，前端不保存 Token。

## 目录约定

| 目录 | 说明 |
| --- | --- |
| `src/api` | admin 接口定义与统一请求封装 |
| `src/views` | 管理后台页面，按业务模块组织 |
| `src/router` | 静态路由、动态菜单路由、组件映射和图标映射 |
| `src/stores` | 登录态、权限、标签页和全局设置等状态 |
| `src/layouts` | 管理后台整体布局 |
| `src/components` | 可复用组件 |
| `src/hooks` | 可复用组合式逻辑 |
| `src/directives` | 自定义指令，例如按钮权限指令 |
| `src/types` | 接口、菜单、权限和通用业务类型 |
| `src/i18n` | 菜单与页面国际化文案 |

## 运行环境

| 环境 | 命令 | env 文件 | 代理方式 |
| --- | --- | --- | --- |
| 本地 local | `npm run local` | `.env.localdev` | Vite -> `VITE_DEV_PROXY_TARGET`，默认 `localhost:8080` |
| 开发 development | `npm run dev` | `.env.development` | Vite -> 开发服务器后端 |
| 测试 test | `npm run build` | `.env.production` | Nginx -> `/admin/api/` -> 测试后端 |
| 线上 production | `npm run build` | `.env.production` | Nginx -> `/admin/api/` -> 生产后端 |

test 与 production 使用同一份前端构建产物，后端目标由各环境机器上的 Nginx `proxy_pass` 决定。Vite 开发服务器和 Nginx 都会移除 `/admin/api` 前缀后再转发到后端。

## 接口与权限

当前前端只对接后端 admin 侧接口，重点覆盖 `/admin/auth/*` 及权限管理相关能力：

| 模块 | 能力 |
| --- | --- |
| 认证 | `loginByAccount`、`logoff`、`getUser`、`updateUser`、`updatePassword` |
| 会话权限 | `listAuthMenu`、`listAuthButton` |
| 用户 | 查询、详情、新增、修改、删除、`resetPassword` |
| 角色 | 查询、详情、新增、修改、删除、`listRolePerm` |
| 权限 | 查询、详情、完整权限树、新增、修改、删除 |

统一响应码：`2000` 表示成功，`2001` 表示未登录，`2002` 表示无权限。分页参数统一为 `pageNum`、`pageSize`，分页响应结构为 `{ total, content }`。

登录或刷新会话时，前端会并行调用 `getUser` 与 `listAuthMenu`。菜单返回后注册动态路由，再按菜单 ID 调用 `listAuthButton` 获取按钮权限。按钮权限按菜单缓存，页面通过 `v-permission` 或 `hasPermission` 判断当前用户是否具备操作权限。

退出登录、修改密码或会话失效时，前端会清理用户信息、权限缓存、动态路由和标签页状态。

## 动态菜单与路由

后端菜单是业务导航的事实来源。除登录页、错误页等基础页面外，业务菜单不维护前端静态菜单树。

- 菜单 `path` 对应浏览器访问路径。
- 菜单 `code` 对应菜单权限标识和国际化文案 key。
- 菜单 `component` 使用相对 `src/views` 的无扩展名路径，例如 `auth/UserManageView`。
- 前端通过 `import.meta.glob('/src/views/**/*.vue')` 在构建期收集页面组件，仅允许加载集合内的页面路径。
- 不匹配的 `component` 会被拒绝，并在控制台输出诊断警告。
- 后端图标 key 支持 `setting`、`user`、`team`、`lock`，未知图标会回退为默认图标。

## 新增管理功能

1. 确认后端 admin 模块已提供对应接口、菜单和权限码。
2. 在 `src/api` 中增加类型明确的接口封装，页面不要直接调用 Axios。
3. 在 `src/views/<module>` 下创建页面，并优先复用现有 CRUD 组件和组合式逻辑。
4. 在后端新增菜单，配置 `path`、`code`、`component` 和图标 key。
5. 确保菜单 `component` 与页面相对 `src/views` 的无扩展名路径一致。
6. 为角色绑定菜单及按钮权限，页面操作使用后端定义的按钮权限码。
7. 在 `src/i18n/locales` 的 `menuCode` 中按菜单 code 补充文案。

权限码由后端定义并保持稳定，前端只消费权限码，不通过角色名称、用户名或页面路径推断权限。

## 部署

`document/deploy/nginx.conf` 已配置 history 路由回退。部署到不同环境时，只需要调整 `location /admin/api/` 的 `proxy_pass`，使其指向对应后端服务。

本地开发不依赖 Nginx，可通过 `.env.localdev` 或 `.env.development` 中的 `VITE_DEV_PROXY_TARGET` 指定 Vite 代理目标。
