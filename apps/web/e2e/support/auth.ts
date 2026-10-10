import { expect, type Page, type Cookie } from "@playwright/test";

/** Explicit test fixtures from scripts/setup-auth-e2e.mjs, never runtime seed accounts. */
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3002";
const TEST_PASSWORD = "Password@1";

export const TEST_ACCOUNTS = {
  student: "letuanloc.2203@hcmus.edu.vn",
  sme: "contact@coffeelab.vn",
  admin: "admin@genda.vn"
} as const;
const sessions = new Map<string, Cookie[]>();

/**
 * Non-auth journeys use API login; auth.spec.ts exercises real registration and session flows.
 * `page.request` dùng chung kho cookie với trình duyệt, nên cookie phiên (HttpOnly) trả về ở đây
 * được chính trang web gửi kèm ở các lần gọi API sau. Đăng nhập tài khoản khác sẽ ghi đè phiên cũ.
 */
export async function loginAs(page: Page, role: keyof typeof TEST_ACCOUNTS) {
  const cached = sessions.get(role);
  if (cached?.some(cookie => cookie.name === "genda_access" && cookie.expires > Date.now() / 1000 + 60)) {
    await page.context().clearCookies();
    await page.context().addCookies(cached);
    return;
  }
  const csrf = await page.request.get(`${API_URL}/api/v1/auth/csrf`);
  expect(csrf.ok(), "backend phải chạy ở " + API_URL).toBeTruthy();
  const { token } = (await csrf.json()) as { token: string };
  const login = await page.request.post(`${API_URL}/api/v1/auth/login`, {
    headers: { "X-CSRF-Token": token },
    data: { email: TEST_ACCOUNTS[role], password: TEST_PASSWORD, rememberDevice: false }
  });
  expect(login.ok(), `đăng nhập ${role}: HTTP ${login.status()}`).toBeTruthy();
  sessions.set(role, await page.context().cookies());
}
