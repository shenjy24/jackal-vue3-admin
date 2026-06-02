import { defineStore } from "pinia";
import { setLocale, type SupportedLocale } from "@/i18n";

const STORAGE_KEY = "jackal-admin-locale";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    locale: (localStorage.getItem(STORAGE_KEY) || "zh-CN") as SupportedLocale
  }),
  actions: {
    changeLocale(locale: SupportedLocale) {
      this.locale = locale;
      localStorage.setItem(STORAGE_KEY, locale);
      setLocale(locale);
    }
  }
});
