"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { needsCv } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";

export const CV_ONBOARDING_PATH = "/student/cv";

/** Đường dẫn tới trang nộp CV, nộp xong quay lại `next`. */
export function cvOnboardingHref(next: string) {
  return `${CV_ONBOARDING_PATH}?next=${encodeURIComponent(next)}`;
}

/**
 * Tài khoản sinh viên mới tạo phải nộp CV trước khi xem danh sách / chi tiết dự án.
 * Khách chưa đăng nhập và tài khoản đã có CV xem bình thường.
 */
export function CvRequiredGate({ children }: { children: ReactNode }) {
  const { session, hydrated } = useDemoSession();
  const ledger = useDemoLedger();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = hydrated && session?.role === "CONTRIBUTOR" && needsCv(ledger.users.find((user) => user.email === session.email));

  useEffect(() => {
    if (!blocked) return;
    // Đọc query từ window thay vì useSearchParams để trang dự án tĩnh không phải bọc Suspense
    router.replace(cvOnboardingHref(`${pathname}${window.location.search}`));
  }, [blocked, pathname, router]);

  return blocked ? null : children;
}
