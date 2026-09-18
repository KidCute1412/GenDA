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
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) notFound();

  const score = matchScore(project.skills, CURRENT_STUDENT.skills);
  const remaining = daysUntil(project.deadline, TODAY);
  const milestoneTotal = project.milestones.reduce((sum, milestone) => sum + milestone.budget, 0);

  return (
    <>
      <SiteHeader current="/projects" />

      <main id="main-content" className="container has-bottom-nav">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/projects">Dự án</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{project.title}</li>
          </ol>
        </nav>

        <div className="layout-aside section--tight">
          {/* --- Cột nội dung chính --- */}
          <div className="stack stack--lg">
            <div className="stack stack--sm">
              <p className="text-caption">
                {project.smeName}, {project.smeIndustry}
              </p>
              <h1>{project.title}</h1>
              <p className="lede">{project.summary}</p>
            </div>

            <section>
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Bài toán của doanh nghiệp</h2>
              <p style={{ marginTop: "var(--space-3)", maxWidth: "65ch" }}>{project.problem}</p>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Thế nào là làm xong</h2>
              <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
                Doanh nghiệp nghiệm thu dựa đúng trên các tiêu chí này, không thêm tiêu chí mới giữa chừng.
              </p>
              <ul style={{ marginTop: "var(--space-4)", paddingLeft: "var(--space-5)" }}>
                {project.acceptance.map((item) => (
                  <li key={item} style={{ marginBottom: "var(--space-2)" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Tiền được chia theo mốc</h2>
              <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
                Bạn đọc được toàn bộ cách chia tiền trước khi quyết định ứng tuyển.
              </p>

              <ul style={{ listStyle: "none", margin: "var(--space-4) 0 0", padding: 0 }}>
                {project.milestones.map((milestone) => (
                  <li key={milestone.id} className="project-row">
                    <div className="stack stack--sm">
                      <h3 style={{ fontSize: "var(--text-h4-size)" }}>
                        Mốc {milestone.order}: {milestone.title}
                      </h3>
                      <p className="text-muted" style={{ margin: 0, maxWidth: "58ch" }}>
                        {milestone.criteria}
                      </p>
                    </div>
                    <div className="project-row__meta stack stack--sm">
                      <p className="project-row__money">{formatVnd(milestone.budget)}</p>
                      <p className="text-caption num" style={{ margin: 0 }}>
                        Hạn {formatDate(milestone.deadline)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Bất biến FR-MIL-02 hiển thị công khai: tổng các mốc phải bằng
                  đúng ngân sách dự án. Cho người dùng tự đối chiếu được. */}
              <p
                className="cluster cluster--between num"
                style={{
                  marginTop: "var(--space-4)",
                  paddingTop: "var(--space-4)",
                  borderTop: "2px solid var(--color-border-subtle)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--color-text-heading)"
                }}
              >
                <span>Tổng cộng</span>
                <span>{formatVnd(milestoneTotal)}</span>
              </p>
            </section>
          </div>

          {/* --- Cột phụ: thông tin quyết định + hành động --- */}
          <aside className="stack">
            <div className="card stack">
              <div>
                <p className="text-caption">Ngân sách toàn dự án</p>
                <p className="text-display" style={{ fontSize: "var(--text-h1-size)" }}>
                  {formatVnd(project.budget)}
                </p>
              </div>

              <hr className="rule" />

              <dl className="stack stack--sm" style={{ margin: 0 }}>
                <div className="cluster cluster--between">
                  <dt className="text-muted">Hạn hoàn thành</dt>
                  <dd className="num" style={{ margin: 0 }}>
                    {formatDate(project.deadline)}
                  </dd>
                </div>
                <div className="cluster cluster--between">
                  <dt className="text-muted">Còn lại</dt>
                  <dd className="num" style={{ margin: 0 }}>
                    {remaining} ngày
                  </dd>
                </div>
                <div className="cluster cluster--between">
                  <dt className="text-muted">Đã có</dt>
                  <dd className="num" style={{ margin: 0 }}>
                    {project.applicantCount} người ứng tuyển
                  </dd>
                </div>
                <div className="cluster cluster--between">
                  <dt className="text-muted">Trạng thái</dt>
                  <dd style={{ margin: 0 }}>
                    <StatusBadge status={project.status} />
                  </dd>
                </div>
              </dl>

              <hr className="rule" />

              <div>
                <p className="match-score">
                  <span className="match-score__value">{score.percent}%</span>
                  <span className="text-caption">
                    phù hợp, trùng {score.matchedCount}/{score.total} kỹ năng của bạn
                  </span>
                </p>

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

              {project.status === "PUBLISHED" ? (
                <ApplyButton
                  projectTitle={project.title}
                  verified={CURRENT_STUDENT.verification === "VERIFIED"}
                />
              ) : (
                <>
                  <button type="button" className="btn btn--primary btn--lg" disabled>
                    Ứng tuyển ngay
                  </button>
                  <p className="hint-disabled">
                    Dự án này không còn nhận đơn vì đã có người được chọn.
                  </p>
                </>
              )}
            </div>

            {/* Banner Ký quỹ mô phỏng (FR-MIL-07). Nói rõ giới hạn của sản phẩm
                NGAY tại nơi người dùng sắp cam kết, thay vì để họ tự phát hiện
                ra sau — đây là nguyên tắc Trust-First ở dạng cụ thể nhất. */}
            <Alert variant="warning" title="Về khoản tiền của dự án này">
              Ở bản MVP, GenDA ghi nhận trạng thái tiền của từng mốc để hai bên cùng nhìn vào một chỗ,
              nhưng chưa giữ tiền thật. Việc chuyển tiền diễn ra trực tiếp giữa bạn và doanh nghiệp.
            </Alert>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <BottomNav current="/projects" />
    </>
  );
}
