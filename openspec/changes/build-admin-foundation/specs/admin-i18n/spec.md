## ADDED Requirements

### Requirement: 应用支持中文和英文
系统 SHALL 为通用后台 UI 文案提供中文和英文 locale 资源。

#### Scenario: 切换语言
- **WHEN** 当前语言发生变化
- **THEN** 菜单、通用操作、表单标签和消息在存在翻译时使用所选语言渲染

### Requirement: 菜单标题使用 i18n key
系统 SHALL 使用菜单元数据中的 i18n key 渲染菜单和路由标题。

#### Scenario: 渲染动态菜单标题
- **WHEN** 后端菜单节点的 `meta.title` 包含 i18n key
- **THEN** 侧边栏、面包屑、标签页和文档标题使用翻译后的标签
