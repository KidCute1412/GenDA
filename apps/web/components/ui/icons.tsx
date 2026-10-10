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
  ShieldCheck,
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
  Sun,
  Moon,
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
import Image from "next/image";

export const ICON_WEIGHT = "bold" as const;

/**
 * Dấu hiệu nhận diện GenDA chính thức từ tệp logo nguyên bản.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brandmark.svg"
      alt="GenDA Logo"
      width={48}
      height={32}
      className={className}
      priority
      unoptimized
      style={{ objectFit: "contain", display: "inline-block" }}
    />
  );
}
