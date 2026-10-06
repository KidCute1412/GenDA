"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { resetDemoData } from "../services/demo-session";
import { logout as logoutSession } from "../services/auth-api";
import { useDemoSession } from "../hooks/use-demo-session";

/** Account controls remain reachable on mobile even when the top header is hidden. */
export function AccountSessionActions() {
  const router = useRouter();
  const { session, hydrated } = useDemoSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  if (!hydrated || !session) return null;

  async function logout() {
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await logoutSession();
      router.replace("/");
      router.refresh();
    } catch {
      setLogoutError("Không thể đăng xuất. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function reset() {
    if (!window.confirm("Đặt lại toàn bộ dữ liệu demo? Thao tác này xóa phiên đăng nhập và các thay đổi đã tạo.")) return;
    resetDemoData();
    router.replace("/");
    router.refresh();
  }

  return (
    <section className="module-bay stack stack--sm" style={{ padding: "var(--space-5)" }}>
      <div className="module-bay__header">
        <span className="module-bay__id">ACCOUNT // SESSION</span>
        <span>{session.role}</span>
      </div>
      <Alert variant="info">Đang đăng nhập: <strong>{session.email}</strong></Alert>
      {logoutError ? <Alert variant="danger">{logoutError}</Alert> : null}
      <div className="cluster">
        <Button type="button" variant="outline" size="sm" disabled={isLoggingOut} onClick={reset}>Đặt lại demo</Button>
        <Button type="button" size="sm" loading={isLoggingOut} onClick={() => void logout()}>Đăng xuất</Button>
      </div>
    </section>
  );
}
