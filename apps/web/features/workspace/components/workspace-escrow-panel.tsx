"use client";

import { Alert } from "../../../components/ui/alert";
import { EscrowActions } from "../../milestones/components/escrow-actions";
import { useDemoSession } from "../../auth/hooks/use-demo-session";

type EscrowStage = "PENDING_FUNDING" | "FUNDED" | "RELEASED";

export function WorkspaceEscrowPanel({ initialStage }: { initialStage: EscrowStage }) {
  const { session, hydrated } = useDemoSession();
  if (!hydrated) return null;
  if (session?.role === "STUDENT") {
    return <Alert variant="info">Bạn xem được trạng thái quỹ mô phỏng. Chỉ doanh nghiệp và quản trị viên được ghi nhận các bước thanh toán.</Alert>;
  }
  if (!session) return <Alert variant="warning">Đăng nhập để xem trạng thái quỹ của dự án.</Alert>;
  return <EscrowActions
    initialStage={initialStage}
    canConfirmFunding={session.role === "SME"}
    canConfirmRelease={session.role === "ADMIN"}
  />;
}
