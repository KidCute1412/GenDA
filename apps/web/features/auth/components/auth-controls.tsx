"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearDemoSession, DEMO_SESSION_EVENT, getDemoSession, resetDemoData, type DemoSession } from "../services/demo-session";

const dashboardFor = (role: DemoSession["role"]) => role === "SME" ? "/sme/projects" : role === "ADMIN" ? "/admin" : "/student/profile";

export function AuthControls() {
  const router = useRouter();
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
        <button type="button" className="nav-link" onClick={reset}>
          ĐẶT LẠI DEMO
        </button>
        <Link href="/login" className="nav-link">ĐĂNG NHẬP</Link>
        <Link href="/register" className="btn--tactile-orange" style={{ height: "36px", paddingInline: "var(--space-4)", fontSize: "12px", boxShadow: "2px 2px 0px var(--machinery-shadow)" }}>THAM GIA</Link>
      </>
    );
  }

  return (
    <>
      {session.role === "STUDENT" ? (
        <Link href="/student/applications" className="nav-link">
          DỰ ÁN CỦA TÔI
        </Link>
      ) : null}
      <button type="button" className="nav-link" onClick={reset}>
        ĐẶT LẠI DEMO
      </button>
      <button type="button" className="chip" onClick={() => router.push(dashboardFor(session.role))}>
        {session.name.toUpperCase()}
      </button>
      <button type="button" className="nav-link" onClick={() => { clearDemoSession(); router.push("/"); }}>
        ĐĂNG XUẤT
      </button>
    </>
  );
}
