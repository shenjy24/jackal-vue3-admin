import { post } from "./client";
import type { LoginPayload, SessionPayload } from "@/types/admin";

export function loginApi(payload: LoginPayload) {
  return post<unknown, LoginPayload>("/auth/login", payload);
}

export function sessionApi() {
  return post<SessionPayload>("/auth/session");
}

export function logoutApi() {
  return post<unknown>("/auth/logout");
}
