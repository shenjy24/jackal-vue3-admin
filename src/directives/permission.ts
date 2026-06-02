import type { Directive } from "vue";
import { hasPermission } from "@/utils/permissions";

export const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    if (!hasPermission(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
  updated(el, binding) {
    if (!hasPermission(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  }
};
