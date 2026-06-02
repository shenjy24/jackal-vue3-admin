import type { App } from "vue";
import { createPinia } from "pinia";

export function setupApp(app: App) {
  const pinia = createPinia();

  app.use(pinia);
}
