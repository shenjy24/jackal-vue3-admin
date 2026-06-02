import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { ElMessage } from "element-plus";
import { API_FORBIDDEN_CODES, API_UNAUTHORIZED_CODES, ApiClientError } from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useTabsStore } from "@/stores/tabs";
import { i18n } from "@/i18n";
import { adminShellRoute, ADMIN_ROUTE_NAME, menusToRoutes } from "./dynamic";

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
    router.addRoute(ADMIN_ROUTE_NAME, route);
  });
  authStore.markDynamicRoutesReady();
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isPublic = to.name === "Login" || to.name === "Forbidden";
  const dynamicRoutesWereReady = authStore.dynamicRoutesReady;

  if (isPublic) return true;

  try {
    if (!authStore.sessionReady) {
      await authStore.restoreSession();
    }
    registerDynamicRoutes();

    if (!dynamicRoutesWereReady && to.name === "NotFound") {
      return to.fullPath;
    }

    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      return { name: "Forbidden" };
    }

    if (!to.matched.length) {
      return { name: "NotFound" };
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
      ElMessage.error(error.message);
    }
    authStore.clearSession();
    return { name: "Login", query: { redirect: to.fullPath } };
  }
});

router.afterEach((to) => {
  const tabsStore = useTabsStore();
  tabsStore.addRoute(to);
  document.title = `${i18n.global.t(to.meta.title || "app.title")} - ${i18n.global.t("app.title")}`;
});

window.addEventListener("admin:api-error", (event) => {
  const detail = (event as CustomEvent<{ code: number; message: string }>).detail;
  if (API_UNAUTHORIZED_CODES.includes(detail.code)) {
    useAuthStore().clearSession();
    router.push({ name: "Login" });
  }
});

export default router;
