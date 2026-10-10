"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoSession } from "../../features/auth/hooks/use-demo-session";
import { groupOf, useMyApplications } from "../../features/applications/hooks/use-my-applications";

/**
 * Menu chính trên header (máy tính / máy tính bảng). Điện thoại đã có thanh tab dưới
 * đáy (BottomNav) với cùng các mục nên menu này ẩn dưới 768px.
 *
 * Hai việc sinh viên làm nhiều nhất phải nhìn thấy ngay trên mọi trang: TÌM DỰ ÁN và
 * xem ĐƠN CỦA TÔI. Mục "Đơn của tôi" có số đơn đang chờ duyệt để biết có gì cần theo dõi.
 * Hồ sơ và portfolio nằm trong menu biểu tượng người dùng bên phải (UserMenu).
 */
type NavItem = { href: string; label: string; badge?: number; matches?: (path: string) => boolean };

export function MainNav() {
  const pathname = usePathname();
  const { session, hydrated } = useDemoSession();
  const { items } = useMyApplications();

  const pending = items.filter((item) => groupOf(item.status) === "pending").length;

  const navItems: NavItem[] =
    !hydrated || !session
      ? [{ href: "/projects", label: "Tìm dự án" }]
      : session.role === "SME"
        ? [
            { href: "/sme/projects", label: "Dự án của tôi", matches: (p) => (p.startsWith("/sme/projects") && p !== "/sme/projects/new") || p.startsWith("/workspace/") },
            { href: "/sme/projects/new", label: "Đăng dự án" }
          ]
        : session.role === "ADMIN"
          ? [{ href: "/admin", label: "Quản trị" }]
          : [
              { href: "/projects", label: "Tìm dự án" },
              { href: "/student/applications", label: "Đơn của tôi", badge: pending, matches: (p) => p.startsWith("/student/applications") || p.startsWith("/workspace/") }
            ];

  return (
    <nav className="main-nav" aria-label="Điều hướng chính">
      {navItems.map((item) => {
        const active = item.matches ? item.matches(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className="nav-link main-nav__link" aria-current={active ? "page" : undefined}>
            {item.label}
            {item.badge ? (
              <span className="main-nav__badge" aria-label={`${item.badge} đơn đang chờ duyệt`}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
