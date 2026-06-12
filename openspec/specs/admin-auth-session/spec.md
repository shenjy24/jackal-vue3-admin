# admin-auth-session Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: 登录建立 HttpOnly 会话
系统 SHALL 通过 `POST /auth/login` 认证用户，并依赖后端设置 HttpOnly Cookie 会话。

#### Scenario: 登录成功
- **WHEN** 用户提交有效账号密码
- **THEN** 后端设置会话 Cookie，前端请求当前会话上下文

#### Scenario: 登录失败
- **WHEN** 用户提交无效账号密码
- **THEN** 前端展示后端错误消息，并且不进入后台 shell

### Requirement: 当前会话恢复应用状态
系统 SHALL 在应用启动时和登录成功后调用 `POST /auth/session`，获取当前用户、角色、菜单和权限。

#### Scenario: 已存在有效会话
- **WHEN** 应用启动且会话 Cookie 有效
- **THEN** 前端恢复用户状态、权限、动态路由和菜单

#### Scenario: 会话缺失或过期
- **WHEN** 应用启动且不存在有效会话
- **THEN** 前端将用户重定向到登录页

### Requirement: 退出登录清理会话
系统 SHALL 调用 `POST /auth/logout` 结束当前会话。

#### Scenario: 退出登录成功
- **WHEN** 用户执行退出登录
- **THEN** 前端清理本地用户状态并返回登录页

