"use client";

import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Alert } from "../../../components/ui/alert";
import { EmptyState } from "../../../components/ui/feedback";
import { ButtonLink } from "../../../components/ui/button";
import { Check } from "../../../components/ui/icons";
import { ApplyButton } from "../../applications/components/apply-button";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { CURRENT_STUDENT, TODAY } from "../../../mocks/data";
import { daysUntil, formatDate, formatVnd, matchScore } from "../../../lib/utils/format";

export function LedgerProjectDetail({ id }: { id: string }) {
  const ledger = useDemoLedger();
  const project = ledger.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <>
        <SiteHeader hideOnMobile />
        <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
          <EmptyState
            title="KHÔNG TÌM THẤY DỰ ÁN"
            advice="Dự án này không tồn tại trong hệ thống hoặc đã bị gỡ bỏ."
            action={
              <ButtonLink href="/projects" variant="primary" className="btn--tactile-orange">
                Khám phá dự án khác
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
    .map((mId) => ledger.milestones.find((m) => m.id === mId))
    .filter(Boolean) as typeof ledger.milestones;

  const score = matchScore(project.skills, CURRENT_STUDENT.skills);
  const remaining = daysUntil(project.deadline, TODAY);
  const milestoneTotal = milestones.reduce((sum, m) => sum + m.budget, 0);

  return (
    <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-8)" }}>
        <div className="layout-aside section--tight">
          {/* --- Cột nội dung chính --- */}
          <div className="stack stack--lg">
            <div className="stack stack--sm" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)" }}>
                <span className="tag-hardware">
                  BAY-ACTIVE
                </span>
                <span>{project.smeName.toUpperCase()}</span>
                <span>{"//"}</span>
                <span>{project.status}</span>
              </div>
              <h1 className="industrial-display" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", margin: "var(--space-2) 0" }}>
                {project.title}
              </h1>
              <p className="lede" style={{ color: "var(--color-text-muted)" }}>{project.summary}</p>
            </div>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange-500)" }}>
                {"[01] BÀI TOÁN DOANH NGHIỆP"}
              </h2>
              <p style={{ marginTop: "var(--space-2)", maxWidth: "65ch", lineHeight: 1.6 }}>{project.problem}</p>
            </section>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange-500)" }}>
                {"[02] TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)"}
              </h2>
              <p className="text-muted" style={{ marginTop: "var(--space-1)", fontSize: "13px" }}>
                Doanh nghiệp nghiệm thu dựa đúng trên các tiêu chí này, không thêm tiêu chí mới giữa chừng.
              </p>
              <ul style={{ marginTop: "var(--space-4)", paddingLeft: "var(--space-5)", lineHeight: 1.6 }}>
                {project.acceptance.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "var(--space-2)" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--orange-500)" }}>
                {"[03] LỘ TRÌNH GIẢI NGÂN THEO MỐC (ESCROW MILESTONES)"}
              </h2>
              <p className="text-muted" style={{ marginTop: "var(--space-1)", fontSize: "13px" }}>
                Bạn đọc được toàn bộ cách chia tiền trước khi quyết định ứng tuyển.
              </p>

              <ul style={{ listStyle: "none", margin: "var(--space-4) 0 0", padding: 0 }}>
                {milestones.map((milestone) => (
                  <li key={milestone.id} className="project-row">
                    <div className="stack stack--sm">
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)" }}>
                        {`MỐC ${milestone.order} // CRITERIA VERIFICATION`}
                      </div>
                      <h3 style={{ fontSize: "var(--text-h4-size)", margin: 0 }}>
                        {milestone.title}
                      </h3>
                      <p className="text-muted" style={{ margin: 0, maxWidth: "58ch", fontSize: "13px" }}>
                        {milestone.criteria}
                      </p>
                    </div>
                    <div className="project-row__meta stack stack--sm">
                      <p className="project-row__money">{formatVnd(milestone.budget)}</p>
                      <p className="text-caption num" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
                        HẠN: {formatDate(milestone.deadline)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div
                className="cluster cluster--between num"
                style={{
                  marginTop: "var(--space-4)",
                  padding: "var(--space-4)",
                  backgroundColor: "var(--color-surface-subtle)",
                  border: "2px solid var(--machinery-border)",
                  fontWeight: "var(--weight-bold)",
                  color: "var(--color-text-heading)",
                  fontFamily: "ui-monospace, monospace"
                }}
              >
                <span>TỔNG CỘNG NGÂN SÁCH MỐC</span>
                <span style={{ fontSize: "1.2rem", color: "var(--orange-500)" }}>{formatVnd(milestoneTotal)}</span>
              </div>
            </section>
          </div>

          {/* --- Cột phụ: thông tin quyết định + hành động --- */}
          <aside className="stack">
            <div className="module-bay stack" style={{ padding: "var(--space-5)" }}>
              <div className="module-bay__header">
                <span>SPEC-CARD</span>
                <span className="module-bay__id">BAY-ACTION</span>
              </div>

              <div>
                <p className="text-caption" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
                  NGÂN SÁCH KÝ QUỸ
                </p>
                <p className="project-row__money" style={{ fontSize: "2rem", margin: "var(--space-1) 0" }}>
                  {formatVnd(project.budget)}
                </p>
              </div>

              <div style={{ borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-3)" }}>
                <StatusBadge status={project.status} />
                <p className="text-caption" style={{ margin: "var(--space-2) 0 0", fontFamily: "ui-monospace, monospace" }}>
                  HẠN CHÓT: {formatDate(project.deadline)} (còn {remaining} ngày)
                </p>
              </div>

              {project.skills.length > 0 ? (
                <div style={{ borderTop: "1px dashed var(--machinery-border)", paddingTop: "var(--space-3)" }}>
                  <p className="text-caption" style={{ margin: "0 0 var(--space-2)", fontFamily: "ui-monospace, monospace" }}>
                    KỸ NĂNG YÊU CẦU
                  </p>
                  <ul className="pill-list">
                    {project.skills.map((skill) => {
                      const owned = score.matched.includes(skill);
                      return (
                        <li key={skill} className={`skill-pill ${owned ? "skill-pill--matched" : ""}`}>
                          {owned ? <Check weight="bold" aria-hidden="true" /> : null}
                          {skill}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <div style={{ borderTop: "2px solid var(--machinery-border)", paddingTop: "var(--space-4)" }}>
                {project.status === "PUBLISHED" ? (
                  <ApplyButton
                    projectId={project.id}
                    projectTitle={project.title}
                    smeName={project.smeName}
                    budget={project.budget}
                    verified={CURRENT_STUDENT.verification === "VERIFIED"}
                  />
                ) : (
                  <Alert variant="info">Dự án này hiện đang ở trạng thái {project.status}.</Alert>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
