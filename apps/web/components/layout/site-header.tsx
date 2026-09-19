import Link from "next/link";
import { BrandMark } from "../ui/icons";
import { ThemeToggle } from "./theme-toggle";
import { AuthControls } from "../../features/auth/components/auth-controls";

/**
 * Top Navigation Bar (docs/design.md Mục 6, nhóm pattern 1).
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
          <span>GenDA</span>
          <span className="brand__tag">SYS.26</span>
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
          <ThemeToggle />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
