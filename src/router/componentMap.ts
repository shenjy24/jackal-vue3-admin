import type { Component } from "vue";
import {
  House,
  Lock,
  Menu as MenuIcon,
  Setting,
  User,
  UserFilled
} from "@element-plus/icons-vue";

const viewModules = import.meta.glob("/src/views/**/*.vue");

const iconMap: Record<string, Component> = {
  house: House,
  setting: Setting,
  user: User,
  team: UserFilled,
  lock: Lock,
  menu: MenuIcon
};

export function resolveMenuComponent(component?: string) {
  const value = component?.trim();
  if (!value) return undefined;
  if (
    value.includes("..") ||
    value.includes("\\") ||
    value.startsWith("/") ||
    /^[a-zA-Z]:/.test(value)
  ) {
    return undefined;
  }

  const normalized = value.replace(/\.vue$/, "");
  return viewModules[`/src/views/${normalized}.vue`];
}

export function resolveMenuIcon(key?: string) {
  if (!key) return MenuIcon;
  return iconMap[key.toLowerCase()] || MenuIcon;
}
