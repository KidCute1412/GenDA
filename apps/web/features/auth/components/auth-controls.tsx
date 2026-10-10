"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "../services/auth-api";
import { useDemoSession } from "../hooks/use-demo-session";
import { ICON_WEIGHT, SignOut } from "../../../components/ui/icons";
import { UserMenu } from "./user-menu";

export function AuthControls() {
  const router = useRouter();
  const { session, hydrated } = useDemoSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch {
      window.alert("Không thể đăng xuất. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!hydrated || !session) {
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
        aria-busy={isLoggingOut}
        disabled={isLoggingOut}
        onClick={() => void handleLogout()}
      >
        <SignOut weight={ICON_WEIGHT} aria-hidden="true" />
      </button>
    </>
  );
}
