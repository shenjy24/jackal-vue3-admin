## Context

`jackal-vue3-admin` 已经具备 Vue 3 管理后台的布局、Pinia、动态路由、权限指令、CRUD 组件、i18n 和部署文件，但当前业务代码使用的是示例契约：`/auth/session`、`/system/*`、`page/list`、`username` 和 `system:*` 权限码。实际后端 `jackal-java-template` 仅在 `/admin/**` 下提供管理端能力，认证与权限集中在 `AdminAuthController`，并使用 `account`、`pageNum/pageSize`、`total/content`、`2000/2001/2002` 等契约。

后端会话没有聚合接口。当前用户、菜单和页面按钮分别由 `getUser`、`listAuthMenu`、`listAuthButton` 返回。菜单模型已增加 `component` 字段，初始化数据使用相对 `src/views` 的无扩展名路径，例如 `auth/UserManageView`。

## Goals / Non-Goals

**Goals:**

- 让前端可以直接对接当前 `jackal-java-template` admin 模块完成登录和权限管理。
- 以真实后端模型重建 TypeScript 契约，并保留统一 API 客户端和 CRUD 基础设施。
- 通过菜单 `component` 和 `import.meta.glob` 生成动态路由，使后续功能通过后端菜单配置与前端页面文件即可接入。
- 完成后台用户、角色、菜单/按钮权限的查询、编辑和绑定流程。
- 使刷新恢复、退出、未登录、无权限和未知菜单均具有确定行为。

**Non-Goals:**

- 不对接或改造 `controller/web` 用户侧功能。
- 不继续扩展后端菜单为前端路由 `meta` 全量配置，菜单显示和授权仍以现有权限模型为边界。
- 不实现数据权限、字段权限、多租户、低代码页面或微前端。
- 不新增前端依赖，不对现有布局进行无关视觉改版。

## Decisions

### 使用 admin 专用 API 模块表达真实契约

新增面向认证、用户、角色和权限的 API 函数，统一使用 `/admin/auth/*` 完整路径。分页请求直接发送 `pageNum`、`pageSize` 和业务查询字段，分页响应映射后端 `{ total, content }`，不再让系统页面复用假设 `{ page, filters }` 和 `{ list, total }` 的示例接口。

保留 `src/api/client.ts` 作为唯一 Axios 入口，并将状态码明确为：`2000` 成功、`2001` 未登录、`2002` 无权限。HTTP 网络错误和业务错误继续使用统一异常与消息处理。

替代方案是让后端增加兼容 `/auth/session` 和 `/system/*` 的接口。该方案会形成重复接口并偏离“前端对接现有 admin 模块”的边界，因此不采用。

### 会话启动采用用户与菜单并行加载

登录调用 `POST /admin/auth/loginByAccount`，请求体为 `{ account, password }`。登录成功或应用刷新时，并行调用 `getUser` 和 `listAuthMenu`；两者都成功后才将会话标记为 ready 并注册动态路由。`AuthUserVo.roles` 直接作为当前角色信息，不再假设后端返回独立角色码数组。

退出调用 `POST /admin/auth/logoff`，无论请求结果如何都清理本地用户、菜单、按钮缓存、动态路由状态和标签页。修改当前密码成功后同样按后端行为回到登录页。

替代方案是在前端模拟聚合 `sessionApi`。可以保留一个内部 `restoreSession` 编排函数，但不得伪造后端不存在的 HTTP 接口。

### 按页面菜单 ID 延迟加载按钮权限

`listAuthMenu` 返回 `PermType.DIRECTORY` 和 `PermType.MENU` 节点，目录只展开子节点，菜单挂载页面组件；按钮权限通过 `POST /admin/auth/listAuthButton` 和 `{ permId }` 获取。路由元数据保存对应菜单 ID；进入受保护页面前，路由守卫加载该菜单的按钮列表并缓存为 `menuId -> permissionCodes`。`v-permission` 和程序化检查读取当前页面缓存。

缓存会在退出登录、会话失效和重新恢复会话时清空。完成角色权限修改后，不尝试修改其他已登录用户的前端缓存；其权限在下次刷新或重新登录时生效。

替代方案是启动时逐个菜单请求全部按钮。该方式会产生 N+1 启动请求并拖慢首屏，因此不采用。

### 使用 component 路径与 import.meta.glob 加载页面

三个字段职责独立：`code` 是权限标识，`path` 是浏览器 URL，`component` 是相对 `src/views` 的页面路径。前端通过 Vite 的 `import.meta.glob` 在构建时收集全部页面模块：

```ts
const viewModules = import.meta.glob("/src/views/**/*.vue");

function resolveMenuComponent(component?: string) {
  if (!component || component.includes("..")) return undefined;
  const normalized = component.replace(/^\/+/, "").replace(/\.vue$/, "");
  return viewModules[`/src/views/${normalized}.vue`];
}
```

`auth:manage` 等仅包含子菜单的目录节点不设置 `component`，由动态路由转换器创建父级路由。按钮权限同样不设置 `component`。菜单名称默认使用后端 `name` 显示；如果本地存在以 `code` 为键的 i18n 文案，则优先使用翻译。图标映射兼容后端初始化数据的小写 `setting`、`user`、`team`、`lock`，未知图标使用统一默认图标。

`import.meta.glob` 是构建期白名单，后端不能加载 `src/views` 之外的文件。缺少 `component`、包含 `..` 或无法匹配本地页面的叶子菜单不注册路由并输出开发警告。后续新增功能只需创建页面文件，并将后端菜单 `component` 配置为对应相对路径，无需手工维护 `componentMap`。

### RBAC 页面使用专用交互而非万能 CRUD

用户页面按昵称查询，编辑字段为 `account`、`nickname`、`avatar` 和 `roleIds`；角色选项通过角色分页接口获取，提供删除和重置密码操作。角色页面按名称查询，编辑时通过 `listRolePerm` 获取带 `checked` 状态的权限树，并将选中 ID 随 `saveAuthRole/updateAuthRole` 提交。权限页面按 `code`、`name`、`type` 查询，编辑 `parentId`、`code`、`name`、`type`、`icon`、`path`、`component`、`sort`、`remark`；仅叶子菜单需要填写 `component`。

通用 `useCrud` 可以继续承担加载、分页和弹窗状态，但 API payload、树选择、角色选择和重置密码等专用行为放在模块 composable 或页面中，不扩张成 schema-driven 平台。

### 清理范围限定为 admin 框架入口

从动态组件注册和后台导航中移除与 admin 框架无关的音频、绘图、SSE、Vue 示例页面。只有确认未被入口、路由或构建引用的演示文件才删除；公共样式、布局和通用组件不因本变更重写。

## Risks / Trade-offs

- [后端 component 与前端文件路径可能不一致] → 使用 `import.meta.glob` 的构建期模块集合校验，无法匹配的叶子菜单拒绝注册并输出包含菜单 code 与 component 的警告。
- [component 被配置为越界路径] → 只接受相对 `src/views` 的路径，拒绝 `..`、绝对路径和 glob 集合外模块。
- [按钮权限按页面异步加载可能造成短暂错误显示] → 路由进入前等待权限请求完成，页面渲染后权限集合已就绪。
- [角色选项接口只有分页查询] → 使用足够大的受控 `pageSize` 获取当前规模下的角色选项；若后端角色数量超出限制，再单独增加后端列表接口，不在前端无限翻页猜测。
- [权限树同时包含菜单和按钮，父子半选语义可能导致多选或漏选] → 提交 Element Plus tree 的 checked 与 half-checked 节点并去重，确保父级菜单授权随子权限保存。
- [当前用户权限在角色修改后不会实时刷新] → 当前用户修改涉及自身角色或权限时提示刷新会话；常规权限变更在重新登录或刷新后生效。
- [删除被绑定角色或权限由后端拒绝] → 展示后端业务错误，不在前端预判数据库关联状态。

## Migration Plan

1. 先替换共享类型、状态码和 admin API 层，保持页面尚未切换时构建可通过。
2. 改造会话启动、动态菜单和按钮权限加载，使登录与导航链路可用。
3. 依次接入用户、角色、权限管理页面及其权限码。
4. 更新 i18n、README 和新增页面接入说明，清理不再使用的示例入口。
5. 运行生产构建，并使用不同授权角色验证菜单和按钮行为。

回滚前端时可整体恢复原示例 API、会话 store 和系统页面；后端新增 `component` 字段允许为空，前端回滚不会阻塞原权限查询，但数据库字段回滚需单独执行对应 DDL。

## Open Questions

无。实现以后端已增加 `component` 后的 `AdminAuthController`、`AuthMenuVo`、`auth.sql` 和 `SystemCode` 为固定契约；后续接口变化另行提出变更。
