import { beforeEach, describe, expect, it } from "vitest";
import { applyToProject, findDemoAccount, getLedger, mirrorPublishedProject, mirrorContributor, moderateSmeRegistration, registerDemoUser, resetLedger,reviewMilestone, seedAssistantScenario, setApplicationStatus, submitDeliverable, submitReview, verifyDemoEmail } from "./store";

const published = { id: "p-backend-demo", title: "Demo xuyên vai trò", smeName: "The Coffee Lab", smeContact: "contact@coffeelab.vn", budget: 3_000_000, deadline: "2027-01-01", skills: ["React"], summary: "Demo", problem: "Cần một sản phẩm demo", acceptance: ["Hoàn tất"], milestones: [{ order: 1, title: "Mốc một", budget: 1_000_000, deadline: "2026-12-01", criteria: "Đạt" }, { order: 2, title: "Mốc hai", budget: 2_000_000, deadline: "2027-01-01", criteria: "Đạt" }] };
/** Dự án đã được backend xuất bản, sao vào ledger như ApplyButton làm trước khi ứng tuyển. */
function publish() { expect(mirrorPublishedProject(published).ok).toBe(true); return { ok: true as const, value: published.id }; }

describe("demo ledger lifecycle", () => {
  beforeEach(() => { localStorage.clear(); resetLedger(); });
  it("requires an SME to provide a tax code or, failing that, a company website", () => {
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", taxCode: "12345" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", companyWebsite: "khong-hop-le" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", taxCode: "0316789012001" })).toMatchObject({ ok: true, value: { taxCode: "0316789012-001" } });
    expect(registerDemoUser({ name: "Công ty B", email: "b@congty.vn", role: "SME", companyWebsite: "congtyb.vn" })).toMatchObject({ ok: true, value: { companyWebsite: "https://congtyb.vn" } });
    expect(registerDemoUser({ name: "Sinh viên", email: "sv@hcmus.edu.vn", role: "CONTRIBUTOR" }).ok).toBe(true);
  });
  it("keeps a new SME pending until an admin approves it", () => {
    const registered = registerDemoUser({ name: "Công ty C", email: "c@congty.vn", role: "SME", taxCode: "0316789012" });
    expect(registered).toMatchObject({ ok: true, value: { smeApprovalStatus: "PENDING" } }); if (!registered.ok) return;
    expect(moderateSmeRegistration("contact@coffeelab.vn", registered.value.id, "approve")).toMatchObject({ ok: false, code: "WRONG_ROLE" });
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "reject")).toMatchObject({ ok: false, code: "REASON_REQUIRED" });
    expect(verifyDemoEmail("c@congty.vn").ok).toBe(true);
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "approve").ok).toBe(true);
    expect(findDemoAccount("c@congty.vn")).toMatchObject({ smeApprovalStatus: "APPROVED", emailVerified: true, accountState: "ACTIVE" });
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "approve")).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
  });
  it("requires a verified contributor with a CV before applying", () => {
    const registered = registerDemoUser({ name: "Sinh viên mới", email: "moi@hcmus.edu.vn", role: "CONTRIBUTOR" }); if (!registered.ok) throw new Error();
    const created = publish();
    expect(applyToProject({ email: "moi@hcmus.edu.vn", projectId: created.value, coverLetter: "Thư ngỏ" })).toMatchObject({ ok: false, code: "EMAIL_NOT_VERIFIED" });
    verifyDemoEmail("moi@hcmus.edu.vn");
    expect(applyToProject({ email: "moi@hcmus.edu.vn", projectId: created.value, coverLetter: "Thư ngỏ" })).toMatchObject({ ok: false, code: "CV_REQUIRED" });
  });
  it("mirrors a backend contributor and their READY CV so the demo application carries it", () => {
    const created = publish();
    expect(mirrorContributor({ email: "backend@hcmus.edu.vn", name: "Người dùng backend" }).ok).toBe(true);
    expect(applyToProject({ email: "backend@hcmus.edu.vn", projectId: created.value, coverLetter: "Thư ngỏ" })).toMatchObject({ ok: false, code: "CV_REQUIRED" });
    expect(mirrorContributor({ email: "backend@hcmus.edu.vn", name: "Người dùng backend", cv: { name: "cv.pdf", size: 1024, uploadedAt: "2026-10-09T00:00:00Z", dataUrl: "data:application/pdf;base64,JVBERg==" } }).ok).toBe(true);
    expect(getLedger().users.filter((user) => user.email === "backend@hcmus.edu.vn")).toHaveLength(1);
    const application = applyToProject({ email: "backend@hcmus.edu.vn", projectId: created.value, coverLetter: "Thư ngỏ" });
    expect(application.ok).toBe(true);
    expect(getLedger().applications.find((item) => application.ok && item.id === application.value)?.cv).toMatchObject({ name: "cv.pdf" });
    expect(mirrorContributor({ email: "contact@coffeelab.vn", name: "SME" })).toMatchObject({ ok: false, code: "WRONG_ROLE" });
  });
  it("mirrors a backend-published project once, owned by the matching SME", () => {
    publish(); publish();
    expect(getLedger().projects.filter((project) => project.id === published.id)).toHaveLength(1);
    expect(getLedger().projects.find((project) => project.id === published.id)).toMatchObject({ ownerId: "sme-coffee", status: "PUBLISHED" });
    expect(getLedger().milestones.filter((milestone) => milestone.projectId === published.id)).toHaveLength(2);
  });
  it("runs apply and atomic accept on a published project", () => {
    const created = publish();
    const application = applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Tôi có đủ kinh nghiệm để thực hiện dự án này một cách rõ ràng và đúng hạn." });
    expect(application.ok).toBe(true); if (!application.ok) return;
    expect(applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Lặp" })).toMatchObject({ ok: false, code: "DUPLICATE_APPLICATION" });
    expect(setApplicationStatus("contact@coffeelab.vn", application.value, "ACCEPTED").ok).toBe(true);
    expect(getLedger().projects.find((project) => project.id === created.value)?.status).toBe("IN_PROGRESS");
  });
  it("keeps resubmission history and completes the project", () => {
    const created = publish();
    const application = applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Tôi có đủ kinh nghiệm để thực hiện dự án này một cách rõ ràng và đúng hạn." }); if (!application.ok) throw new Error(); setApplicationStatus("contact@coffeelab.vn", application.value, "ACCEPTED");
    const project = getLedger().projects.find((item) => item.id === created.value)!;
    for (const [index, milestoneId] of project.milestoneIds.entries()) {
      expect(submitDeliverable({ email: "letuanloc.2203@hcmus.edu.vn", milestoneId, link: "https://example.com", note: "Bàn giao", files: [{ name: "result.pdf", type: "application/pdf", size: 10 }] }).ok).toBe(true);
      if (index === 0) { expect(reviewMilestone({ email: "contact@coffeelab.vn", milestoneId, decision: "changes", reason: "Vui lòng chỉnh lại phần tiêu đề" }).ok).toBe(true); submitDeliverable({ email: "letuanloc.2203@hcmus.edu.vn", milestoneId, link: "https://example.com/v2", note: "Nộp lại", files: [] }); }
      expect(reviewMilestone({ email: "contact@coffeelab.vn", milestoneId, decision: "accept" }).ok).toBe(true);
    }
    expect(getLedger().submissions.filter((item) => item.milestoneId === project.milestoneIds[0])).toHaveLength(2);
    expect(getLedger().projects.find((item) => item.id === created.value)?.status).toBe("COMPLETED");
    expect(submitReview({ email: "contact@coffeelab.vn", projectId: created.value, rating: 5, comment: "Hoàn thành tốt và đúng yêu cầu" }).ok).toBe(true);
    expect(submitReview({ email: "contact@coffeelab.vn", projectId: created.value, rating: 5, comment: "Lặp" })).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
  });
  it("upgrades contributors saved under the legacy STUDENT role", () => {
    const stored = getLedger();
    const legacy = { ...stored, users: stored.users.map((user) => user.email === "letuanloc.2203@hcmus.edu.vn" ? { ...user, role: "STUDENT" } : user) };
    localStorage.setItem("genda-demo:ledger:v2", JSON.stringify(legacy));
    window.dispatchEvent(new StorageEvent("storage", { key: "genda-demo:ledger:v2" }));
    expect(findDemoAccount("letuanloc.2203@hcmus.edu.vn")?.role).toBe("CONTRIBUTOR");
    expect(seedAssistantScenario("letuanloc.2203@hcmus.edu.vn", "changes").ok).toBe(true);
  });
});
