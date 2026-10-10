"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, House, ICON_WEIGHT, UserCircle } from "../ui/icons";
import { useDemoSession } from "../../features/auth/hooks/use-demo-session";

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
const STUDENT_TABS = [
  { href: "/", label: "Trang chủ", icon: House },
  { href: "/projects", label: "Dự án", icon: Briefcase },
  { href: "/student/applications", label: "Đơn của tôi", icon: FileText },
  { href: "/student/profile", label: "Hồ sơ", icon: UserCircle }
];

const SME_TABS = [
  { href: "/", label: "Trang chủ", icon: House },
  { href: "/sme/projects", label: "Dự án của tôi", icon: Briefcase },
  { href: "/sme/projects/new", label: "Đăng dự án", icon: FileText },
  { href: "/student/profile", label: "Hồ sơ", icon: UserCircle }
];

export function BottomNav() {
  const pathname = usePathname();
  const { session, hydrated } = useDemoSession();
  const tabs = hydrated && session?.role === "SME" ? SME_TABS : STUDENT_TABS;
  const activeHref = pathname.startsWith("/workspace/")
    ? session?.role === "SME" ? "/sme/projects" : "/student/applications"
    : tabs.find((tab) => pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)))?.href;
  return (
    <nav className="bottom-nav" aria-label="Điều hướng nhanh">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="bottom-nav__item"
            aria-current={activeHref === tab.href ? "page" : undefined}
          >
            <Icon weight={ICON_WEIGHT} aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
