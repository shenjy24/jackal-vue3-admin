import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { API_FORBIDDEN_CODES, API_UNAUTHORIZED_CODES, ApiClientError } from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useTabsStore } from "@/stores/tabs";
import { i18n } from "@/i18n";
import { adminShellRoute, ADMIN_HOME_ROUTE_NAME, ADMIN_ROUTE_NAME, menusToRoutes } from "./dynamic";
import { registerDynamicRouteRemover } from "./dynamicRegistry";

const publicRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { title: "auth.login", hidden: true }
  },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/error/ForbiddenView.vue"),
    meta: { title: "error.forbidden", hidden: true }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFoundView.vue"),
    meta: { title: "error.notFound", hidden: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [adminShellRoute, ...publicRoutes]
});

function registerDynamicRoutes() {
  const authStore = useAuthStore();
  if (authStore.dynamicRoutesReady) return;

  menusToRoutes(authStore.menus).forEach((route) => {
    registerDynamicRouteRemover(router.addRoute(ADMIN_ROUTE_NAME, route));
  });
  authStore.markDynamicRoutesReady();
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isPublic = to.name === "Login" || to.name === "Forbidden";

  if (isPublic) {
    if (to.name === "Login" && authStore.sessionReady) {
      return { name: ADMIN_HOME_ROUTE_NAME };
    }
    return true;
  }

  try {
    const routesWereReady = authStore.dynamicRoutesReady;
    if (!authStore.sessionReady) {
      await authStore.restoreSession();
    }
    registerDynamicRoutes();

    if (to.name === ADMIN_ROUTE_NAME) {
      return { name: ADMIN_HOME_ROUTE_NAME };
    }

    if (!routesWereReady && to.name === "NotFound") {
      return { path: to.fullPath, replace: true };
    }

    const menuId = to.meta.menuId;
    authStore.activateMenu(menuId);
    if (menuId) {
      await authStore.loadButtonPermissions(menuId);
    }
    return true;
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (API_UNAUTHORIZED_CODES.includes(error.code)) {
        authStore.clearSession();
        return { name: "Login", query: { redirect: to.fullPath } };
      }
      if (API_FORBIDDEN_CODES.includes(error.code)) {
        return { name: "Forbidden" };
      }
    }
    return false;
  }
});

router.afterEach((to) => {
  useTabsStore().addRoute(to);
  document.title = i18n.global.t("app.title");
});

window.addEventListener("admin:api-error", (event) => {
  const detail = (event as CustomEvent<{ code: number | string }>).detail;
  if (API_UNAUTHORIZED_CODES.includes(detail.code)) {
    useAuthStore().clearSession();
    router.push({ name: "Login" });
  }
});

export default router;
