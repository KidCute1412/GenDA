import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

// Trợ lý Gen tự bật có thể che nút; Gen có kiểm thử riêng ở assistant.spec.ts
const QUIET_GEN = { version: 1, introDone: true, seen: {}, lastActiveAt: null, autoOpen: false };

/** PDF một trang tối giản: đủ để backend mở được và đếm trang. */
const VALID_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n"
);

test.beforeEach(async ({ page }) => {
  await page.addInitScript((memory) => localStorage.setItem("genda-demo:assistant:student-loc", JSON.stringify(memory)), QUIET_GEN);
});

test("the profile shows tier, XP bar and which project levels are unlocked", async ({ page }) => {
  await loginAs(page, "student");
  await page.goto("/student/profile");
  await expect(page.getByRole("heading", { name: "Hạng Bạc" })).toBeVisible();
  await expect(page.getByRole("meter", { name: "Điểm kinh nghiệm" })).toHaveAttribute("aria-valuetext", "14/30 XP · còn 16 XP để lên Vàng");
  await expect(page.getByText("XP từ dự án Cơ bản: 10/10 · đã chạm trần")).toBeVisible();
  const ladder = page.getByRole("list", { name: "Mức dự án bạn tự ứng tuyển được" });
  await expect(ladder.getByRole("listitem").filter({ hasText: "Trung bình" })).toContainText("Đã mở");
  await expect(ladder.getByRole("listitem").filter({ hasText: "Nâng cao" })).toContainText("Cần hạng vàng");
  await expect(page.getByText("Sẵn sàng ứng tuyển")).toBeVisible();
});

test("the SME reviews applicants with tier, XP and an explained skill match", async ({ page }) => {
  await loginAs(page, "sme");
  await page.goto("/sme/projects/p-coffee-lab/review");
  const card = page.locator(".applicant-card").filter({ hasText: "Phạm Gia Huy" });
  await expect(card.getByText("Hạng Vàng")).toBeVisible();
  await expect(card.getByText("33 XP")).toBeVisible();
  await expect(card.getByText(/Khớp \d\/3 kỹ năng/)).toBeVisible();
  await expect(card.getByRole("button", { name: /Xem CV/ })).toBeVisible();
  await expect(card.getByRole("button", { name: "Chấp nhận" })).toBeVisible();
});

test("a fake PDF is rejected with its reason and a real one becomes READY", async ({ page }) => {
  await loginAs(page, "student");
  await page.goto("/student/profile");
  const input = page.locator("#profile-cv");
  await input.setInputFiles({ name: "cv.pdf", mimeType: "application/pdf", buffer: Buffer.from("<html>đây không phải PDF</html>") });
  await expect(page.getByText(/không phải PDF thật/)).toBeVisible();

  await input.setInputFiles({ name: "CV_TranMinhAnh.pdf", mimeType: "application/pdf", buffer: VALID_PDF });
  await expect(page.getByText("Đã kiểm tra kỹ thuật. Nội dung CV chưa được GenDA xác minh.")).toBeVisible();
  await expect(page.getByText("CV_TranMinhAnh.pdf")).toBeVisible();
  await expect(page.locator(".quest__count")).toHaveText("4/4");
});

test("education entries are self-declared and can be added and removed", async ({ page }) => {
  const course = `Khóa UX ${Date.now()}`;
  await loginAs(page, "student");
  await page.goto("/student/profile");
  await page.getByRole("button", { name: "Thêm học vấn" }).click();
  const form = page.getByRole("form", { name: "Thêm học vấn" });
  await form.getByLabel("Trường hoặc cơ sở đào tạo").fill("Trung tâm Thiết kế Sài Gòn");
  await form.getByLabel("Chuyên ngành").fill(course);
  await form.getByLabel("Bậc học").selectOption({ label: "Khóa học ngắn hạn" });
  await form.getByLabel("Trạng thái").selectOption({ label: "Đã hoàn thành" });
  await form.getByLabel("Tháng bắt đầu").fill("2025-01");
  await form.getByRole("button", { name: "Thêm vào hồ sơ" }).click();
  await expect(form.getByText("Chọn tháng kết thúc.")).toBeVisible();
  await form.getByLabel("Tháng kết thúc").fill("2025-04");
  await form.getByRole("button", { name: "Thêm vào hồ sơ" }).click();

  const card = page.locator(".edu-card").filter({ hasText: course });
  await expect(card).toContainText("01/2025 - 04/2025 · Đã hoàn thành");
  await expect(card).toContainText("Thông tin tự khai");
  await card.getByRole("button", { name: /Xóa học vấn/ }).click();
  await card.getByRole("button", { name: "Xác nhận xóa" }).click();
  await expect(card).toHaveCount(0);
});
