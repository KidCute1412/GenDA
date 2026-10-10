/**
 * Điểm nhập DUY NHẤT cho biểu tượng. Một họ icon cho cả dự án (Phosphor), một
 * trọng lượng nét thống nhất — trộn nhiều bộ icon là dấu hiệu giao diện chắp vá.
 *
 * Dùng bản `/ssr`: icon render thẳng ra SVG trên máy chủ, không kèm JavaScript
 * phía client và dùng được trong Server Component.
 *
 * Kỷ luật đặt icon (docs/design.md 4.9): icon CHỈ xuất hiện khi nó mã hóa trạng
 * thái (lớp 2 của quy tắc Redundant Coding) hoặc làm affordance. Không đính icon
 * vào tiêu đề cho đẹp.
 */
export {
  // --- Mã hóa trạng thái (lớp 2 của Redundant Coding, design.md 4.5) ---
  Check,
  CheckCircle,
  Clock,
  ArrowCounterClockwise,
  XCircle,
  CircleDashed,
  SealCheck,
  // --- Ngữ nghĩa thông báo ---
  Info,
  Warning,
  WarningCircle,
  // --- Affordance ---
  CloudArrowUp,
  MagnifyingGlass,
  Paperclip,
  LinkSimple,
  ArrowRight,
  CaretRight,
  Eye,
  EyeSlash,
  Star,
  // --- Điều hướng dưới đáy màn hình ---
  House,
  Briefcase,
  FileText,
  UserCircle
} from "@phosphor-icons/react/ssr";

/**
 * Trọng lượng nét dùng chung. Icon giao diện của GenDA phần lớn sống ở cỡ nhỏ
 * (14-20px), nét `bold` giữ được hình dạng ở cỡ đó; nét `regular` bị mảnh và
 * nhòe đi khi icon nằm trong badge 14px.
 */
export const ICON_WEIGHT = "bold" as const;

/**
 * Dấu hiệu nhận diện GenDA, dựng từ mô-típ khối nghiêng của logo.
 * Tô bằng token màu nên đổi thương hiệu là hình đổi theo.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      {/* Khối nghiêng teal = quá trình đang vận hành ("Learn") */}
      <path d="M6 22 L14 6 L20 6 L12 22 Z" fill="var(--color-brand-decorative)" />
      {/* Khối nghiêng xanh lá = thành quả đã xác thực ("Earn") */}
      <path d="M16 22 L24 6 L28 6 L20 22 Z" fill="var(--color-status-verified)" />
      {/* Chân đế slate = khung đỡ, không mang ngữ nghĩa trạng thái */}
      <rect x="4" y="24" width="24" height="3" rx="1.5" fill="var(--color-text-muted)" />
    </svg>
  );
}
