import type { Component } from "vue";

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface UserInfo {
  id: string | number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  enabled?: boolean;
}

export interface RoleInfo {
  id?: string | number;
  code: string;
  name: string;
  remark?: string;
}

export interface PermissionInfo {
  id?: string | number;
  code: string;
  name: string;
}

export interface AdminRouteMeta {
  title: string;
  icon?: string;
  keepAlive?: boolean;
  permission?: string;
  hidden?: boolean;
  affix?: boolean;
}

export interface MenuNode {
  id: string | number;
  parentId?: string | number | null;
  path: string;
  name: string;
  component?: string;
  redirect?: string;
  meta: AdminRouteMeta;
  children?: MenuNode[];
}

export interface SessionPayload {
  user: UserInfo;
  roles: string[];
  menus: MenuNode[];
  permissions: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PageQuery<TFilter = Record<string, unknown>> {
  page: number;
  pageSize: number;
  filters?: TFilter;
}

export interface PageResult<TItem> {
  list: TItem[];
  total: number;
}

export interface CrudApi<TItem, TForm = Partial<TItem>, TFilter = Record<string, unknown>> {
  list: (query: PageQuery<TFilter>) => Promise<PageResult<TItem>>;
  create: (form: TForm) => Promise<unknown>;
  update: (id: string | number, form: TForm) => Promise<unknown>;
  remove: (id: string | number) => Promise<unknown>;
}

export type ComponentResolver = () => Promise<Component>;
