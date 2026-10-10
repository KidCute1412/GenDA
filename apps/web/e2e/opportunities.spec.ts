import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

// Trợ lý Gen tự bật có thể che nút; Gen có kiểm thử riêng ở assistant.spec.ts
const QUIET_GEN = { version: 1, introDone: true, seen: {}, lastActiveAt: null, autoOpen: false };

test.beforeEach(async ({ page }) => {
  await page.addInitScript((memory) => localStorage.setItem("genda-demo:assistant:student-loc", JSON.stringify(memory)), QUIET_GEN);
  await page.goto("/");
  await page.evaluate(() => { for (let i = localStorage.length - 1; i >= 0; i -= 1) { const key = localStorage.key(i); if (key?.startsWith("genda-demo:") && key !== "genda-demo:assistant:student-loc") localStorage.removeItem(key); } });
});

function dateIn(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

test("a student reserves an event seat without a CV and can cancel it", async ({ page }) => {
  await loginAs(page, "student");
  await page.goto("/projects?type=event");
  await expect(page.getByRole("link", { name: /Sự kiện & workshop/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("HẾT CHỖ").first()).toBeVisible();

  await page.getByRole("link", { name: "Khán giả talkshow \"Làm podcast từ con số 0\"" }).click();
  await expect(page.getByText("150.000 đ")).toBeVisible();
  await page.getByRole("button", { name: "ĐĂNG KÝ THAM GIA" }).click();
  await expect(page.getByText("ĐÃ GIỮ CHỖ")).toBeVisible();
  await expect(page.getByText("17/40")).toBeVisible();

  await page.goto("/student/applications");
  const registration = page.locator("#registrations article").filter({ hasText: "Làm podcast từ con số 0" });
  await expect(registration.getByText("Đã giữ chỗ")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await registration.getByRole("button", { name: "HỦY ĐĂNG KÝ" }).click();
  await expect(registration.getByText("Đã hủy")).toBeVisible();
});

test("an SME posts a gig, an admin approves it, a student registers and the SME confirms", async ({ page }) => {
  test.setTimeout(60_000);
  const title = `Cộng tác viên E2E ${Date.now()}`;

  await loginAs(page, "sme");
  await page.goto("/sme/opportunities/new");
  await page.getByRole("radio", { name: /Cộng tác viên/ }).check();
  await page.getByLabel("Tiêu đề tin").fill(title);
  await page.getByLabel("Lĩnh vực").selectOption("Sự kiện");
  await page.getByLabel("Mô tả ngắn (hiện trên thẻ)").fill("Hỗ trợ check-in khách mời trong buổi workshop.");
  await page.getByLabel("Thù lao (đồng/buổi)").fill("40000");
  await page.getByLabel("Số chỗ").fill("1");
  await page.getByLabel("Địa điểm").fill("Q.3, TP.HCM");
  await page.getByLabel("Ngày buổi 1").fill(dateIn(8));
  await page.getByLabel("Bắt đầu").fill("13:00");
  await page.getByLabel("Kết thúc").fill("17:00");
  await page.getByRole("button", { name: "GỬI DUYỆT" }).click();
  await expect(page.getByText("Thù lao tối thiểu là 50.000đ/buổi.")).toBeVisible();
  await page.getByLabel("Thù lao (đồng/buổi)").fill("300000");
  await page.getByRole("button", { name: "GỬI DUYỆT" }).click();
  await expect(page.getByText("Cần cam kết không thu phí người tham gia")).toBeVisible();
  await page.getByRole("checkbox", { name: /không thu bất kỳ khoản phí nào/ }).check();
  await page.getByRole("button", { name: "GỬI DUYỆT" }).click();
  await expect(page.getByText("Đã gửi tin đi duyệt")).toBeVisible();

  await loginAs(page, "admin");
  await page.goto("/admin?tab=opportunities");
  const queued = page.locator("article").filter({ hasText: title });
  await queued.getByRole("button", { name: "Duyệt đăng tin" }).click();
  await expect(queued).toHaveCount(0);

  await loginAs(page, "student");
  await page.goto("/projects?type=gig");
  await page.getByRole("link", { name: title }).click();
  await page.getByRole("button", { name: "ĐĂNG KÝ LÀM" }).click();
  await expect(page.getByText("ĐÃ ĐĂNG KÝ, CHỜ DUYỆT")).toBeVisible();

  await loginAs(page, "sme");
  await page.goto("/sme/projects");
  await page.getByRole("link", { name: title }).click();
  await page.getByRole("button", { name: "NHẬN" }).click();
  await expect(page.getByText("Đã chốt 1 người, còn 0 chỗ")).toBeVisible();

  await loginAs(page, "student");
  await page.goto("/student/applications");
  await expect(page.locator("#registrations article").filter({ hasText: title }).getByText("Đã giữ chỗ")).toBeVisible();
});
