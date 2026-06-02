import "vue-router";
import type { AdminRouteMeta } from "./admin";

declare module "vue-router" {
  interface RouteMeta extends AdminRouteMeta {}
}
