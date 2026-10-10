import { expect, test } from "@playwright/test";

test.describe("real auth", () => {
  test.setTimeout(90_000);
  test.describe.configure({ mode: "serial" });
  for (const role of ["CONTRIBUTOR", "SME"] as const) {
    test(`${role} registers and signs in without email verification`, async ({ page }) => {
      const email = `auth.${role.toLowerCase()}.${Date.now()}@genda.test`;
      await page.goto("/login?mode=register");
      await page.getByRole("radio", { name: role === "SME" ? /DOANH NGHIỆP/ : /CONTRIBUTOR/ }).check();
      if (role === "SME") {
        await page.locator("#register-no-tax-code").check();
        await page.locator("#register-website").fill("company.genda.test");
      }
      await page.locator("#register-name").fill("Auth Test");
      await page.locator("#register-email").fill(email);
      await page.getByLabel(/^MẬT KHẨU BẢO MẬT/).fill("Password@1");
      await page.getByLabel(/^NHẬP LẠI MẬT KHẨU/).fill("Password@1");
      await page.locator("#register-agree").check();
      await page.getByRole("button", { name: "TẠO TÀI KHOẢN MỚI" }).click();
      await expect(page).toHaveURL(/login\?registered=1/, { timeout: 30_000 });
      expect((await page.context().cookies()).filter(cookie => /genda_(access|refresh)/.test(cookie.name))).toHaveLength(0);
      await page.getByLabel("EMAIL ĐĂNG NHẬP").fill(email);
      await page.getByLabel(/^MẬT KHẨU/).fill("Password@1");
      await page.getByRole("button", { name: "ĐĂNG NHẬP", exact: true }).click();
      await expect(page).toHaveURL(role === "SME" ? /sme\/projects/ : /\/projects$/, { timeout: 30_000 });
      const cookies = (await page.context().cookies()).filter(cookie => /genda_(access|refresh)/.test(cookie.name));
      expect(cookies).toHaveLength(2);
      expect(cookies.every(cookie => cookie.httpOnly)).toBeTruthy();
      await page.reload();
      await expect(page.getByRole("button", { name: "Đăng xuất", exact: true }).first()).toBeVisible();
      const second = await page.context().newPage();
      await second.goto("/");
      await expect(second.getByRole("button", { name: "Đăng xuất", exact: true })).toBeVisible();
      const refreshBefore = cookies.find(cookie => cookie.name === "genda_refresh")?.value;
      await page.context().clearCookies({ name: "genda_access" });
      await Promise.all([page.reload(), second.reload()]);
      await expect(page.getByRole("button", { name: "Đăng xuất", exact: true }).first()).toBeVisible();
      await expect(second.getByRole("button", { name: "Đăng xuất", exact: true })).toBeVisible();
      expect((await page.context().cookies()).find(cookie => cookie.name === "genda_refresh")?.value !== refreshBefore).toBe(true);
      await page.getByRole("button", { name: "Đăng xuất", exact: true }).first().click();
      await expect(page).toHaveURL("/", { timeout: 30_000 });
      await expect(second.getByRole("link", { name: "ĐĂNG NHẬP", exact: true })).toBeVisible();
      expect((await page.context().cookies()).filter(cookie => /genda_(access|refresh)/.test(cookie.name))).toHaveLength(0);
    });
  }

  test("backend enforces CSRF and login rate limits without a CAPTCHA", async ({ request }) => {
    const api = process.env.E2E_API_URL ?? "http://localhost:3002";
    const body = { email: "rate-limit@genda.test", password: "Wrong@123", rememberDevice: false };
    const forbidden = await request.post(`${api}/api/v1/auth/login`, { data: body });
    expect(forbidden.status()).toBe(403);
    const csrf = await request.get(`${api}/api/v1/auth/csrf`);
    const { token } = await csrf.json();
    for (let attempt = 0; attempt < 10; attempt++) {
      const response = await request.post(`${api}/api/v1/auth/login`, { headers: { "X-CSRF-Token": token }, data: body });
      expect(response.status()).toBe(401);
    }
    const limited = await request.post(`${api}/api/v1/auth/login`, { headers: { "X-CSRF-Token": token }, data: body });
    expect(limited.status()).toBe(429);
    expect((await limited.json()).code).toBe("AUTH_RATE_LIMITED");
    expect(Number(limited.headers()["retry-after"])).toBeGreaterThan(0);
  });
});
