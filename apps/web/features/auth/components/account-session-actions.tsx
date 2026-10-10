"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { logout as logoutSession } from "../services/auth-api";
import { useAuthSession } from "../hooks/use-auth-session";

/** Account controls remain reachable on mobile even when the top header is hidden. */
export function AccountSessionActions() {
  const { session, hydrated } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  if (!hydrated || !session) return null;

  async function logout() {
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await logoutSession();
      // Tải lại hẳn trang chủ thay vì router.replace + router.refresh: refresh gọi ngay sau replace có thể
      // hủy lượt chuyển trang, để người dùng kẹt ở trang cần đăng nhập (vd. /sme/projects). Tải lại cũng xóa
      // sạch trạng thái của phiên cũ; `replace` để nút Quay lại không mở lại trang vừa rời.
      window.location.replace("/");
    } catch {
      setLogoutError("Không thể đăng xuất. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
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
        <Button type="button" size="sm" loading={isLoggingOut} onClick={() => void logout()}>Đăng xuất</Button>
      </div>
    </section>
  );
}
