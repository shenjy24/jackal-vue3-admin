import type { Component } from "vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const viewModules = import.meta.glob("/src/views/**/*.vue");

const iconMap = Object.entries(ElementPlusIconsVue).reduce<Record<string, Component>>((map, [name, component]) => {
  map[name.toLowerCase()] = component;
  return map;
}, {});

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
  const normalizedKey = key?.trim().toLowerCase();
  return normalizedKey ? iconMap[normalizedKey] : undefined;
}
