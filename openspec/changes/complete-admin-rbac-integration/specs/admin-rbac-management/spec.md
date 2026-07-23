## ADDED Requirements

### Requirement: 管理员可以维护后台用户
系统 SHALL 提供后台用户查询、新增、修改、删除、角色绑定和密码重置能力，并使用 `auth:user:*` 权限码控制操作入口。

#### Scenario: 查询后台用户
- **WHEN** 有 `auth:user:query` 权限的管理员按昵称查询
- **THEN** 页面展示用户账号、昵称、头像和已绑定角色的分页结果

#### Scenario: 保存用户及角色
- **WHEN** 有对应保存或修改权限的管理员提交有效用户表单
- **THEN** 页面调用 `saveAuthUser` 或 `updateAuthUser` 并提交 `roleIds`

#### Scenario: 重置用户密码
- **WHEN** 有 `auth:user:reset` 权限的管理员确认重置密码
- **THEN** 页面调用 `resetPassword` 并展示操作结果

### Requirement: 管理员可以维护角色及其权限
系统 SHALL 提供角色查询、新增、修改、删除和权限树授权能力，并使用 `auth:role:*` 权限码控制操作入口。

#### Scenario: 编辑角色权限
- **WHEN** 管理员打开角色编辑弹窗
- **THEN** 页面加载 `listRolePerm` 返回的权限树和选中状态

#### Scenario: 保存角色权限
- **WHEN** 管理员提交角色表单
- **THEN** 页面将去重后的菜单与按钮权限 ID 通过 `permIds` 一并提交

#### Scenario: 删除已被用户绑定的角色
- **WHEN** 后端拒绝删除仍有关联用户的角色
- **THEN** 页面保留当前数据并展示后端业务错误

### Requirement: 管理员可以维护菜单和按钮权限
系统 SHALL 提供权限查询、新增、修改和删除能力，并支持目录、菜单与按钮三种权限类型。

#### Scenario: 查询权限
- **WHEN** 有 `auth:perm:query` 权限的管理员按 code、名称或类型查询
- **THEN** 页面展示 `parentId`、`code`、`name`、`type`、`icon`、`path`、`sort` 和 `remark`

#### Scenario: 保存菜单权限
- **WHEN** 管理员保存类型为菜单的权限
- **THEN** 表单允许配置父节点、code、名称、图标、路径、component 和排序，其中叶子菜单 component 指向 `src/views` 下的页面

#### Scenario: 保存按钮权限
- **WHEN** 管理员保存类型为按钮的权限
- **THEN** 表单要求选择所属菜单并配置用于前后端授权的权限码，component 保持为空

### Requirement: 无权限操作不进入业务请求
系统 SHALL 在模板和程序逻辑中使用当前页面按钮权限控制操作入口，同时以后端权限校验作为最终授权。

#### Scenario: 缺少新增用户权限
- **WHEN** 当前页面权限集合不包含 `auth:user:save`
- **THEN** 页面不展示新增用户按钮且不发起保存请求
