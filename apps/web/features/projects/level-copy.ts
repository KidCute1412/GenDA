import { ApiRequestError } from "../auth/services/session-request";
import { formatVnd } from "../../lib/utils/format";
import type { ProjectComplexity, ProjectCreationPolicy, ReadinessIssue } from "./sme-api";

/**
 * Lời mô tả cho từng project level. Khoảng tiền KHÔNG nằm ở đây: nó đến từ policy của backend
 * (GET /projects/creation-policy) để giao diện không bao giờ lệch với nơi thực thi luật.
 */
export const LEVEL_COPY: Record<ProjectComplexity, { label: string; scope: string; eligibility: string }> = {
  BASIC: {
    label: "Cơ bản",
    scope: "Một đầu việc rõ ràng, làm trong 1–2 tuần, ví dụ một landing page tĩnh hay bộ ảnh mạng xã hội.",
    eligibility: "Mọi hạng, kể cả người mới ở hạng Đồng, có hồ sơ và CV hợp lệ."
  },
  MEDIUM: {
    label: "Trung bình",
    scope: "Vài hạng mục liên quan nhau, cần phối hợp qua nhiều mốc, ví dụ website nhiều trang có form liên hệ.",
    eligibility: "Người từ hạng Bạc (10 XP, khoảng 10 dự án Cơ bản), hoặc người được chính bạn mời."
  },
  HIGH: {
    label: "Nâng cao",
    scope: "Nhiều phần việc kỹ thuật hoặc tích hợp, ví dụ có thanh toán, quản trị nội dung hay kết nối hệ thống khác.",
    eligibility: "Chỉ người hạng Vàng (30 XP, đã làm nhiều dự án Trung bình)."
  }
};

export const COMPLEXITY_ORDER: ProjectComplexity[] = ["BASIC", "MEDIUM", "HIGH"];

export function levelRange(policy: ProjectCreationPolicy, complexity: ProjectComplexity) {
  return policy.levels.find((level) => level.complexity === complexity) ?? null;
}

export function formatRange(range: { minimumBudget: number; maximumBudget: number }) {
  return `${formatVnd(range.minimumBudget)} – ${formatVnd(range.maximumBudget)}`;
}

/** Mỗi lý do chặn gửi duyệt kèm bước của wizard nơi người dùng sửa được nó. */
export const ISSUE_COPY: Record<ReadinessIssue, { message: string; step: number }> = {
  SUMMARY_REQUIRED: { message: "Thiếu câu tóm tắt dự án.", step: 0 },
  PROBLEM_REQUIRED: { message: "Thiếu mô tả chi tiết yêu cầu.", step: 0 },
  INDUSTRY_REQUIRED: { message: "Chưa chọn lĩnh vực kinh doanh.", step: 0 },
  SME_SIZE_REQUIRED: { message: "Chưa chọn quy mô doanh nghiệp.", step: 0 },
  COMPLEXITY_REQUIRED: { message: "Chưa chọn mức độ dự án.", step: 1 },
  BUDGET_REQUIRED: { message: "Chưa nhập ngân sách.", step: 1 },
  BUDGET_OUTSIDE_LEVEL_RANGE: { message: "Ngân sách nằm ngoài khoảng của mức độ đã chọn.", step: 1 },
  DEADLINE_REQUIRED: { message: "Chưa chọn hạn hoàn thành dự án.", step: 1 },
  DEADLINE_NOT_IN_FUTURE: { message: "Hạn hoàn thành dự án phải sau hôm nay.", step: 1 },
  SKILLS_REQUIRED: { message: "Chưa chọn kỹ năng cần có.", step: 1 },
  ACCEPTANCE_CRITERIA_REQUIRED: { message: "Thiếu tiêu chí nghiệm thu.", step: 2 },
  MILESTONES_REQUIRED: { message: "Cần ít nhất một mốc bàn giao.", step: 2 },
  MILESTONE_TITLE_REQUIRED: { message: "Có mốc chưa ghi nội dung bàn giao.", step: 2 },
  MILESTONE_BUDGET_REQUIRED: { message: "Có mốc chưa được chia tiền.", step: 2 },
  MILESTONE_DEADLINE_REQUIRED: { message: "Có mốc chưa có hạn.", step: 2 },
  MILESTONE_DEADLINE_NOT_IN_FUTURE: { message: "Hạn của mỗi mốc phải sau hôm nay.", step: 2 },
  MILESTONE_DEADLINE_AFTER_PROJECT: { message: "Có mốc hết hạn sau hạn của cả dự án.", step: 2 },
  MILESTONE_BUDGET_MISMATCH: { message: "Tổng tiền các mốc chưa bằng ngân sách dự án.", step: 2 }
};

/** Chuyển lỗi API thành câu tiếng Việt nói rõ phải làm gì, không lộ mã kỹ thuật. */
export function describeProjectError(error: unknown): string {
  if (!(error instanceof ApiRequestError)) return "Không kết nối được máy chủ. Vui lòng thử lại.";
  const details = error.details;
  switch (error.code) {
    case "PROJECT_BUDGET_OUTSIDE_LEVEL_RANGE": {
      const level = LEVEL_COPY[details.complexity as ProjectComplexity]?.label ?? "đã chọn";
      return `Mức ${level} nhận ngân sách từ ${formatVnd(Number(details.minimumBudget))} đến ${formatVnd(
        Number(details.maximumBudget)
      )}. Hãy chỉnh ngân sách hoặc chọn mức độ phù hợp với phạm vi công việc.`;
    }
    case "PROJECT_BUDGET_OUT_OF_RANGE":
      return "Ngân sách mỗi dự án phải từ 1.000.000 đ đến 5.000.000 đ.";
    case "PROJECT_NOT_READY":
      return "Dự án còn thiếu thông tin, xem danh sách bên dưới.";
    case "PROJECT_INVALID_TRANSITION":
      return "Dự án đã đổi trạng thái ở nơi khác. Tải lại trang để xem trạng thái mới nhất.";
    case "PROJECT_NOT_FOUND":
      return "Không tìm thấy dự án này trong tài khoản của bạn.";
    case "PROJECT_RETURN_REASON_REQUIRED":
      return "Lý do trả về cần ít nhất 10 ký tự.";
    case "SME_NOT_APPROVED":
      return "Tài khoản doanh nghiệp chưa được duyệt nên chưa đăng được dự án.";
    case "ADMIN_ROLE_REQUIRED":
    case "ACCESS_DENIED":
      return "Tài khoản hiện tại không có quyền thực hiện thao tác này.";
    case "AUTH_REQUIRED":
      return "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.";
    case "UNKNOWN_SKILL":
    case "DUPLICATE_SKILL":
      return "Danh sách kỹ năng không hợp lệ. Tải lại trang rồi chọn lại.";
    default:
      return error.requestId ? `${error.message} (mã yêu cầu ${error.requestId})` : error.message;
  }
}

export function readinessIssuesOf(error: unknown): ReadinessIssue[] {
  if (!(error instanceof ApiRequestError) || error.code !== "PROJECT_NOT_READY") return [];
  const issues = error.details.issues;
  return Array.isArray(issues) ? (issues.filter((issue) => issue in ISSUE_COPY) as ReadinessIssue[]) : [];
}
