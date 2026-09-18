import {
  ArrowCounterClockwise,
  CheckCircle,
  CircleDashed,
  Clock,
  ICON_WEIGHT,
  XCircle
} from "./icons";

/**
 * StatusBadge — hợp đồng tại docs/design-tokens.md 3.4.
 *
 * Component quan trọng nhất của hệ thống về mặt khả dụng, vì nó hiện thực hóa
 * quy tắc Redundant Coding (design.md 4.5): mọi trạng thái được mã hóa BA LỚP
 * độc lập — màu nền + biểu tượng + nhãn chữ. Khoảng 8% nam giới không phân biệt
 * được đỏ/lục; họ vẫn phải đọc được trạng thái mốc bàn giao.
 *
 * Điều kiện nghiệm thu: chụp màn hình -> chuyển ảnh xám -> vẫn đọc được đủ.
 */

type Tone = "verified" | "warning" | "danger" | "progress" | "neutral";

type StatusSpec = {
  tone: Tone;
  icon: typeof CheckCircle;
  label: string;
};

/**
 * Nhãn mặc định viết theo giọng của sản phẩm: nói rõ chuyện gì đang xảy ra,
 * không dùng từ hệ thống. Gọi kèm prop `label` khi ngữ cảnh cần câu khác.
 */
const STATUS: Record<string, StatusSpec> = {
  // --- Xác thực sinh viên ---
  VERIFIED: { tone: "verified", icon: CheckCircle, label: "Đã xác thực" },
  UNVERIFIED: { tone: "neutral", icon: CircleDashed, label: "Chưa xác thực" },

  // --- Dự án ---
  DRAFT: { tone: "neutral", icon: CircleDashed, label: "Bản nháp" },
  PENDING_REVIEW: { tone: "warning", icon: Clock, label: "Đang chờ duyệt" },
  PENDING: { tone: "warning", icon: Clock, label: "Đang chờ duyệt" },
  PUBLISHED: { tone: "progress", icon: CircleDashed, label: "Đang tuyển" },
  IN_PROGRESS: { tone: "progress", icon: CircleDashed, label: "Đang thực hiện" },
  COMPLETED: { tone: "verified", icon: CheckCircle, label: "Đã hoàn thành" },
  CANCELLED: { tone: "danger", icon: XCircle, label: "Đã hủy" },

  // --- Đơn ứng tuyển ---
  SUBMITTED: { tone: "progress", icon: CircleDashed, label: "Đã nộp, chờ phản hồi" },
  SHORTLISTED: { tone: "progress", icon: CircleDashed, label: "Vào danh sách rút gọn" },
  ACCEPTED: { tone: "verified", icon: CheckCircle, label: "Đã nghiệm thu" },
  REJECTED: { tone: "danger", icon: XCircle, label: "Bị từ chối" },
  WITHDRAWN: { tone: "neutral", icon: XCircle, label: "Đã rút đơn" },

  // --- Mốc bàn giao ---
  CHANGES_REQUESTED: { tone: "warning", icon: ArrowCounterClockwise, label: "Yêu cầu chỉnh sửa" },

  // --- Ký quỹ mô phỏng (FR-MIL-06, FR-MIL-07) ---
  PENDING_FUNDING: { tone: "neutral", icon: CircleDashed, label: "Chưa ghi nhận quỹ" },
  FUNDED: { tone: "progress", icon: Clock, label: "Đã ghi nhận quỹ" },
  RELEASED: { tone: "verified", icon: CheckCircle, label: "Đã ghi nhận giải ngân" }
};

export type StatusKey = keyof typeof STATUS;

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const spec = STATUS[status] ?? STATUS.DRAFT;
  const Icon = spec.icon;

  return (
    <span className={`badge badge--${spec.tone}`}>
      {/* Lớp 2: biểu tượng. aria-hidden vì lớp 3 (nhãn chữ) đã nói đủ nghĩa
          cho trình đọc màn hình — để cả hai sẽ đọc lặp. */}
      <Icon weight={ICON_WEIGHT} aria-hidden="true" />
      {/* Lớp 3: nhãn chữ */}
      {label ?? spec.label}
    </span>
  );
}
