"use client";

import { useRouter } from "next/navigation";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { clearDemoSession, resetDemoData } from "../services/demo-session";
import { useDemoSession } from "../hooks/use-demo-session";

/** Account controls remain reachable on mobile even when the top header is hidden. */
export function AccountSessionActions() {
  const router = useRouter();
  const { session, hydrated } = useDemoSession();
  if (!hydrated || !session) return null;

  function logout() {
    clearDemoSession();
    router.replace("/");
    router.refresh();
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
      <div className="cluster">
        <Button type="button" variant="outline" size="sm" onClick={reset}>Đặt lại demo</Button>
        <Button type="button" size="sm" onClick={logout}>Đăng xuất</Button>
      </div>
    </section>
  );
}
