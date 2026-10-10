"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useAuthSession } from "../hooks/use-auth-session";
import type { AuthSession } from "../services/auth-api";

export function RoleRouteGuard({ role, children }: { role: AuthSession["role"]; children: ReactNode }) {
  const { session, hydrated, error, retry } = useAuthSession();
  if (!hydrated) return <main id="main-content" className="container" role="status">Đang kiểm tra phiên…</main>;
  if (error) return <main id="main-content" className="container"><Alert variant="danger">{error} <button type="button" onClick={retry}>Thử lại</button></Alert></main>;
  if (session?.role === role) return children;
  return <main id="main-content" className="container" style={{ paddingBlock: "var(--space-section)" }}><Alert variant="warning" title="Không có quyền truy cập">Khu vực này dành cho vai trò {role}. <Link href="/login">Đăng nhập bằng tài khoản phù hợp</Link>.</Alert></main>;
}
