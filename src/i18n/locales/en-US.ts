export default {
  app: { title: "Jackal Admin" },
  common: {
    add: "Add", edit: "Edit", delete: "Delete", search: "Search", reset: "Reset", save: "Save",
    cancel: "Cancel", actions: "Actions", logout: "Logout",
    confirmLogout: "Log out of the current admin session?", saveSuccess: "Saved successfully",
    deleteSuccess: "Deleted successfully", language: "Language",
    noPermission: "No permission", backHome: "Back to Home"
  },
  auth: {
    login: "Login", account: "Account", password: "Password",
    accountPlaceholder: "Enter account", passwordPlaceholder: "Enter password"
  },
  menu: {
    user: "Admin Users", role: "Roles", permission: "Permissions"
  },
  menuCode: {
    "auth:manage": "Access Control", "auth:user": "Admin Users",
    "auth:role": "Roles", "auth:perm": "Permissions"
  },
  crud: {
    name: "Name", code: "Permission Code", account: "Account", nickname: "Nickname",
    avatar: "Avatar URL", roles: "Roles", icon: "Icon", path: "Route Path",
    component: "View Component", sort: "Sort", remark: "Remark"
  },
  user: {
    addTitle: "Add Admin User", editTitle: "Edit Admin User", resetPassword: "Reset Password",
    confirmDelete: "Delete user '{name}'?", confirmResetPassword: "Reset the password for '{name}'?",
    resetPasswordSuccess: "Password reset successfully"
  },
  role: {
    addTitle: "Add Role", editTitle: "Edit Role", permissionTree: "Permission Tree",
    confirmDelete: "Delete role '{name}'?"
  },
  permission: {
    addTitle: "Add Permission", editTitle: "Edit Permission", parent: "Parent Permission",
    type: "Permission Type", menuType: "Menu", buttonType: "Button",
    componentTip: "Leaf menus use a path relative to src/views without an extension; directories leave it empty.",
    confirmDelete: "Delete permission '{name}'?"
  },
  error: { forbidden: "403 Forbidden", notFound: "404 Not Found" }
};
