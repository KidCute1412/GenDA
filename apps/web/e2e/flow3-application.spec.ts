import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

const QUIET_GEN = { version: 1, introDone: true, seen: {}, lastActiveAt: null, autoOpen: false };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (memory) => localStorage.setItem("genda-demo:assistant:student-loc", JSON.stringify(memory)),
    QUIET_GEN
  );
});

test("Flow 3: catalog and detail show neutral skills without mock matching", async ({ page }) => {
  // 1. Khách vãng lai xem danh sách dự án
  await page.goto("/projects");
  await expect(page.locator(".projects-page")).toBeVisible();
  
  // Xác nhận không còn mock MATCH score nào trên danh sách
  await expect(page.locator("text=/MATCH:/")).toHaveCount(0);
  await expect(page.locator("text=/KHỚP.*KỸ NĂNG/")).toHaveCount(0);

  // Mở dự án đầu tiên
  const firstProjectLink = page.locator(".project-row h2 a").first();
  await expect(firstProjectLink).toBeVisible();
  await firstProjectLink.click();

  // 2. Chi tiết dự án hiển thị kỹ năng trung lập
  await expect(page.getByText("// KỸ NĂNG YÊU CẦU")).toBeVisible();
  await expect(page.locator(".pill-list .skill-pill").first()).toBeVisible();
  await expect(page.locator("text=/MATCH:/")).toHaveCount(0);
  await expect(page.locator("text=/KHỚP.*KỸ NĂNG/")).toHaveCount(0);
});

test("Flow 3: contributor applies to project and manages application in Đơn của tôi", async ({ page }) => {
  test.setTimeout(60_000);
  await loginAs(page, "student");

  // Đi tới trang chi tiết dự án mẫu p-coffee-lab
  await page.goto("/projects/p-coffee-lab");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("// KỸ NĂNG YÊU CẦU")).toBeVisible();

  // Kiểm tra nút ứng tuyển
  const applyBtn = page.getByRole("button", { name: /ỨNG TUYỂN NGAY|ĐÃ NỘP ĐƠN/i });
  await expect(applyBtn).toBeVisible();

  // Nếu đã nộp trước đó từ test khác, vào /student/applications để rút trước
  const isAlreadyApplied = (await applyBtn.textContent())?.includes("ĐÃ NỘP ĐƠN");
  if (isAlreadyApplied) {
    await page.goto("/student/applications");
    const withdrawBtn = page.locator(".app-card").filter({ hasText: "Coffee Lab" }).getByRole("button", { name: /Rút đơn/i });
    if (await withdrawBtn.isVisible()) {
      await withdrawBtn.click();
      await expect(page.getByText("Đã rút đơn này")).toBeVisible();
    }
    await page.goto("/projects/p-coffee-lab");
  }

  // Bấm Ứng tuyển ngay
  await page.getByRole("button", { name: /ỨNG TUYỂN NGAY/i }).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();

  // Điền thư ngỏ đủ điều kiện (>= 80 ký tự)
  const coverLetter = "Em đã có kinh nghiệm thực hiện các dự án thiết kế và phát triển tương tự, có thể cam kết bàn giao đúng hạn theo các mốc đã nêu.";
  await dialog.getByLabel("Thư ngỏ").fill(coverLetter);

  // Gửi đơn ứng tuyển
  await dialog.getByRole("button", { name: "Gửi đơn ứng tuyển" }).click();
  await expect(dialog.getByText("Đã gửi đơn của bạn")).toBeVisible();

  // Đi tới Đơn của tôi
  await page.goto("/student/applications");
  await expect(page.getByRole("heading", { name: /ĐƠN CỦA TÔI/i })).toBeVisible();

  // Đơn mới phải nằm trong danh sách
  const appCard = page.locator(".app-card").filter({ hasText: "Coffee Lab" });
  await expect(appCard).toBeVisible();
  await expect(appCard.getByText("Đang chờ duyệt")).toBeVisible();

  // Rút đơn
  const withdrawButton = appCard.getByRole("button", { name: /Rút đơn/i });
  await expect(withdrawButton).toBeVisible();
  await withdrawButton.click();

  // Xác nhận đơn chuyển sang trạng thái đã rút
  await expect(appCard.getByText("Đã rút đơn")).toBeVisible();
});
