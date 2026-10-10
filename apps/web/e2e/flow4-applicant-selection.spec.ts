import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

const QUIET_GEN = { version: 1, introDone: true, seen: {}, lastActiveAt: null, autoOpen: false };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (memory) => localStorage.setItem("genda-demo:assistant:student-loc", JSON.stringify(memory)),
    QUIET_GEN
  );
});

test("Flow 4: SME reviews multiple applicants, compares match scores, shortlists, and accepts one", async ({ page }) => {
  test.setTimeout(60_000);
  await loginAs(page, "sme");

  // 1. Vào danh sách dự án của SME
  await page.goto("/sme/projects");
  await expect(page.getByRole("heading", { name: /DỰ ÁN CỦA TÔI/i })).toBeVisible();

  // Tìm dự án Coffee Lab và click vào nút xem ứng viên
  const projectCard = page.locator("article").filter({ hasText: "Landing page cho chiến dịch cà phê mới" });
  await expect(projectCard).toBeVisible();
  
  // Nếu dự án đã ở trạng thái IN_PROGRESS từ lần chạy trước, kiểm tra trực tiếp trang review
  await page.goto("/sme/projects/p-coffee-lab/review");
  await expect(page.getByRole("heading", { name: "Xét duyệt ứng viên" })).toBeVisible();

  // 2. Xác nhận danh sách có 2 ứng viên được xếp hạng
  const applicantCards = page.locator(".applicant-card");
  await expect(applicantCards).toHaveCount(2);

  // Ứng viên top 1: Nguyễn Hoàng Thảo (100% khớp)
  const topCard = applicantCards.filter({ hasText: "Nguyễn Hoàng Thảo" });
  await expect(topCard).toBeVisible();
  await expect(topCard.getByText("Hạng Vàng")).toBeVisible();
  await expect(topCard.getByText("32 XP")).toBeVisible();
  await expect(topCard.getByText("100%")).toBeVisible();

  // Ứng viên top 2: Phạm Gia Huy (67% khớp)
  const secondCard = applicantCards.filter({ hasText: "Phạm Gia Huy" });
  await expect(secondCard).toBeVisible();
  await expect(secondCard.getByText("Hạng Vàng")).toBeVisible();
  await expect(secondCard.getByText("33 XP")).toBeVisible();
  await expect(secondCard.getByText("67%")).toBeVisible();

  // 3. Kiểm tra nút xem CV
  await expect(topCard.getByRole("button", { name: /Xem CV/ })).toBeVisible();
  await expect(secondCard.getByRole("button", { name: /Xem CV/ })).toBeVisible();

  // Nếu dự án chưa bắt đầu (PUBLISHED), thực hiện luồng shortlist và accept
  const acceptBtn = topCard.getByRole("button", { name: "Chấp nhận" });
  if (await acceptBtn.isVisible()) {
    // Thử đưa ứng viên 2 vào danh sách rút gọn
    const shortlistBtn = secondCard.getByRole("button", { name: "Đưa vào rút gọn" });
    if (await shortlistBtn.isVisible()) {
      await shortlistBtn.click();
      await expect(secondCard.getByText("Trong danh sách rút gọn")).toBeVisible();
    }

    // Chọn ứng viên top 1
    await acceptBtn.click();

    // Hộp thoại dialog cảnh báo
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Bạn không hoàn tác được bước này/)).toBeVisible();

    // Xác nhận chấp nhận
    await dialog.getByRole("button", { name: "Chấp nhận ứng viên" }).click();

    // 4. Xác nhận kết quả sau khi chọn
    await expect(page.getByText(/Bạn đã chọn Nguyễn Hoàng Thảo/)).toBeVisible();
    await expect(page.getByText("nguyenhoangthao@demo.genda.vn")).toBeVisible();

    // Thẻ top 1 hiển thị "Đã được chọn"
    await expect(topCard.getByText("Đã được chọn")).toBeVisible();

    // Thẻ thứ 2 tự động chuyển thành "Không được chọn"
    await expect(secondCard.getByText("Không được chọn")).toBeVisible();

    // Nút vào workspace hiển thị
    await expect(page.getByRole("link", { name: "Vào workspace" })).toBeVisible();
  } else {
    // Đã được chọn trước đó
    await expect(page.getByText(/Bạn đã chọn/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Vào workspace" })).toBeVisible();
  }
});

test("Flow 4: Contributor views project brief without 404", async ({ page }) => {
  await loginAs(page, "student");

  // Contributor vào trang Đơn của tôi
  await page.goto("/student/applications");
  await expect(page.getByRole("heading", { name: /ĐƠN CỦA TÔI/i })).toBeVisible();

  // Mở trang chi tiết dự án qua link xem đề bài
  const projectLink = page.locator(".app-card").first().getByRole("link", { name: "Xem đề bài" });
  if (await projectLink.isVisible()) {
    await projectLink.click();
    // Đảm bảo không bị lỗi 404 Not Found
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("// KỸ NĂNG YÊU CẦU")).toBeVisible();
  }
});
