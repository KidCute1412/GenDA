import { beforeEach, describe, expect, it } from "vitest";
import { applyToProject, createProject, findDemoAccount, getLedger, moderateProject, moderateSmeRegistration, registerDemoUser, resetLedger,reviewMilestone, setApplicationStatus, submitDeliverable, submitReview } from "./store";

const projectInput = { ownerEmail: "contact@coffeelab.vn", title: "Demo xuyên vai trò", smeName: "The Coffee Lab", budget: 3_000_000, deadline: "2027-01-01", skills: ["React"], summary: "Demo", problem: "Cần một sản phẩm demo", acceptance: ["Hoàn tất"], milestones: [{ order: 1, title: "Mốc một", budget: 1_000_000, deadline: "2026-12-01", criteria: "Đạt" }, { order: 2, title: "Mốc hai", budget: 2_000_000, deadline: "2027-01-01", criteria: "Đạt" }] };

describe("demo ledger lifecycle", () => {
  beforeEach(() => { localStorage.clear(); resetLedger(); });
  it("requires an SME to provide a tax code or, failing that, a company website", () => {
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", taxCode: "12345" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", companyWebsite: "khong-hop-le" })).toMatchObject({ ok: false, code: "SME_IDENTITY_REQUIRED" });
    expect(registerDemoUser({ name: "Công ty A", email: "a@congty.vn", role: "SME", taxCode: "0316789012001" })).toMatchObject({ ok: true, value: { taxCode: "0316789012-001" } });
    expect(registerDemoUser({ name: "Công ty B", email: "b@congty.vn", role: "SME", companyWebsite: "congtyb.vn" })).toMatchObject({ ok: true, value: { companyWebsite: "https://congtyb.vn" } });
    expect(registerDemoUser({ name: "Sinh viên", email: "sv@hcmus.edu.vn", role: "STUDENT" }).ok).toBe(true);
  });
  it("keeps a new SME pending until an admin approves it", () => {
    const registered = registerDemoUser({ name: "Công ty C", email: "c@congty.vn", role: "SME", taxCode: "0316789012" });
    expect(registered).toMatchObject({ ok: true, value: { smeApprovalStatus: "PENDING" } }); if (!registered.ok) return;
    expect(createProject({ ...projectInput, ownerEmail: "c@congty.vn" })).toMatchObject({ ok: false });
    expect(moderateSmeRegistration("contact@coffeelab.vn", registered.value.id, "approve")).toMatchObject({ ok: false, code: "WRONG_ROLE" });
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "reject")).toMatchObject({ ok: false, code: "REASON_REQUIRED" });
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "approve").ok).toBe(true);
    expect(findDemoAccount("c@congty.vn")).toMatchObject({ smeApprovalStatus: "APPROVED", emailVerified: true });
    expect(createProject({ ...projectInput, ownerEmail: "c@congty.vn" }).ok).toBe(true);
    expect(moderateSmeRegistration("admin@genda.vn", registered.value.id, "approve")).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
  });
  it("rejects an unbalanced milestone budget", () => { const result = createProject({ ...projectInput, milestones: [{ ...projectInput.milestones[0], budget: 999 }] }); expect(result).toMatchObject({ ok: false, code: "MILESTONE_BUDGET_MISMATCH" }); });
  it("runs create, moderate, apply and atomic accept", () => {
    const created = createProject(projectInput); expect(created.ok).toBe(true); if (!created.ok) return;
    expect(moderateProject("admin@genda.vn", created.value, "reject")).toMatchObject({ ok: false, code: "REASON_REQUIRED" });
    expect(moderateProject("admin@genda.vn", created.value, "approve").ok).toBe(true);
    const application = applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Tôi có đủ kinh nghiệm để thực hiện dự án này một cách rõ ràng và đúng hạn.", portfolioUrl: "https://example.com" });
    expect(application.ok).toBe(true); if (!application.ok) return;
    expect(applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Lặp", portfolioUrl: "https://example.com" })).toMatchObject({ ok: false, code: "DUPLICATE_APPLICATION" });
    expect(setApplicationStatus("contact@coffeelab.vn", application.value, "ACCEPTED").ok).toBe(true);
    expect(getLedger().projects.find((project) => project.id === created.value)?.status).toBe("IN_PROGRESS");
  });
  it("keeps resubmission history and creates portfolio on completion", () => {
    const created = createProject(projectInput); if (!created.ok) throw new Error(); moderateProject("admin@genda.vn", created.value, "approve");
    const application = applyToProject({ email: "letuanloc.2203@hcmus.edu.vn", projectId: created.value, coverLetter: "Tôi có đủ kinh nghiệm để thực hiện dự án này một cách rõ ràng và đúng hạn.", portfolioUrl: "https://example.com" }); if (!application.ok) throw new Error(); setApplicationStatus("contact@coffeelab.vn", application.value, "ACCEPTED");
    const project = getLedger().projects.find((item) => item.id === created.value)!;
    for (const [index, milestoneId] of project.milestoneIds.entries()) {
      expect(submitDeliverable({ email: "letuanloc.2203@hcmus.edu.vn", milestoneId, link: "https://example.com", note: "Bàn giao", files: [{ name: "result.pdf", type: "application/pdf", size: 10 }] }).ok).toBe(true);
      if (index === 0) { expect(reviewMilestone({ email: "contact@coffeelab.vn", milestoneId, decision: "changes", reason: "Vui lòng chỉnh lại phần tiêu đề" }).ok).toBe(true); submitDeliverable({ email: "letuanloc.2203@hcmus.edu.vn", milestoneId, link: "https://example.com/v2", note: "Nộp lại", files: [] }); }
      expect(reviewMilestone({ email: "contact@coffeelab.vn", milestoneId, decision: "accept" }).ok).toBe(true);
    }
    expect(getLedger().submissions.filter((item) => item.milestoneId === project.milestoneIds[0])).toHaveLength(2);
    expect(getLedger().projects.find((item) => item.id === created.value)?.status).toBe("COMPLETED");
    expect(getLedger().portfolios.some((item) => item.projectId === created.value)).toBe(true);
    expect(submitReview({ email: "contact@coffeelab.vn", projectId: created.value, rating: 5, comment: "Hoàn thành tốt và đúng yêu cầu" }).ok).toBe(true);
    expect(submitReview({ email: "contact@coffeelab.vn", projectId: created.value, rating: 5, comment: "Lặp" })).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
  });
});
