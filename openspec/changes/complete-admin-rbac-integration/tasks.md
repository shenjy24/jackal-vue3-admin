## 1. 对齐后端契约

- [x] 1.1 按包含 `component` 的 `AuthUserVo`、`AuthRoleVo`、`AuthPermVo`、`AuthMenuVo`、`JsonPage` 和各 Qo 重建 admin TypeScript 请求响应类型。
- [x] 1.2 将 API 成功、未登录和无权限状态码调整为 `2000`、`2001`、`2002`，统一保留后端业务错误消息。
- [x] 1.3 新增 `/admin/auth/*` 认证 API，覆盖 `loginByAccount`、`logoff`、`getUser`、`updateUser` 和 `updatePassword`。
- [x] 1.4 新增后台用户 API，覆盖查询、详情、新增、修改、删除和重置密码，并使用 `pageNum/pageSize` 与 `total/content`。
- [x] 1.5 新增角色 API，覆盖查询、详情、新增、修改、删除、角色权限树和权限绑定。
- [x] 1.6 新增权限 API，覆盖权限查询、详情、完整权限树、新增、修改、删除和页面按钮查询。

## 2. 会话与权限状态

- [x] 2.1 改造登录表单和认证 store，使用 `account/password` 登录，并通过 `getUser` 与 `listAuthMenu` 并行恢复会话。
- [x] 2.2 在认证 store 中保存真实用户角色、授权菜单和按菜单 ID 缓存的按钮权限码。
- [x] 2.3 实现进入业务页面前按菜单 ID 调用 `listAuthButton`，并让 `v-permission` 和程序化检查读取当前页面权限。
- [x] 2.4 在退出、密码修改成功、会话失效时清理用户、菜单、按钮缓存、动态路由状态和标签页。
- [x] 2.5 验证 `2001` 跳转登录、`2002` 展示无权限反馈，避免业务异常被误判为会话失效。

## 3. 动态菜单与路由

- [x] 3.1 将动态菜单类型和转换逻辑改为使用后端 `id/parentId/code/name/icon/path/component/sort/children` 字段。
- [x] 3.2 使用 `import.meta.glob("/src/views/**/*.vue")` 建立构建期页面模块集合，通过菜单 `component` 相对路径解析叶子页面，并支持 component 为空的目录节点。
- [x] 3.3 扩展图标白名单以兼容 `setting`、`user`、`team`、`lock`，并为未知图标提供默认回退。
- [x] 3.4 将菜单 ID 和 code 写入路由元数据，保证直接刷新授权路由时可恢复会话、路由和页面按钮权限。
- [x] 3.5 拒绝包含 `..`、绝对路径或无法匹配本地模块的 component，并处理未授权路径和动态路由重复注册，提供诊断警告及 403/404 行为。

## 4. 后台用户管理

- [x] 4.1 将用户列表改为按昵称查询并展示账号、昵称、头像和角色，适配后端分页响应。
- [x] 4.2 实现用户新增和编辑表单，提交 `account`、`nickname`、`avatar` 和 `roleIds`，并加载角色选项。
- [x] 4.3 实现用户删除和密码重置确认流程，并分别使用 `auth:user:delete`、`auth:user:reset` 控制按钮。
- [x] 4.4 使用 `auth:user:query/save/update/delete/reset` 替换示例权限码，并补齐加载态、提交态和失败反馈。

## 5. 角色与权限管理

- [x] 5.1 将角色列表改为按名称查询，使用真实角色字段和 `auth:role:*` 权限码完成新增、修改、删除。
- [x] 5.2 在角色编辑流程中加载 `listRolePerm` 权限树，恢复 checked 状态并提交去重后的 checked 与 half-checked 权限 ID。
- [x] 5.3 将菜单示例页改造为权限管理页，支持按 code、名称和类型查询菜单与按钮权限。
- [x] 5.4 实现权限新增和编辑表单，支持父节点、类型、code、名称、图标、路径、component、排序和备注；叶子菜单填写 component，目录和按钮保持为空。
- [x] 5.5 实现权限删除确认和后端关联错误反馈，使用 `auth:perm:query/save/update/delete` 控制操作入口。

## 6. 框架整理与文档

- [x] 6.1 更新中英文 i18n 资源，覆盖登录、用户、角色、权限树、权限类型、重置密码和通用反馈文案。
- [x] 6.2 移除手工 `componentMap` 页面映射，保留图标映射，并清理后台入口中与 admin 框架无关的音频、绘图、SSE 及 Vue 示例引用。
- [x] 6.3 仅删除确认未被引用的演示文件，保持现有布局、通用 CRUD 组件、样式和部署配置不变。
- [x] 6.4 更新 README，记录真实 admin 接口、状态码、分页结构，以及通过“后端菜单 component + `src/views` 页面文件”新增功能的步骤。

## 7. 验证

- [x] 7.1 运行 `npm run build`，修复 TypeScript 与生产构建错误。
- [ ] 7.2 验证登录、刷新恢复、退出和会话过期流程均使用后端 HttpOnly Cookie 且不在前端持久化 Token。
- [ ] 7.3 使用不同权限角色验证用户、角色、权限菜单可见性以及新增、修改、删除、重置密码按钮权限。
- [ ] 7.4 验证 `/auth/user`、`/auth/role`、`/auth/perm` 直接刷新、未知菜单 code、未授权地址和 404 地址行为。
- [ ] 7.5 验证新增 `src/views` 页面并配置后端菜单 component 后，无需修改组件映射、认证与后台布局即可打开新页面。
