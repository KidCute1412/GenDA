"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useAuthSession } from "../hooks/use-auth-session";

/** Prevents fixture student data from being presented as an anonymous user's profile. */
export function StudentRouteGuard({ children }: { children: ReactNode }) {
  const { session, hydrated, error, retry } = useAuthSession();

  if (!hydrated) return null;
  if (error) return <main id="main-content" className="container"><Alert variant="danger">{error} <button type="button" onClick={retry}>Thử lại</button></Alert></main>;
  if (session?.role === "CONTRIBUTOR") return children;

  return (
    <main id="main-content" className="container has-bottom-nav" style={{ paddingBlock: "var(--space-section)" }}>
      <Alert variant="warning" title="Cần đăng nhập bằng tài khoản sinh viên">
        Trang này chỉ hiển thị hồ sơ và đơn ứng tuyển của tài khoản sinh viên đang đăng nhập. <Link href="/login">Đăng nhập</Link> hoặc <Link href="/login?mode=register">tạo tài khoản</Link> để tiếp tục.
      </Alert>
    </main>
  );
}
