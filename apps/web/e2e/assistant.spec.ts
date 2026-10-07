import { expect, test, type Locator } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) { const key = localStorage.key(i); if (key?.startsWith("genda-demo:")) localStorage.removeItem(key); }
    sessionStorage.clear();
  });
});

/** Bấm "Hiện hết" / "Tiếp" cho tới khi lựa chọn `choice` hiện ra. */
async function readUntil(gen: Locator, choice: string) {
  const target = gen.getByRole("button", { name: choice });
  for (let step = 0; step < 10 && !(await target.isVisible()); step += 1) {
    await gen.getByRole("button", { name: /Hiện hết|Tiếp/ }).click();
  }
  return target;
}

test("Gen chào sinh viên lần đầu, nói tiếp điều quan trọng và không tự bật lại trong cùng phiên", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /SINH VIÊN$/i }).click();
  await page.waitForURL(/\/projects/);
  await page.goto("/student/applications");

  const gen = page.getByRole("dialog", { name: "Gen" });
  await expect(gen).toContainText("Mình là Gen");
  await (await readUntil(gen, "Bắt đầu thôi")).click();

  // Đơn mẫu đã chờ hơn 7 ngày nên Gen nói tiếp về đơn đó
  await expect(gen).toContainText("chưa phản hồi");
  await gen.getByRole("button", { name: "Đóng hội thoại với Gen" }).click();

  // Đóng giữa chừng thì điều đó vẫn là "mới", nhưng Gen không tự bật lần hai trong một phiên
  await page.reload();
  const launcher = page.getByRole("button", { name: "Mở trợ lý Gen, có 1 điều mới" });
  await expect(launcher).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(gen).toHaveCount(0);

  // Gọi Gen bằng nút: menu liệt kê điều chưa nghe, Esc đóng và trả tiêu điểm về nút gọi
  await launcher.click();
  await expect(gen.getByRole("button", { name: /Đơn chờ lâu chưa có phản hồi/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(gen).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test("Gen không xuất hiện với doanh nghiệp", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /DOANH NGHIỆP$/i }).click();
  await page.goto("/sme/projects");
  await page.waitForTimeout(2000);
  await expect(page.getByRole("button", { name: /Mở trợ lý Gen/ })).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Gen" })).toHaveCount(0);
});
