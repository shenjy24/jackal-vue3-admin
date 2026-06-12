import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import type { ApiResponse } from "@/types/admin";

export type ApiCode = number | string;

export const API_SUCCESS_CODES: ApiCode[] = [2000, "2000"];
export const API_UNAUTHORIZED_CODES: ApiCode[] = [2001, "2001"];
export const API_FORBIDDEN_CODES: ApiCode[] = [2002, "2002"];

export class ApiClientError extends Error {
  code: ApiCode;

  constructor(code: ApiCode, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/admin/api",
  method: "post",
  timeout: 15000,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  config.method = "post";
  config.withCredentials = true;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse;

    if (!body || (typeof body.code !== "number" && typeof body.code !== "string")) {
      return response.data;
    }

    if (API_SUCCESS_CODES.includes(body.code)) {
      return body.data;
    }

    const message = body.message || "Request failed";
    window.dispatchEvent(
      new CustomEvent("admin:api-error", {
        detail: { code: body.code, message }
      })
    );

    if (!API_UNAUTHORIZED_CODES.includes(body.code)) {
      ElMessage.error(message);
    }
    throw new ApiClientError(body.code, message);
  },
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || "Network error";
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export function post<TData, TPayload = Record<string, unknown>>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig
) {
  return apiClient.request<TData, TData>({
    url,
    data: payload ?? {},
    ...config,
    method: "post"
  });
}
