"use client";

import { PROJECTS, MY_APPLICATIONS, SAMPLE_CV_PATH } from "../../mocks/data";
import { normalizeTaxCode, normalizeWebsite, validateSmeIdentity } from "../../lib/utils/sme-identity";
import { createSeedOpportunities } from "../opportunities/seed";
import { KIND_META, activeRegistration, isOver, slotsLeft, toIsoDate, validateOpportunity, type OpportunityDraft } from "../opportunities/model";
import type { DemoApplication, DemoAudit, DemoCv, DemoLedger, DemoMilestone, DemoProject, DemoResult, DemoRole, DemoSubmission, DemoUser, RegistrationStatus } from "./types";

const KEY = "genda-demo:ledger:v2";
const NOTICE_KEY = "genda-demo:ledger-reset-notice";
/** Nội dung PDF (data URL) để ngoài ledger cho ledger gọn; reset dữ liệu demo xóa luôn vì cùng tiền tố. */
const CV_FILE_KEY = (userId: string) => `genda-demo:cv-file:${userId}`;
export const CV_MAX_BYTES = 2 * 1024 * 1024;
const listeners = new Set<() => void>();
let memory: DemoLedger | null = null;

const accounts: DemoUser[] = [
  { id: "student-loc", name: "Lê Tuấn Lộc", email: "letuanloc.2203@hcmus.edu.vn", role: "CONTRIBUTOR", accountState: "ACTIVE", emailVerified: true, cv: { name: "CV_LeTuanLoc.pdf", size: 184_320, uploadedAt: "2026-08-20T09:00:00.000Z" }, skills: ["Next.js", "React", "UI/UX"] },
  { id: "student-unverified", name: "Võ Ngọc Diệp", email: "diep@student.vn", role: "CONTRIBUTOR", accountState: "ACTIVE", emailVerified: true, cv: { name: "CV_VoNgocDiep.pdf", size: 152_576, uploadedAt: "2026-09-02T09:00:00.000Z" }, skills: ["Figma"] },
  { id: "sme-coffee", name: "The Coffee Lab", email: "contact@coffeelab.vn", role: "SME", accountState: "ACTIVE", emailVerified: true, smeApprovalStatus: "APPROVED" },
  { id: "admin-triet", name: "Đỗ Minh Triết", email: "admin@genda.vn", role: "ADMIN", accountState: "ACTIVE", emailVerified: true }
];

export function createSeedLedger(): DemoLedger {
  const projects: DemoProject[] = PROJECTS.map((project) => ({ id: project.id, ownerId: "sme-coffee", title: project.title, smeName: project.smeName, budget: project.budget, deadline: project.deadline, skills: project.skills, summary: project.summary, problem: project.problem, acceptance: project.acceptance, status: project.status as DemoProject["status"], milestoneIds: project.milestones.map((m) => `${project.id}:${m.id}`), createdAt: "2026-09-01" }));
  const milestones: DemoMilestone[] = PROJECTS.flatMap((project) => project.milestones.map((m) => ({ ...m, id: `${project.id}:${m.id}`, projectId: project.id, status: m.status as DemoMilestone["status"], escrow: m.escrow })));
  const applications: DemoApplication[] = MY_APPLICATIONS.map((a) => ({ id: a.id, projectId: a.projectId, studentId: "student-loc", coverLetter: "Đơn ứng tuyển dữ liệu mẫu", cv: accounts[0].cv, status: a.status, submittedAt: a.submittedAt }));
  const { opportunities, registrations } = createSeedOpportunities(toIsoDate(new Date()));
  return { version: 2, users: accounts, projects, milestones, applications, submissions: [], reviews: [], opportunities, registrations, audits: [], uiState: {} };
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
        parsed.users.forEach((user) => {
          user.cv ??= accounts.find((seed) => seed.id === user.id)?.cv;
          user.accountState ??= user.emailVerified
            ? user.role === "SME" && user.smeApprovalStatus !== "APPROVED" ? "EMAIL_VERIFIED" : "ACTIVE"
            : "PENDING_EMAIL_VERIFICATION";
          delete (user as DemoUser & Record<string, unknown>).studentVerified;
          delete (user as DemoUser & Record<string, unknown>).verificationStatus;
          delete (user as DemoUser & Record<string, unknown>).verificationReason;
        });
        // Ledger lưu trước khi có cơ hội ngắn: thêm dữ liệu mẫu, giữ nguyên mọi thứ khác
        if (!parsed.opportunities || !parsed.registrations) Object.assign(parsed, createSeedOpportunities(toIsoDate(new Date())));
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
  const result = update((draft) => { const existing = actor(draft, input.email); if (existing) { created = existing; return { ok: true, value: undefined }; } created = { id: crypto.randomUUID(), name: input.name, email: input.email, role: input.role, accountState: "PENDING_EMAIL_VERIFICATION", ...identity, ...(input.role === "SME" ? { smeApprovalStatus: "PENDING" as const } : {}), emailVerified: false, skills: [] }; draft.users.push(created); if (created.role === "SME") audit(draft, created.id, "SUBMIT_SME_REGISTRATION", created.id); return { ok: true, value: undefined }; });
  return result.ok ? { ok: true, value: created } : result;
}

/**
 * Tài khoản doanh nghiệp mới đăng ký phải xác minh email và được quản trị viên duyệt trước khi
 * đăng nhập hoặc tạo dự án. Tài khoản SME tạo trước khi có quy tắc này (không có
 * smeApprovalStatus) được coi là đã duyệt về mặt doanh nghiệp.
 */
export function isSmeApproved(user: DemoUser | undefined) { return user?.role === "SME" && (user.smeApprovalStatus ?? "APPROVED") === "APPROVED"; }

/** Trạng thái tài khoản theo email, để màn hình đăng nhập chặn doanh nghiệp chưa được duyệt. */
export function findDemoAccount(email: string): DemoUser | undefined { return load().users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()); }

/**
 * Quản trị viên duyệt / từ chối đăng ký doanh nghiệp. Từ chối bắt buộc có lý do.
 * Duyệt doanh nghiệp không thay thế bước xác minh email.
 */
export function moderateSmeRegistration(email: string, smeId: string, decision: "approve" | "reject", reason?: string) { return update((draft) => { const admin = actor(draft, email); if (admin?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ quản trị viên được duyệt doanh nghiệp."); const sme = draft.users.find((user) => user.id === smeId && user.role === "SME"); if (!sme || sme.smeApprovalStatus !== "PENDING") return fail("INVALID_TRANSITION", "Hồ sơ doanh nghiệp không ở trạng thái chờ duyệt."); if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do."); sme.smeApprovalStatus = decision === "approve" ? "APPROVED" : "REJECTED"; sme.smeRejectionReason = decision === "reject" ? reason : undefined; if (decision === "approve" && sme.emailVerified) sme.accountState = "ACTIVE"; audit(draft, admin.id, decision === "approve" ? "APPROVE_SME" : "REJECT_SME", sme.id, reason); return { ok: true, value: undefined }; }); }
/**
 * Contributor do backend sở hữu (hồ sơ, CV và hạng đều ở API thật). Ledger chỉ giữ BẢN SAO tối thiểu để luồng
 * ứng tuyển demo nhận ra tài khoản và doanh nghiệp xem được CV, cho tới khi module applications có API. CV
 * chỉ được sao sau khi backend đã kiểm tra kỹ thuật và chuyển READY.
 */
export function mirrorContributor(input: { email: string; name: string; cv?: { name: string; size: number; uploadedAt: string; dataUrl: string } }): DemoResult {
  if (input.cv) {
    const id = actor(load(), input.email)?.id ?? crypto.randomUUID();
    try { window.localStorage.setItem(CV_FILE_KEY(id), input.cv.dataUrl); } catch { return fail("STORAGE_WRITE_FAILED", "Trình duyệt không còn chỗ lưu bản sao CV cho bản demo."); }
    return upsertContributor(input.email, input.name, id, { name: input.cv.name, size: input.cv.size, uploadedAt: input.cv.uploadedAt });
  }
  return upsertContributor(input.email, input.name, crypto.randomUUID());
}

function upsertContributor(email: string, name: string, newId: string, cv?: DemoCv): DemoResult {
  return update((draft) => {
    let user = actor(draft, email);
    if (user && user.role !== "CONTRIBUTOR") return fail("WRONG_ROLE", "Tài khoản này không phải contributor.");
    if (!user) { user = { id: newId, name, email, role: "CONTRIBUTOR", accountState: "ACTIVE", emailVerified: true, skills: [] }; draft.users.push(user); }
    user.name = name;
    user.accountState = "ACTIVE";
    user.emailVerified = true;
    if (cv) user.cv = cv;
    return { ok: true, value: undefined };
  });
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

export function verifyDemoEmail(email: string) { return update((draft) => { const user = actor(draft, email); if (!user) return fail("NOT_FOUND", "Không tìm thấy tài khoản."); user.emailVerified = true; user.accountState = user.role === "SME" && user.smeApprovalStatus !== "APPROVED" ? "EMAIL_VERIFIED" : "ACTIVE"; return { ok: true, value: undefined }; }); }

/**
 * Dự án do backend sở hữu: SME tạo, gửi duyệt và admin xuất bản qua API thật. Ledger chỉ nhận BẢN SAO của
 * một dự án đã PUBLISHED, để các bước demo phía sau (ứng tuyển, chọn người, workspace) vẫn chạy được cho tới
 * khi module applications có API. Gọi lại với cùng id thì không làm gì.
 */
export type PublishedProjectSnapshot = {
  id: string;
  title: string;
  smeName: string;
  smeContact: string;
  budget: number;
  deadline: string;
  summary: string;
  problem: string;
  skills: string[];
  acceptance: string[];
  milestones: Array<{ order: number; title: string; budget: number; deadline: string; criteria: string }>;
};

export function mirrorPublishedProject(snapshot: PublishedProjectSnapshot): DemoResult {
  if (load().projects.some((project) => project.id === snapshot.id)) return { ok: true, value: undefined };
  return update((draft) => {
    const owner = draft.users.find((user) => user.role === "SME" && user.email.toLowerCase() === snapshot.smeContact.toLowerCase());
    const milestoneIds = snapshot.milestones.map((milestone) => `${snapshot.id}:m${milestone.order}`);
    draft.milestones.push(...snapshot.milestones.map((milestone, index): DemoMilestone => ({ ...milestone, id: milestoneIds[index], projectId: snapshot.id, status: "PENDING", escrow: "PENDING_FUNDING" })));
    const { id, title, smeName, budget, deadline, summary, problem, skills, acceptance } = snapshot;
    draft.projects.push({ id, title, smeName, budget, deadline, summary, problem, skills, acceptance, ownerId: owner?.id ?? `sme:${snapshot.smeContact}`, status: "PUBLISHED", milestoneIds, createdAt: new Date().toISOString() });
    return { ok: true, value: undefined };
  });
}
/**
 * SME đã chấp nhận ứng viên qua API thật. Workspace (mốc, bàn giao, nghiệm thu) vẫn là demo, nên ledger nhận bản
 * sao dự án đã bắt đầu: SME là chủ, contributor được nhận, đơn ACCEPTED. Gọi lại với cùng đơn thì không làm gì.
 */
export function mirrorAcceptedApplication(input: {
  project: PublishedProjectSnapshot;
  sme: { email: string; name: string };
  contributor: { email: string; name: string };
  application: { id: string; coverLetter: string; submittedAt: string };
}): DemoResult {
  if (load().applications.some((application) => application.id === input.application.id)) return { ok: true, value: undefined };
  const mirrored = mirrorPublishedProject(input.project);
  if (!mirrored.ok) return mirrored;
  const contributor = mirrorContributor(input.contributor);
  if (!contributor.ok) return contributor;
  return update((draft) => {
    let sme = actor(draft, input.sme.email);
    if (!sme) { sme = { id: crypto.randomUUID(), name: input.sme.name, email: input.sme.email, role: "SME", accountState: "ACTIVE", emailVerified: true, smeApprovalStatus: "APPROVED" }; draft.users.push(sme); }
    const project = draft.projects.find((item) => item.id === input.project.id);
    const student = actor(draft, input.contributor.email);
    if (!project || !student) return fail("NOT_FOUND", "Không sao được dự án vào bản demo.");
    project.ownerId = sme.id;
    project.status = "IN_PROGRESS";
    draft.applications.filter((application) => application.projectId === project.id).forEach((application) => { application.status = "REJECTED"; });
    draft.applications.push({ id: input.application.id, projectId: project.id, studentId: student.id, coverLetter: input.application.coverLetter, cv: student.cv, status: "ACCEPTED", submittedAt: input.application.submittedAt });
    audit(draft, sme.id, "ACCEPTED", input.application.id);
    return { ok: true, value: undefined };
  });
}

export function applyToProject(input: { email: string; projectId: string; coverLetter: string }): DemoResult<string> { let id = ""; const result = update((draft) => { const user = actor(draft, input.email); if (user?.role !== "CONTRIBUTOR") return fail("WRONG_ROLE", "Chỉ contributor được ứng tuyển."); if (!user.emailVerified || user.accountState !== "ACTIVE") return fail("EMAIL_NOT_VERIFIED", "Bạn cần xác minh email trước khi ứng tuyển."); if (!user.cv) return fail("CV_REQUIRED", "Bạn cần nộp CV (PDF) trước khi ứng tuyển."); const project = draft.projects.find((p) => p.id === input.projectId); if (project?.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không còn nhận ứng tuyển."); if (draft.applications.some((a) => a.projectId === input.projectId && a.studentId === user.id && !["REJECTED", "WITHDRAWN"].includes(a.status))) return fail("DUPLICATE_APPLICATION", "Bạn đã ứng tuyển dự án này."); id = `a-${crypto.randomUUID()}`; draft.applications.push({ id, projectId: input.projectId, studentId: user.id, coverLetter: input.coverLetter, cv: user.cv, status: "SUBMITTED", submittedAt: new Date().toISOString() }); audit(draft, user.id, "SUBMIT_APPLICATION", id); return { ok: true, value: undefined }; }); return result.ok ? { ok: true, value: id } : result; }
export function setApplicationStatus(email: string, applicationId: string, status: "SHORTLISTED" | "WITHDRAWN" | "ACCEPTED") { return update((draft) => { const user = actor(draft, email); const application = draft.applications.find((a) => a.id === applicationId); const project = draft.projects.find((p) => p.id === application?.projectId); if (!user || !application || !project) return fail("NOT_FOUND", "Không tìm thấy đơn ứng tuyển."); if (status === "WITHDRAWN") { if (user.id !== application.studentId) return fail("NOT_OWNER", "Bạn không sở hữu đơn này."); if (!['SUBMITTED','SHORTLISTED'].includes(application.status)) return fail("INVALID_TRANSITION", "Không thể rút đơn này."); application.status = status; } else { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (status === "ACCEPTED") { if (project.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Dự án không thể nhận ứng viên."); draft.applications.filter((a) => a.projectId === project.id).forEach((a) => { a.status = a.id === application.id ? "ACCEPTED" : "REJECTED"; }); project.status = "IN_PROGRESS"; } else application.status = status; } audit(draft, user.id, status, applicationId); return { ok: true, value: undefined }; }); }
export function submitDeliverable(input: { email: string; milestoneId: string; link?: string; note: string; files: DemoSubmission["files"] }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); const accepted = draft.applications.find((a) => a.projectId === project?.id && a.status === "ACCEPTED"); if (!user || user.role !== "CONTRIBUTOR" || accepted?.studentId !== user.id) return fail("NOT_ASSIGNED", "Bạn chưa được phân công dự án này."); if (!milestone || !["PENDING", "CHANGES_REQUESTED"].includes(milestone.status)) return fail("INVALID_TRANSITION", "Milestone không nhận bàn giao."); draft.submissions.push({ id: crypto.randomUUID(), milestoneId: milestone.id, studentId: user.id, link: input.link, note: input.note, files: input.files, submittedAt: new Date().toISOString() }); milestone.status = "SUBMITTED"; audit(draft, user.id, "SUBMIT_DELIVERABLE", milestone.id); return { ok: true, value: undefined }; }); }
export function reviewMilestone(input: { email: string; milestoneId: string; decision: "accept" | "changes"; reason?: string }) { return update((draft) => { const user = actor(draft, input.email); const milestone = draft.milestones.find((m) => m.id === input.milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (!milestone || milestone.status !== "SUBMITTED") return fail("INVALID_TRANSITION", "Milestone chưa có bàn giao."); if (input.decision === "changes" && !input.reason?.trim()) return fail("REASON_REQUIRED", "Yêu cầu chỉnh sửa phải có lý do."); milestone.status = input.decision === "accept" ? "ACCEPTED" : "CHANGES_REQUESTED"; const latest = [...draft.submissions].reverse().find((s) => s.milestoneId === milestone.id); if (latest && input.reason) latest.feedback = input.reason; if (project.milestoneIds.every((id) => draft.milestones.find((m) => m.id === id)?.status === "ACCEPTED")) { project.status = "COMPLETED"; } audit(draft, user.id, input.decision === "accept" ? "ACCEPT_MILESTONE" : "REQUEST_CHANGES", milestone.id, input.reason); return { ok: true, value: undefined }; }); }
export function advanceEscrow(email: string, milestoneId: string) { return update((draft) => { const user = actor(draft, email); const milestone = draft.milestones.find((m) => m.id === milestoneId); const project = draft.projects.find((p) => p.id === milestone?.projectId); if (!user || !milestone || !project) return fail("NOT_FOUND", "Không tìm thấy milestone."); if (milestone.escrow === "PENDING_FUNDING") { if (user.role !== "SME" || user.id !== project.ownerId) return fail("NOT_OWNER", "Chỉ SME sở hữu được xác nhận funding."); milestone.escrow = "FUNDED"; } else if (milestone.escrow === "FUNDED") { if (user.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ Admin được xác nhận release."); milestone.escrow = "RELEASED"; } else return fail("INVALID_TRANSITION", "Quỹ đã hoàn tất."); audit(draft, user.id, "ADVANCE_ESCROW", milestone.id); return { ok: true, value: undefined }; }); }
export function submitReview(input: { email: string; projectId: string; rating: number; comment: string }) { return update((draft) => { const user = actor(draft, input.email); const project = draft.projects.find((p) => p.id === input.projectId); const accepted = draft.applications.find((a) => a.projectId === input.projectId && a.status === "ACCEPTED"); if (!user || !project || user.id !== project.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu dự án này."); if (project.status !== "COMPLETED" || !accepted) return fail("INVALID_TRANSITION", "Dự án chưa hoàn tất."); if (draft.reviews.some((r) => r.projectId === input.projectId)) return fail("INVALID_TRANSITION", "Đánh giá chỉ được gửi một lần."); const review = { id: crypto.randomUUID(), projectId: project.id, studentId: accepted.studentId, rating: input.rating, comment: input.comment, createdAt: new Date().toISOString() }; draft.reviews.push(review); audit(draft, user.id, "SUBMIT_REVIEW", project.id); return { ok: true, value: undefined }; }); }

/* ==========================================================================
   CƠ HỘI NGẮN: cộng tác viên và sự kiện/workshop (docs/opportunities.md)
   ========================================================================== */

const today = () => toIsoDate(new Date());

/** Đơn vị đã duyệt đăng tin; tin vào hàng đợi duyệt của quản trị viên như dự án (FR-OPP-01, FR-OPP-04). */
export function createOpportunity(input: OpportunityDraft & { ownerEmail: string }): DemoResult<string> {
  let id = "";
  const { ownerEmail, noFeeCommitment, ...draft } = input;
  const result = update((ledger) => {
    const user = actor(ledger, ownerEmail);
    if (!user) return fail("AUTH_REQUIRED", "Cần đăng nhập.");
    if (user.role !== "SME") return fail("WRONG_ROLE", "Chỉ doanh nghiệp được đăng tin.");
    if (!isSmeApproved(user)) return fail("SME_NOT_APPROVED", "Tài khoản doanh nghiệp chưa được quản trị viên duyệt.");
    if (!user.emailVerified) return fail("EMAIL_NOT_VERIFIED", "Cần xác minh email.");
    const problem = validateOpportunity({ ...draft, noFeeCommitment }, today());
    if (problem) return fail("INVALID_INPUT", problem);
    id = `o-${crypto.randomUUID()}`;
    ledger.opportunities.push({
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      details: draft.details.trim(),
      location: draft.location.trim(),
      requirements: draft.requirements.map((item) => item.trim()).filter(Boolean),
      id,
      ownerId: user.id,
      orgName: user.name,
      payUnit: KIND_META[draft.kind].payUnit,
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString()
    });
    audit(ledger, user.id, "SUBMIT_OPPORTUNITY", id);
    return { ok: true, value: undefined };
  });
  return result.ok ? { ok: true, value: id } : result;
}

export function moderateOpportunity(email: string, opportunityId: string, decision: "approve" | "reject", reason?: string): DemoResult {
  return update((ledger) => {
    const admin = actor(ledger, email);
    if (admin?.role !== "ADMIN") return fail("WRONG_ROLE", "Chỉ quản trị viên được duyệt tin.");
    const opportunity = ledger.opportunities.find((item) => item.id === opportunityId);
    if (!opportunity) return fail("NOT_FOUND", "Không tìm thấy tin.");
    if (opportunity.status !== "PENDING_REVIEW") return fail("INVALID_TRANSITION", "Tin không ở trạng thái chờ duyệt.");
    if (decision === "reject" && !reason?.trim()) return fail("REASON_REQUIRED", "Từ chối phải có lý do.");
    opportunity.status = decision === "approve" ? "PUBLISHED" : "REJECTED";
    opportunity.rejectionReason = decision === "reject" ? reason?.trim() : undefined;
    audit(ledger, admin.id, decision === "approve" ? "APPROVE_OPPORTUNITY" : "REJECT_OPPORTUNITY", opportunityId, reason);
    return { ok: true, value: undefined };
  });
}

/**
 * Đăng ký nhanh, không thư ngỏ, không CV (FR-OPP-05). Sự kiện giữ chỗ ngay; cộng tác viên chờ đơn vị
 * đăng tin chọn. Hết chỗ, hết buổi hoặc đã đăng ký thì chặn.
 */
export function registerForOpportunity(email: string, opportunityId: string): DemoResult<RegistrationStatus> {
  let status: RegistrationStatus = "PENDING";
  const result = update((ledger) => {
    const user = actor(ledger, email);
    if (!user) return fail("AUTH_REQUIRED", "Cần đăng nhập để đăng ký.");
    if (user.role !== "CONTRIBUTOR") return fail("WRONG_ROLE", "Chỉ tài khoản cá nhân được đăng ký.");
    if (!user.emailVerified) return fail("EMAIL_NOT_VERIFIED", "Cần xác minh email trước khi đăng ký.");
    const opportunity = ledger.opportunities.find((item) => item.id === opportunityId);
    if (opportunity?.status !== "PUBLISHED") return fail("INVALID_TRANSITION", "Tin này không nhận đăng ký.");
    if (isOver(opportunity, today())) return fail("INVALID_TRANSITION", "Các buổi của tin này đã diễn ra.");
    if (activeRegistration(ledger.registrations, opportunityId, user.id)) return fail("DUPLICATE_REGISTRATION", "Bạn đã đăng ký tin này.");
    if (slotsLeft(opportunity, ledger.registrations) === 0) return fail("OPPORTUNITY_FULL", "Đã hết chỗ.");
    status = opportunity.kind === "EVENT" ? "CONFIRMED" : "PENDING";
    const id = `r-${crypto.randomUUID()}`;
    ledger.registrations.push({ id, opportunityId, userId: user.id, name: user.name, status, createdAt: new Date().toISOString() });
    audit(ledger, user.id, "REGISTER_OPPORTUNITY", id);
    return { ok: true, value: undefined };
  });
  return result.ok ? { ok: true, value: status } : result;
}

/** Người đăng ký tự hủy khi đăng ký còn hiệu lực; chỗ được trả lại cho người khác. */
export function cancelRegistration(email: string, registrationId: string): DemoResult {
  return update((ledger) => {
    const user = actor(ledger, email);
    const registration = ledger.registrations.find((item) => item.id === registrationId);
    if (!user || !registration) return fail("NOT_FOUND", "Không tìm thấy đăng ký.");
    if (registration.userId !== user.id) return fail("NOT_OWNER", "Bạn không sở hữu đăng ký này.");
    if (registration.status !== "PENDING" && registration.status !== "CONFIRMED") return fail("INVALID_TRANSITION", "Đăng ký này đã khép lại.");
    registration.status = "CANCELLED";
    audit(ledger, user.id, "CANCEL_REGISTRATION", registrationId);
    return { ok: true, value: undefined };
  });
}

/** Đơn vị đăng tin cộng tác viên chọn hoặc từ chối người đăng ký; đã đủ người thì không nhận thêm. */
export function decideRegistration(email: string, registrationId: string, decision: "confirm" | "decline"): DemoResult {
  return update((ledger) => {
    const user = actor(ledger, email);
    const registration = ledger.registrations.find((item) => item.id === registrationId);
    const opportunity = ledger.opportunities.find((item) => item.id === registration?.opportunityId);
    if (!user || !registration || !opportunity) return fail("NOT_FOUND", "Không tìm thấy đăng ký.");
    if (user.role !== "SME" || user.id !== opportunity.ownerId) return fail("NOT_OWNER", "Bạn không sở hữu tin này.");
    if (registration.status !== "PENDING") return fail("INVALID_TRANSITION", "Đăng ký này không chờ duyệt.");
    if (decision === "confirm" && slotsLeft(opportunity, ledger.registrations) === 0) return fail("OPPORTUNITY_FULL", "Đã đủ người, không nhận thêm được.");
    registration.status = decision === "confirm" ? "CONFIRMED" : "DECLINED";
    audit(ledger, user.id, decision === "confirm" ? "CONFIRM_REGISTRATION" : "DECLINE_REGISTRATION", registrationId);
    return { ok: true, value: undefined };
  });
}

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
    if (student?.role !== "CONTRIBUTOR") return fail("WRONG_ROLE", "Kịch bản này dành cho tài khoản sinh viên.");
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
