import { defineStore } from "pinia";
import type { RouteLocationNormalizedLoaded } from "vue-router";

export interface VisitedTab {
  name: string;
  path: string;
  title: string;
  keepAlive: boolean;
}

export const useTabsStore = defineStore("tabs", {
  state: () => ({
    visitedTabs: [] as VisitedTab[]
  }),
  getters: {
    keepAliveNames: (state) => state.visitedTabs.filter((tab) => tab.keepAlive).map((tab) => tab.name)
  },
  actions: {
    addRoute(route: RouteLocationNormalizedLoaded) {
      if (!route.name || route.meta.hidden || route.name === "AdminRoot") return;
      const name = String(route.name);
      if (this.visitedTabs.some((tab) => tab.name === name)) return;
      this.visitedTabs.push({
        name,
        path: route.fullPath,
        title: route.meta.titleKey || route.meta.title || name,
        keepAlive: Boolean(route.meta.keepAlive)
      });
    },
    removeTab(path: string) {
      this.visitedTabs = this.visitedTabs.filter((tab) => tab.path !== path);
    },
    reset() {
      this.visitedTabs = [];
    }
  }
});
