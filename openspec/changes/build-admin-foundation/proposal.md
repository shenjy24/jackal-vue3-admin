## 为什么

项目需要一个稳定的 Vue 3 管理后台基础框架，面向内部运营人员和管理员使用。第一版应先建立认证、RBAC 权限、动态菜单、CRUD 开发范式、i18n 预留和部署约定，避免后续业务页面不断堆叠出不一致的实现模式。

## 变更内容

- 基于 Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、Axios 和 vue-i18n 建立管理后台应用基础。
- 增加基于 HttpOnly Cookie 的登录、退出登录和当前会话恢复能力。
- 增加用户、角色、动态菜单和按钮级权限码的 RBAC 支持。
- 增加后端驱动菜单路由，并在前端使用组件白名单和图标白名单。
- 增加标准后台布局，包括侧边栏、顶部栏、面包屑、内容区、多标签页导航和 keep-alive 控制。
- 增加统一的 POST-only API 请求处理，包括响应解包和错误处理。
- 增加面向 CRUD 的页面模式，包括查询表单、数据表格和表单弹窗。
- 从第一版开始建立中文和英文 i18n 结构。
- 增加 Nginx 静态部署支持和 Docker 部署支持。

## 能力

### 新增能力

- `admin-auth-session`: HttpOnly Cookie 登录、退出登录、会话恢复和当前用户上下文获取。
- `admin-rbac-permissions`: 基于角色的访问控制，包括角色、权限、菜单授权和按钮级权限检查。
- `admin-dynamic-navigation`: 将后端驱动菜单转换为动态 Vue Router 路由和侧边栏导航。
- `admin-shell-layout`: 核心后台布局，包括侧边栏、顶部栏、面包屑、多标签页和 keep-alive 行为。
- `admin-api-client`: 统一 POST-only API 客户端行为，包括响应标准化和请求错误处理。
- `admin-crud-patterns`: 可复用 CRUD 页面模式，包括查询表单、表格、分页和编辑弹窗。
- `admin-i18n`: 面向菜单、操作、表单和通用消息的中英文国际化结构。
- `admin-deployment`: Nginx 静态部署和 Docker 打包支持。

### 修改能力

无。

## 影响

- 影响应用启动、路由配置、状态管理、布局、共享组件、请求工具、i18n 文件和部署文件。
- 需要后端提供登录、退出登录和当前会话上下文接口。
- 需要后端菜单项使用约定好的组件 key、图标 key、i18n 标题 key 和权限码。
- 如果项目尚未包含相关依赖，将增加路由、状态管理、UI 组件、HTTP 请求和国际化依赖。
