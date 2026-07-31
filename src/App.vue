<script setup lang="ts">
import { computed } from "vue";
import { ElConfigProvider } from "element-plus";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();
const elementLocale = computed(() => (settingsStore.locale === "zh-CN" ? zhCn : en));
</script>

<template>
  <ElConfigProvider :locale="elementLocale">
    <RouterView />
  </ElConfigProvider>
</template>
