import { expect, test, type APIRequestContext } from "@playwright/test";

const api = process.env.E2E_API_URL ?? "http://localhost:3002";

async function registerAndLogin(request: APIRequestContext, role: "SME" | "CONTRIBUTOR", website = false) {
  const email = `profile-${crypto.randomUUID()}@example.com`;
  const csrf = await request.get(`${api}/api/v1/auth/csrf`);
  expect(csrf.ok()).toBeTruthy();
  const { token } = await csrf.json();
  const headers = { "X-CSRF-Token": token };
  const registration = await request.post(`${api}/api/v1/auth/register`, {
    headers,
    data: { email, password: "Password@1", name: "Registered Company", role,
      ...(role === "SME" ? website ? { companyWebsite: "https://example.com" } : { taxCode: "0316789012" } : {}) }
  });
  expect(registration.status()).toBe(201);
  const login = await request.post(`${api}/api/v1/auth/login`, {
    headers, data: { email, password: "Password@1", rememberDevice: false }
  });
  expect(login.ok()).toBeTruthy();
  return { email, token };
}

test("a new SME sees registration data and saves its profile across reloads", async ({ page }) => {
  const { email, token } = await registerAndLogin(page.request, "SME");
  expect((await page.request.put(`${api}/api/v1/users/me/sme-profile`, {
    data: { displayName: "Blocked" }
  })).status()).toBe(403);
  expect((await page.request.put(`${api}/api/v1/users/me/sme-profile`, {
    headers: { "X-CSRF-Token": token }, data: { displayName: "Blocked", taxCode: "0123456789" }
  })).status()).toBe(400);
  await page.goto("/sme/profile");
  await expect(page.getByLabel(/^Tên doanh nghiệp/)).toHaveValue("Registered Company");
  await expect(page.getByLabel("Email đăng nhập")).toHaveValue(email);
  await expect(page.getByLabel("Mã số thuế đăng ký")).toHaveValue("0316789012");
  await expect(page.getByLabel("Email đăng nhập")).toHaveAttribute("readonly", "");
  await expect(page.getByText("VERIFIED PARTNER")).toHaveCount(0);
  await expect(page.getByText("The Coffee Lab", { exact: true })).toHaveCount(0);
  await page.getByLabel(/^Tên doanh nghiệp/).fill("Updated Company");
  await page.getByLabel("Lĩnh vực hoạt động").fill("Công nghệ");
  await page.getByLabel("Mô tả doanh nghiệp").fill("Mô tả được lưu tại backend.");
  await page.route("**/api/v1/users/me/sme-profile", async (route) => {
    if (route.request().method() === "PUT") {
      await route.fulfill({ status: 503, json: { code: "SERVICE_UNAVAILABLE", message: "Thử lại", requestId: "test-save-failure" } });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("Chưa lưu được hồ sơ", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/^Tên doanh nghiệp/)).toHaveValue("Updated Company");
  await page.unroute("**/api/v1/users/me/sme-profile");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByText("Đã lưu hồ sơ", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel(/^Tên doanh nghiệp/)).toHaveValue("Updated Company");
  await expect(page.getByLabel("Lĩnh vực hoạt động")).toHaveValue("Công nghệ");
  await expect(page.getByLabel("Mô tả doanh nghiệp")).toHaveValue("Mô tả được lưu tại backend.");
  await page.screenshot({ path: "../../output/playwright/sme-profile-desktop.png", fullPage: true });
});

test("another SME sees its own empty profile and website registration", async ({ page }) => {
  await registerAndLogin(page.request, "SME", true);
  await page.goto("/sme/profile");
  await expect(page.getByLabel("Website đăng ký")).toHaveValue("https://example.com");
  await expect(page.getByLabel("Mô tả doanh nghiệp")).toHaveValue("");
  await expect(page.getByLabel("Lĩnh vực hoạt động")).toHaveValue("");
  await expect(page.getByLabel(/^Tên doanh nghiệp/)).toHaveValue("Registered Company");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: "../../output/playwright/sme-profile-mobile.png", fullPage: true });
});

test("anonymous users and contributors cannot access SME profile APIs", async ({ request }) => {
  expect((await request.get(`${api}/api/v1/users/me/sme-profile`)).status()).toBe(401);
  const { token } = await registerAndLogin(request, "CONTRIBUTOR");
  expect((await request.get(`${api}/api/v1/users/me/sme-profile`)).status()).toBe(403);
  expect((await request.put(`${api}/api/v1/users/me/sme-profile`, {
    headers: { "X-CSRF-Token": token }, data: { displayName: "Forbidden", description: "", industry: "" }
  })).status()).toBe(403);
});
