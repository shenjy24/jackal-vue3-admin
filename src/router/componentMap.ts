import type { Component } from "vue";
import {
  House,
  Menu as MenuIcon,
  Setting,
  User,
  UserFilled
} from "@element-plus/icons-vue";

export const componentMap = {
  Dashboard: () => import("@/views/dashboard/DashboardView.vue"),
  UserManage: () => import("@/views/system/UserManageView.vue"),
  RoleManage: () => import("@/views/system/RoleManageView.vue"),
  MenuManage: () => import("@/views/system/MenuManageView.vue")
};

export type ComponentKey = keyof typeof componentMap;

export const iconMap: Record<string, Component> = {
  House,
  Menu: MenuIcon,
  Setting,
  User,
  UserFilled
};

export function resolveMenuComponent(key?: string) {
  if (!key) return undefined;
  return componentMap[key as ComponentKey];
}

export function resolveMenuIcon(key?: string) {
  if (!key) return undefined;
  return iconMap[key];
}
