"use client";

import { Alert } from "../../../components/ui/alert";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { DeliverableForm } from "../../milestones/components/deliverable-form";
import { ReviewActions } from "../../milestones/components/review-actions";

export function WorkspaceRoleActions({ milestoneTitle, milestoneSubmitted, isFinalMilestone }: { milestoneTitle: string; milestoneSubmitted: boolean; isFinalMilestone: boolean }) {
  const { session, hydrated } = useDemoSession();

  if (!hydrated) return null;

  if (!session) return <Alert variant="warning" title="Cần đăng nhập">Đăng nhập đúng vai trò để thao tác trong không gian dự án.</Alert>;
  if (session.role === "STUDENT") {
    return (
      <section className="card">
        <h2 style={{ fontSize: "var(--text-h3-size)" }}>KHU VỰC BÀN GIAO CỦA BẠN</h2>
        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>Nộp kết quả cho mốc đang mở. Doanh nghiệp sẽ nhận thông báo sau khi bạn gửi.</p>
        <DeliverableForm milestoneTitle={milestoneTitle} />
      </section>
    );
  }
  if (session.role === "SME") {
    return (
      <section className="card">
        <h2 style={{ fontSize: "var(--text-h3-size)" }}>THAO TÁC NGHIỆM THU</h2>
        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>Đối chiếu kết quả bàn giao với tiêu chí đã thống nhất trước khi nghiệm thu.</p>
        <ReviewActions enabled={milestoneSubmitted} isFinalMilestone={isFinalMilestone} />
      </section>
    );
  }
  return <Alert variant="info" title="Chế độ hỗ trợ quản trị">Quản trị viên chỉ xem và hỗ trợ theo quy trình kiểm toán; không thao tác thay sinh viên hoặc doanh nghiệp.</Alert>;
}
