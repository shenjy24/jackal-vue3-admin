## ADDED Requirements

### Requirement: 后端菜单树生成侧边栏和动态路由
系统 SHALL 将 `listAuthMenu` 返回的菜单树转换为侧边栏节点和 Vue Router 动态路由。

#### Scenario: 加载权限管理菜单
- **WHEN** 后端返回 `auth:manage` 及其用户、角色、权限子菜单
- **THEN** 前端按后端层级与排序渲染目录和子菜单，并注册叶子页面路由

### Requirement: 菜单 component 使用构建期组件白名单
系统 SHALL 使用菜单 `component` 在 `import.meta.glob("/src/views/**/*.vue")` 生成的构建期模块集合中解析页面，禁止加载集合外文件。

#### Scenario: component 匹配本地页面
- **WHEN** 菜单 component 为 `system/UserManageView`
- **THEN** 前端加载 `/src/views/system/UserManageView.vue`

#### Scenario: component 无法匹配本地页面
- **WHEN** 后端返回的叶子菜单 component 不存在于构建期模块集合
- **THEN** 前端不注册该路由并输出可诊断警告

#### Scenario: component 包含越界路径
- **WHEN** 后端 component 包含 `..`、绝对路径或其他不允许的形式
- **THEN** 前端拒绝解析和注册该组件

### Requirement: 菜单 path 与元数据保持可导航
系统 SHALL 使用后端菜单 `path` 作为路由地址，并将菜单 ID、code、component、名称和图标写入路由元数据。

#### Scenario: 直接刷新授权页面
- **WHEN** 用户直接打开 `/auth/user` 且会话有效
- **THEN** 前端恢复菜单、注册路由并继续进入用户管理页

#### Scenario: 访问未授权菜单路径
- **WHEN** 用户访问不在其授权菜单树中的管理页面
- **THEN** 前端展示 403 或 404 页面而不渲染受保护内容

### Requirement: 后端图标名称通过白名单解析
系统 SHALL 兼容初始化菜单中的 `setting`、`user`、`team` 和 `lock` 图标名，并为未知图标提供统一回退。

#### Scenario: 渲染已知图标
- **WHEN** 菜单图标名存在于本地图标映射
- **THEN** 侧边栏显示对应 Element Plus 图标

### Requirement: 新业务通过菜单 component 和页面文件接入
系统 SHALL 允许新增 admin 功能通过新增后端菜单记录和前端页面文件接入现有框架，无需手工维护组件映射表。

#### Scenario: 接入新管理页面
- **WHEN** 开发者在 `src/views` 创建页面，并将后端菜单 component 配置为对应相对路径
- **THEN** 获得该菜单授权的用户可以通过动态导航打开页面，无需修改后台布局和认证流程
