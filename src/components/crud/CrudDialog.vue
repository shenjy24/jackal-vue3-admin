<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  title: string;
  loading?: boolean;
}>();

const visible = defineModel<boolean>({ required: true });

defineEmits<{
  save: [];
}>();

const { t } = useI18n();
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="520px" destroy-on-close>
    <slot />
    <template #footer>
      <el-button @click="visible = false">{{ t("common.cancel") }}</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('save')">{{ t("common.save") }}</el-button>
    </template>
  </el-dialog>
</template>
