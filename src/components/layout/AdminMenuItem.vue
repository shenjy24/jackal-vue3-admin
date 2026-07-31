<script setup lang="ts">
import { resolveMenuIcon } from "@/router/componentMap";
import { menuDisplayTitle } from "@/router/dynamic";
import { PermType, type AuthMenuVo } from "@/types/admin";

defineOptions({ name: "AdminMenuItem" });
defineProps<{ menu: AuthMenuVo }>();

function menuIndex(menu: AuthMenuVo) {
  if (!menu.path) return `menu-${menu.id}`;
  return menu.path.startsWith("/") ? menu.path : `/${menu.path}`;
}

function canOpenPage(menu: AuthMenuVo) {
  return menu.type !== PermType.DIRECTORY && menu.type !== PermType.BUTTON && Boolean(menu.path);
}
</script>

<template>
  <el-sub-menu v-if="menu.children?.length" :index="menuIndex(menu)">
    <template #title>
      <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
      <span>{{ menuDisplayTitle(menu) }}</span>
    </template>
    <AdminMenuItem v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>
  <el-menu-item v-else-if="canOpenPage(menu)" :index="menuIndex(menu)">
    <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
    <span>{{ menuDisplayTitle(menu) }}</span>
  </el-menu-item>
</template>
