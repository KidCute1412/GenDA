import Link from "next/link";
import { BrandMark } from "../ui/icons";
import { ButtonLink } from "../ui/button";

/**
 * Top Navigation Bar (docs/design.md Mục 6, nhóm pattern 1).
 *
 * Hai ràng buộc cứng về bố cục:
 *  - Điều hướng phải nằm gọn trên MỘT dòng ở desktop.
 *  - Chiều cao tối đa 80px; ở đây giữ 64px để thanh không ăn mất viewport.
 *
 * Dưới breakpoint md, các liên kết chữ ẩn đi và nhường cho Bottom Navigation
 * bốn tab — sinh viên (85% dùng smartphone) thao tác bằng ngón cái ở đáy màn
 * hình, không với lên đỉnh màn hình.
 */
const LINKS = [
  { href: "/projects", label: "Khám phá dự án" },
  { href: "/#trust-layer", label: "Về Trust Layer" }
];

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand">
          <BrandMark />
          GenDA
        </Link>

        <nav className="site-header__nav" aria-label="Điều hướng chính">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={current === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="cluster" style={{ gap: "var(--space-2)" }}>
          <ButtonLink href="/login" variant="ghost" size="sm">
            Đăng nhập
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Tham gia
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
