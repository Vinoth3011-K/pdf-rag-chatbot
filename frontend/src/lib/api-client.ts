import { useAuthStore } from "@/lib/auth-store";
import { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const { accessToken } = useAuthStore.getState();

  const headers: HeadersInit = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
    // No credentials: "include" — app uses Authorization Bearer header,
    // not cross-origin cookies. Removing this fixes the CORS preflight error.
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    useAuthStore.getState().clearAuth();
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiClientError(json.message || "Request failed", res.status, json.details);
  }

  return json as ApiResponse<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const { refreshToken } = useAuthStore.getState();

    // Send refreshToken in the JSON body — no cookie dependency
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken ?? "" })
    });
    if (!res.ok) return false;
    const json = await res.json();
    useAuthStore
      .getState()
      .setAuth(json.data.accessToken, json.data.refreshToken, json.data.user);
    return true;
  } catch {
    return false;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {})
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  apiUrl: API_URL
};

export { ApiClientError };
