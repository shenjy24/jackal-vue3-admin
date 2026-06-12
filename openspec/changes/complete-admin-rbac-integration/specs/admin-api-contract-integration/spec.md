## ADDED Requirements

### Requirement: 管理端请求使用真实 admin 接口
系统 SHALL 通过统一 API 客户端调用 `jackal-java-template` 的 `/admin/auth/*` 接口，并保持所有服务请求使用 POST。

#### Scenario: 账号密码登录
- **WHEN** 管理员提交账号和密码
- **THEN** 前端调用 `POST /admin/auth/loginByAccount` 并发送 `account` 与 `password`

#### Scenario: 调用权限管理接口
- **WHEN** 页面查询或修改用户、角色或权限
- **THEN** 前端调用 `AdminAuthController` 中对应的 `/admin/auth/*` 接口

### Requirement: API 客户端处理后端统一状态码
系统 SHALL 将 `2000` 识别为成功、`2001` 识别为未登录、`2002` 识别为无权限，并保留后端业务错误消息。

#### Scenario: 成功响应
- **WHEN** 后端返回 `code: "2000"`
- **THEN** API 客户端向调用方返回响应中的 `data`

#### Scenario: 会话失效
- **WHEN** 后端返回 `code: "2001"`
- **THEN** 前端清理认证状态并跳转登录页

#### Scenario: 接口无权限
- **WHEN** 后端返回 `code: "2002"`
- **THEN** 前端阻止当前操作并展示无权限反馈

### Requirement: 分页契约与后端保持一致
系统 SHALL 使用 `pageNum`、`pageSize` 发送分页请求，并将后端 `{ total, content }` 响应提供给列表页面。

#### Scenario: 查询用户分页
- **WHEN** 用户管理页请求第 N 页数据
- **THEN** 请求包含 `pageNum`、`pageSize` 和 `nickname`，页面使用 `content` 渲染行并使用 `total` 渲染分页

### Requirement: API 模型使用后端字段语义
系统 SHALL 使用 `account`、`nickname`、`avatar`、`roleIds`、`permIds`、`component` 等后端实际字段，不得继续依赖示例字段。

#### Scenario: 保存后台用户
- **WHEN** 管理员提交用户表单
- **THEN** 请求体符合 `AuthUserQo` 并包含所选角色 ID

#### Scenario: 保存叶子菜单组件
- **WHEN** 管理员提交可打开页面的菜单权限
- **THEN** 请求体符合 `AuthPermQo` 并包含相对 `src/views` 的 `component` 路径
