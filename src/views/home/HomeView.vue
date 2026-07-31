<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

defineOptions({ name: "HomeView" });

const { t } = useI18n();
const authStore = useAuthStore();
</script>

<template>
  <section class="home-page" :aria-label="t('app.home')">
    <div class="welcome-card">
      <p class="welcome-card__eyebrow">{{ t("app.title") }}</p>
      <h1 class="welcome-card__title">
        {{ t("home.greeting", { name: authStore.user?.nickname || authStore.user?.account || "" }) }}
      </h1>
      <p class="welcome-card__description">{{ t("home.description") }}</p>
      <span class="welcome-card__hint">{{ t("home.hint") }}</span>
    </div>
  </section>
</template>
