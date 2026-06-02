import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import type { ApiResponse } from "@/types/admin";

export const API_SUCCESS_CODE = 0;
export const API_UNAUTHORIZED_CODES = [401, 10001];
export const API_FORBIDDEN_CODES = [403, 10003];

export class ApiClientError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
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

    if (!body || typeof body.code !== "number") {
      return response.data;
    }

    if (body.code === API_SUCCESS_CODE) {
      return body.data;
    }

    window.dispatchEvent(
      new CustomEvent("admin:api-error", {
        detail: { code: body.code, message: body.message }
      })
    );

    throw new ApiClientError(body.code, body.message || "Request failed");
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
    data: payload || {},
    ...config,
    method: "post"
  });
}
