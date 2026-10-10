"use client";

import { PROJECTS, MY_APPLICATIONS, PORTFOLIO } from "../../mocks/data";
import type { DemoApplication, DemoAudit, DemoLedger, DemoMilestone, DemoPortfolio, DemoProject, DemoResult, DemoRole, DemoSubmission, DemoUser } from "./types";

const KEY = "genda-demo:ledger:v2";
const NOTICE_KEY = "genda-demo:ledger-reset-notice";
const listeners = new Set<() => void>();
let memory: DemoLedger | null = null;

const accounts: DemoUser[] = [
  { id: "student-loc", name: "Lê Tuấn Lộc", email: "letuanloc.2203@hcmus.edu.vn", role: "STUDENT", emailVerified: true, studentVerified: true, verificationStatus: "VERIFIED", skills: ["Next.js", "React", "UI/UX"] },
  { id: "student-unverified", name: "Võ Ngọc Diệp", email: "diep@student.vn", role: "STUDENT", emailVerified: true, studentVerified: false, verificationStatus: "UNVERIFIED", skills: ["Figma"] },
  { id: "sme-coffee", name: "The Coffee Lab", email: "contact@coffeelab.vn", role: "SME", emailVerified: true },
  { id: "admin-triet", name: "Đỗ Minh Triết", email: "admin@genda.vn", role: "ADMIN", emailVerified: true }
];

export function createSeedLedger(): DemoLedger {
  const projects: DemoProject[] = PROJECTS.map((project) => ({ id: project.id, ownerId: "sme-coffee", title: project.title, smeName: project.smeName, budget: project.budget, deadline: project.deadline, skills: project.skills, summary: project.summary, problem: project.problem, acceptance: project.acceptance, status: project.status as DemoProject["status"], milestoneIds: project.milestones.map((m) => `${project.id}:${m.id}`), createdAt: "2026-09-01" }));
  const milestones: DemoMilestone[] = PROJECTS.flatMap((project) => project.milestones.map((m) => ({ ...m, id: `${project.id}:${m.id}`, projectId: project.id, status: m.status as DemoMilestone["status"], escrow: m.escrow })));
  const applications: DemoApplication[] = MY_APPLICATIONS.map((a) => ({ id: a.id, projectId: a.projectId, studentId: "student-loc", coverLetter: "Đơn ứng tuyển dữ liệu mẫu", portfolioUrl: "/portfolio/le-tuan-loc", status: a.status, submittedAt: a.submittedAt }));
  const portfolios: DemoPortfolio[] = PORTFOLIO.map((entry, index) => ({ id: entry.id, projectId: `seed-completed-${index}`, studentId: "student-loc", visible: entry.visible }));
  return { version: 2, users: accounts, projects, milestones, applications, submissions: [], reviews: [], portfolios, audits: [], uiState: {} };
}

function load(): DemoLedger {
  if (memory) return memory;
  if (typeof window === "undefined") return createSeedLedger();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoLedger;
      if (parsed.version === 2) {
        parsed.uiState ??= {};
        return (memory = parsed);
      }
    }
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("genda-demo:") && key !== "genda-demo:session") window.localStorage.removeItem(key);
    }
    window.sessionStorage.setItem(NOTICE_KEY, "1");
  } catch { /* seed below */ }
  memory = createSeedLedger();
  persist(memory);
  return memory;
}

function persist(next: DemoLedger): DemoResult<DemoLedger> {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
    memory = next;
    listeners.forEach((listener) => listener());
    return { ok: true, value: next };
  } catch {
    return { ok: false, code: "STORAGE_WRITE_FAILED", message: "Không thể lưu dữ liệu demo trong trình duyệt." };
  }
}

export function getLedger() { return load(); }
export function subscribeLedger(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function resetLedger() { memory = createSeedLedger(); return persist(memory); }
export function consumeResetNotice() { if (typeof window === "undefined") return false; const found = window.sessionStorage.getItem(NOTICE_KEY) === "1"; window.sessionStorage.removeItem(NOTICE_KEY); return found; }
export function getDemoUiValue<T>(key: string, fallback: T): T { const stored = load().uiState[key]; return stored && stored.expiresAt > Date.now() ? stored.value as T : fallback; }
export function setDemoUiValue<T>(key: string, value: T, ttlMs: number) { return update((draft) => { draft.uiState[key] = { value, expiresAt: Date.now() + ttlMs }; return { ok: true, value: undefined }; }); }

function update(mutator: (draft: DemoLedger) => DemoResult): DemoResult {
  const draft = structuredClone(load());
  const result = mutator(draft);
  if (!result.ok) return result;
  const saved = persist(draft);
  return saved.ok ? { ok: true, value: undefined } : saved;
}
const fail = (code: Parameters<typeof failure>[0], message: string) => failure(code, message);
function failure(code: import("./types").DemoErrorCode, message: string): DemoResult { return { ok: false, code, message }; }
const audit = (draft: DemoLedger, actorId: string, action: string, targetId: string, reason?: string) => draft.audits.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), actorId, action, targetId, reason });
const actor = (draft: DemoLedger, email: string) => draft.users.find((u) => u.email === email);

export function registerDemoUser(input: { name: string; email: string; role: Exclude<DemoRole, "ADMIN"> }): DemoResult<DemoUser> {
  let created!: DemoUser;
  const result = update((draft) => { const existing = actor(draft, input.email); if (existing) { created = existing; return { ok: true, value: undefined }; } created = { id: crypto.randomUUID(), ...input, emailVerified: false, studentVerified: input.role === "STUDENT" ? false : undefined, verificationStatus: input.role === "STUDENT" ? "UNVERIFIED" : undefined, skills: [] }; draft.users.push(created); return { ok: true, value: undefined }; });
  return result.ok ? { ok: true, value: created } : result;
}
export function verifyDemoEmail(email: string) { return update((draft) => { const user = actor(draft, email); if (!user) return fail("NOT_FOUND", "Không tìm thấy tài khoản."); user.emailVerified = true; return { ok: true, value: undefined }; }); }
export function requestStudentVerification(email: string) { return update((draft) => { const user = actor(draft, email); if (user?.role !== "STUDENT") return fail("WRONG_ROLE", "Chỉ sinh viên được gửi minh chứng."); user.verificationStatus = "PENDING"; user.verificationReason = undefined; audit(draft, user.id, "SUBMIT_VERIFICATION", user.id); return { ok: true, value: undefined }; }); }
export function moderateStudentVerification(email: string, studentId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const admin = actor(draft, email); if (admin?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ Admin được duyệt minh chứng."); const student = draft.users.find((user) => user.id === studentId && user.role === "STUDENT"); if (!student || student.verificationStatus !== "PENDING") return fail("INVALID_TRANSITION", "Minh chứng không chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); student.studentVerified = decision === "approve"; student.verificationStatus = decision === "approve" ? "VERIFIED" : "REJECTED"; student.verificationReason = reason; audit(draft, admin.id, decision === "approve" ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION", student.id, reason); return { ok: true, value: undefined }; }); }

export function createProject(input: Omit<DemoProject, "id" | "ownerId" | "status" | "milestoneIds" | "createdAt"> & { ownerEmail: string; milestones: Array<Omit<DemoMilestone, "id" | "projectId" | "status" | "escrow">> }): DemoResult<string> {
  let id = "";
  const result = update((draft) => { const user = actor(draft, input.ownerEmail); if (!user) return fail("AUTH_REQUIRED", "Cần đăng nhập."); if (user.role !== "SME") return fail("WRONG_ROLE", "Chỉ doanh nghiệp được đăng dự án."); if (!user.emailVerified) return fail("EMAIL_NOT_VERIFIED", "Cần xác minh email."); if (input.milestones.reduce((s, m) => s + m.budget, 0) !== input.budget) return fail("MILESTONE_BUDGET_MISMATCH", "Tổng ngân sách milestone phải bằng ngân sách dự án."); id = `p-${crypto.randomUUID()}`; const milestoneIds = input.milestones.map(() => crypto.randomUUID()); const created: DemoMilestone[] = input.milestones.map((m, i) => ({ ...m, id: milestoneIds[i], projectId: id, status: "PENDING", escrow: "PENDING_FUNDING" })); draft.milestones.push(...created); draft.projects.push({ ...input, id, ownerId: user.id, status: "PENDING_REVIEW", milestoneIds, createdAt: new Date().toISOString() }); audit(draft, user.id, "SUBMIT_PROJECT", id); return { ok: true, value: undefined }; });
  return result.ok ? { ok: true, value: id } : result;
}
export function moderateProject(email: string, projectId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const user = actor(draft, email); if (user?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ quản trị viên được duyệt dự án."); const project = draft.projects.find((p) => p.id === projectId); if (!project) return fail("NOT_FOUND", "Không tìm thấy dự án."); if (project.status !== "PENDING_REVIEW") return fail("INVALID_TRANSITION", "Dự án không ở trạng thái chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); project.status = decision === "approve" ? "PUBLISHED" : "DRAFT"; project.rejectionReason = reason; audit(draft, user.id, decision === "approve" ? "APPROVE_PROJECT" : "REJECT_PROJECT", projectId, reason); return { ok: true, value: undefined }; }); }
export function applyToProject(input: { email: string; projectId: string; coverLetter: string; portfolioUrl: string }): DemoResult<string> { let id = ""; const result = update((draft) => { const user = actor(draft, input.email); if (user?.role !== "STUDENT") return fail("WRONG_ROLE", "Chỉ sinh viên được ứng tuyển."); if (!user.studentVerified) return fail("STUDENT_NOT_VERIFIED", "Hồ sơ sinh viên chưa được xác minh."); const project = draft.projects.find((p) => p.id === input.projectId); if (project?.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không còn nhận ứng tuyển."); if (draft.applications.some((a) => a.projectId === input.projectId && a.studentId === user.id && !["REJECTED", "WITHDRAWN"].includes(a.status))) return fail("DUPLICATE_APPLICATION", "Bạn đã ứng tuyển dự án này."); id = `a-${crypto.randomUUID()}`; draft.applications.push({ id, projectId: input.projectId, studentId: user.id, coverLetter: input.coverLetter, portfolioUrl: input.portfolioUrl, status: "SUBMITTED", submittedAt: new Date().toISOString() }); audit(draft, user.id, "SUBMIT_APPLICATION", id); return { ok: true, value: undefined }; }); return result.ok ? { ok: true, value: id } : result; }
export function setApplicationStatus(email: string, applicationId: string, status: "SHORTLISTED" | "WITHDRAWN" | "ACCEPTED") { return update((draft) => { const user = actor(draft, email); const application = draft.applications.find((a) => a.id === applicationId); const project = draft.projects.find((p) => p.id === application?.projectId); if (!user || !application || !project) return fail("NOT_FOUND", "Không tìm thấy đơn ứng tuyển."); if (status === "WITHDRAWN") { if (user.id !== application.studentId) return fail("NOT_OWNER", "Bạn không sở hữu đơn này."); if (!['SUBMITTED','SHORTLISTED'].includes(application.status)) return fail("INVALID_TRANSITION", "Không thể rút đơn này."); application.status = status; } else { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (status === "ACCEPTED") { if (project.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không thể nhận ứng viên."); draft.applications.filter((a) => a.projectId === project.id).forEach((a) => { a.status = a.id === application.id ? "ACCEPTED" : "REJECTED"; }); project.status = "IN_PROGRESS"; } else application.status = status; } audit(draft, user.id, status, applicationId); return { ok: true, value: undefined }; }); }
export function submitDeliverable(input: { email: string; milestoneId: string; link?: string; note: string; files: DemoSubmission["files"] }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); const accepted = draft.applications.find((a) => a.projectId === project?.id && a.status === "ACCEPTED"); if (!user || user.role !== "STUDENT" || accepted?.studentId !== user.id) return fail("NOT_ASSIGNED", "Bạn chưa được phân công dự án này."); if (!milestone || !["PENDING", "CHANGES_REQUESTED"].includes(milestone.status)) return fail("INVALID_TRANSITION", "Milestone không nhận bàn giao."); draft.submissions.push({ id: crypto.randomUUID(), milestoneId: milestone.id, studentId: user.id, link: input.link, note: input.note, files: input.files, submittedAt: new Date().toISOString() }); milestone.status = "SUBMITTED"; audit(draft, user.id, "SUBMIT_DELIVERABLE", milestone.id); return { ok: true, value: undefined }; }); }
export function reviewMilestone(input: { email: string; milestoneId: string; decision: "accept" | "changes"; reason?: string }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (!milestone || milestone.status !== "SUBMITTED") return fail("INVALID_TRANSITION", "Milestone chưa có bàn giao."); if (input.decision === "changes" && !input.reason?.trim()) return fail("REASON_REQUIRED", "Yêu cầu chỉnh sửa phải có lý do."); milestone.status = input.decision === "accept" ? "ACCEPTED" : "CHANGES_REQUESTED"; const latest = [...draft.submissions].reverse().find((s) => s.milestoneId === milestone.id); if (latest && input.reason) latest.feedback = input.reason; if (project.milestoneIds.every((id) => draft.milestones.find((m) => m.id === id)?.status === "ACCEPTED")) { project.status = "COMPLETED"; const accepted = draft.applications.find((a) => a.projectId === project.id && a.status === "ACCEPTED"); if (accepted && !draft.portfolios.some((p) => p.projectId === project.id)) draft.portfolios.push({ id: crypto.randomUUID(), projectId: project.id, studentId: accepted.studentId, visible: true }); } audit(draft, user.id, input.decision === "accept" ? "ACCEPT_MILESTONE" : "REQUEST_CHANGES", milestone.id, input.reason); return { ok: true, value: undefined }; }); }
export function advanceEscrow(email: string, milestoneId: string) { return update((draft) => { const user = actor(draft, email); const milestone = draft.milestones.find((m) => m.id === milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !milestone || !project) return fail("NOT_FOUND", "Không tìm thấy milestone."); if (milestone.escrow === "PENDING_FUNDING") { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Chỉ SME sở hữu được xác nhận funding."); milestone.escrow = "FUNDED"; } else if (milestone.escrow === "FUNDED") { if (user.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ Admin được xác nhận release."); milestone.escrow = "RELEASED"; } else return fail("INVALID_TRANSITION", "Quỹ đã hoàn tất."); audit(draft, user.id, "ADVANCE_ESCROW", milestone.id); return { ok: true, value: undefined }; }); }
export function submitReview(input: { email: string; projectId: string; rating: number; comment: string }) { return update((draft) => { const user = actor(draft, input.email); const project = draft.projects.find((p) => p.id === input.projectId); const accepted = draft.applications.find((a) => a.projectId === input.projectId && a.status === "ACCEPTED"); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (project.status !== "COMPLETED" || !accepted) return fail("INVALID_TRANSITION", "Dự án chưa hoàn tất."); if (draft.reviews.some((r) => r.projectId === input.projectId)) return fail("INVALID_TRANSITION", "Đánh giá chỉ được gửi một lần."); const review = { id: crypto.randomUUID(), projectId: project.id, studentId: accepted.studentId, rating: input.rating, comment: input.comment, createdAt: new Date().toISOString() }; draft.reviews.push(review); const portfolio = draft.portfolios.find((p) => p.projectId === project.id); if (portfolio) portfolio.reviewId = review.id; audit(draft, user.id, "SUBMIT_REVIEW", project.id); return { ok: true, value: undefined }; }); }
export function setPortfolioVisibility(email: string, portfolioId: string, visible: boolean) { return update((draft) => { const user = actor(draft, email); const portfolio = draft.portfolios.find((p) => p.id === portfolioId); if (!user || !portfolio || portfolio.studentId !== user.id) return fail("NOT_OWNER", "Bạn không sở hữu portfolio này."); portfolio.visible = visible; return { ok: true, value: undefined }; }); }

if (typeof window !== "undefined") window.addEventListener("storage", (event) => { if (event.key === KEY) { memory = null; listeners.forEach((listener) => listener()); } });
