import { useAuthStore } from "@/stores/auth";

export function hasPermission(code?: string | string[]) {
  return useAuthStore().hasPermission(code);
}
