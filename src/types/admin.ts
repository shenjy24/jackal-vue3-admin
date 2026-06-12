export type AdminId = number;

export interface ApiResponse<T = unknown> {
  code: string | number;
  message: string;
  data: T;
}

export interface JsonPage<T> {
  total: number;
  content: T[];
}

export interface PageQo {
  pageNum: number;
  pageSize: number;
}

export interface LoginAccountQo {
  account: string;
  password: string;
}

export interface IdQo {
  id: AdminId;
}

export interface AuthPermIdQo {
  permId: AdminId;
}

export interface AuthUserRoleVo {
  id: AdminId;
  name: string;
}

export interface AuthUserVo {
  id: AdminId;
  nickname: string;
  avatar?: string;
  account: string;
  roles: AuthUserRoleVo[];
}

export interface AuthRoleVo {
  id: AdminId;
  name: string;
  remark?: string;
}

export enum PermType {
  MENU = 1,
  BUTTON = 2
}

export interface AuthPermVo {
  id: AdminId;
  parentId: AdminId;
  code?: string;
  name: string;
  type: PermType;
  icon?: string;
  path?: string;
  component?: string;
  sort?: number;
  remark?: string;
}

export interface AuthMenuVo {
  id: AdminId;
  parentId: AdminId;
  code?: string;
  name: string;
  icon?: string;
  path?: string;
  component?: string;
  sort?: number;
  remark?: string;
  checked?: number;
  children?: AuthMenuVo[];
}

export interface AuthUserQueryQo extends PageQo {
  nickname?: string;
}

export interface AuthUserQo {
  id?: AdminId;
  nickname: string;
  avatar?: string;
  account: string;
  roleIds: AdminId[];
}

export interface AuthUserUpdateQo {
  nickname: string;
  avatar?: string;
  account: string;
}

export interface AuthUserPasswordUpdateQo {
  oldPassword: string;
  newPassword: string;
}

export interface AuthRoleQueryQo extends PageQo {
  name?: string;
}

export interface AuthRoleQo {
  id?: AdminId;
  name: string;
  remark?: string;
  permIds: AdminId[];
}

export interface AuthRolePermBindQo {
  roleId: AdminId;
  permIds: AdminId[];
}

export interface AuthUserRoleBindQo {
  userId: AdminId;
  roleIds: AdminId[];
}

export interface AuthPermQueryQo extends PageQo {
  code?: string;
  name?: string;
  type?: PermType;
}

export interface AuthPermQo {
  id?: AdminId;
  parentId: AdminId;
  code?: string;
  name: string;
  type: PermType;
  icon?: string;
  path?: string;
  component?: string;
  sort?: number;
  remark?: string;
}

export interface AdminRouteMeta {
  title: string;
  titleKey?: string;
  icon?: string;
  menuId?: AdminId;
  menuCode?: string;
  menuComponent?: string;
  keepAlive?: boolean;
  hidden?: boolean;
  affix?: boolean;
}
