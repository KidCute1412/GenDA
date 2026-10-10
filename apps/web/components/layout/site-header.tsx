"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export function SiteHeader({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const activeHeaderHref = pathname === "/projects" || pathname.startsWith("/projects/")
    ? "/projects"
    : pathname === "/" && hash === "#trust-layer"
      ? "/#trust-layer"
      : undefined;
  return (
    <header className={`site-header${hideOnMobile ? " site-header--hide-on-mobile" : ""}`}>
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
              aria-current={activeHeaderHref === link.href ? "page" : undefined}
              onClick={() => link.href === "/#trust-layer" && setHash("#trust-layer")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="cluster site-header__controls" style={{ gap: "var(--space-2)" }}>
          <ThemeToggle />
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
