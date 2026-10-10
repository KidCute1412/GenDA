import Link from "next/link";
import { BrandMark } from "../ui/icons";
import { ThemeToggle } from "./theme-toggle";
import { AuthControls } from "../../features/auth/components/auth-controls";

/**
 * Top Navigation Bar (docs/design.md Mục 6, nhóm pattern 1).
 */
export function SiteHeader({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  return (
    <header className={`site-header${hideOnMobile ? " site-header--hide-on-mobile" : ""}`}>
      <div className="container site-header__inner">
        <Link href="/" className="brand">
          <BrandMark />
          <span>GenDA</span>
        </Link>

        <div className="cluster site-header__controls" style={{ gap: "var(--space-2)" }}>
          <ThemeToggle />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
