import type { DemoLedger } from "../demo-ledger/types";

/** Biểu cảm của Gen. Khẩu hình "đang nói" không phải biểu cảm: nó chồng lên biểu cảm khi chữ đang chạy. */
export type GenExpression = "neutral" | "happy" | "thinking" | "concerned" | "surprised" | "wink";

/**
 * Bậc ưu tiên, xếp từ cao xuống thấp. Gen chỉ tự bật một lời nhắc mỗi phiên nên thứ tự
 * này quyết định sinh viên nghe điều gì trước.
 */
export const INSIGHT_TIERS = ["intro", "welcome", "urgent", "news", "coach", "discover"] as const;
export type InsightTier = (typeof INSIGHT_TIERS)[number];

export type InsightKind =
  | "INTRO"
  | "WELCOME_BACK"
  | "CHANGES_REQUESTED"
  | "DEADLINE_SOON"
  | "ACCEPTED_START"
  | "SHORTLISTED"
  | "PROJECT_COMPLETED"
  | "CV_MISSING"
  | "VERIFICATION"
  | "REJECTION_STREAK"
  | "LONG_WAIT"
  | "SKILLS_FEW"
  | "MATCH_SUGGESTION";

export type DialogueLine = { text: string; expression: GenExpression };

/** Lựa chọn ở câu thoại cuối. Có `href` thì là điều hướng, không có thì chỉ khép hội thoại. */
export type DialogueChoice = { label: string; href?: string };

export type Insight = {
  kind: InsightKind;
  /**
   * Dấu vân tay của tình huống. Đổi khi dữ liệu nền đổi (đơn khác, mốc khác, chuỗi dài thêm),
   * nhờ vậy lời nhắc đã nghe rồi không lặp lại, nhưng tình huống mới vẫn được nhắc.
   */
  key: string;
  tier: InsightTier;
  /** Nhãn ngắn trong menu của Gen. */
  title: string;
  lines: DialogueLine[];
  choices: DialogueChoice[];
  /** "Vì sao Gen nói vậy": dữ liệu nào dẫn tới lời nhắc này (Trust-First). */
  reason: string;
};

export type InsightContext = {
  ledger: DemoLedger;
  userId: string;
  now: Date;
  /** Lần hoạt động cuối của phiên TRƯỚC; null nếu đây là lần đầu. */
  previousVisitAt: string | null;
  introDone: boolean;
};
