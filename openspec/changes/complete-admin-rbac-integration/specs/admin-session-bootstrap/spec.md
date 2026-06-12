## ADDED Requirements

### Requirement: 登录使用后端 HttpOnly Cookie 会话
系统 SHALL 在登录成功后依赖后端设置的 HttpOnly Cookie，不在前端保存或读取认证 Token。

#### Scenario: 登录成功
- **WHEN** `loginByAccount` 返回成功
- **THEN** 前端恢复当前用户和授权菜单后进入管理后台

#### Scenario: 登录失败
- **WHEN** 后端拒绝账号密码
- **THEN** 前端保留在登录页并展示后端错误消息

### Requirement: 应用通过分步接口恢复会话
系统 SHALL 在应用启动时并行调用 `getUser` 和 `listAuthMenu`，两者成功后才完成会话初始化。

#### Scenario: 刷新有效会话页面
- **WHEN** 浏览器已有有效管理端 Cookie
- **THEN** 前端恢复当前用户、角色和菜单，并重新注册授权动态路由

#### Scenario: 刷新已失效会话页面
- **WHEN** 任一会话初始化接口返回 `2001`
- **THEN** 前端清理本地权限与路由状态并跳转登录页

### Requirement: 页面按钮权限按菜单加载
系统 SHALL 在进入带菜单 ID 的业务路由前调用 `listAuthButton` 获取该页面按钮权限，并按菜单缓存权限码。

#### Scenario: 首次进入用户管理页
- **WHEN** 用户进入对应菜单路由且该菜单尚无按钮缓存
- **THEN** 前端使用菜单 `permId` 请求按钮列表并在渲染页面前保存权限码

#### Scenario: 再次进入已加载页面
- **WHEN** 当前会话中该菜单按钮权限已有缓存
- **THEN** 前端复用缓存且不重复请求按钮接口

### Requirement: 退出登录清理全部会话派生状态
系统 SHALL 在退出或会话失效时清理用户、角色、菜单、按钮权限缓存、动态路由状态和后台标签页。

#### Scenario: 用户退出登录
- **WHEN** 管理员执行退出操作
- **THEN** 前端调用 `logoff`、清理全部会话派生状态并返回登录页

