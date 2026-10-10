import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { Alert } from "../../../../components/ui/alert";
import { Check, ICON_WEIGHT } from "../../../../components/ui/icons";
import { ApplyButton } from "../../../../features/applications/components/apply-button";
import { CURRENT_STUDENT, PROJECTS, TODAY, getProject } from "../../../../mocks/data";
import { daysUntil, formatDate, formatVnd, matchScore } from "../../../../lib/utils/format";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
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
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ emailVerified?: string }>;
}) {
  const { id } = await params;
  await searchParams;
  const project = getProject(id);

  if (!project) notFound();

  const score = matchScore(project.skills, CURRENT_STUDENT.skills);
  const remaining = daysUntil(project.deadline, TODAY);
  const milestoneTotal = project.milestones.reduce((sum, milestone) => sum + milestone.budget, 0);

  return (
    <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-8)" }}>
        <div className="industrial-ruler">
          {`SYS.EXPLORER // SPECIFICATION // MOD-${project.id.toUpperCase()}`}
        </div>

        <nav className="page-breadcrumb-bar" aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", textTransform: "uppercase" }}>
            <li>
              <Link href="/">ROOT</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/projects">PROJECTS</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: "var(--orange-500)", fontWeight: 700 }}>{project.id.toUpperCase()}</li>
          </ol>
        </nav>

        <div className="layout-aside section--tight">
          {/* --- Cột nội dung chính --- */}
          <div className="stack stack--lg">
            <div className="stack stack--sm" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)" }}>
                <span style={{ backgroundColor: "var(--machinery-border)", color: "var(--color-surface-card)", padding: "1px 6px", fontWeight: 800, borderRadius: "2px" }}>
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
                {project.acceptance.map((item) => (
                  <li key={item} style={{ marginBottom: "var(--space-2)" }}>
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
                    {project.applicantCount} HỒ SƠ
                  </dd>
                </div>
                <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>
                  <dt className="text-muted">TRẠNG THÁI</dt>
                  <dd style={{ margin: 0 }}>
                    <StatusBadge status={project.status} />
                  </dd>
                </div>
              </dl>

              <hr className="rule" style={{ borderTop: "2px solid var(--machinery-border)", margin: "var(--space-2) 0" }} />

              <div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  backgroundColor: score.percent >= 70 ? "rgba(249, 115, 22, 0.15)" : "var(--color-surface-subtle)",
                  color: score.percent >= 70 ? "var(--orange-500)" : "var(--color-text-muted)",
                  border: `1px solid ${score.percent >= 70 ? "var(--orange-500)" : "var(--machinery-border)"}`,
                  padding: "4px 8px",
                  borderRadius: "2px",
                  width: "100%",
                  justifyContent: "space-between"
                }}>
                  <span>[MATCH: {score.percent}%]</span>
                  <span style={{ fontSize: "10px" }}>KHỚP {score.matchedCount}/{score.total} KỸ NĂNG</span>
                </div>

                <ul className="pill-list" style={{ marginTop: "var(--space-3)" }}>
                  {project.skills.map((skill) => {
                    const owned = score.matched.includes(skill);
                    return (
                      <li key={skill} className={`skill-pill ${owned ? "skill-pill--matched" : ""}`}>
                        {owned ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                        {skill}
                        {owned ? <span className="visually-hidden">(bạn đã có kỹ năng này)</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div style={{ marginTop: "var(--space-4)" }}>
                {project.status === "PUBLISHED" ? (
                  <ApplyButton
                    projectTitle={project.title}
                    projectId={project.id}
                    smeName={project.smeName}
                    budget={project.budget}
                    verified={CURRENT_STUDENT.verification === "VERIFIED"}
                  />
                ) : (
                  <>
                    <button type="button" className="btn--tactile-zinc" style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }} disabled>
                      ỨNG TUYỂN NGAY
                    </button>
                    <p className="hint-disabled" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", marginTop: "6px" }}>
                      Dự án này không còn nhận đơn vì đã có người được chọn.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Banner Ký quỹ mô phỏng (FR-MIL-07) */}
            <div style={{
              padding: "var(--space-4)",
              border: "2px solid var(--machinery-border)",
              backgroundColor: "var(--color-surface-card)",
              boxShadow: "4px 4px 0px var(--machinery-shadow)",
              fontFamily: "ui-monospace, monospace",
              fontSize: "12px"
            }}>
              <div style={{ fontWeight: 800, color: "var(--orange-500)", marginBottom: "4px" }}>
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
