# admin-rbac-permissions Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: 会话暴露 RBAC 上下文
系统 SHALL 使用当前会话 API 返回的角色和权限码表示授权信息。

#### Scenario: 会话包含权限
- **WHEN** 前端收到会话数据
- **THEN** 前端存储角色和权限码，用于路由和按钮授权

### Requirement: UI 中执行按钮权限控制
系统 SHALL 通过模板指令和程序化权限检查提供按钮级授权。

#### Scenario: 有权限按钮
- **WHEN** 用户拥有按钮要求的权限码
- **THEN** 按钮根据页面实现可见且可用

#### Scenario: 无权限按钮
- **WHEN** 用户缺少按钮要求的权限码
- **THEN** 按钮不渲染，或以其他方式不可访问

### Requirement: 阻止访问无权限路由
系统 SHALL 阻止用户打开不在其授权菜单或路由集合中的路由。

#### Scenario: 用户打开未授权路由
- **WHEN** 用户导航到授权动态路由之外的路由
- **THEN** 前端展示无权限或未找到页面，而不是受保护页面

