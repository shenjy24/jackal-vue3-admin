<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ArrowDown,
  Close,
  Fold,
  SwitchButton
} from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useTabsStore } from "@/stores/tabs";
import { resolveMenuIcon } from "@/router/componentMap";
import type { MenuNode } from "@/types/admin";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const tabsStore = useTabsStore();
const { t } = useI18n();

const breadcrumbs = computed(() => route.matched.filter((item) => item.meta.title && !item.meta.hidden));

function menuIndex(menu: MenuNode) {
  return menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
}

function switchLocale(locale: "zh-CN" | "en-US") {
  settingsStore.changeLocale(locale);
}

async function logout() {
  await ElMessageBox.confirm(t("common.logout"), t("app.title"), {
    type: "warning"
  });
  await authStore.logout();
  tabsStore.reset();
  await router.push({ name: "Login" });
}

function closeTab(path: string) {
  const index = tabsStore.visitedTabs.findIndex((tab) => tab.path === path);
  tabsStore.removeTab(path);
  if (route.fullPath === path) {
    const next = tabsStore.visitedTabs[index - 1] || tabsStore.visitedTabs[0];
    router.push(next?.path || "/dashboard");
  }
}
</script>

<template>
  <el-container class="admin-shell">
    <el-aside class="admin-shell__aside" width="236px">
      <div class="admin-shell__brand">{{ t("app.title") }}</div>
      <el-scrollbar>
        <el-menu :default-active="route.path" router class="admin-menu">
          <template v-for="menu in authStore.menus" :key="menu.id">
            <el-sub-menu v-if="menu.children?.length" :index="menuIndex(menu)">
              <template #title>
                <el-icon v-if="menu.meta.icon && resolveMenuIcon(menu.meta.icon)">
                  <component :is="resolveMenuIcon(menu.meta.icon)" />
                </el-icon>
                <span>{{ t(menu.meta.title) }}</span>
              </template>
              <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="menuIndex(child)"
              >
                <el-icon v-if="child.meta.icon && resolveMenuIcon(child.meta.icon)">
                  <component :is="resolveMenuIcon(child.meta.icon)" />
                </el-icon>
                <span>{{ t(child.meta.title) }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menuIndex(menu)">
              <el-icon v-if="menu.meta.icon && resolveMenuIcon(menu.meta.icon)">
                <component :is="resolveMenuIcon(menu.meta.icon)" />
              </el-icon>
              <span>{{ t(menu.meta.title) }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="admin-shell__header">
        <div class="admin-shell__header-left">
          <el-button :icon="Fold" text />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ t(item.meta.title || "app.title") }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="admin-shell__header-right">
          <el-dropdown @command="switchLocale">
            <el-button text>
              {{ settingsStore.locale }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en-US">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="admin-shell__user">{{ authStore.user?.nickname || authStore.user?.username }}</span>
          <el-button :icon="SwitchButton" text @click="logout">{{ t("common.logout") }}</el-button>
        </div>
      </el-header>

      <div class="admin-tabs">
        <button
          v-for="tab in tabsStore.visitedTabs"
          :key="tab.path"
          class="admin-tabs__item"
          :class="{ 'is-active': tab.path === route.fullPath }"
          @click="router.push(tab.path)"
        >
          <span>{{ t(tab.title) }}</span>
          <el-icon v-if="!tab.keepAlive" @click.stop="closeTab(tab.path)"><Close /></el-icon>
        </button>
      </div>

      <el-main class="admin-shell__main">
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="tabsStore.keepAliveNames">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>
