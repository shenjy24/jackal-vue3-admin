<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();
const loading = ref(false);
const form = reactive({
  account: "",
  password: ""
});

async function submit() {
  if (!form.account || !form.password) return;
  loading.value = true;
  try {
    await authStore.login(form);
    await router.replace((route.query.redirect as string) || "/");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-panel">
      <h1 class="page-title">{{ t("app.title") }}</h1>
      <el-form class="login-form" :model="form" label-position="top" @submit.prevent="submit">
        <el-form-item :label="t('auth.account')">
          <el-input v-model="form.account" :placeholder="t('auth.accountPlaceholder')" autocomplete="username" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="t('auth.passwordPlaceholder')"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>
        <el-button class="login-form__button" type="primary" native-type="submit" :loading="loading">
          {{ t("auth.login") }}
        </el-button>
      </el-form>
    </section>
  </main>
</template>

<style scoped>
.login-form {
  margin-top: 20px;
}

.login-form__button {
  width: 100%;
}
</style>
