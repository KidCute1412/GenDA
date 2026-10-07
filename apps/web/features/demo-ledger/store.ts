"use client";

import { PROJECTS, MY_APPLICATIONS, SAMPLE_CV_PATH } from "../../mocks/data";
import { normalizeTaxCode, normalizeWebsite, validateSmeIdentity } from "../../lib/utils/sme-identity";
import type { DemoApplication, DemoAudit, DemoLedger, DemoMilestone, DemoProject, DemoResult, DemoRole, DemoSubmission, DemoUser } from "./types";

const KEY = "genda-demo:ledger:v2";
const NOTICE_KEY = "genda-demo:ledger-reset-notice";
/** Nội dung PDF (data URL) để ngoài ledger cho ledger gọn; reset dữ liệu demo xóa luôn vì cùng tiền tố. */
const CV_FILE_KEY = (userId: string) => `genda-demo:cv-file:${userId}`;
export const CV_MAX_BYTES = 2 * 1024 * 1024;
const listeners = new Set<() => void>();
let memory: DemoLedger | null = null;

const accounts: DemoUser[] = [
  { id: "student-loc", name: "Lê Tuấn Lộc", email: "letuanloc.2203@hcmus.edu.vn", role: "STUDENT", emailVerified: true, cv: { name: "CV_LeTuanLoc.pdf", size: 184_320, uploadedAt: "2026-08-20T09:00:00.000Z" }, studentVerified: true, verificationStatus: "VERIFIED", skills: ["Next.js", "React", "UI/UX"] },
  { id: "student-unverified", name: "Võ Ngọc Diệp", email: "diep@student.vn", role: "STUDENT", emailVerified: true, cv: { name: "CV_VoNgocDiep.pdf", size: 152_576, uploadedAt: "2026-09-02T09:00:00.000Z" }, studentVerified: false, verificationStatus: "UNVERIFIED", skills: ["Figma"] },
  { id: "sme-coffee", name: "The Coffee Lab", email: "contact@coffeelab.vn", role: "SME", emailVerified: true, smeApprovalStatus: "APPROVED" },
  { id: "admin-triet", name: "Đỗ Minh Triết", email: "admin@genda.vn", role: "ADMIN", emailVerified: true }
];

export function createSeedLedger(): DemoLedger {
  const projects: DemoProject[] = PROJECTS.map((project) => ({ id: project.id, ownerId: "sme-coffee", title: project.title, smeName: project.smeName, budget: project.budget, deadline: project.deadline, skills: project.skills, summary: project.summary, problem: project.problem, acceptance: project.acceptance, status: project.status as DemoProject["status"], milestoneIds: project.milestones.map((m) => `${project.id}:${m.id}`), createdAt: "2026-09-01" }));
  const milestones: DemoMilestone[] = PROJECTS.flatMap((project) => project.milestones.map((m) => ({ ...m, id: `${project.id}:${m.id}`, projectId: project.id, status: m.status as DemoMilestone["status"], escrow: m.escrow })));
  const applications: DemoApplication[] = MY_APPLICATIONS.map((a) => ({ id: a.id, projectId: a.projectId, studentId: "student-loc", coverLetter: "Đơn ứng tuyển dữ liệu mẫu", cv: accounts[0].cv, status: a.status, submittedAt: a.submittedAt }));
  return { version: 2, users: accounts, projects, milestones, applications, submissions: [], reviews: [], audits: [], uiState: {} };
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
        // Ledger lưu trước khi bỏ tính năng portfolio vẫn còn khóa này
        delete (parsed as Partial<Record<"portfolios", unknown>>).portfolios;
        // Ledger lưu trước khi có CV: tài khoản dựng sẵn coi như đã nộp CV, chỉ tài khoản mới tạo phải nộp
        parsed.users.forEach((user) => { user.cv ??= accounts.find((seed) => seed.id === user.id)?.cv; });
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

export function registerDemoUser(input: { name: string; email: string; role: Exclude<DemoRole, "ADMIN">; taxCode?: string; companyWebsite?: string }): DemoResult<DemoUser> {
  let created!: DemoUser;
  // Doanh nghiệp phải có mã số thuế, hoặc website công ty nếu chưa có mã số thuế
  const identity = input.role === "SME"
    ? (input.taxCode?.trim() ? { taxCode: normalizeTaxCode(input.taxCode) } : { companyWebsite: normalizeWebsite(input.companyWebsite ?? "") })
    : {};
  if (input.role === "SME") { const problem = validateSmeIdentity(identity); if (problem) return { ok: false, code: "SME_IDENTITY_REQUIRED", message: problem }; }
  const result = update((draft) => { const existing = actor(draft, input.email); if (existing) { created = existing; return { ok: true, value: undefined }; } created = { id: crypto.randomUUID(), name: input.name, email: input.email, role: input.role, ...identity, ...(input.role === "SME" ? { smeApprovalStatus: "PENDING" as const } : {}), emailVerified: false,studentVerified: input.role === "STUDENT" ? false : undefined, verificationStatus: input.role === "STUDENT" ? "UNVERIFIED" : undefined, skills: [] }; draft.users.push(created); if (created.role === "SME") audit(draft, created.id, "SUBMIT_SME_REGISTRATION", created.id); return { ok: true, value: undefined }; });
  return result.ok ? { ok: true, value: created } : result;
}

/**
 * Tài khoản doanh nghiệp mới đăng ký ở trạng thái PENDING, chưa đăng nhập và chưa đăng dự án
 * được cho tới khi quản trị viên duyệt. Tài khoản SME tạo trước khi có quy tắc này (không có
 * smeApprovalStatus) được coi là đã duyệt.
 */
export function isSmeApproved(user: DemoUser | undefined) { return user?.role === "SME" && (user.smeApprovalStatus ?? "APPROVED") === "APPROVED"; }

/** Trạng thái tài khoản theo email, để màn hình đăng nhập chặn doanh nghiệp chưa được duyệt. */
export function findDemoAccount(email: string): DemoUser | undefined { return load().users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()); }

/**
 * Quản trị viên duyệt / từ chối đăng ký doanh nghiệp. Từ chối bắt buộc có lý do.
 * Ở bản demo không gửi email thật: thư báo "đã duyệt" đóng vai trò thư kích hoạt, nên duyệt
 * xong thì email cũng được coi là đã xác minh (doanh nghiệp không phải qua bước kích hoạt riêng).
 */
export function moderateSmeRegistration(email: string, smeId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const admin = actor(draft, email); if (admin?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ quản trị viên được duyệt doanh nghiệp."); const sme = draft.users.find((user) => user.id === smeId && user.role === "SME"); if (!sme || sme.smeApprovalStatus !== "PENDING") return fail("INVALID_TRANSITION", "Hồ sơ doanh nghiệp không ở trạng thái chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); sme.smeApprovalStatus = decision === "approve" ? "APPROVED" : "REJECTED"; sme.smeRejectionReason = decision === "reject" ? reason : undefined; if (decision === "approve") sme.emailVerified = true; audit(draft, admin.id, decision === "approve" ? "APPROVE_SME" : "REJECT_SME", sme.id, reason); return { ok: true, value: undefined }; }); }
/** Sinh viên chưa nộp CV (tài khoản mới tạo) thì chưa được xem danh sách dự án. */
export function needsCv(user: DemoUser | undefined) { return user?.role === "STUDENT" && !user.cv; }

/** Sinh viên nộp hoặc thay CV. Chỉ nhận PDF, tối đa 2 MB (giới hạn của localStorage trong bản demo). */
export function uploadStudentCv(email: string, file: { name: string; type: string; size: number }, dataUrl: string): DemoResult {
  const user = actor(load(), email);
  if (user?.role !== "STUDENT") return fail("WRONG_ROLE", "Chỉ sinh viên được nộp CV.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return fail("INVALID_FILE", "CV phải là tệp PDF.");
  if (file.size > CV_MAX_BYTES) return fail("INVALID_FILE", "CV tối đa 2 MB. Hãy nén hoặc xuất lại PDF nhẹ hơn.");
  try { window.localStorage.setItem(CV_FILE_KEY(user.id), dataUrl); } catch { return fail("STORAGE_WRITE_FAILED", "Trình duyệt không còn chỗ lưu CV. Hãy thử tệp nhẹ hơn."); }
  return update((draft) => { const target = actor(draft, email)!; target.cv = { name: file.name, size: file.size, uploadedAt: new Date().toISOString() }; audit(draft, target.id, "UPLOAD_CV", target.id); return { ok: true, value: undefined }; });
}

/** Đường dẫn mở CV: tệp sinh viên đã tải lên nếu còn trong trình duyệt, nếu không thì CV mẫu. */
export function getCvFileUrl(userId: string): string {
  try {
    const dataUrl = window.localStorage.getItem(CV_FILE_KEY(userId));
    if (dataUrl) {
      // Trình duyệt chặn mở data: URL ở tab mới nên đổi sang blob: URL
      const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(",") + 1)), (char) => char.charCodeAt(0));
      return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    }
  } catch { /* dùng CV mẫu */ }
  return SAMPLE_CV_PATH;
}

export function verifyDemoEmail(email: string) { return update((draft) => { const user = actor(draft, email); if (!user) return fail("NOT_FOUND", "Không tìm thấy tài khoản."); user.emailVerified = true; return { ok: true, value: undefined }; }); }
export function requestStudentVerification(email: string) { return update((draft) => { const user = actor(draft, email); if (user?.role !== "STUDENT") return fail("WRONG_ROLE", "Chỉ sinh viên được gửi minh chứng."); user.verificationStatus = "PENDING"; user.verificationReason = undefined; audit(draft, user.id, "SUBMIT_VERIFICATION", user.id); return { ok: true, value: undefined }; }); }
export function moderateStudentVerification(email: string, studentId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const admin = actor(draft, email); if (admin?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ Admin được duyệt minh chứng."); const student = draft.users.find((user) => user.id === studentId && user.role === "STUDENT"); if (!student || student.verificationStatus !== "PENDING") return fail("INVALID_TRANSITION", "Minh chứng không chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); student.studentVerified = decision === "approve"; student.verificationStatus = decision === "approve" ? "VERIFIED" : "REJECTED"; student.verificationReason = reason; audit(draft, admin.id, decision === "approve" ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION", student.id, reason); return { ok: true, value: undefined }; }); }

export function createProject(input: Omit<DemoProject, "id" | "ownerId" | "status" | "milestoneIds" | "createdAt"> & { ownerEmail: string; milestones: Array<Omit<DemoMilestone, "id" | "projectId" | "status" | "escrow">> }): DemoResult<string> {
  let id = "";
  const result = update((draft) => { const user = actor(draft, input.ownerEmail); if (!user) return fail("AUTH_REQUIRED", "Cần đăng nhập."); if (user.role !== "SME") return fail("WRONG_ROLE", "Chỉ doanh nghiệp được đăng dự án."); if (!isSmeApproved(user)) return fail("SME_NOT_APPROVED", "Tài khoản doanh nghiệp chưa được quản trị viên duyệt.");if (!user.emailVerified) return fail("EMAIL_NOT_VERIFIED", "Cần xác minh email."); if (input.milestones.reduce((s, m) => s + m.budget, 0) !== input.budget) return fail("MILESTONE_BUDGET_MISMATCH", "Tổng ngân sách milestone phải bằng ngân sách dự án."); id = `p-${crypto.randomUUID()}`; const milestoneIds = input.milestones.map(() => crypto.randomUUID()); const created: DemoMilestone[] = input.milestones.map((m, i) => ({ ...m, id: milestoneIds[i], projectId: id, status: "PENDING", escrow: "PENDING_FUNDING" })); draft.milestones.push(...created); draft.projects.push({ ...input, id, ownerId: user.id, status: "PENDING_REVIEW", milestoneIds, createdAt: new Date().toISOString() }); audit(draft, user.id, "SUBMIT_PROJECT", id); return { ok: true, value: undefined }; });
  return result.ok ? { ok: true, value: id } : result;
}
export function moderateProject(email: string, projectId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const user = actor(draft, email); if (user?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ quản trị viên được duyệt dự án."); const project = draft.projects.find((p) => p.id === projectId); if (!project) return fail("NOT_FOUND", "Không tìm thấy dự án."); if (project.status !== "PENDING_REVIEW") return fail("INVALID_TRANSITION", "Dự án không ở trạng thái chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); project.status = decision === "approve" ? "PUBLISHED" : "DRAFT"; project.rejectionReason = reason; audit(draft, user.id, decision === "approve" ? "APPROVE_PROJECT" : "REJECT_PROJECT", projectId, reason); return { ok: true, value: undefined }; }); }
export function applyToProject(input: { email: string; projectId: string; coverLetter: string }): DemoResult<string> { let id = ""; const result = update((draft) => { const user = actor(draft, input.email); if (user?.role !== "STUDENT") return fail("WRONG_ROLE", "Chỉ sinh viên được ứng tuyển."); if (!user.studentVerified) return fail("STUDENT_NOT_VERIFIED", "Hồ sơ sinh viên chưa được xác minh."); if (!user.cv) return fail("CV_REQUIRED", "Bạn cần nộp CV (PDF) trước khi ứng tuyển."); const project = draft.projects.find((p) => p.id === input.projectId); if (project?.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không còn nhận ứng tuyển."); if (draft.applications.some((a) => a.projectId === input.projectId && a.studentId === user.id && !["REJECTED", "WITHDRAWN"].includes(a.status))) return fail("DUPLICATE_APPLICATION", "Bạn đã ứng tuyển dự án này."); id = `a-${crypto.randomUUID()}`; draft.applications.push({ id, projectId: input.projectId, studentId: user.id, coverLetter: input.coverLetter, cv: user.cv, status: "SUBMITTED", submittedAt: new Date().toISOString() }); audit(draft, user.id, "SUBMIT_APPLICATION", id); return { ok: true, value: undefined }; }); return result.ok ? { ok: true, value: id } : result; }
export function setApplicationStatus(email: string, applicationId: string, status: "SHORTLISTED" | "WITHDRAWN" | "ACCEPTED") { return update((draft) => { const user = actor(draft, email); const application = draft.applications.find((a) => a.id === applicationId); const project = draft.projects.find((p) => p.id === application?.projectId); if (!user || !application || !project) return fail("NOT_FOUND", "Không tìm thấy đơn ứng tuyển."); if (status === "WITHDRAWN") { if (user.id !== application.studentId) return fail("NOT_OWNER", "Bạn không sở hữu đơn này."); if (!['SUBMITTED','SHORTLISTED'].includes(application.status)) return fail("INVALID_TRANSITION", "Không thể rút đơn này."); application.status = status; } else { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (status === "ACCEPTED") { if (project.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không thể nhận ứng viên."); draft.applications.filter((a) => a.projectId === project.id).forEach((a) => { a.status = a.id === application.id ? "ACCEPTED" : "REJECTED"; }); project.status = "IN_PROGRESS"; } else application.status = status; } audit(draft, user.id, status, applicationId); return { ok: true, value: undefined }; }); }
export function submitDeliverable(input: { email: string; milestoneId: string; link?: string; note: string; files: DemoSubmission["files"] }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); const accepted = draft.applications.find((a) => a.projectId === project?.id && a.status === "ACCEPTED"); if (!user || user.role !== "STUDENT" || accepted?.studentId !== user.id) return fail("NOT_ASSIGNED", "Bạn chưa được phân công dự án này."); if (!milestone || !["PENDING", "CHANGES_REQUESTED"].includes(milestone.status)) return fail("INVALID_TRANSITION", "Milestone không nhận bàn giao."); draft.submissions.push({ id: crypto.randomUUID(), milestoneId: milestone.id, studentId: user.id, link: input.link, note: input.note, files: input.files, submittedAt: new Date().toISOString() }); milestone.status = "SUBMITTED"; audit(draft, user.id, "SUBMIT_DELIVERABLE", milestone.id); return { ok: true, value: undefined }; }); }
export function reviewMilestone(input: { email: string; milestoneId: string; decision: "accept" | "changes"; reason?: string }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (!milestone || milestone.status !== "SUBMITTED") return fail("INVALID_TRANSITION", "Milestone chưa có bàn giao."); if (input.decision === "changes" && !input.reason?.trim()) return fail("REASON_REQUIRED", "Yêu cầu chỉnh sửa phải có lý do."); milestone.status = input.decision === "accept" ? "ACCEPTED" : "CHANGES_REQUESTED"; const latest = [...draft.submissions].reverse().find((s) => s.milestoneId === milestone.id); if (latest && input.reason) latest.feedback = input.reason; if (project.milestoneIds.every((id) => draft.milestones.find((m) => m.id === id)?.status === "ACCEPTED")) { project.status = "COMPLETED"; } audit(draft, user.id, input.decision === "accept" ? "ACCEPT_MILESTONE" : "REQUEST_CHANGES", milestone.id, input.reason); return { ok: true, value: undefined }; }); }
export function advanceEscrow(email: string, milestoneId: string) { return update((draft) => { const user = actor(draft, email); const milestone = draft.milestones.find((m) => m.id === milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !milestone || !project) return fail("NOT_FOUND", "Không tìm thấy milestone."); if (milestone.escrow === "PENDING_FUNDING") { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Chỉ SME sở hữu được xác nhận funding."); milestone.escrow = "FUNDED"; } else if (milestone.escrow === "FUNDED") { if (user.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ Admin được xác nhận release."); milestone.escrow = "RELEASED"; } else return fail("INVALID_TRANSITION", "Quỹ đã hoàn tất."); audit(draft, user.id, "ADVANCE_ESCROW", milestone.id); return { ok: true, value: undefined }; }); }
export function submitReview(input: { email: string; projectId: string; rating: number; comment: string }) { return update((draft) => { const user = actor(draft, input.email); const project = draft.projects.find((p) => p.id === input.projectId); const accepted = draft.applications.find((a) => a.projectId === input.projectId && a.status === "ACCEPTED"); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (project.status !== "COMPLETED" || !accepted) return fail("INVALID_TRANSITION", "Dự án chưa hoàn tất."); if (draft.reviews.some((r) => r.projectId === input.projectId)) return fail("INVALID_TRANSITION", "Đánh giá chỉ được gửi một lần."); const review = { id: crypto.randomUUID(), projectId: project.id, studentId: accepted.studentId, rating: input.rating, comment: input.comment, createdAt: new Date().toISOString() }; draft.reviews.push(review); audit(draft, user.id, "SUBMIT_REVIEW", project.id); return { ok: true, value: undefined }; }); }

if (typeof window !== "undefined") window.addEventListener("storage", (event) => { if (event.key === KEY) { memory = null; listeners.forEach((listener) => listener()); } });

/**
 * Kịch bản demo cho trợ lý Gen (features/assistant): dựng nhanh những tình huống ngoài đời
 * phải chờ nhiều ngày mới có. Chỉ dành cho bản demo, backend không có tương đương.
 * - `rejections`: thêm 3 đơn bị từ chối, lệch kỹ năng và dùng lại cùng một thư ngỏ.
 * - `away-news`: một dự án mới khớp kỹ năng và một đơn vừa vào danh sách rút gọn (đi kèm giả lập vắng mặt).
 * - `changes`: mốc đang làm bị yêu cầu sửa, còn 2 ngày tới hạn.
 */
export type AssistantScenario = "rejections" | "away-news" | "changes";
export function seedAssistantScenario(email: string, scenario: AssistantScenario): DemoResult {
  return update((draft) => {
    const student = actor(draft, email);
    if (student?.role !== "STUDENT") return fail("WRONG_ROLE", "Kịch bản này dành cho tài khoản sinh viên.");
    const now = Date.now();
    const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();
    const dateIn = (days: number) => new Date(now + days * 86_400_000).toISOString().slice(0, 10);
    const addProject = (input: Pick<DemoProject, "title" | "smeName" | "budget" | "skills" | "summary" | "status">, createdDaysAgo: number) => {
      const id = `p-demo-${crypto.randomUUID().slice(0, 8)}`;
      const half = Math.round(input.budget / 2);
      const milestones: DemoMilestone[] = [
        { id: `${id}:m1`, projectId: id, order: 1, title: "Bản nháp đầu tiên", budget: half, deadline: dateIn(10), criteria: "Doanh nghiệp duyệt hướng làm", status: "PENDING", escrow: "PENDING_FUNDING" },
        { id: `${id}:m2`, projectId: id, order: 2, title: "Bàn giao hoàn chỉnh", budget: input.budget - half, deadline: dateIn(24), criteria: "Đạt toàn bộ tiêu chí nghiệm thu", status: "PENDING", escrow: "PENDING_FUNDING" }
      ];
      draft.milestones.push(...milestones);
      draft.projects.push({ ...input, id, ownerId: "sme-coffee", deadline: dateIn(24), problem: input.summary, acceptance: ["Đạt toàn bộ tiêu chí nghiệm thu"], milestoneIds: milestones.map((m) => m.id), createdAt: daysAgo(createdDaysAgo) });
      return id;
    };

    if (scenario === "rejections") {
      const letter = "Em rất muốn tham gia dự án này. Em là người chăm chỉ, ham học hỏi và luôn hoàn thành công việc đúng hạn.";
      const closed: Array<[Pick<DemoProject, "title" | "smeName" | "budget" | "skills" | "summary" | "status">, number]> = [
        [{ title: "Thiết kế menu và standee mùa Giáng sinh", smeName: "Tiệm bánh Mây", budget: 2_000_000, skills: ["Figma", "Thiết kế đồ họa"], summary: "Bộ menu và standee cho mùa lễ cuối năm.", status: "IN_PROGRESS" }, 12],
        [{ title: "Chạy quảng cáo Meta cho đợt khai trương", smeName: "Spa Hoa Cúc", budget: 3_500_000, skills: ["Quảng cáo Meta", "Content Marketing", "Figma"], summary: "Lên nội dung và chạy quảng cáo hai tuần khai trương.", status: "IN_PROGRESS" }, 8],
        [{ title: "Làm lại giao diện trang đặt lịch khám", smeName: "Phòng khám thú y An Bình", budget: 4_000_000, skills: ["Figma", "UI/UX", "React"], summary: "Đơn giản hóa luồng đặt lịch khám trên điện thoại.", status: "IN_PROGRESS" }, 4]
      ];
      closed.forEach(([project, days]) => {
        const projectId = addProject(project, days + 3);
        draft.applications.push({ id: `a-demo-${crypto.randomUUID().slice(0, 8)}`, projectId, studentId: student.id, coverLetter: letter, cv: student.cv, status: "REJECTED", submittedAt: daysAgo(days) });
      });
    } else if (scenario === "away-news") {
      addProject({ title: "Landing page đặt bàn cho quán bún bò", smeName: "Bún bò Cô Ba", budget: 3_000_000, skills: ["Next.js", "React", "UI/UX"], summary: "Trang giới thiệu thực đơn và nhận đặt bàn trước qua điện thoại.", status: "PUBLISHED" }, 2);
      const pending = draft.applications.find((a) => a.studentId === student.id && a.status === "SUBMITTED");
      const project = draft.projects.find((p) => p.id === pending?.projectId);
      if (pending && project) {
        pending.status = "SHORTLISTED";
        draft.audits.unshift({ id: crypto.randomUUID(), at: daysAgo(3), actorId: project.ownerId, action: "SHORTLISTED", targetId: pending.id });
      }
    } else {
      const assigned = draft.applications.find((a) => a.studentId === student.id && a.status === "ACCEPTED");
      const project = draft.projects.find((p) => p.id === assigned?.projectId && p.status === "IN_PROGRESS");
      const milestone = project && project.milestoneIds.map((id) => draft.milestones.find((m) => m.id === id)).find((m) => m && m.status !== "ACCEPTED");
      if (!project || !milestone) return fail("NOT_FOUND", "Không có mốc nào đang làm để giả lập.");
      milestone.status = "CHANGES_REQUESTED";
      milestone.deadline = dateIn(2);
      draft.submissions.push({ id: crypto.randomUUID(), milestoneId: milestone.id, studentId: student.id, link: "https://example.com/ban-chay-thu", note: "Em gửi bản chạy thử.", files: [], submittedAt: daysAgo(2), feedback: "Cỡ chữ phần mô tả trên điện thoại còn nhỏ, nút đặt hàng bị che bởi thanh điều hướng. Nhờ em chỉnh lại giúp." });
      draft.audits.unshift({ id: crypto.randomUUID(), at: daysAgo(1), actorId: project.ownerId, action: "REQUEST_CHANGES", targetId: milestone.id, reason: "Cỡ chữ và vị trí nút đặt hàng" });
    }
    return { ok: true, value: undefined };
  });
}
