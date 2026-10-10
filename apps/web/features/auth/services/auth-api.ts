import { createApiClient, type components } from "@genda/api-client";

export type AuthSession = components["schemas"]["AuthUserResponse"];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const api = createApiClient(API_URL, { credentials: "include" });
const EVENT_NAME = "genda:auth-session-change";
let csrfToken: string | null = null;

export class AuthApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly requestId?: string) {
    super(message);
  }
}

async function csrf() {
  const result = await api.GET("/api/v1/auth/csrf");
  if (!result.data) throw toError(result.error, "CSRF_UNAVAILABLE", "Không thể khởi tạo phiên bảo mật.");
  csrfToken = result.data.token;
  return csrfToken;
}

export async function getAuthMutationHeaders() {
  return { "X-CSRF-Token": csrfToken ?? (await csrf()) };
}

/** Forgets the cached CSRF token so the next mutation fetches a fresh one (e.g. after its cookie expired). */
export function resetCsrfToken() {
  csrfToken = null;
}

function changed() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NAME));
}

function toError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  const value = error as { code?: string; message?: string; requestId?: string } | undefined;
  return new AuthApiError(value?.code ?? fallbackCode, value?.message ?? fallbackMessage, value?.requestId);
}

export async function login(email: string, password: string, rememberDevice: boolean) {
  const { data, error } = await api.POST("/api/v1/auth/login", {
    headers: await getAuthMutationHeaders(),
    body: { email, password, rememberDevice }
  });
  if (!data) throw toError(error, "LOGIN_FAILED", "Không thể đăng nhập.");
  changed();
  return data;
}

export async function registerAccount(input: components["schemas"]["RegisterRequest"]) {
  const { data, error } = await api.POST("/api/v1/auth/register", {
    headers: await getAuthMutationHeaders(),
    body: input
  });
  if (!data) throw toError(error, "REGISTRATION_FAILED", "Không thể tạo tài khoản.");
  return data;
}

export async function confirmEmailVerification(email: string, code: string) {
  const { data, error } = await api.POST("/api/v1/auth/email-verifications/confirm", {
    headers: await getAuthMutationHeaders(),
    body: { email, code }
  });
  if (!data) throw toError(error, "OTP_CONFIRMATION_FAILED", "Không thể xác minh email.");
  return data;
}

export async function resendEmailVerification(email: string) {
  const { error, response } = await api.POST("/api/v1/auth/email-verifications/resend", {
    headers: await getAuthMutationHeaders(),
    body: { email }
  });
  if (!response.ok) throw toError(error, "OTP_RESEND_FAILED", "Không thể gửi lại mã xác minh.");
}

export async function refreshSession() {
  try {
    const { data } = await api.POST("/api/v1/auth/refresh", { headers: await getAuthMutationHeaders() });
    if (!data) return null;
    changed();
    return data;
  } catch {
    return null;
  }
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  try {
    const current = await api.GET("/api/v1/auth/me");
    if (current.data) return current.data;
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    const retried = await api.GET("/api/v1/auth/me");
    return retried.data ?? null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  let result = await api.POST("/api/v1/auth/logout", { headers: await getAuthMutationHeaders() });
  const error = result.error as { code?: string } | undefined;

  if (result.response.status === 403 && error?.code === "CSRF_TOKEN_INVALID") {
    csrfToken = null;
    result = await api.POST("/api/v1/auth/logout", { headers: await getAuthMutationHeaders() });
  }

  if (!result.response.ok) {
    throw toError(result.error, "LOGOUT_FAILED", "Không thể đăng xuất. Vui lòng thử lại.");
  }

  csrfToken = null;
  changed();
}

export const AUTH_SESSION_EVENT = EVENT_NAME;
