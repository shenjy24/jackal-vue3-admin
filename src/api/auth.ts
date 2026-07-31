import { post } from "./client";
import type {
  AuthMenuVo,
  AuthPermIdQo,
  AuthPermQo,
  AuthPermQueryQo,
  AuthPermVo,
  AuthRoleQo,
  AuthRolePermBindQo,
  AuthRoleQueryQo,
  AuthRoleVo,
  AuthUserPasswordUpdateQo,
  AuthUserQo,
  AuthUserQueryQo,
  AuthUserUpdateQo,
  AuthUserVo,
  IdQo,
  JsonPage,
  LoginAccountQo
} from "@/types/admin";

const ADMIN_AUTH = "/admin/auth";

export function loginByAccount(payload: LoginAccountQo) {
  return post<AuthUserVo, LoginAccountQo>(`${ADMIN_AUTH}/loginByAccount`, payload);
}

export function logoff() {
  return post<void>(`${ADMIN_AUTH}/logoff`);
}

export function getUser() {
  return post<AuthUserVo>(`${ADMIN_AUTH}/getUser`);
}

export function updateUser(payload: AuthUserUpdateQo) {
  return post<AuthUserVo, AuthUserUpdateQo>(`${ADMIN_AUTH}/updateUser`, payload);
}

export function updatePassword(payload: AuthUserPasswordUpdateQo) {
  return post<void, AuthUserPasswordUpdateQo>(`${ADMIN_AUTH}/updatePassword`, payload);
}

export function listAuthMenu() {
  return post<AuthMenuVo[]>(`${ADMIN_AUTH}/listAuthMenu`);
}

export function listAuthButton(payload: AuthPermIdQo) {
  return post<AuthPermVo[], AuthPermIdQo>(`${ADMIN_AUTH}/listAuthButton`, payload);
}

export function getAuthUser(payload: IdQo) {
  return post<AuthUserVo, IdQo>(`${ADMIN_AUTH}/getAuthUser`, payload);
}

export function queryAuthUser(payload: AuthUserQueryQo) {
  return post<JsonPage<AuthUserVo>, AuthUserQueryQo>(`${ADMIN_AUTH}/queryAuthUser`, payload);
}

export function saveAuthUser(payload: AuthUserQo) {
  return post<AuthUserVo, AuthUserQo>(`${ADMIN_AUTH}/saveAuthUser`, payload);
}

export function updateAuthUser(payload: AuthUserQo) {
  return post<AuthUserVo, AuthUserQo>(`${ADMIN_AUTH}/updateAuthUser`, payload);
}

export function deleteAuthUser(payload: IdQo) {
  return post<void, IdQo>(`${ADMIN_AUTH}/deleteAuthUser`, payload);
}

export function resetPassword(payload: IdQo) {
  return post<void, IdQo>(`${ADMIN_AUTH}/resetPassword`, payload);
}

export function getAuthRole(payload: IdQo) {
  return post<AuthRoleVo, IdQo>(`${ADMIN_AUTH}/getAuthRole`, payload);
}

export function queryAuthRole(payload: AuthRoleQueryQo) {
  return post<JsonPage<AuthRoleVo>, AuthRoleQueryQo>(`${ADMIN_AUTH}/queryAuthRole`, payload);
}

export function saveAuthRole(payload: AuthRoleQo) {
  return post<AuthRoleVo, AuthRoleQo>(`${ADMIN_AUTH}/saveAuthRole`, payload);
}

export function updateAuthRole(payload: AuthRoleQo) {
  return post<AuthRoleVo, AuthRoleQo>(`${ADMIN_AUTH}/updateAuthRole`, payload);
}

export function deleteAuthRole(payload: IdQo) {
  return post<void, IdQo>(`${ADMIN_AUTH}/deleteAuthRole`, payload);
}

export function bindRolePerm(payload: AuthRolePermBindQo) {
  return post<void, AuthRolePermBindQo>(`${ADMIN_AUTH}/bindRolePerm`, payload);
}

export function getAuthPerm(payload: IdQo) {
  return post<AuthPermVo, IdQo>(`${ADMIN_AUTH}/getAuthPerm`, payload);
}

export function queryAuthPerm(payload: AuthPermQueryQo) {
  return post<JsonPage<AuthPermVo>, AuthPermQueryQo>(`${ADMIN_AUTH}/queryAuthPerm`, payload);
}

export function listAuthPerm() {
  return post<AuthMenuVo[]>(`${ADMIN_AUTH}/listAuthPerm`);
}

export function listRolePerm(payload: IdQo) {
  return post<AuthMenuVo[], IdQo>(`${ADMIN_AUTH}/listRolePerm`, payload);
}

export function saveAuthPerm(payload: AuthPermQo) {
  return post<AuthPermVo, AuthPermQo>(`${ADMIN_AUTH}/saveAuthPerm`, payload);
}

export function updateAuthPerm(payload: AuthPermQo) {
  return post<AuthPermVo, AuthPermQo>(`${ADMIN_AUTH}/updateAuthPerm`, payload);
}

export function deleteAuthPerm(payload: IdQo) {
  return post<void, IdQo>(`${ADMIN_AUTH}/deleteAuthPerm`, payload);
}
