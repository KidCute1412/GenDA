"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { Alert } from "../../../components/ui/alert";
import { Button, ButtonLink } from "../../../components/ui/button";
import { StatusBadge } from "../../../components/ui/status-badge";
import { EmptyState } from "../../../components/ui/feedback";
import { TextAreaField, TextField } from "../../../components/ui/field";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { advanceEscrow, reviewMilestone, submitDeliverable, submitReview } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";

export function LedgerWorkspace({ projectId }: { projectId?: string } = {}) {
  const ledger = useDemoLedger();
  const { session, hydrated } = useDemoSession();
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [reason, setReason] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<string | null>(null);

  if (!hydrated) {
    return null;
  }

  if (!session) {
    return (
      <>
        <SiteHeader hideOnMobile />
        <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-12)" }}>
          <Alert variant="warning">
            Bạn cần đăng nhập để truy cập không gian làm việc này. Vui lòng đăng nhập với tài khoản Doanh nghiệp hoặc Sinh viên.
          </Alert>
          <div style={{ marginTop: "var(--space-4)" }}>
            <ButtonLink href="/login" variant="primary" className="btn--tactile-orange">
              Đăng nhập ngay
            </ButtonLink>
          </div>
        </main>
        <SiteFooter />
        <BottomNav />
      </>
    );
  }

  const user = ledger.users.find((item) => item.email === session.email);

  // Find project: either explicit projectId, or matching active accepted application for this user
  let project = projectId && projectId !== "demo"
    ? ledger.projects.find((item) => item.id === projectId)
    : undefined;

  if (!project) {
    project = ledger.projects.find(
      (item) =>
        item.createdAt !== "2026-09-01" &&
        ledger.applications.some(
          (application) =>
            application.projectId === item.id &&
            application.status === "ACCEPTED" &&
            (application.studentId === user?.id || item.ownerId === user?.id)
        )
    );
  }

  if (!project) {
    return (
      <>
        <SiteHeader hideOnMobile />
        <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-12)" }}>
          <EmptyState
            title="CHƯA CÓ DỰ ÁN ĐANG THỰC HIỆN"
            advice="Chưa có dự án nào được giao hoặc chấp thuận cho tài khoản của bạn trong không gian làm việc này."
            action={
              <ButtonLink href="/projects" variant="primary" className="btn--tactile-orange">
                Xem danh sách dự án
              </ButtonLink>
            }
          />
        </main>
        <SiteFooter />
        <BottomNav />
      </>
    );
  }

  const milestones = project.milestoneIds
    .map((id) => ledger.milestones.find((item) => item.id === id))
    .filter(Boolean) as typeof ledger.milestones;

  const active = milestones.find((item) => item.status !== "ACCEPTED") ?? milestones[milestones.length - 1];

  const run = (result: ReturnType<typeof reviewMilestone>) => {
    setMessage(result.ok ? "Đã cập nhật hệ thống thành công." : result.message);
  };

  return (
    <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-8)" }}>
        <div className="industrial-ruler">
          {`SYS.WORKSPACE // ACTIVE-EXECUTION // MOD-${project.id.toUpperCase()}`}
        </div>

        <nav className="page-breadcrumb-bar" aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", textTransform: "uppercase" }}>
            <li>
              <Link href="/">ROOT</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/workspace/demo">WORKSPACE</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: "var(--orange-500)", fontWeight: 700 }}>{project.id.toUpperCase()}</li>
          </ol>
        </nav>

        <div className="section--tight cluster cluster--between" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-4)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)" }}>
              <span className="tag-hardware">RUNTIME-BAY</span>
              <span>{project.smeName.toUpperCase()}</span>
            </div>
            <h1 className="industrial-display" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", margin: "var(--space-2) 0 0" }}>
              {project.title}
            </h1>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {message ? (
          <div style={{ marginTop: "var(--space-4)" }}>
            <Alert variant="info">{message}</Alert>
          </div>
        ) : null}

        <div className="layout-aside section--tight">
          <div className="stack stack--lg">
            {/* --- Tiến độ mốc --- */}
            <section className="module-bay stack" style={{ padding: "var(--space-5)" }}>
              <div className="module-bay__header">
                <span>EXECUTION-PHASES</span>
                <span className="module-bay__id">BAY-01</span>
              </div>
              <h2 style={{ fontSize: "var(--text-h4-size)", margin: "var(--space-1) 0 var(--space-3)" }}>
                TIẾN ĐỘ CÁC MỐC
              </h2>
              <div className="stack stack--sm">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="cluster cluster--between"
                    style={{
                      padding: "var(--space-3)",
                      border: "1px solid var(--machinery-border)",
                      backgroundColor: milestone.id === active?.id ? "var(--color-surface-subtle)" : "transparent"
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, display: "block" }}>
                        MỐC {milestone.order}: {milestone.title}
                      </span>
                      <span className="text-caption" style={{ color: "var(--color-text-muted)" }}>
                        {milestone.criteria}
                      </span>
                    </div>
                    <div className="cluster" style={{ gap: "var(--space-2)" }}>
                      <StatusBadge status={milestone.status} />
                      <StatusBadge status={milestone.escrow} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- Mốc đang mở & Thao tác --- */}
            {active ? (
              <section className="module-bay stack" style={{ padding: "var(--space-5)" }}>
                <div className="module-bay__header">
                  <span>ACTIVE-MILESTONE</span>
                  <span className="module-bay__id">BAY-02</span>
                </div>
                <h2 style={{ fontSize: "var(--text-h4-size)", margin: "var(--space-1) 0" }}>
                  MỐC ĐANG MỞ: {active.title}
                </h2>
                <p className="text-muted" style={{ margin: 0 }}>
                  Tiêu chí: {active.criteria}
                </p>

                {session.role === "STUDENT" ? (
                  <div className="stack stack--md" style={{ marginTop: "var(--space-3)", borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-3)" }}>
                    <TextField
                      id="demo-deliverable-link"
                      label="Liên kết bàn giao"
                      type="url"
                      value={link}
                      onChange={(event) => setLink(event.target.value)}
                    />
                    <TextAreaField
                      id="demo-deliverable-note"
                      label="Ghi chú bàn giao"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={4}
                    />
                    <div>
                      <Button
                        className="btn--tactile-orange"
                        onClick={() =>
                          run(
                            submitDeliverable({
                              email: session.email,
                              milestoneId: active.id,
                              link,
                              note,
                              files: []
                            })
                          )
                        }
                      >
                        Nộp bàn giao
                      </Button>
                    </div>
                  </div>
                ) : null}

                {session.role === "SME" ? (
                  <div className="stack stack--md" style={{ marginTop: "var(--space-3)", borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-3)" }}>
                    <TextAreaField
                      id="demo-change-reason"
                      label="Lý do cần sửa đổi (nếu yêu cầu sửa)"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      rows={3}
                    />
                    <div className="cluster" style={{ gap: "var(--space-3)" }}>
                      <Button
                        variant="outline"
                        disabled={reason.trim().length < 10 || active.status !== "SUBMITTED"}
                        onClick={() =>
                          run(
                            reviewMilestone({
                              email: session.email,
                              milestoneId: active.id,
                              decision: "changes",
                              reason
                            })
                          )
                        }
                      >
                        Yêu cầu sửa
                      </Button>
                      <Button
                        className="btn--tactile-orange"
                        disabled={active.status !== "SUBMITTED"}
                        onClick={() =>
                          run(
                            reviewMilestone({
                              email: session.email,
                              milestoneId: active.id,
                              decision: "accept"
                            })
                          )
                        }
                      >
                        Nghiệm thu
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        disabled={active.escrow !== "PENDING_FUNDING"}
                        onClick={() => run(advanceEscrow(session.email, active.id))}
                      >
                        Xác nhận nạp quỹ mô phỏng
                      </Button>
                    </div>
                  </div>
                ) : null}

                {session.role === "ADMIN" ? (
                  <div style={{ marginTop: "var(--space-3)", borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-3)" }}>
                    <Button
                      variant="outline"
                      disabled={active.escrow !== "FUNDED"}
                      onClick={() => run(advanceEscrow(session.email, active.id))}
                    >
                      Xác nhận giải ngân mô phỏng
                    </Button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* --- Đánh giá kết thúc --- */}
            {project.status === "COMPLETED" && session.role === "SME" ? (
              <section className="module-bay stack" style={{ padding: "var(--space-5)" }}>
                <div className="module-bay__header">
                  <span>FINAL-EVALUATION</span>
                  <span className="module-bay__id">BAY-03</span>
                </div>
                <h2 style={{ fontSize: "var(--text-h4-size)", margin: "var(--space-1) 0" }}>
                  ĐÁNH GIÁ KẾT THÚC DỰ ÁN
                </h2>
                <TextField
                  id="demo-rating"
                  label="Điểm đánh giá (1-5)"
                  type="number"
                  value={String(rating)}
                  onChange={(event) => setRating(Number(event.target.value))}
                />
                <TextAreaField
                  id="demo-review"
                  label="Nhận xét chi tiết"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                />
                <div>
                  <Button
                    className="btn--tactile-orange"
                    disabled={reason.trim().length < 10}
                    onClick={() =>
                      run(
                        submitReview({
                          email: session.email,
                          projectId: project.id,
                          rating,
                          comment: reason
                        })
                      )
                    }
                  >
                    Gửi đánh giá
                  </Button>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="stack">
            <div className="module-bay stack" style={{ padding: "var(--space-5)" }}>
              <div className="module-bay__header">
                <span>SESSION-INFO</span>
                <span className="module-bay__id">AUTH-BAY</span>
              </div>
              <p className="text-caption" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
                VAI TRÒ HIỆN TẠI
              </p>
              <div style={{ fontWeight: 800, color: "var(--orange-500)", fontFamily: "ui-monospace, monospace" }}>
                {session.role} // {session.email}
              </div>
              <p className="text-muted" style={{ fontSize: "13px", margin: "var(--space-2) 0 0" }}>
                Tất cả thao tác trên màn hình này ghi nhận trực tiếp vào Ledger mô phỏng của trình duyệt.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
