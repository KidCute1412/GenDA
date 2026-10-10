import { expect, test } from "@playwright/test";
import { loginAs } from "./support/auth";

const api = process.env.E2E_API_URL ?? "http://localhost:3002";

test("SME saves, resubmits a returned project and admin publishes it to the real catalog", async ({ page }) => {
  test.setTimeout(120_000);
  const title = `MVP moderation ${crypto.randomUUID()}`;
  const deadline = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const reason = "Thu hẹp phạm vi còn một landing page tĩnh trước khi xuất bản.";
  await loginAs(page, "sme");
  await page.goto("/sme/projects/new");
  await page.getByLabel(/^Bạn cần làm gì/).fill(title);
  await page.getByRole("button", { name: "LƯU BẢN NHÁP", exact: true }).click();
  await expect(page.getByText(/Đã lưu lúc/)).toBeVisible();
  await expect(page).toHaveURL(/\/sme\/projects\/p-[a-f0-9]+\/edit$/);
  const id = new URL(page.url()).pathname.split("/")[3];
  await page.reload();
  await expect(page.getByLabel(/^Bạn cần làm gì/)).toHaveValue(title);
  expect((await page.request.get(`${api}/api/v1/projects/${id}`)).status()).toBe(404);
  const draftCatalog = await page.request.get(`${api}/api/v1/projects`, { params: { q: title } });
  expect((await draftCatalog.json()).data).toEqual([]);

  await page.getByLabel(/^Tóm tắt trong một câu/).fill("Landing page giới thiệu doanh nghiệp.");
  await page.getByLabel(/^Lĩnh vực của bạn/).selectOption("Dịch vụ");
  await page.getByLabel(/^Quy mô doanh nghiệp/).selectOption("1-10 nhân sự");
  await page.getByLabel(/^Mô tả chi tiết yêu cầu/).fill("Landing page và hệ thống quản trị nội dung cần đối chiếu phạm vi.");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "React", exact: true }).click();
  await page.getByRole("radio", { name: "Cơ bản", exact: true }).check();
  await page.getByLabel(/^Ngân sách cho toàn dự án/).fill("1500000");
  await page.getByLabel(/^Hạn hoàn thành toàn dự án/).fill(deadline);
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByLabel(/^Thế nào là làm xong/).fill("Chạy tốt trên điện thoại\nBàn giao mã nguồn");
  await page.getByLabel("Mốc này bàn giao cái gì", { exact: true }).nth(0).fill("Thiết kế");
  await page.getByLabel("Mốc này bàn giao cái gì", { exact: true }).nth(1).fill("Bàn giao");
  await expect(page.getByRole("button", { name: "Gửi duyệt", exact: true })).toBeDisabled();
  await page.getByLabel("Số tiền của mốc", { exact: true }).nth(0).fill("500000");
  await page.getByLabel("Số tiền của mốc", { exact: true }).nth(1).fill("1000000");
  await page.getByLabel("Hạn của mốc", { exact: true }).nth(0).fill(deadline);
  await page.getByLabel("Hạn của mốc", { exact: true }).nth(1).fill(deadline);
  await expect(page.getByRole("button", { name: "Gửi duyệt", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Gửi duyệt", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đã gửi dự án đi duyệt" })).toBeVisible();
  expect((await page.request.get(`${api}/api/v1/projects/${id}`)).status()).toBe(404);
  await page.goto(`/sme/projects/${id}/edit`);
  await expect(page.getByText("Dự án này không còn là bản nháp", { exact: true })).toBeVisible();

  await loginAs(page, "admin");
  await page.goto("/admin");
  const card = page.locator("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Trả về chỉnh sửa", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Xác nhận trả về" })).toBeDisabled();
  await dialog.getByLabel(/^Lý do trả về/).fill(reason);
  await dialog.getByLabel("Mức độ đề xuất (không bắt buộc)").selectOption("BASIC");
  await dialog.getByRole("button", { name: "Xác nhận trả về" }).click();
  await expect(card).toHaveCount(0);

  await loginAs(page, "sme");
  await page.goto("/sme/projects");
  const ownCard = page.locator("article").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  await expect(ownCard.getByText(reason, { exact: false })).toBeVisible();
  await ownCard.getByRole("link", { name: "SỬA THEO GÓP Ý" }).click();
  await expect(page.getByLabel(/^Bạn cần làm gì/)).toHaveValue(title);
  await expect(page.getByText(reason, { exact: false })).toBeVisible();
  await page.getByLabel(/^Mô tả chi tiết yêu cầu/).fill("Một landing page tĩnh; không có hệ thống quản trị nội dung.");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.getByRole("button", { name: "Gửi duyệt", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đã gửi dự án đi duyệt" })).toBeVisible();

  await loginAs(page, "admin");
  await page.goto("/admin");
  await expect(card.getByText("Một landing page tĩnh; không có hệ thống quản trị nội dung.", { exact: true })).toBeVisible();
  await card.getByRole("button", { name: "Duyệt xuất bản", exact: true }).click();
  await expect(card).toHaveCount(0);

  await loginAs(page, "student");
  await page.goto(`/projects?q=${encodeURIComponent(title)}`);
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`), { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByText("Một landing page tĩnh; không có hệ thống quản trị nội dung.", { exact: true })).toBeVisible();
  await expect(page.getByText("Bàn giao mã nguồn", { exact: true })).toBeVisible();
});
