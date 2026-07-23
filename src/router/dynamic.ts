import { RouterView, type RouteRecordRaw } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { i18n } from "@/i18n";
import { resolveMenuComponent } from "./componentMap";
import { PermType, type AuthMenuVo } from "@/types/admin";

export const ADMIN_ROUTE_NAME = "AdminRoot";

export const adminShellRoute: RouteRecordRaw = {
  path: "/",
  name: ADMIN_ROUTE_NAME,
  component: AdminLayout,
  meta: {
    title: "app.title"
  },
  children: []
};

export function menuTitleKey(menu: AuthMenuVo) {
  const key = menu.code ? `menuCode.${menu.code}` : "";
  return key && i18n.global.te(key) ? key : undefined;
}

export function menuDisplayTitle(menu: AuthMenuVo) {
  const key = menuTitleKey(menu);
  return key ? i18n.global.t(key) : menu.name;
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
            titleKey: menuTitleKey(menu),
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
