import { createI18n } from "vue-i18n";
import enUS from "./locales/en-US";
import zhCN from "./locales/zh-CN";

export type SupportedLocale = "zh-CN" | "en-US";

export const i18n = createI18n({
  legacy: false,
  locale: (localStorage.getItem("jackal-admin-locale") || "zh-CN") as SupportedLocale,
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS
  }
});

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale;
}
