import { createApiClient, type components } from "@genda/api-client";
import { clearDemoSession, getDemoSession, setDemoSession } from "./demo-session";

export type AuthSession = components["schemas"]["AuthUserResponse"];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const api = createApiClient(API_URL, { credentials: "include" });
const EVENT_NAME = "genda:auth-session-change";
let csrfToken: string | null = null;
const DEMO_PASSWORD = "Demo@12345";
const DEMO_USERS: Record<string, { name: string; role: AuthSession["role"]; emailVerified: boolean }> = {
  "letuanloc.2203@hcmus.edu.vn": { name: "Lê Tuấn Lộc", role: "STUDENT", emailVerified: true },
  "contact@coffeelab.vn": { name: "The Coffee Lab", role: "SME", emailVerified: true },
  "admin@genda.vn": { name: "Đỗ Minh Triết", role: "ADMIN", emailVerified: true }
};

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

async function mutationHeaders() {
  return { "X-CSRF-Token": csrfToken ?? (await csrf()) };
}

function changed() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NAME));
}

function toError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  const value = error as { code?: string; message?: string; requestId?: string } | undefined;
  return new AuthApiError(value?.code ?? fallbackCode, value?.message ?? fallbackMessage, value?.requestId);
}

function asAuthSession(session: { email: string; name: string; role: AuthSession["role"]; emailVerified: boolean }): AuthSession {
  return {
    id: session.email,
    email: session.email,
    name: session.name,
    role: session.role,
    emailVerified: session.emailVerified
  };
}

function loginWithDemoAccount(email: string, password: string): AuthSession | null {
  const demo = DEMO_USERS[email.toLowerCase()];
  if (!demo || password !== DEMO_PASSWORD) return null;
  setDemoSession({ email, name: demo.name, role: demo.role, emailVerified: demo.emailVerified });
  return asAuthSession({ email, ...demo });
}

export async function login(email: string, password: string, rememberDevice: boolean) {
  try {
    const { data, error } = await api.POST("/api/v1/auth/login", {
      headers: await mutationHeaders(),
      body: { email, password, rememberDevice }
    });
    if (!data) throw toError(error, "LOGIN_FAILED", "Không thể đăng nhập.");
    changed();
    return data;
  } catch (error) {
    const demoSession = loginWithDemoAccount(email, password);
    if (demoSession) {
      changed();
      return demoSession;
    }
    throw error;
  }
}

export async function registerAccount(input: components["schemas"]["RegisterRequest"]) {
  const { data, error } = await api.POST("/api/v1/auth/register", {
    headers: await mutationHeaders(),
    body: input
  });
  if (!data) throw toError(error, "REGISTRATION_FAILED", "Không thể tạo tài khoản.");
  if (data.role === "STUDENT") changed();
  return data;
}

export async function refreshSession() {
  try {
    const { data } = await api.POST("/api/v1/auth/refresh", { headers: await mutationHeaders() });
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
    if (refreshed) {
      const retried = await api.GET("/api/v1/auth/me");
      if (retried.data) return retried.data;
    }
  } catch {
    // Fallback to browser-only demo session when API is unavailable.
  }
  const demo = getDemoSession();
  if (demo) {
    return asAuthSession({ email: demo.email, name: demo.name, role: demo.role, emailVerified: demo.emailVerified });
  }
  return null;
}

export async function logout(): Promise<void> {
  try {
    let result = await api.POST("/api/v1/auth/logout", { headers: await mutationHeaders() });
    const error = result.error as { code?: string } | undefined;

    if (result.response.status === 403 && error?.code === "CSRF_TOKEN_INVALID") {
      csrfToken = null;
      result = await api.POST("/api/v1/auth/logout", { headers: await mutationHeaders() });
    }

    if (!result.response.ok) {
      throw toError(result.error, "LOGOUT_FAILED", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  } catch {
    clearDemoSession();
  }

  csrfToken = null;
  changed();
}

export const AUTH_SESSION_EVENT = EVENT_NAME;
