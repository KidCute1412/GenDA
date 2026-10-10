import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

// Trợ lý Gen tự bật có thể che nút mà luồng demo cần bấm; Gen có kiểm thử riêng ở assistant.spec.ts
const QUIET_GEN = { version: 1, introDone: true, seen: {}, lastActiveAt: null, autoOpen: false };

test.beforeEach(async ({ page }) => { await page.addInitScript((memory) => localStorage.setItem("genda-demo:assistant:student-loc", JSON.stringify(memory)), QUIET_GEN); await page.goto("/"); await page.evaluate(() => { for (let i = localStorage.length - 1; i >= 0; i -= 1) { const key = localStorage.key(i); if (key?.startsWith("genda-demo:")) localStorage.removeItem(key); } }); });

test("role session survives navigation and protects student pages", async ({ page }) => {
  await page.goto("/student/applications");
  await expect(page.getByText(/Cần đăng nhập bằng tài khoản sinh viên/i)).toBeVisible();
  await loginAs(page, "student");
  await page.goto("/student/applications");
  await expect(page.getByRole("heading", { name: /ĐƠN CỦA TÔI/i })).toBeVisible();
});

test("admin route shows a permission warning to a student", async ({ page }) => {
  await loginAs(page, "student"); await page.goto("/admin");
  await expect(page.getByText(/Không có quyền truy cập/i)).toBeVisible();
});

test("runs the demo lifecycle across SME, Admin and Student", async ({ page }) => {
  test.setTimeout(60_000);
  const title = `Demo E2E ${Date.now()}`;
  await loginAs(page, "sme");
  await page.goto("/sme/projects/new");
  await page.getByLabel("Bạn cần làm gì").fill(title);
  await page.getByLabel("Tóm tắt trong một câu").fill("Sản phẩm demo để kiểm thử xuyên vai trò.");
  await page.getByLabel("Lĩnh vực của bạn").selectOption({ label: "Dịch vụ" });
  await page.getByLabel("Quy mô doanh nghiệp").selectOption({ label: "1-10 nhân sự" });
  await page.getByLabel("Mô tả chi tiết yêu cầu").fill("Xây dựng một sản phẩm demo đủ rõ để kiểm thử xuyên vai trò.");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "React", exact: true }).click();
  // Ngân sách mặc định 2.000.000 đ nằm trong khoảng của mức Trung bình
  await page.getByRole("radio", { name: "Trung bình" }).check();
  await page.getByLabel("Hạn hoàn thành toàn dự án").fill("2027-01-15");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Thế nào là làm xong").fill("Bàn giao đủ nội dung và được doanh nghiệp nghiệm thu.");
  const milestoneTitles = page.getByLabel("Mốc này bàn giao cái gì");
  await milestoneTitles.nth(0).fill("Bản nháp"); await milestoneTitles.nth(1).fill("Bản hoàn chỉnh");
  const deadlines = page.getByLabel("Hạn của mốc"); await deadlines.nth(0).fill("2026-12-15"); await deadlines.nth(1).fill("2027-01-15");
  await page.getByRole("button", { name: "Gửi duyệt" }).click();
  await expect(page.getByText("Đã gửi dự án đi duyệt")).toBeVisible();

  await loginAs(page, "admin"); await page.goto("/admin");
  const adminCard = page.locator("article").filter({ hasText: title }); await expect(adminCard).toBeVisible(); await adminCard.getByRole("button", { name: "Duyệt xuất bản" }).click();

  await loginAs(page, "student"); await page.goto(`/projects?q=${encodeURIComponent(title)}`);
  await page.getByRole("link", { name: title }).first().click();
  await page.getByRole("button", { name: /Ứng tuyển ngay/i }).click();
  await page.getByLabel("Thư ngỏ").fill("Em đã có kinh nghiệm thực hiện sản phẩm tương tự và có thể bàn giao đúng hạn theo các mốc đã nêu.");
  await expect(page.getByRole("button", { name: /Xem CV/i })).toBeVisible(); await page.getByRole("button", { name: "Gửi đơn ứng tuyển" }).click(); await expect(page.getByText("Đã gửi đơn của bạn")).toBeVisible();

  await loginAs(page, "sme"); await page.goto("/sme/projects");
  await page.locator("article").filter({ hasText: title }).getByRole("link", { name: /XEM ỨNG VIÊN \(1\)/ }).click();
  const applicantCard = page.locator(".applicant-card").filter({ hasText: "Lê Tuấn Lộc" });
  await expect(applicantCard.getByText("Hạng Bạc")).toBeVisible();
  await applicantCard.getByRole("button", { name: "Chấp nhận" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Chấp nhận ứng viên" }).click();
  await expect(page.getByText("Bạn đã chọn Lê Tuấn Lộc")).toBeVisible();
  await expect(page.getByRole("link", { name: "Vào workspace" })).toBeVisible();
  const acceptedProjectId = await page.evaluate(() => { const raw = localStorage.getItem("genda-demo:ledger:v2"); if (!raw) return null; const ledger = JSON.parse(raw); return ledger.projects.find((project: { title: string }) => project.title.startsWith("Demo E2E"))?.id ?? null; });
  expect(acceptedProjectId).not.toBeNull();

  await loginAs(page, "student"); await page.goto("/workspace/demo");
  await page.getByLabel("Liên kết bàn giao").fill("https://example.com/delivery-1"); await page.getByLabel("Ghi chú").fill("Bàn giao mốc đầu tiên"); await page.getByRole("button", { name: "Nộp bàn giao" }).click();
  await loginAs(page, "sme"); await page.goto("/workspace/demo"); await page.getByRole("button", { name: "Nghiệm thu" }).click();
  await loginAs(page, "student"); await page.goto("/workspace/demo"); await page.getByLabel("Liên kết bàn giao").fill("https://example.com/delivery-2"); await page.getByLabel("Ghi chú").fill("Bàn giao mốc cuối"); await page.getByRole("button", { name: "Nộp bàn giao" }).click();
  await loginAs(page, "sme"); await page.goto("/workspace/demo"); await page.getByRole("button", { name: "Nghiệm thu" }).click(); await expect(page.getByText("Đã hoàn thành")).toBeVisible();
  await page.getByLabel("Nhận xét").fill("Sinh viên bàn giao đầy đủ, đúng hạn và phản hồi tốt."); await page.getByRole("button", { name: "Gửi đánh giá" }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("genda-demo:ledger:v2") ?? "{}").reviews?.length ?? 0)).toBeGreaterThan(0);
});

test("a returned project goes back to the SME with the admin's reason", async ({ page }) => {
  test.setTimeout(60_000);
  const title = `Trả về E2E ${Date.now()}`;
  await loginAs(page, "sme");
  await page.goto("/sme/projects/new");
  await page.getByLabel("Bạn cần làm gì").fill(title);
  await page.getByRole("button", { name: "LƯU BẢN NHÁP" }).click();
  await expect(page.getByText(/Đã lưu lúc/)).toBeVisible();
  await expect(page).toHaveURL(/\/sme\/projects\/p-[0-9a-f]+\/edit$/);

  await page.getByLabel("Tóm tắt trong một câu").fill("Website có thanh toán online.");
  await page.getByLabel("Lĩnh vực của bạn").selectOption({ label: "Bán lẻ" });
  await page.getByLabel("Quy mô doanh nghiệp").selectOption({ label: "11-20 nhân sự" });
  await page.getByLabel("Mô tả chi tiết yêu cầu").fill("Cần website bán hàng có giỏ hàng và cổng thanh toán.");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "React", exact: true }).click();
  await page.getByRole("radio", { name: "Cơ bản" }).check();
  // 2.000.000 đ vượt trần 1.500.000 đ của mức Cơ bản: giao diện báo, không tự đổi số tiền hay mức độ
  await expect(page.getByText(/Mức Cơ bản nhận ngân sách từ/)).toBeVisible();
  await page.getByLabel("Hạn hoàn thành toàn dự án").fill("2027-02-01");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByLabel("Thế nào là làm xong").fill("Thanh toán thử thành công");
  const milestoneTitles = page.getByLabel("Mốc này bàn giao cái gì");
  await milestoneTitles.nth(0).fill("Giao diện"); await milestoneTitles.nth(1).fill("Thanh toán");
  const deadlines = page.getByLabel("Hạn của mốc"); await deadlines.nth(0).fill("2027-01-10"); await deadlines.nth(1).fill("2027-02-01");
  await expect(page.getByRole("button", { name: "Gửi duyệt" })).toBeDisabled();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await page.getByRole("radio", { name: "Trung bình" }).check();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Gửi duyệt" }).click();
  await expect(page.getByText("Đã gửi dự án đi duyệt")).toBeVisible();

  await loginAs(page, "admin"); await page.goto("/admin");
  const adminCard = page.locator("article").filter({ hasText: title });
  await adminCard.getByRole("button", { name: "Trả về chỉnh sửa" }).click();
  await adminCard.getByLabel("Lý do trả về").fill("Có cổng thanh toán nên phạm vi tương đương mức Nâng cao.");
  await adminCard.getByLabel("Mức độ đề xuất (không bắt buộc)").selectOption({ label: "Nâng cao" });
  await adminCard.getByRole("button", { name: "Xác nhận trả về" }).click();
  await expect(page.getByText(`Đã trả "${title}" về cho doanh nghiệp.`)).toBeVisible();

  await loginAs(page, "sme"); await page.goto("/sme/projects?tab=draft");
  const smeCard = page.locator("article").filter({ hasText: title });
  await expect(smeCard.getByText("Có cổng thanh toán nên phạm vi tương đương mức Nâng cao. Mức độ đề xuất: Nâng cao.")).toBeVisible();
  await smeCard.getByRole("link", { name: "SỬA THEO GÓP Ý" }).click();
  await expect(page.getByText("Quản trị viên đã trả dự án về để chỉnh sửa")).toBeVisible();
  await expect(page.getByLabel("Bạn cần làm gì")).toHaveValue(title);
});

test("logging out from an SME page returns to the home page", async ({ page }) => {
  await loginAs(page, "sme");
  await page.goto("/sme/projects");
  await expect(page.getByRole("heading", { name: /DỰ ÁN CỦA TÔI/i })).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/Không có quyền truy cập/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "ĐĂNG NHẬP" }).first()).toBeVisible();
});
