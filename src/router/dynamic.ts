import type { RouteRecordRaw } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { resolveMenuComponent } from "./componentMap";
import type { MenuNode } from "@/types/admin";

export const ADMIN_ROUTE_NAME = "AdminRoot";

export const adminShellRoute: RouteRecordRaw = {
  path: "/",
  name: ADMIN_ROUTE_NAME,
  component: AdminLayout,
  redirect: "/dashboard",
  meta: {
    title: "app.title"
  },
  children: []
};

export function menusToRoutes(menus: MenuNode[]): RouteRecordRaw[] {
  return menus.flatMap((menu) => {
    const children = menu.children ? menusToRoutes(menu.children) : [];
    const component = resolveMenuComponent(menu.component);

    if (!component && children.length === 0) {
      console.warn(`[router] Unknown menu component: ${menu.component}`);
      return [];
    }

    return [
      {
        path: normalizeChildPath(menu.path),
        name: menu.name,
        component,
        redirect: menu.redirect,
        meta: {
          ...menu.meta
        },
        children
      } satisfies RouteRecordRaw
    ];
  });
}

function normalizeChildPath(path: string) {
  return path.startsWith("/") ? path.slice(1) : path;
}
