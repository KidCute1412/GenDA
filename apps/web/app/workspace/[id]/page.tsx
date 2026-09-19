import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { Alert } from "../../../components/ui/alert";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Stepper, type Step } from "../../../components/ui/stepper";
import { ICON_WEIGHT, SealCheck } from "../../../components/ui/icons";
import { DeliverableForm } from "../../../features/milestones/components/deliverable-form";
import { ReviewActions } from "../../../features/milestones/components/review-actions";
import { APPLICANTS, DELIVERY_HISTORY, PROJECTS, getProject } from "../../../mocks/data";
import { formatDate, formatVnd } from "../../../lib/utils/format";

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
  return { title: project ? `Không gian làm việc: ${project.title}` : "Không tìm thấy dự án" };
}

/**
 * Màn hình 6 — Không gian Quản lý Milestone & Bàn giao (docs/design.md 7.6).
 *
 * Đây là MỘT route dùng chung cho cả hai bên, không tách thành hai màn hình
 * riêng (Quyết định thiết kế DD-02): hai bên nhìn vào cùng một tiến độ mốc,
 * cùng một lịch sử bàn giao, cùng một trạng thái quỹ. Tách đôi sẽ nhân đôi màn
 * hình để rồi phải giữ cho chúng luôn khớp nhau.
 *
 * Chỉ khối thao tác ở cuối là khác nhau. Bản dựng này hiển thị CẢ HAI khối kèm
 * nhãn ghi rõ của ai, đúng như wireframe ở Mục 7.6; khi nối API thật, mỗi người
 * chỉ thấy khối tương ứng với vai trò lấy từ phiên đăng nhập.
 *
 * Mật độ ở màn hình này CHẶT hơn hẳn khu marketing — đây là nơi làm việc hằng
 * ngày, người dùng cần thấy nhiều thứ cùng lúc (design.md 4.9).
 */
const ESCROW_STAGES = ["PENDING_FUNDING", "FUNDED", "RELEASED"] as const;
const ESCROW_LABELS: Record<string, string> = {
  PENDING_FUNDING: "Chưa ghi nhận quỹ",
  FUNDED: "Đã ghi nhận quỹ",
  RELEASED: "Đã ghi nhận giải ngân"
};

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) notFound();

  // Mốc đang mở là mốc đầu tiên chưa được nghiệm thu.
  const active = project.milestones.find((milestone) => milestone.status !== "ACCEPTED") ?? project.milestones[0];
  const partner = APPLICANTS[0];

  const milestoneSteps: Step[] = project.milestones.map((milestone) => ({
    label: `Mốc ${milestone.order}: ${milestone.title}`,
    state:
      milestone.status === "ACCEPTED"
        ? "completed"
        : milestone.id === active.id
          ? "current"
          : "upcoming"
  }));

  const escrowIndex = ESCROW_STAGES.indexOf(active.escrow);

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="container has-bottom-nav">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Không gian làm việc</li>
          </ol>
        </nav>

        <div className="section--tight cluster cluster--between">
          <div>
            <p className="text-caption">{project.smeName}</p>
            <h1>{project.title}</h1>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="layout-aside">
          <div className="stack stack--lg" style={{ paddingBottom: "var(--space-section)" }}>
            {/* --- Tiến độ các mốc: cả hai bên nhìn vào đúng khối này --- */}
            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)", marginBottom: "var(--space-5)" }}>
                Tiến độ các mốc
              </h2>
              <Stepper steps={milestoneSteps} ariaLabel="Tiến độ các mốc bàn giao" />

              <ul
                className="stack stack--sm"
                style={{ listStyle: "none", margin: "var(--space-6) 0 0", padding: 0 }}
              >
                {project.milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    className="cluster cluster--between"
                    style={{
                      paddingBlock: "var(--space-3)",
                      borderTop: "1px solid var(--color-border-subtle)"
                    }}
                  >
                    <span>
                      <span style={{ color: "var(--color-text-heading)" }}>
                        Mốc {milestone.order}: {milestone.title}
                      </span>
                      <span className="text-caption num" style={{ display: "block" }}>
                        Hạn {formatDate(milestone.deadline)}
                      </span>
                    </span>
                    {/* Tiền và badge có bề rộng riêng cố định. Nếu để chúng tự
                        co theo nội dung, badge dài ngắn khác nhau sẽ đẩy cột tiền
                        lệch trục giữa các hàng, đúng thứ mà Mục 4.9 của design.md
                        cấm: số để so sánh phải nằm trên một trục dọc duy nhất. */}
                    <span className="milestone-row__meta">
                      <span className="project-row__money">{formatVnd(milestone.budget)}</span>
                      <span className="milestone-row__badge">
                        <StatusBadge status={milestone.status} />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* --- Chi tiết mốc đang mở --- */}
            <section className="card stack">
              <div className="cluster cluster--between">
                <h2 style={{ fontSize: "var(--text-h3-size)" }}>
                  Mốc {active.order}: {active.title}
                </h2>
                <StatusBadge status={active.status} />
              </div>

              <dl className="cluster" style={{ gap: "var(--space-6)", margin: 0 }}>
                <div>
                  <dt className="text-caption">Hạn của mốc</dt>
                  <dd className="num" style={{ margin: 0, color: "var(--color-text-heading)" }}>
                    {formatDate(active.deadline)}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption">Số tiền của mốc</dt>
                  <dd className="num" style={{ margin: 0, color: "var(--color-text-heading)" }}>
                    {formatVnd(active.budget)}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="text-caption">Thế nào là đạt</p>
                <p style={{ marginTop: "var(--space-1)" }}>{active.criteria}</p>
              </div>
            </section>

            {/* --- Lịch sử bàn giao: chỉ nối thêm, không sửa, không xóa --- */}
            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Lịch sử bàn giao</h2>
              <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
                Mọi lần nộp và mọi góp ý đều được giữ lại nguyên vẹn. Không bên nào xóa hay sửa được phần
                đã ghi, kể cả chúng tôi.
              </p>

              <ol className="timeline">
                {DELIVERY_HISTORY.map((event) => (
                  <li key={event.id} className="timeline__item" data-kind={event.kind}>
                    <span className="timeline__dot" aria-hidden="true" />
                    <div>
                      <p className="cluster" style={{ gap: "var(--space-2)" }}>
                        <span style={{ color: "var(--color-text-heading)", fontWeight: "var(--weight-medium)" }}>
                          {event.actor}
                        </span>
                        <span className="text-caption num">{formatDate(event.date)}</span>
                      </p>
                      <p className="text-muted" style={{ marginTop: "var(--space-1)", maxWidth: "62ch" }}>
                        {event.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* --- Khối thao tác: phần DUY NHẤT khác nhau giữa hai vai trò --- */}
            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Khu vực bàn giao của sinh viên</h2>
              <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
                Nộp kết quả cho mốc {active.order}. Doanh nghiệp nhận thông báo ngay khi bạn gửi.
              </p>
              <DeliverableForm milestoneTitle={active.title} />
            </section>

            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Thao tác của doanh nghiệp</h2>
              <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
                So kết quả sinh viên vừa nộp với tiêu chí đã thống nhất ở trên, rồi chọn một trong hai.
              </p>
              <ReviewActions enabled={active.status === "SUBMITTED"} />
            </section>
          </div>

          {/* --- Cột phụ --- */}
          <aside className="stack">
            {/* Thẻ Hồ sơ Đối tác (FR-USR-06) */}
            <section className="card stack stack--sm">
              <h2 style={{ fontSize: "var(--text-h4-size)" }}>Người làm dự án này</h2>
              <p style={{ margin: 0, color: "var(--color-text-heading)", fontWeight: "var(--weight-medium)" }}>
                {partner.name}
              </p>
              <p className="text-muted" style={{ margin: 0 }}>
                {partner.major}, {partner.year}, {partner.school}
              </p>

              {partner.verified ? (
                <p style={{ margin: 0 }}>
                  <span className="badge badge--verified">
                    <SealCheck weight={ICON_WEIGHT} aria-hidden="true" />
                    Sinh viên đã xác thực
                  </span>
                </p>
              ) : null}

              <ul className="pill-list">
                {partner.skills.map((skill) => (
                  <li key={skill} className="skill-pill">
                    {skill}
                  </li>
                ))}
              </ul>

              <div className="card__footer">
                <Link href="/portfolio/le-tuan-loc" className="btn btn--outline btn--sm">
                  Xem hồ sơ đầy đủ
                </Link>
              </div>
            </section>

            {/* Trạng thái quỹ mô phỏng (FR-MIL-06, FR-MIL-07) */}
            <section className="card stack stack--sm">
              <h2 style={{ fontSize: "var(--text-h4-size)" }}>Trạng thái quỹ của mốc này</h2>

              <ol
                className="stack stack--sm"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {ESCROW_STAGES.map((stage, index) => (
                  <li key={stage} className="cluster" style={{ gap: "var(--space-3)" }}>
                    <span
                      className="stepper__marker"
                      aria-hidden="true"
                      style={
                        index <= escrowIndex
                          ? {
                              backgroundColor: "var(--color-action-primary)",
                              borderColor: "var(--color-action-primary)",
                              color: "var(--color-text-on-accent)"
                            }
                          : undefined
                      }
                    >
                      {index + 1}
                    </span>
                    <span
                      className={index === escrowIndex ? undefined : "text-muted"}
                      style={
                        index === escrowIndex
                          ? { color: "var(--color-text-heading)", fontWeight: "var(--weight-semibold)" }
                          : undefined
                      }
                    >
                      {ESCROW_LABELS[stage]}
                      {index === escrowIndex ? (
                        <span className="visually-hidden"> - đang ở trạng thái này</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Banner Ký quỹ mô phỏng: nói thẳng giới hạn của bản MVP ngay tại
                  nơi hiển thị trạng thái quỹ, không giấu xuống chân trang. */}
              <Alert variant="warning" title="Đây là ghi nhận mô phỏng">
                GenDA ghi lại trạng thái tiền để hai bên cùng nhìn vào một chỗ, nhưng chưa giữ tiền thật.
                Việc chuyển tiền diễn ra trực tiếp giữa doanh nghiệp và sinh viên.
              </Alert>
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
