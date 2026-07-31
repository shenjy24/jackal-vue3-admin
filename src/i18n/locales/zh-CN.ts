export default {
  app: { title: "Jackal 管理后台", home: "首页" },
  common: {
    add: "新增", edit: "编辑", delete: "删除", search: "查询", reset: "重置", save: "保存",
    cancel: "取消", actions: "操作", logout: "退出登录", confirmLogout: "确认退出当前管理会话吗？",
    saveSuccess: "保存成功", deleteSuccess: "删除成功", language: "语言", welcome: "欢迎您",
    noPermission: "无权限访问", backHome: "返回首页"
  },
  auth: {
    login: "登录", account: "账号", password: "密码",
    accountPlaceholder: "请输入账号", passwordPlaceholder: "请输入密码"
  },
  home: {
    greeting: "你好，{name}", description: "这是管理后台的工作台。你可以从左侧菜单进入已授权的功能模块。",
    hint: "请选择左侧菜单开始操作"
  },
  menu: {
    user: "后台用户管理", role: "角色管理", permission: "权限管理"
  },
  menuCode: {
    "auth:manage": "权限管理", "auth:user": "后台用户管理",
    "auth:role": "角色管理", "auth:perm": "权限管理"
  },
  crud: {
    name: "名称", code: "权限码", account: "账号", nickname: "昵称", avatar: "头像地址",
    roles: "角色", icon: "图标", path: "路由路径", component: "页面组件", sort: "排序", remark: "备注"
  },
  user: {
    addTitle: "新增后台用户", editTitle: "编辑后台用户", resetPassword: "重置密码",
    confirmDelete: "确认删除用户“{name}”吗？", confirmResetPassword: "确认重置用户“{name}”的密码吗？",
    resetPasswordSuccess: "密码重置成功"
  },
  role: {
    addTitle: "新增角色", editTitle: "编辑角色", permissionTree: "权限树",
    selectRoleTip: "请选择左侧角色后分配权限",
    confirmDelete: "确认删除角色“{name}”吗？"
  },
  permission: {
    addTitle: "新增权限", editTitle: "编辑权限", parent: "父级权限", type: "权限类型",
    directoryType: "目录", menuType: "菜单", buttonType: "按钮",
    componentTip: "菜单填写相对 src/views 的无扩展名路径；目录和按钮留空。",
    confirmDelete: "确认删除权限“{name}”吗？"
  },
  error: { forbidden: "403 无权限", notFound: "404 页面不存在" }
};
