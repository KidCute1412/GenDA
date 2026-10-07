import { expect, type Page } from "@playwright/test";

/** Backend thật (Docker Compose, profile `demo`) đã seed sẵn ba tài khoản này. */
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3001";
const DEMO_PASSWORD = "Demo@12345";

export const DEMO_ACCOUNTS = {
  student: "letuanloc.2203@hcmus.edu.vn",
  sme: "contact@coffeelab.vn",
  admin: "admin@genda.vn"
} as const;

/**
 * Đăng nhập bằng API thay vì qua form: form có reCAPTCHA của Google nên không tự động hóa ổn định.
 * `page.request` dùng chung kho cookie với trình duyệt, nên cookie phiên (HttpOnly) trả về ở đây
 * được chính trang web gửi kèm ở các lần gọi API sau. Đăng nhập tài khoản khác sẽ ghi đè phiên cũ.
 */
export async function loginAs(page: Page, role: keyof typeof DEMO_ACCOUNTS) {
  const csrf = await page.request.get(`${API_URL}/api/v1/auth/csrf`);
  expect(csrf.ok(), "backend phải chạy ở " + API_URL).toBeTruthy();
  const { token } = (await csrf.json()) as { token: string };
  const login = await page.request.post(`${API_URL}/api/v1/auth/login`, {
    headers: { "X-CSRF-Token": token },
    data: { email: DEMO_ACCOUNTS[role], password: DEMO_PASSWORD, rememberDevice: false }
  });
  expect(login.ok(), `đăng nhập ${role}: HTTP ${login.status()}`).toBeTruthy();
}
