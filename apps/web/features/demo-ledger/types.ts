export type DemoRole = "STUDENT" | "SME" | "ADMIN";
export type ProjectStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ApplicationStatus = "SUBMITTED" | "SHORTLISTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type MilestoneStatus = "PENDING" | "SUBMITTED" | "CHANGES_REQUESTED" | "ACCEPTED";
export type EscrowStatus = "PENDING_FUNDING" | "FUNDED" | "RELEASED";

export type DemoUser = { id: string; name: string; email: string; role: DemoRole; emailVerified: boolean; studentVerified?: boolean; verificationStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED"; verificationReason?: string; skills?: string[] };
export type DemoMilestone = { id: string; projectId: string; order: number; title: string; budget: number; deadline: string; criteria: string; status: MilestoneStatus; escrow: EscrowStatus };
export type DemoProject = { id: string; ownerId: string; title: string; smeName: string; budget: number; deadline: string; skills: string[]; summary: string; problem: string; acceptance: string[]; status: ProjectStatus; milestoneIds: string[]; createdAt: string; rejectionReason?: string };
export type DemoApplication = { id: string; projectId: string; studentId: string; coverLetter: string; portfolioUrl: string; status: ApplicationStatus; submittedAt: string };
export type DemoSubmission = { id: string; milestoneId: string; studentId: string; link?: string; files: Array<{ name: string; type: string; size: number }>; note: string; submittedAt: string; feedback?: string };
export type DemoReview = { id: string; projectId: string; studentId: string; rating: number; comment: string; createdAt: string };
export type DemoPortfolio = { id: string; projectId: string; studentId: string; visible: boolean; reviewId?: string };
export type DemoAudit = { id: string; at: string; actorId: string; action: string; targetId: string; reason?: string };
export type DemoUiStateValue = { value: unknown; expiresAt: number };

export type DemoLedger = {
  version: 2;
  users: DemoUser[];
  projects: DemoProject[];
  milestones: DemoMilestone[];
  applications: DemoApplication[];
  submissions: DemoSubmission[];
  reviews: DemoReview[];
  portfolios: DemoPortfolio[];
  audits: DemoAudit[];
  uiState: Record<string, DemoUiStateValue>;
};

export type DemoErrorCode = "AUTH_REQUIRED" | "WRONG_ROLE" | "NOT_OWNER" | "NOT_ASSIGNED" | "EMAIL_NOT_VERIFIED" | "STUDENT_NOT_VERIFIED" | "INVALID_TRANSITION" | "DUPLICATE_APPLICATION" | "MILESTONE_BUDGET_MISMATCH" | "REASON_REQUIRED" | "NOT_FOUND" | "STORAGE_WRITE_FAILED";
export type DemoResult<T = undefined> = { ok: true; value: T } | { ok: false; code: DemoErrorCode; message: string };
