"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "../services/auth-api";
import { useAuthSession } from "../hooks/use-auth-session";
import { ICON_WEIGHT, SignOut } from "../../../components/ui/icons";
import { UserMenu } from "./user-menu";

export function AuthControls() {
  const { session, hydrated, error, retry } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      // Tải lại hẳn trang chủ thay vì router.replace + router.refresh: refresh gọi ngay sau replace có thể
      // hủy lượt chuyển trang, để người dùng kẹt ở trang cần đăng nhập (vd. /sme/projects). Tải lại cũng xóa
      // sạch trạng thái của phiên cũ; `replace` để nút Quay lại không mở lại trang vừa rời.
      window.location.replace("/");
    } catch {
      window.alert("Không thể đăng xuất. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!hydrated) return <span role="status">Đang kiểm tra phiên…</span>;
  if (error) return <button type="button" className="nav-link" onClick={retry}>{error}</button>;
  if (!session) {
    return (
      <>
        <Link href="/login" className="nav-link">ĐĂNG NHẬP</Link>
        <Link href="/login?mode=register" className="btn--tactile-brand" style={{ height: "36px", paddingInline: "var(--space-4)", fontSize: "12px" }}>THAM GIA</Link>
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
