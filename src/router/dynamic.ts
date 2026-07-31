import { RouterView, type RouteRecordRaw } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { resolveMenuComponent } from "./componentMap";
import { PermType, type AuthMenuVo } from "@/types/admin";
import { i18n } from "@/i18n";

export const ADMIN_ROUTE_NAME = "AdminRoot";
export const ADMIN_HOME_ROUTE_NAME = "AdminHome";

export const adminShellRoute: RouteRecordRaw = {
  path: "/",
  name: ADMIN_ROUTE_NAME,
  component: AdminLayout,
  meta: {
    title: "app.title"
  },
  children: [
    {
      path: "",
      name: ADMIN_HOME_ROUTE_NAME,
      component: () => import("@/views/home/HomeView.vue"),
      meta: {
        titleKey: "app.home",
        title: "首页",
        affix: true
      }
    }
  ]
};

export function menuDisplayTitle(menu: AuthMenuVo) {
  return i18n.global.locale.value === "en-US" && menu.nameEn?.trim() ? menu.nameEn : menu.name;
}

export function menusToRoutes(menus: AuthMenuVo[]): RouteRecordRaw[] {
  return [...menus]
    .sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
    .flatMap((menu) => {
      const children = menu.children?.length ? menusToRoutes(menu.children) : [];
      const isDirectory = menu.type === PermType.DIRECTORY || children.length > 0;
      const component = isDirectory ? RouterView : resolveMenuComponent(menu.component);

      if (!isDirectory && !component) {
        console.warn(
          `[router] Menu "${menu.code || menu.name}" has an invalid component: ${menu.component || "<empty>"}`
        );
        return [];
      }
      if (!menu.path) {
        console.warn(`[router] Menu "${menu.code || menu.name}" has no path and was skipped`);
        return [];
      }

      return [
        {
          path: normalizeRoutePath(menu.path),
          name: `AdminMenu-${menu.id}`,
          component,
          meta: {
            title: menu.name,
            titleEn: menu.nameEn,
            icon: menu.icon,
            menuId: menu.id,
            menuCode: menu.code,
            menuComponent: menu.component
          },
          children
        } satisfies RouteRecordRaw
      ];
    });
}

export function firstMenuPath(menus: AuthMenuVo[]): string | undefined {
  for (const menu of menus) {
    const childPath = menu.children?.length ? firstMenuPath(menu.children) : undefined;
    if (childPath) return childPath;
    if (menu.type !== PermType.DIRECTORY && menu.component && menu.path) return normalizeRoutePath(menu.path);
  }
  return undefined;
}

function normalizeRoutePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}
