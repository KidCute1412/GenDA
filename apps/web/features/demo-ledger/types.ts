export type DemoRole = "STUDENT" | "SME" | "ADMIN";
export type ProjectStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ApplicationStatus = "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type MilestoneStatus = "PENDING" | "SUBMITTED" | "CHANGES_REQUESTED" | "ACCEPTED";
export type EscrowStatus = "PENDING_FUNDING" | "FUNDED" | "RELEASED";

/** CV dạng PDF của sinh viên. Ledger chỉ giữ thông tin tệp; nội dung tệp nằm ở khóa localStorage riêng (xem store.ts). */
export type DemoCv = { name: string; size: number; uploadedAt: string };
export type DemoUser = { id: string; name: string; email: string; role: DemoRole; emailVerified: boolean; cv?: DemoCv; studentVerified?: boolean; verificationStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED"; verificationReason?: string; skills?: string[]; taxCode?: string; companyWebsite?: string; smeApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED"; smeRejectionReason?: string };
export type DemoMilestone = { id: string; projectId: string; order: number; title: string; budget: number; deadline: string; criteria: string; status: MilestoneStatus; escrow: EscrowStatus };
export type DemoProject = { id: string; ownerId: string; title: string; smeName: string; budget: number; deadline: string; skills: string[]; summary: string; problem: string; acceptance: string[]; status: ProjectStatus; milestoneIds: string[]; createdAt: string; rejectionReason?: string };
export type DemoApplication = { id: string; projectId: string; studentId: string; coverLetter: string; cv?: DemoCv; status: ApplicationStatus; submittedAt: string };
export type DemoSubmission = { id: string; milestoneId: string; studentId: string; link?: string; files: Array<{ name: string; type: string; size: number }>; note: string; submittedAt: string; feedback?: string };
export type DemoReview = { id: string; projectId: string; studentId: string; rating: number; comment: string; createdAt: string };
export type DemoAudit = { id: string; at: string; actorId: string; action: string; targetId: string; reason?: string };
export type DemoUiStateValue = { value: unknown; expiresAt: number };

/**
 * Cơ hội ngắn (docs/opportunities.md): việc cộng tác viên và sự kiện/workshop. Tách khỏi DemoProject
 * vì vòng đời khác hẳn: nhiều người một tin, thù lao theo buổi/người, đăng ký nhanh thay cho đơn + CV.
 */
export type OpportunityKind = "GIG" | "EVENT";
export type OpportunityStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
export type OpportunityMode = "OFFLINE" | "ONLINE";
export type PayUnit = "PER_PERSON" | "PER_SESSION";
/** Một buổi: ngày `YYYY-MM-DD`, giờ `HH:mm`. */
export type OpportunitySession = { date: string; start: string; end: string };
export type DemoOpportunity = {
  id: string;
  kind: OpportunityKind;
  ownerId: string;
  orgName: string;
  industry: string;
  title: string;
  summary: string;
  details: string;
  pay: number;
  payUnit: PayUnit;
  sessions: OpportunitySession[];
  mode: OpportunityMode;
  location: string;
  slots: number;
  requirements: string[];
  status: OpportunityStatus;
  createdAt: string;
  rejectionReason?: string;
};
/** Sự kiện: giữ chỗ ngay (CONFIRMED). Cộng tác viên: chờ đơn vị đăng tin duyệt (PENDING). */
export type RegistrationStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";
export type DemoRegistration = { id: string; opportunityId: string; userId: string; name: string; status: RegistrationStatus; createdAt: string };

export type DemoLedger = {
  version: 2;
  users: DemoUser[];
  projects: DemoProject[];
  milestones: DemoMilestone[];
  applications: DemoApplication[];
  submissions: DemoSubmission[];
  reviews: DemoReview[];
  opportunities: DemoOpportunity[];
  registrations: DemoRegistration[];
  audits: DemoAudit[];
  uiState: Record<string, DemoUiStateValue>;
};

export type DemoErrorCode = "AUTH_REQUIRED" | "WRONG_ROLE" | "NOT_OWNER" | "NOT_ASSIGNED" | "EMAIL_NOT_VERIFIED" | "STUDENT_NOT_VERIFIED" | "INVALID_TRANSITION" | "DUPLICATE_APPLICATION" | "MILESTONE_BUDGET_MISMATCH" | "REASON_REQUIRED" | "NOT_FOUND" | "STORAGE_WRITE_FAILED" | "SME_IDENTITY_REQUIRED" | "SME_NOT_APPROVED" | "CV_REQUIRED" | "INVALID_FILE" | "INVALID_INPUT" | "OPPORTUNITY_FULL" | "DUPLICATE_REGISTRATION";
export type DemoResult<T = undefined> = { ok: true; value: T } | { ok: false; code: DemoErrorCode; message: string };
