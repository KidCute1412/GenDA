import { expect, test, type Page } from "@playwright/test";
import { loginAs } from "./support/auth";
import type { components } from "@genda/api-client";
import { writeFileSync } from "node:fs";

const api = process.env.E2E_API_URL ?? "http://localhost:3002";
type Workspace = components["schemas"]["WorkspaceResponse"];
const PDF = Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n");

async function mutation(page: Page, path: string, data: unknown, method: "post" | "put" = "post") {
  const { token } = await (await page.request.get(`${api}/api/v1/auth/csrf`)).json();
  const response = await page.request[method](`${api}/api/v1${path}`, { headers: { "X-CSRF-Token": token }, data });
  expect(response.ok(), `${path}: ${response.status()} ${await response.text()}`).toBeTruthy();
  return response.status() === 204 ? null : response.json();
}

async function assignedProject(sme: Page, contributor: Page, admin: Page) {
  await loginAs(sme, "sme"); await loginAs(admin, "admin");
  // Each scenario owns a contributor, so repeated runs do not consume another test's persisted AI quota.
  const email = `milestone.${crypto.randomUUID()}@genda.test`;
  await mutation(contributor, "/auth/register", { name: "Milestone Contributor", email, password: "Password@1", role: "CONTRIBUTOR" });
  await mutation(contributor, "/auth/login", { email, password: "Password@1", rememberDevice: false });
  await mutation(contributor, "/users/me/profile", { displayName: "Milestone Contributor", backgroundType: "WORKING_PROFESSIONAL", specialization: "Frontend", skillCodes: ["react"] }, "put");
  const { token } = await (await contributor.request.get(`${api}/api/v1/auth/csrf`)).json();
  const cv = await contributor.request.put(`${api}/api/v1/users/me/cv`, { headers: { "X-CSRF-Token": token }, multipart: { file: { name: "cv.pdf", mimeType: "application/pdf", buffer: PDF } } });
  expect(cv.ok()).toBeTruthy();
  const deadline = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const project = await mutation(sme, "/sme/projects", {
    title: `Milestone E2E ${crypto.randomUUID()}`, summary: "Landing page", problem: "A static page with a form", industry: "IT", smeSize: "1-10",
    complexity: "BASIC", budget: 1500000, deadline, skillCodes: ["react"], acceptanceCriteria: ["Form and source"],
    milestones: [{ title: "Thiết kế", budget: 500000, deadline, criteria: ["Form có tên", "Chưa bổ sung phần thiếu email", "Thiết kế đẹp"] }, { title: "Mã nguồn", budget: 1000000, deadline, criteria: ["Bàn giao mã nguồn"] }]
  });
  await mutation(sme, `/sme/projects/${project.id}/submit`, {});
  await mutation(admin, `/admin/projects/${project.id}/publish`, {});
  const application = await mutation(contributor, "/applications", { projectId: project.id, coverLetter: "Tôi có thể thực hiện landing page với React và bàn giao mã nguồn, cập nhật tiến độ theo từng milestone đã chốt." });
  await mutation(sme, `/sme/applications/${application.id}/accept`, {});
  return project.id as string;
}

test("two sessions share revisions, evidence, AI review, human decisions and project completion", async ({ page: sme, browser, baseURL }) => {
  test.setTimeout(180000);
  const contributor = await browser.newPage({ baseURL });
  const admin = await browser.newPage({ baseURL });
  try {
    const id = await assignedProject(sme, contributor, admin);
    await Promise.all([sme.goto(`/workspace/${id}`), contributor.goto(`/workspace/${id}`)]);
    await expect(contributor.getByLabel("Ghi chú bàn giao")).toBeVisible();
    await expect(sme.getByLabel("Ghi chú bàn giao")).toHaveCount(0);
    await contributor.getByLabel("Ghi chú bàn giao").fill("Đã thêm form có tên và số điện thoại.");
    await contributor.getByLabel("Liên kết sản phẩm").fill("https://example.com/deliverable");
    await contributor.getByLabel("Tệp bàn giao").setInputFiles([{ name: "proof.txt", mimeType: "text/plain", buffer: Buffer.from("Form includes name and phone") }, { name: "scan.pdf", mimeType: "application/pdf", buffer: PDF }]);
    await expect(contributor.getByRole("button", { name: "Bỏ tệp scan.pdf" })).toBeVisible();
    await contributor.getByRole("button", { name: "Nộp bản 1", exact: true }).click();
    const first = contributor.getByRole("article", { name: "Bản bàn giao 1" });
    await expect(first).toBeVisible();
    await first.getByRole("button", { name: "Phân tích bằng AI", exact: true }).click();
    await expect(first.getByText("EXECUTIVE SUMMARY")).toBeVisible();
    await expect(first.getByText("Có bằng chứng liên quan")).toBeVisible();
    await expect(first.getByText("Chưa thấy bằng chứng")).toBeVisible();
    await expect(first.getByText("Chưa đủ thông tin")).toBeVisible();
    await expect(first.getByText("Bước kiểm tra tiếp theo").first()).toBeVisible();
    await expect(first.getByText(/AI không đọc được văn bản trong scan.pdf/)).toBeVisible();
    const original = await (await contributor.request.get(`${api}/api/v1/projects/${id}/workspace`)).json() as Workspace;
    const oldReview = original.submissions[0].aiReview!;
    expect(oldReview.sources.some(source => source.label === "proof.txt")).toBeTruthy();
    const cached = await mutation(contributor, `/milestones/${original.milestones[0].id}/submissions/${original.submissions[0].id}/ai-review`, {});
    expect(cached.id).toBe(oldReview.id);
    const download = await sme.request.get(`${api}/api/v1/attachments/${original.submissions[0].attachments[0].id}/download`);
    expect(download.ok()).toBeTruthy(); expect(download.headers()["content-disposition"]).toContain("attachment");
    await sme.reload();
    await expect(sme.getByRole("article", { name: "Bản bàn giao 1" }).getByText("Có bằng chứng liên quan")).toBeVisible();
    await sme.getByRole("button", { name: "Có ích", exact: true }).click();
    await expect(sme.getByText("Đã ghi nhận phản hồi của bạn.")).toBeVisible();
    await sme.getByLabel("Lý do yêu cầu sửa").fill("Bổ sung email và mô tả mã nguồn.");
    await sme.getByRole("button", { name: "Yêu cầu chỉnh sửa", exact: true }).click();
    await expect(sme.getByText("Đã gửi yêu cầu chỉnh sửa.", { exact: true })).toBeVisible();
    await contributor.reload();
    await contributor.getByLabel("Ghi chú bàn giao").fill("Đã bổ sung email, mã nguồn và form có tên.");
    await contributor.getByRole("button", { name: "Nộp bản 2", exact: true }).click();
    await expect(contributor.getByRole("article", { name: "Bản bàn giao 2" })).toBeVisible();
    await contributor.getByRole("article", { name: "Bản bàn giao 2" }).getByRole("button", { name: "Phân tích bằng AI" }).click();
    await expect(contributor.getByRole("article", { name: "Bản bàn giao 2" }).getByText("Có bằng chứng liên quan")).toBeVisible();
    await sme.reload();
    await sme.getByRole("button", { name: "Ghi nhận đã cấp quỹ" }).click();
    await expect(sme.getByRole("button", { name: "Ghi nhận đã giải ngân" })).toBeDisabled();
    await sme.getByRole("button", { name: "Nghiệm thu mốc này", exact: true }).click();
    await expect(sme.getByRole("dialog")).toBeVisible();
    await sme.keyboard.press("Escape");
    await expect(sme.getByRole("dialog")).not.toBeVisible();
    await expect(sme.getByRole("button", { name: "Nghiệm thu mốc này", exact: true })).toBeFocused();
    await sme.getByRole("button", { name: "Nghiệm thu mốc này", exact: true }).click();
    await sme.getByRole("button", { name: "Xác nhận nghiệm thu", exact: true }).click();
    await expect(sme.getByRole("heading", { name: "Mốc 2: Mã nguồn" })).toBeVisible();
    await sme.getByRole("button", { name: "Mốc 1: Thiết kế", exact: true }).click();
    await sme.getByRole("button", { name: "Ghi nhận đã giải ngân" }).click();
    await expect(sme.getByText("Đã ghi nhận giải ngân mô phỏng.", { exact: true })).toBeVisible();
    await contributor.reload();
    await contributor.getByLabel("Ghi chú bàn giao").fill("Mã nguồn đã bàn giao đầy đủ.");
    await contributor.getByRole("button", { name: "Nộp bản 1", exact: true }).click();
    await sme.reload();
    await sme.getByRole("button", { name: "Nghiệm thu mốc này", exact: true }).click();
    await sme.getByRole("button", { name: "Xác nhận nghiệm thu", exact: true }).click();
    await expect(sme.getByText("Dự án đã hoàn tất", { exact: true })).toBeVisible();
    await contributor.reload();
    await expect(contributor.getByText("Dự án đã hoàn tất", { exact: true })).toBeVisible();
    const final = await (await contributor.request.get(`${api}/api/v1/projects/${id}/workspace`)).json() as Workspace;
    expect(final.status).toBe("COMPLETED"); expect(final.submissions).toHaveLength(3);
    expect(final.submissions.find(h => h.id === original.submissions[0].id)?.aiReview?.id).toBe(oldReview.id);
    expect(final.milestones.every(m => m.status === "ACCEPTED")).toBeTruthy();
    const account = await (await contributor.request.get(`${api}/api/v1/auth/me`)).json();
    writeFileSync("../../output/milestone-e2e-snapshot.json", JSON.stringify({ workspace: final, email: account.email }));
    await contributor.getByRole("button", { name: "Mốc 1: Thiết kế", exact: true }).press("Enter");
    await contributor.screenshot({ path: "../../output/milestone-workspace-desktop.png", fullPage: true });
    await contributor.setViewportSize({ width: 390, height: 844 });
    expect(await contributor.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await contributor.screenshot({ path: "../../output/milestone-workspace-mobile.png", fullPage: true });
  } finally { await contributor.close(); await admin.close(); }
});

test("AI service failures and invented quotes do not block manual acceptance", async ({ page: sme, browser, baseURL }) => {
  test.setTimeout(120000);
  const contributor = await browser.newPage({ baseURL }); const admin = await browser.newPage({ baseURL });
  try {
    const id = await assignedProject(sme, contributor, admin);
    await contributor.goto(`/workspace/${id}`);
    await contributor.getByLabel("Ghi chú bàn giao").fill("BAD_QUOTE");
    await contributor.getByRole("button", { name: "Nộp bản 1", exact: true }).click();
    await contributor.getByRole("button", { name: "Phân tích bằng AI" }).click();
    await expect(contributor.getByText(/AI_INVALID_OUTPUT/)).toBeVisible();
    await sme.goto(`/workspace/${id}`);
    await sme.getByLabel("Lý do yêu cầu sửa").fill("Nộp bản mới."); await sme.getByRole("button", { name: "Yêu cầu chỉnh sửa", exact: true }).click();
    await expect(sme.getByText("Đã gửi yêu cầu chỉnh sửa.", { exact: true })).toBeVisible();
    await contributor.reload(); await contributor.getByLabel("Ghi chú bàn giao").fill("FAIL_AI");
    await contributor.getByRole("button", { name: "Nộp bản 2", exact: true }).click();
    await contributor.getByRole("article", { name: "Bản bàn giao 2" }).getByRole("button", { name: "Phân tích bằng AI" }).click();
    await expect(contributor.getByRole("article", { name: "Bản bàn giao 2" }).getByText(/AI_UNAVAILABLE/)).toBeVisible();
    await sme.reload(); await sme.getByRole("button", { name: "Nghiệm thu mốc này", exact: true }).click(); await sme.getByRole("button", { name: "Xác nhận nghiệm thu", exact: true }).click();
    await expect(sme.getByRole("heading", { name: "Mốc 2: Mã nguồn" })).toBeVisible();
  } finally { await contributor.close(); await admin.close(); }
});
