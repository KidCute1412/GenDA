"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useDemoSession } from "../hooks/use-demo-session";

/** Prevents fixture student data from being presented as an anonymous user's profile. */
export function StudentRouteGuard({ children }: { children: ReactNode }) {
  const { session, hydrated } = useDemoSession();

  if (!hydrated) return null;
  if (session?.role === "STUDENT") return children;

  return (
    <main id="main-content" className="container has-bottom-nav" style={{ paddingBlock: "var(--space-section)" }}>
      <Alert variant="warning" title="Cần đăng nhập bằng tài khoản sinh viên">
        Trang này chỉ hiển thị hồ sơ và đơn ứng tuyển của tài khoản sinh viên đang đăng nhập. <Link href="/login">Đăng nhập</Link> hoặc <Link href="/login?mode=register">tạo tài khoản</Link> để tiếp tục.
      </Alert>
    </main>
  );
}
