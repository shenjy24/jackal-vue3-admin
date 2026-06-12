import { defineStore } from "pinia";
import {
  getUser,
  listAuthButton,
  listAuthMenu,
  loginByAccount,
  logoff,
  updatePassword
} from "@/api/auth";
import { resetDynamicRoutes } from "@/router/dynamicRegistry";
import { useTabsStore } from "@/stores/tabs";
import type {
  AdminId,
  AuthMenuVo,
  AuthUserPasswordUpdateQo,
  AuthUserRoleVo,
  AuthUserVo,
  LoginAccountQo
} from "@/types/admin";

interface AuthState {
  user: AuthUserVo | null;
  roles: AuthUserRoleVo[];
  menus: AuthMenuVo[];
  buttonPermissions: Record<string, string[]>;
  currentMenuId: AdminId | null;
  sessionReady: boolean;
  dynamicRoutesReady: boolean;
}

let restorePromise: Promise<void> | null = null;

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    roles: [],
    menus: [],
    buttonPermissions: {},
    currentMenuId: null,
    sessionReady: false,
    dynamicRoutesReady: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    currentPermissions: (state) =>
      state.currentMenuId === null ? [] : state.buttonPermissions[String(state.currentMenuId)] || [],
    hasPermission() {
      return (code?: string | string[]) => {
        if (!code) return true;
        const required = Array.isArray(code) ? code : [code];
        return required.some((item) => this.currentPermissions.includes(item));
      };
    }
  },
  actions: {
    clearSession() {
      this.user = null;
      this.roles = [];
      this.menus = [];
      this.buttonPermissions = {};
      this.currentMenuId = null;
      this.sessionReady = false;
      this.dynamicRoutesReady = false;
      restorePromise = null;
      resetDynamicRoutes();
      useTabsStore().reset();
    },
    markDynamicRoutesReady() {
      this.dynamicRoutesReady = true;
    },
    activateMenu(menuId?: AdminId) {
      this.currentMenuId = menuId ?? null;
    },
    async loadButtonPermissions(menuId: AdminId) {
      const key = String(menuId);
      if (Object.prototype.hasOwnProperty.call(this.buttonPermissions, key)) {
        return this.buttonPermissions[key];
      }
      const buttons = await listAuthButton({ permId: menuId });
      const codes = buttons.map((button) => button.code).filter((code): code is string => Boolean(code));
      this.buttonPermissions[key] = codes;
      return codes;
    },
    async login(payload: LoginAccountQo) {
      await loginByAccount(payload);
      await this.restoreSession();
    },
    async restoreSession() {
      if (this.sessionReady) return;
      if (restorePromise) return restorePromise;

      restorePromise = (async () => {
        const [user, menus] = await Promise.all([getUser(), listAuthMenu()]);
        this.user = user;
        this.roles = user.roles || [];
        this.menus = menus || [];
        this.buttonPermissions = {};
        this.currentMenuId = null;
        this.sessionReady = true;
      })();

      try {
        await restorePromise;
      } finally {
        restorePromise = null;
      }
    },
    async changePassword(payload: AuthUserPasswordUpdateQo) {
      try {
        await updatePassword(payload);
      } finally {
        this.clearSession();
      }
    },
    async logout() {
      try {
        await logoff();
      } finally {
        this.clearSession();
      }
    }
  }
});
