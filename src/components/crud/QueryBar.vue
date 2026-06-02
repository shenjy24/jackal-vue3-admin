<script setup lang="ts">
import { Search, Refresh } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

defineEmits<{
  search: [];
  reset: [];
}>();

const { t } = useI18n();
</script>

<template>
  <el-form inline class="query-bar" @submit.prevent="$emit('search')">
    <slot />
    <el-form-item>
      <el-button type="primary" :icon="Search" native-type="submit">{{ t("common.search") }}</el-button>
      <el-button :icon="Refresh" @click="$emit('reset')">{{ t("common.reset") }}</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.query-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 8px;
}
</style>
