<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowDown, Close, Fold, SwitchButton } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import AdminMenuItem from "@/components/layout/AdminMenuItem.vue";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useTabsStore } from "@/stores/tabs";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const tabsStore = useTabsStore();
const { t } = useI18n();

const breadcrumbs = computed(() => route.matched.filter((item) => item.meta.title && !item.meta.hidden));

function routeTitle(title: string, titleKey?: string) {
  return titleKey ? t(titleKey) : title;
}

function tabTitle(title: string) {
  return t(title, title);
}

function switchLocale(locale: "zh-CN" | "en-US") {
  settingsStore.changeLocale(locale);
}

async function logout() {
  await ElMessageBox.confirm(t("common.confirmLogout"), t("common.logout"), { type: "warning" });
  await authStore.logout();
  await router.push({ name: "Login" });
}

function closeTab(path: string) {
  const index = tabsStore.visitedTabs.findIndex((tab) => tab.path === path);
  tabsStore.removeTab(path);
  if (route.fullPath === path) {
    const next = tabsStore.visitedTabs[index - 1] || tabsStore.visitedTabs[0];
    router.push(next?.path || "/");
  }
}
</script>

<template>
  <el-container class="admin-shell">
    <el-aside class="admin-shell__aside" width="236px">
      <div class="admin-shell__brand">{{ t("app.title") }}</div>
      <el-scrollbar>
        <el-menu :default-active="route.path" router class="admin-menu">
          <AdminMenuItem v-for="menu in authStore.menus" :key="menu.id" :menu="menu" />
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="admin-shell__header">
        <div class="admin-shell__header-left">
          <el-button :icon="Fold" text />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ routeTitle(item.meta.title, item.meta.titleKey) }}
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
          <span class="admin-shell__user">{{ authStore.user?.nickname || authStore.user?.account }}</span>
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
          <span>{{ tabTitle(tab.title) }}</span>
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
