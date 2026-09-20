"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useDemoSession } from "../hooks/use-demo-session";
import type { DemoRole } from "../../demo-ledger/types";
export function RoleRouteGuard({ role, children }: { role: DemoRole; children: ReactNode }) { const { session, hydrated } = useDemoSession(); if (!hydrated) return null; if (session?.role === role) return children; return <main id="main-content" className="container" style={{ paddingBlock: "var(--space-section)" }}><Alert variant="warning" title="Không có quyền truy cập">Khu vực này dành cho vai trò {role}. <Link href="/login">Đăng nhập bằng tài khoản phù hợp</Link>.</Alert></main>; }
