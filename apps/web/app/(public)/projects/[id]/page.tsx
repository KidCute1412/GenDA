import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { Alert } from "../../../../components/ui/alert";
import { ApplyButton } from "../../../../features/applications/components/apply-button";
import { getPublishedProject } from "../../../../features/projects/api";
import { daysUntil, formatDate, formatVnd } from "../../../../lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublishedProject(id);
  if (!project) return { title: "Không tìm thấy dự án" };

  return { title: project.title, description: project.summary };
}

/**
 * Chi tiết dự án — bước 2 của HTA 2 (đánh giá mức độ phù hợp trước khi ứng tuyển).
 *
 * Các mốc bàn giao hiển thị ĐẦY ĐỦ ngay tại đây, trước khi sinh viên bấm ứng
 * tuyển. Đó là yêu cầu của HTA 2 bước 2.3 và là lý do milestone được khai báo
 * ngay trong Wizard đăng dự án (Quyết định thiết kế DD-01): sinh viên cần biết
 * trước tiền chia thành mấy đợt, mỗi đợt bao nhiêu, thì mới đánh giá được rủi
 * ro trước khi nhận việc.
 */
export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getPublishedProject(id);

  if (!project) {
    notFound();
  }

  const remaining = daysUntil(project.deadline, new Date().toISOString().slice(0, 10));
  const milestoneTotal = project.milestones.reduce((sum, milestone) => sum + milestone.budget, 0);

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
                <span>{project.smeIndustry.toUpperCase()}</span>
              </div>
              <h1 className="industrial-display" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", margin: "var(--space-2) 0" }}>
                {project.title}
              </h1>
              <p className="lede" style={{ color: "var(--color-text-muted)" }}>{project.summary}</p>
              <p className="text-caption" style={{ margin: 0 }}>
                Người đăng: <strong>{project.posterDisplayName ?? "Chưa xác định"}</strong>
              </p>
            </div>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-500)" }}>
                {"[01] BÀI TOÁN DOANH NGHIỆP"}
              </h2>
              <p style={{ marginTop: "var(--space-2)", maxWidth: "65ch", lineHeight: 1.6 }}>{project.problem}</p>
            </section>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-500)" }}>
                {"[02] TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)"}
              </h2>
              <p className="text-muted" style={{ marginTop: "var(--space-1)", fontSize: "13px" }}>
                Doanh nghiệp nghiệm thu dựa đúng trên các tiêu chí này, không thêm tiêu chí mới giữa chừng.
              </p>
              <ul style={{ marginTop: "var(--space-4)", paddingLeft: "var(--space-5)", lineHeight: 1.6 }}>
                {project.acceptanceCriteria.map((item) => (
                  <li key={item} style={{ marginBottom: "var(--space-2)" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: "ui-monospace, monospace", fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-500)" }}>
                {"[03] LỘ TRÌNH GIẢI NGÂN THEO MỐC (ESCROW MILESTONES)"}
              </h2>
              <p className="text-muted" style={{ marginTop: "var(--space-1)", fontSize: "13px" }}>
                Bạn đọc được toàn bộ cách chia tiền trước khi quyết định ứng tuyển.
              </p>

              <ul style={{ listStyle: "none", margin: "var(--space-4) 0 0", padding: 0 }}>
                {project.milestones.map((milestone) => (
                  <li key={milestone.id} className="project-row">
                    <div className="stack stack--sm">
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)" }}>
                        {`MỐC ${milestone.order} // CRITERIA VERIFICATION`}
                      </div>
                      <h3 style={{ fontSize: "var(--text-h4-size)", margin: 0 }}>
                        {milestone.title}
                      </h3>
                      <p className="text-muted" style={{ margin: 0, maxWidth: "58ch", fontSize: "13px" }}>
                        {milestone.criteria.join(" · ")}
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

              {/* Bất biến FR-MIL-02 hiển thị công khai: tổng các mốc phải bằng
                  đúng ngân sách dự án. Cho người dùng tự đối chiếu được. */}
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
                <span style={{ fontSize: "1.2rem", color: "var(--brand-500)" }}>{formatVnd(milestoneTotal)}</span>
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
                <p className="text-caption" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>Ngân sách toàn dự án</p>
                <p className="project-row__money" style={{ fontSize: "2rem", marginTop: "4px" }}>
                  {formatVnd(project.budget)}
                </p>
              </div>

              <hr className="rule" style={{ borderTop: "2px solid var(--machinery-border)", margin: "var(--space-2) 0" }} />

              <dl className="stack stack--sm" style={{ margin: 0 }}>
                <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                  <dt className="text-muted">HẠN CHÓT</dt>
                  <dd className="num" style={{ margin: 0, fontWeight: 700 }}>
                    {formatDate(project.deadline)}
                  </dd>
                </div>
                <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                  <dt className="text-muted">THỜI GIAN CÒN</dt>
                  <dd className="num" style={{ margin: 0, fontWeight: 700, color: remaining <= 5 ? "var(--color-status-danger)" : "inherit" }}>
                    {remaining} NGÀY
                  </dd>
                </div>
                <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                  <dt className="text-muted">ỨNG VIÊN ĐÃ NỘP</dt>
                  <dd className="num" style={{ margin: 0, fontWeight: 700 }}>
                    —
                  </dd>
                </div>
                <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                  <dt className="text-muted">TRẠNG THÁI</dt>
                  <dd style={{ margin: 0 }}>
                    <StatusBadge status="PUBLISHED" />
                  </dd>
                </div>
              </dl>

              <hr className="rule" style={{ borderTop: "2px solid var(--machinery-border)", margin: "var(--space-2) 0" }} />

              <div>
                <p className="text-caption" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase", margin: 0, color: "var(--color-text-muted)" }}>
                  {"// KỸ NĂNG YÊU CẦU"}
                </p>

                <ul className="pill-list" style={{ marginTop: "var(--space-2)" }}>
                  {project.skills.map((skill) => (
                    <li key={skill.code} className="skill-pill">
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "var(--space-4)" }}>
                <ApplyButton
                  projectTitle={project.title}
                  projectId={project.id}
                  complexity={project.complexity}
                  smeName={project.smeName}
                  budget={project.budget}
                />
              </div>
            </div>

            {/* Banner Ký quỹ mô phỏng (FR-MIL-07) */}
            <div style={{
              padding: "var(--space-4)",
              border: "2px solid var(--machinery-border)",
              backgroundColor: "var(--color-surface-card)",
              fontFamily: "ui-monospace, monospace",
              fontSize: "12px"
            }}>
              <div style={{ fontWeight: 800, color: "var(--brand-500)", marginBottom: "4px" }}>
                {"// ESCROW NOTICE (FR-MIL-07)"}
              </div>
              <p style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                Ở bản MVP, GenDA ghi nhận trạng thái tiền của từng mốc để hai bên cùng nhìn vào một chỗ. Việc giải ngân tuân thủ mốc đã nghiệm thu.
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
