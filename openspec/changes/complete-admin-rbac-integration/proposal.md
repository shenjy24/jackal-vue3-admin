## Why

现有管理后台已经具备布局、动态路由、权限指令和 CRUD 基础组件，但认证接口、分页结构、菜单模型和权限码仍按通用示例契约实现，无法直接对接 `jackal-java-template` 的真实 admin 模块。需要完成前后端契约对齐并补齐用户、角色、权限管理闭环，使该仓库真正成为后端框架可直接使用的管理后台。

## What Changes

- 将认证、用户、角色、权限相关请求统一对接 `/admin/auth/*` 实际接口，并适配后端 `JsonResult`、`JsonPage`、错误码和字段命名。
- 将单一 `/auth/session` 假设改为基于 `getUser`、`listAuthMenu` 和按页面获取按钮权限的会话初始化流程。
- 完善用户管理页面，支持查询、新增、修改、删除、角色选择和密码重置。
- 完善角色管理页面，支持查询、新增、修改、删除，并通过权限树配置角色权限。
- 将现有菜单示例页面调整为真实权限管理页面，支持菜单与按钮两类权限的查询、维护、层级关系和类型字段。
- 将后端 `AuthMenuVo` 适配为前端动态路由和侧边栏模型，明确 `code`、`path`、`component` 和图标的职责，并通过构建期组件白名单加载页面。
- 清理与 admin 框架无关的演示入口和虚假接口假设，保留可复用的布局、CRUD、国际化和部署能力。
- 增加针对登录恢复、动态菜单、按钮权限及三类权限管理页面的验证要求。

## Capabilities

### New Capabilities

- `admin-api-contract-integration`: 对接 `jackal-java-template` admin 模块的真实接口路径、请求字段、分页响应、统一错误码和认证 Cookie 行为。
- `admin-session-bootstrap`: 通过当前用户、授权菜单和页面按钮接口分步恢复管理后台会话、导航及权限状态。
- `admin-rbac-management`: 提供后台用户、角色、菜单/按钮权限的完整管理界面，以及用户角色和角色权限绑定流程。
- `admin-menu-route-adapter`: 将后端权限菜单树转换为前端侧边栏与动态路由，并通过后端 `component` 与 Vite 构建期组件白名单完成页面挂载。

### Modified Capabilities

无。

## Impact

- 主要影响 `src/api`、认证与权限 Pinia store、动态路由转换、权限工具、系统管理页面、共享类型和国际化资源。
- 前端只对接 `jackal-java-template` 的 `com.tech.controller.admin` 能力，不扩展 web 用户侧功能。
- 不要求新增前端依赖；继续使用现有 Vue 3、TypeScript、Pinia、Vue Router、Element Plus 和 Axios 技术栈。
- 后端菜单实体、Qo、Vo 和初始化 SQL 已增加独立 `component` 字段；叶子菜单使用相对 `src/views` 的无扩展名路径，例如 `system/UserManageView`，目录菜单和按钮权限保持为空。
- 成功码使用字符串 `2000`，未登录和无权限分别使用 `2001`、`2002`；分页数据使用 `{ total, content }`。
