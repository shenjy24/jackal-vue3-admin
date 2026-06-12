# admin-api-client Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: API 客户端使用 POST 发起服务调用
系统 SHALL 通过统一客户端以 POST 方式发送服务 API 请求。

#### Scenario: 发起服务请求
- **WHEN** 应用代码调用 API 模块
- **THEN** 请求会以 POST 方式发送，并携带提供的 payload

### Requirement: API 客户端携带 credentials
系统 SHALL 在需要 HttpOnly Cookie 会话的 API 请求中携带 credentials。

#### Scenario: 认证请求
- **WHEN** 发送需要认证的 API 调用
- **THEN** 浏览器会根据 Cookie 和 CORS 配置携带会话 Cookie

### Requirement: API 客户端解包标准响应
系统 SHALL 使用标准 `code`、`message`、`data` 结构对响应进行标准化处理。

#### Scenario: 成功响应
- **WHEN** 后端返回成功的标准响应
- **THEN** API 客户端向调用代码返回 `data` 数据

#### Scenario: 未登录响应
- **WHEN** 后端表示当前会话未登录
- **THEN** 前端清理会话状态并跳转到登录页

