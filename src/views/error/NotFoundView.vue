<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <main class="error-page">
    <section class="error-panel">
      <h1 class="page-title">{{ t("error.notFound") }}</h1>
      <el-button type="primary" @click="$router.push('/')">{{ t("common.backHome") }}</el-button>
    </section>
  </main>
</template>
