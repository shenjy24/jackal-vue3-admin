import { defineStore } from "pinia";
import { loginApi, logoutApi, sessionApi } from "@/api/auth";
import type { LoginPayload, MenuNode, SessionPayload, UserInfo } from "@/types/admin";

interface AuthState {
  user: UserInfo | null;
  roles: string[];
  permissions: string[];
  menus: MenuNode[];
  sessionReady: boolean;
  dynamicRoutesReady: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    roles: [],
    permissions: [],
    menus: [],
    sessionReady: false,
    dynamicRoutesReady: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    hasPermission: (state) => (code?: string | string[]) => {
      if (!code) return true;
      const required = Array.isArray(code) ? code : [code];
      return required.some((item) => state.permissions.includes(item));
    }
  },
  actions: {
    setSession(payload: SessionPayload) {
      this.user = payload.user;
      this.roles = payload.roles || [];
      this.permissions = payload.permissions || [];
      this.menus = payload.menus || [];
      this.sessionReady = true;
    },
    clearSession() {
      this.user = null;
      this.roles = [];
      this.permissions = [];
      this.menus = [];
      this.sessionReady = false;
      this.dynamicRoutesReady = false;
    },
    markDynamicRoutesReady() {
      this.dynamicRoutesReady = true;
    },
    async login(payload: LoginPayload) {
      await loginApi(payload);
      await this.restoreSession();
    },
    async restoreSession() {
      const session = await sessionApi();
      this.setSession(session);
      return session;
    },
    async logout() {
      try {
        await logoutApi();
      } finally {
        this.clearSession();
      }
    }
  }
});
