"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearDemoSession, DEMO_SESSION_EVENT, getDemoSession, type DemoSession } from "../services/demo-session";
import { ICON_WEIGHT, SignOut } from "../../../components/ui/icons";
import { UserMenu } from "./user-menu";

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

  if (!session) {
    return (
      <>
        <Link href="/login" className="nav-link">ĐĂNG NHẬP</Link>
        <Link href="/login?mode=register" className="btn--tactile-orange" style={{ height: "36px", paddingInline: "var(--space-4)", fontSize: "12px" }}>THAM GIA</Link>
      </>
    );
  }

  return (
    <>
      <UserMenu session={session} />
      <button
        type="button"
        className="icon-btn auth-logout"
        aria-label="Đăng xuất"
        title="Đăng xuất"
        onClick={() => { clearDemoSession(); router.push("/"); }}
      >
        <SignOut weight={ICON_WEIGHT} aria-hidden="true" />
      </button>
    </>
  );
}
