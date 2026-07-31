import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from "./App.vue";
import { setupApp } from "./app/setup";
import { permissionDirective } from "./directives/permission";
import { i18n } from "./i18n";
import router from "./router";
import "./styles/main.css";

const app = createApp(App);

setupApp(app);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.use(i18n);
app.directive("permission", permissionDirective);

app.mount("#app");
