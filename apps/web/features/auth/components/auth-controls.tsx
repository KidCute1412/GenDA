"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearDemoSession, DEMO_SESSION_EVENT, getDemoSession, resetDemoData, type DemoSession } from "../services/demo-session";

const dashboardFor = (role: DemoSession["role"]) => role === "SME" ? "/sme/projects" : role === "ADMIN" ? "/admin" : "/student/profile";
const navFor = (role: DemoSession["role"]) => role === "SME"
  ? { href: "/sme/projects", label: "DỰ ÁN CỦA TÔI" }
  : role === "ADMIN"
    ? { href: "/admin", label: "QUẢN TRỊ" }
    : { href: "/student/applications", label: "DỰ ÁN CỦA TÔI" };

export function AuthControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    const sync = () => setSession(getDemoSession());
    sync();
    window.addEventListener(DEMO_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function reset() {
    if (!window.confirm("Đặt lại toàn bộ dữ liệu demo? Thao tác này xóa phiên đăng nhập và các dự án, đơn ứng tuyển, trạng thái bạn vừa tạo.")) return;
    resetDemoData();
    window.location.assign("/");
  }

  if (!session) {
    return (
      <>
        <button type="button" className="nav-link auth-reset" onClick={reset}>
          ĐẶT LẠI DEMO
        </button>
        <Link href="/login" className="nav-link">ĐĂNG NHẬP</Link>
        <Link href="/login?mode=register" className="btn--tactile-orange" style={{ height: "36px", paddingInline: "var(--space-4)", fontSize: "12px", boxShadow: "2px 2px 0px var(--machinery-shadow)" }}>THAM GIA</Link>
      </>
    );
  }

  const primaryNav = navFor(session.role);
  const isPrimaryNavActive = pathname === primaryNav.href
    || pathname.startsWith(`${primaryNav.href}/`)
    || (pathname.startsWith("/workspace/") && session.role !== "ADMIN");

  return (
    <>
      <Link href={primaryNav.href} className="nav-link auth-dashboard" aria-current={isPrimaryNavActive ? "page" : undefined}>
        {primaryNav.label}
      </Link>
      <button type="button" className="nav-link auth-reset" onClick={reset}>
        ĐẶT LẠI DEMO
      </button>
      <button type="button" className="chip" onClick={() => router.push(dashboardFor(session.role))}>
        {session.name.toUpperCase()}
      </button>
      <button type="button" className="nav-link auth-logout" onClick={() => { clearDemoSession(); router.push("/"); }}>
        ĐĂNG XUẤT
      </button>
    </>
  );
}
