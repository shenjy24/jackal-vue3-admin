# Jackal Vue3 Admin

基于 Vue 3、Vite、TypeScript、Pinia、Vue Router 和 Element Plus 的后台管理前端工程。

项目内置了后台常见能力：HttpOnly Cookie 会话、登录态恢复、RBAC 权限控制、后端菜单动态路由、Element Plus 管理后台布局、标签页、国际化、CRUD 页面模式，以及 Nginx / Docker 部署约定。

## 技术栈

- Vue 3 + Vite
- TypeScript
- Vue Router
- Pinia
- Element Plus
- Vue I18n
- Axios

## 环境要求

建议使用 Node.js 18 或更高版本。

推荐开发工具：

- VSCode
- Volar
- 禁用 Vetur

## 快速启动

安装依赖：

```sh
npm install
```

启动开发服务：

```sh
npm run dev
```

生产构建：

```sh
npm run build
```

本地预览生产产物：

```sh
npm run preview
```

代码检查并自动修复：

```sh
npm run lint
```

## 环境变量

接口基础地址通过 `VITE_API_BASE_URL` 配置。

```sh
# .env.development / .env.production
VITE_API_BASE_URL=/api
```

如果不配置，默认使用 `/api`。

## 接口约定

前端统一使用 POST 请求，封装入口在 `src/api/client.ts`。

认证相关接口：

- `POST /auth/login`
- `POST /auth/session`
- `POST /auth/logout`

统一响应格式：

```ts
interface ApiResponse<T = unknown> {
  code: number | string;
  message: string;
  data: T;
}
```

成功码约定：

- 只有 `2000` 或 `"2000"` 视为成功
- `0` 不视为成功

成功时，拦截器会返回 `data`；失败时会抛出 `ApiClientError`，并触发全局接口错误事件。

`/auth/session` 需要返回当前用户、角色、菜单和权限码，用于恢复会话、注册动态路由、渲染侧边栏和进行按钮级权限控制。

## 目录说明

```txt
src/
  api/                 接口请求封装
  app/                 应用初始化
  assets/              静态样式和资源
  components/          通用组件
  components/crud/     CRUD 通用组件
  directives/          自定义指令
  hooks/               组合式逻辑
  i18n/                国际化配置
  layouts/             后台布局
  router/              路由和动态菜单
  stores/              Pinia 状态
  styles/              全局样式
  types/               TypeScript 类型
  utils/               工具方法
  views/               页面
deploy/
  nginx.conf           Nginx 部署配置
```

## 新增功能步骤

### 1. 新增普通页面

1. 在 `src/views` 下创建页面组件，例如：

```txt
src/views/order/OrderManageView.vue
```

2. 在 `src/router/componentMap.ts` 中注册组件 key：

```ts
export const componentMap = {
  Dashboard: () => import("@/views/dashboard/DashboardView.vue"),
  OrderManage: () => import("@/views/order/OrderManageView.vue")
};
```

3. 后端 `/auth/session` 返回菜单时，将菜单的 `component` 设置为上一步注册的 key：

```json
{
  "id": "order",
  "path": "/order",
  "name": "OrderManage",
  "component": "OrderManage",
  "meta": {
    "title": "menu.order",
    "icon": "Menu",
    "permission": "order:list"
  }
}
```

4. 在 `src/i18n/locales/zh-CN.ts` 和 `src/i18n/locales/en-US.ts` 中补充 `meta.title` 使用的文案。

5. 如果页面需要权限控制，在后端返回的 `permissions` 中加入对应权限码，例如 `order:list`。

### 2. 新增 CRUD 模块

1. 在 `src/api` 下新增接口文件，例如 `src/api/order.ts`：

```ts
import { createApi, listApi, removeApi, updateApi } from "./crud";
import type { PageQuery } from "@/types/admin";

export interface OrderItem {
  id: string | number;
  orderNo: string;
  status: string;
}

export interface OrderForm {
  orderNo: string;
  status: string;
}

export interface OrderFilter {
  orderNo?: string;
}

export const orderApi = {
  list: (query: PageQuery<OrderFilter>) => listApi<OrderItem, OrderFilter>("/order/list", query),
  create: (form: OrderForm) => createApi<OrderForm>("/order/create", form),
  update: (id: string | number, form: OrderForm) => updateApi<OrderForm>("/order/update", id, form),
  remove: (id: string | number) => removeApi("/order/delete", id)
};
```

2. 在页面中使用 `useCrud` 组织列表、分页、新增、编辑和删除逻辑。

3. 复用 `src/components/crud/QueryBar.vue` 和 `src/components/crud/CrudDialog.vue` 搭建查询区和表单弹窗。

4. 将页面组件注册到 `componentMap`，并由后端菜单返回对应 `component` key。

5. 后端接口保持统一响应格式，并确保成功时返回 `code: 2000` 或 `code: "2000"`。

### 3. 新增菜单图标

1. 从 `@element-plus/icons-vue` 引入图标。

2. 在 `src/router/componentMap.ts` 的 `iconMap` 中注册：

```ts
import { Tickets } from "@element-plus/icons-vue";

export const iconMap = {
  Tickets
};
```

3. 后端菜单的 `meta.icon` 返回注册名：

```json
{
  "meta": {
    "icon": "Tickets"
  }
}
```

### 4. 新增按钮权限

页面按钮可以配合权限指令控制显示：

```vue
<el-button v-permission="'order:create'" type="primary">新增</el-button>
```

后端 `/auth/session` 返回：

```json
{
  "permissions": ["order:list", "order:create", "order:update", "order:delete"]
}
```

## 路由和菜单说明

后台根路由使用 `src/layouts/AdminLayout.vue`。

登录后，前端调用 `/auth/session` 获取菜单数据，并通过 `src/router/dynamic.ts` 转成子路由。菜单中的 `component` 不直接接收任意路径，只能匹配 `src/router/componentMap.ts` 中已注册的 key。

这样可以避免后端返回任意组件路径带来的安全和构建问题。

## Nginx 部署

构建产物输出到 `dist`。

```sh
npm run build
```

将 `dist` 部署到 Nginx Web 根目录，并参考 `deploy/nginx.conf` 配置站点。

`deploy/nginx.conf` 已包含 history 模式回退：

```nginx
try_files $uri $uri/ /index.html;
```

部署时需要根据实际后端地址调整 `/api/` 的代理目标。

## Docker 部署

项目内置 `Dockerfile`，包含 Node 构建阶段和 Nginx 运行阶段。

```sh
docker build -t jackal-vue3-admin .
docker run --rm -p 8080:80 jackal-vue3-admin
```

访问：

```txt
http://localhost:8080
```

## 常见问题

### 登录后一直跳转登录页

检查 `/auth/session` 是否返回成功码 `2000` 或 `"2000"`，并确认浏览器请求携带了 Cookie。

### 菜单不显示或页面 404

检查后端菜单中的 `component` 是否已经在 `src/router/componentMap.ts` 注册。

### 按钮权限不生效

检查后端 `/auth/session` 返回的 `permissions` 是否包含页面中使用的权限码。

### 接口返回成功但前端仍提示失败

检查响应体 `code`。当前项目只把 `2000` 或 `"2000"` 当作成功，`0` 会被当作失败处理。
