import Link from "next/link";
import { Briefcase, FileText, House, ICON_WEIGHT, UserCircle } from "../ui/icons";

/**
 * Mobile Bottom Navigation — bốn tab, chỉ hiện dưới breakpoint md.
 *
 * Bốn tab chứ không nhiều hơn: mỗi ô rộng 25% màn hình mới giữ được vùng chạm
 * ≥ 44x44px theo WCAG 2.5.8 (design.md 4.6f). Đây là bề mặt điều hướng chính
 * của sinh viên, nhóm người dùng vào bằng smartphone.
 *
 * Mỗi tab có cả icon và nhãn chữ: icon một mình không đủ tường minh, và nhãn
 * chữ là thứ duy nhất trình đọc màn hình đọc được.
 */
const TABS = [
  { href: "/", label: "Trang chủ", icon: House },
  { href: "/projects", label: "Dự án", icon: Briefcase },
  { href: "/student/applications", label: "Đơn của tôi", icon: FileText },
  { href: "/student/profile", label: "Hồ sơ", icon: UserCircle }
];

export function BottomNav({ current }: { current?: string }) {
  return (
    <nav className="bottom-nav" aria-label="Điều hướng nhanh">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="bottom-nav__item"
            aria-current={current === tab.href ? "page" : undefined}
          >
            <Icon weight={ICON_WEIGHT} aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
