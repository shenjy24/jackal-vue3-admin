import { post } from "./client";
import type { PageQuery, PageResult } from "@/types/admin";

export function listApi<TItem, TFilter = Record<string, unknown>>(url: string, query: PageQuery<TFilter>) {
  return post<PageResult<TItem>, PageQuery<TFilter>>(url, query);
}

export function createApi<TForm>(url: string, form: TForm) {
  return post<unknown, TForm>(url, form);
}

export function updateApi<TForm>(url: string, id: string | number, form: TForm) {
  return post<unknown, TForm & { id: string | number }>(url, { ...form, id });
}

export function removeApi(url: string, id: string | number) {
  return post<unknown, { id: string | number }>(url, { id });
}
