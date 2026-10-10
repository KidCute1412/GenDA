import { groupThousands } from "../../lib/utils/format";
import type { DemoOpportunity, DemoRegistration, OpportunityKind, OpportunitySession, PayUnit } from "../demo-ledger/types";

/**
 * Quy tắc và định dạng của cơ hội ngắn (docs/opportunities.md). Hàm thuần, không đọc ledger hay
 * đồng hồ: ngày "hôm nay" luôn truyền vào, để kiểm thử được và tách khỏi múi giờ máy chủ.
 */

/** Thù lao tối thiểu cho một người / một buổi (FR-OPP-02). */
export const MIN_PAY = 50_000;
export const MAX_SLOTS = 500;
export const MAX_SESSIONS = 5;

export const KIND_META: Record<OpportunityKind, { label: string; param: "gig" | "event"; tag: string; register: string; payUnit: PayUnit }> = {
  GIG: { label: "Cộng tác viên", param: "gig", tag: "CỘNG TÁC VIÊN", register: "Đăng ký làm", payUnit: "PER_SESSION" },
  EVENT: { label: "Sự kiện & workshop", param: "event", tag: "SỰ KIỆN", register: "Đăng ký tham gia", payUnit: "PER_PERSON" }
};

export function kindFromParam(param: string | undefined): OpportunityKind | null {
  if (param === "gig") return "GIG";
  if (param === "event") return "EVENT";
  return null;
}

export const PAY_UNIT_LABEL: Record<PayUnit, string> = { PER_PERSON: "/người", PER_SESSION: "/buổi" };

/** Lĩnh vực là bộ lọc phụ, không phải loại cơ hội: một công ty truyền thông đăng được cả hai loại. */
export const INDUSTRIES = ["Truyền thông", "Sự kiện", "F&B", "Giáo dục", "Bán lẻ", "Công nghệ", "Dịch vụ", "Khác"] as const;

export const PAY_BUCKETS = [
  { key: "lt200", label: "Dưới 200k", min: 0, max: 199_999 },
  { key: "200-500", label: "200k–500k", min: 200_000, max: 500_000 },
  { key: "500-1m", label: "500k–1 triệu", min: 500_001, max: 1_000_000 },
  { key: "gt1m", label: "Trên 1 triệu", min: 1_000_001, max: Number.POSITIVE_INFINITY }
] as const;

/** `150000, PER_PERSON` -> `"150.000đ/người"`. Luôn kèm đơn vị: 150k/người và 3 triệu trọn gói không so được nếu thiếu. */
export function formatPay(pay: number, unit: PayUnit): string {
  return `${groupThousands(pay)}đ${PAY_UNIT_LABEL[unit]}`;
}

/** Ngày `YYYY-MM-DD` theo giờ địa phương (không dùng toISOString vì lệch ngày ở múi giờ +7). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** `{2026-10-19, 14:00, 16:30}` -> `"T2, 19/10 · 14:00–16:30"`. */
export function formatSession(session: OpportunitySession): string {
  const [y, m, d] = session.date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")} · ${session.start}–${session.end}`;
}

export function sortedSessions(opportunity: Pick<DemoOpportunity, "sessions">): OpportunitySession[] {
  return [...opportunity.sessions].sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
}

/** Buổi sắp tới gần nhất; null khi mọi buổi đã qua. */
export function nextSession(opportunity: Pick<DemoOpportunity, "sessions">, today: string): OpportunitySession | null {
  return sortedSessions(opportunity).find((session) => session.date >= today) ?? null;
}

/** Hết buổi nào để tham gia: ẩn khỏi danh sách và khóa đăng ký. */
export function isOver(opportunity: Pick<DemoOpportunity, "sessions">, today: string): boolean {
  return nextSession(opportunity, today) === null;
}

/** Chỉ chỗ đã chốt (CONFIRMED) mới chiếm chỗ; đăng ký chờ duyệt chưa giữ chỗ. */
export function confirmedCount(registrations: DemoRegistration[], opportunityId: string): number {
  return registrations.filter((item) => item.opportunityId === opportunityId && item.status === "CONFIRMED").length;
}

export function slotsLeft(opportunity: Pick<DemoOpportunity, "id" | "slots">, registrations: DemoRegistration[]): number {
  return Math.max(0, opportunity.slots - confirmedCount(registrations, opportunity.id));
}

/** Đăng ký còn hiệu lực của một người cho một tin (chờ duyệt hoặc đã giữ chỗ). */
export function activeRegistration(registrations: DemoRegistration[], opportunityId: string, userId: string | undefined): DemoRegistration | undefined {
  if (!userId) return undefined;
  return registrations.find((item) => item.opportunityId === opportunityId && item.userId === userId && (item.status === "PENDING" || item.status === "CONFIRMED"));
}

export type DateGroup = "THIS_WEEK" | "NEXT_WEEK" | "LATER";
export const DATE_GROUP_LABEL: Record<DateGroup, string> = { THIS_WEEK: "Trong 7 ngày tới", NEXT_WEEK: "7–14 ngày tới", LATER: "Sau đó" };

/** Nhóm theo buổi gần nhất để người xem lướt theo lịch, không phải theo thời điểm đăng tin. */
export function dateGroup(opportunity: Pick<DemoOpportunity, "sessions">, today: string): DateGroup {
  const next = nextSession(opportunity, today);
  const days = next ? daysBetween(today, next.date) : Number.POSITIVE_INFINITY;
  if (days < 7) return "THIS_WEEK";
  if (days < 14) return "NEXT_WEEK";
  return "LATER";
}

export type OpportunityDraft = Pick<DemoOpportunity, "kind" | "industry" | "title" | "summary" | "details" | "pay" | "sessions" | "mode" | "location" | "slots" | "requirements"> & {
  /** Cam kết không thu bất kỳ khoản phí nào của người tham gia (FR-OPP-03). */
  noFeeCommitment: boolean;
};

/**
 * Kiểm tra tin đăng trước khi gửi duyệt. Trả về câu lỗi đầu tiên (viết cho người đăng đọc), hoặc null.
 * Cùng một hàm chạy ở form (báo sớm) và ở store (chặn thật), để hai nơi không lệch nhau.
 */
export function validateOpportunity(draft: OpportunityDraft, today: string): string | null {
  if (draft.title.trim().length < 8) return "Tiêu đề cần ít nhất 8 ký tự, nói rõ người tham gia sẽ làm gì.";
  if (draft.summary.trim().length < 20) return "Mô tả ngắn cần ít nhất 20 ký tự.";
  if (!INDUSTRIES.includes(draft.industry as (typeof INDUSTRIES)[number])) return "Hãy chọn lĩnh vực.";
  if (!Number.isInteger(draft.pay) || draft.pay < MIN_PAY) return `Thù lao tối thiểu là ${groupThousands(MIN_PAY)}đ${PAY_UNIT_LABEL[KIND_META[draft.kind].payUnit]}.`;
  if (!Number.isInteger(draft.slots) || draft.slots < 1 || draft.slots > MAX_SLOTS) return `Số chỗ phải từ 1 đến ${MAX_SLOTS}.`;
  if (draft.sessions.length === 0 || draft.sessions.length > MAX_SESSIONS) return `Cần từ 1 đến ${MAX_SESSIONS} buổi.`;
  for (const session of draft.sessions) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date) || !/^\d{2}:\d{2}$/.test(session.start) || !/^\d{2}:\d{2}$/.test(session.end)) return "Mỗi buổi cần đủ ngày, giờ bắt đầu và giờ kết thúc.";
    if (session.date < today) return "Ngày diễn ra không được ở trong quá khứ.";
    if (session.end <= session.start) return "Giờ kết thúc phải sau giờ bắt đầu.";
  }
  if (draft.location.trim().length < 3) return draft.mode === "ONLINE" ? "Hãy ghi nền tảng trực tuyến (ví dụ: Google Meet)." : "Hãy ghi địa điểm (quận, thành phố).";
  if (!draft.noFeeCommitment) return "Cần cam kết không thu phí người tham gia thì tin mới được gửi duyệt.";
  return null;
}
