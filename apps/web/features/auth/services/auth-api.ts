import { createApiClient, type components } from "@genda/api-client";

export type AuthSession = components["schemas"]["AuthUserResponse"];
const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", { credentials: "include" });
export const AUTH_SESSION_EVENT = "genda:auth-session-change";
let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;
let sessionRequest: Promise<AuthSession | null> | null = null;
let channel: BroadcastChannel | null = null;

export class AuthApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly requestId?: string) { super(message); }
}

function toError(error: unknown, response?: Response) {
  const value = error as { code?: string; message?: string; requestId?: string } | undefined;
  const seconds = response?.headers.get("Retry-After");
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
    ACCOUNT_DISABLED: "Tài khoản đã bị khóa.",
    PASSWORD_INVALID: "Mật khẩu quá dài. Hãy rút ngắn mật khẩu và thử lại.",
    HTTP_400: "Thông tin chưa hợp lệ. Kiểm tra email, tên và mật khẩu (ít nhất 8 ký tự)."
  };
  const message = value?.code === "AUTH_RATE_LIMITED"
    ? `Bạn đã thử quá nhiều lần. Hãy thử lại sau ${seconds ?? "60"} giây.`
    : messages[value?.code ?? ""] ?? value?.message ?? "Không thể kết nối tới hệ thống. Hãy thử lại.";
  return new AuthApiError(value?.code ?? "AUTH_UNAVAILABLE", message, value?.requestId);
}

export function authChannel() {
  if (!channel && typeof BroadcastChannel !== "undefined") channel = new BroadcastChannel(AUTH_SESSION_EVENT);
  return channel;
}

/** Forgets the cached CSRF token so the next mutation fetches a fresh one (e.g. after its cookie expired). */
export function resetCsrfToken() {
  csrfToken = null;
}

function changed() {
  if (typeof window === "undefined") return;
  sessionRequest = null;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
  authChannel()?.postMessage("changed");
}

async function csrf() {
  if (!csrfRequest) {
    csrfRequest = api.GET("/api/v1/auth/csrf").then(result => {
      if (!result.data) throw toError(result.error, result.response);
      csrfToken = result.data.token;
      return csrfToken;
    }).finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

export async function getAuthMutationHeaders() {
  return { "X-CSRF-Token": csrfToken ?? await csrf() };
}

type MutationResult<T> = { data?: T; error?: unknown; response: Response };
async function mutate<T>(send: (headers: Record<string, string>) => Promise<MutationResult<T>>) {
  let result = await send(await getAuthMutationHeaders());
  if (result.response.status === 403 && (result.error as { code?: string } | undefined)?.code === "CSRF_TOKEN_INVALID") {
    csrfToken = null;
    result = await send(await getAuthMutationHeaders());
  }
  if (!result.response.ok) throw toError(result.error, result.response);
  return result.data;
}

export async function login(email: string, password: string, rememberDevice: boolean) {
  const data = await mutate(headers => api.POST("/api/v1/auth/login", { headers, body: { email: email.trim(), password, rememberDevice } }));
  if (!data) throw toError(undefined);
  changed();
  return data;
}

export async function registerAccount(input: components["schemas"]["RegisterRequest"]) {
  return mutate(headers => api.POST("/api/v1/auth/register", { headers, body: { ...input, email: input.email.trim() } }));
}


async function readSession() {
  const current = await api.GET("/api/v1/auth/me");
  if (current.data) return current.data;
  if (current.response.status !== 401) throw toError(current.error, current.response);
  const refresh = async () => {
    // Another tab may have refreshed while this tab waited for the lock.
    const check = await api.GET("/api/v1/auth/me");
    if (check.data) return check.data;
    if (check.response.status !== 401) throw toError(check.error, check.response);
    try {
      return await mutate(headers => api.POST("/api/v1/auth/refresh", { headers })) ?? null;
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "INVALID_REFRESH_TOKEN") return null;
      throw error;
    }
  };
  return typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("genda:auth-refresh", refresh) : refresh();
}

export function loadAuthSession(): Promise<AuthSession | null> {
  if (!sessionRequest) {
    const pending = readSession().finally(() => { if (sessionRequest === pending) sessionRequest = null; });
    sessionRequest = pending;
  }
  return sessionRequest;
}

export async function logout() {
  await mutate(headers => api.POST("/api/v1/auth/logout", { headers }));
  csrfToken = null;
  changed();
}

export async function refreshSession() {
  const refresh = () => mutate(headers => api.POST("/api/v1/auth/refresh", { headers }));
  const session = typeof navigator !== "undefined" && navigator.locks
    ? await navigator.locks.request("genda:auth-refresh", refresh) : await refresh();
  changed();
  return session;
}
