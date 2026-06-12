# admin-dynamic-navigation Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: 后端菜单生成前端导航
系统 SHALL 将后端提供的菜单树转换为侧边栏导航和 Vue Router 路由记录。

#### Scenario: 菜单树加载完成
- **WHEN** 会话 API 返回菜单节点
- **THEN** 前端注册匹配的动态路由，并渲染侧边栏菜单树

### Requirement: 菜单组件使用前端白名单
系统 SHALL 通过本地白名单将后端组件 key 映射到前端组件。

#### Scenario: 已知组件 key
- **WHEN** 菜单节点引用已知组件 key
- **THEN** 前端使用映射组件注册该路由

#### Scenario: 未知组件 key
- **WHEN** 菜单节点引用未知组件 key
- **THEN** 前端不注册该路由，并记录不匹配信息用于调试

### Requirement: 菜单图标使用前端白名单
系统 SHALL 将后端图标 key 映射到已批准的前端图标。

#### Scenario: 已知图标 key
- **WHEN** 菜单节点引用已知图标 key
- **THEN** 侧边栏渲染对应图标

