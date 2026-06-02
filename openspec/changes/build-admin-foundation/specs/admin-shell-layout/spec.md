## ADDED Requirements

### Requirement: 后台 shell 提供标准布局
系统 SHALL 提供认证后的后台 shell，包括侧边栏、顶部栏、面包屑、内容区和路由出口。

#### Scenario: 已认证用户进入后台 shell
- **WHEN** 有效会话恢复完成
- **THEN** 用户看到后台布局和授权导航

### Requirement: 多标签页导航记录已访问页面
系统 SHALL 为已访问的后台页面提供多标签页导航。

#### Scenario: 用户打开多个页面
- **WHEN** 用户在多个授权页面之间导航
- **THEN** 标签栏列出已访问页面，并允许在它们之间切换

### Requirement: keep-alive 由路由元数据控制
系统 SHALL 仅在路由元数据启用 keep-alive 时缓存路由组件。

#### Scenario: 启用 keep-alive 的路由
- **WHEN** 路由的 `meta.keepAlive` 设置为 true
- **THEN** 页面组件被加入 keep-alive 缓存

#### Scenario: 未启用 keep-alive 的路由
- **WHEN** 路由未启用 keep-alive
- **THEN** 再次访问时页面组件会重新创建
