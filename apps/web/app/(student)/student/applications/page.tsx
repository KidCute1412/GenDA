import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { ButtonLink } from "../../../../components/ui/button";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { EmptyState } from "../../../../components/ui/feedback";
import { MY_APPLICATIONS } from "../../../../mocks/data";
import { formatDate, formatVnd } from "../../../../lib/utils/format";

export const metadata: Metadata = {
  title: "Đơn của tôi",
  description: "Theo dõi trạng thái các đơn ứng tuyển bạn đã gửi."
};

/**
 * Quản lý đơn ứng tuyển của sinh viên (FR-APP-06, FR-APP-07).
 *
 * Mỗi trạng thái đi kèm MỘT dòng nói rõ điều gì đang xảy ra và bạn cần làm gì
 * tiếp. Chỉ hiện nhãn trạng thái là chưa đủ: "Đã nộp" không trả lời được câu
 * hỏi thật sự của sinh viên, là "vậy giờ tôi chờ hay tôi làm gì nữa?".
 */
const NEXT_STEP: Record<string, string> = {
  SUBMITTED: "Doanh nghiệp đang xem. Bạn rút đơn được cho tới khi họ chọn người.",
  SHORTLISTED: "Bạn đã vào danh sách rút gọn. Doanh nghiệp có thể liên hệ để hỏi thêm.",
  ACCEPTED: "Bạn đã được chọn. Vào không gian làm việc để xem mốc bàn giao đầu tiên.",
  REJECTED: "Lần này doanh nghiệp chọn bạn khác. Đơn này đã khép lại.",
  WITHDRAWN: "Bạn đã rút đơn này."
};

export default function ApplicationsPage() {
  const applications = MY_APPLICATIONS;

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
            <li aria-current="page">Đơn của tôi</li>
          </ol>
        </nav>

        <div className="section--tight">
          <h1>Đơn của tôi</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Toàn bộ đơn bạn đã gửi và tình trạng hiện tại của từng đơn.
          </p>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="Bạn chưa gửi đơn nào"
            advice="Hãy xem qua danh sách dự án đang tuyển. Mỗi dự án đều ghi rõ ngân sách và các mốc bàn giao trước khi bạn quyết định."
            action={<ButtonLink href="/projects">Xem dự án đang tuyển</ButtonLink>}
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {applications.map((application) => (
              <li key={application.id} className="project-row">
                <div className="stack stack--sm">
                  <p className="text-caption">{application.smeName}</p>

                  <h2 style={{ fontSize: "var(--text-h4-size)" }}>
                    <Link
                      href={`/projects/${application.projectId}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {application.projectTitle}
                    </Link>
                  </h2>

                  <p className="cluster">
                    <StatusBadge status={application.status} />
                    <span className="text-caption num">
                      Gửi ngày {formatDate(application.submittedAt)}
                    </span>
                  </p>

                  <p className="text-muted" style={{ margin: 0, maxWidth: "60ch" }}>
                    {NEXT_STEP[application.status]}
                  </p>
                </div>

                <div className="project-row__meta stack stack--sm">
                  <p className="project-row__money">{formatVnd(application.budget)}</p>

                  {/* Quy tắc Vàng số 6 — cho phép hoàn tác dễ dàng: sinh viên rút
                      được đơn khi chưa có quyết định (FR-APP-06). Đơn đã khép
                      lại thì không hiện nút, vì không còn gì để hoàn tác. */}
                  {application.status === "SUBMITTED" || application.status === "SHORTLISTED" ? (
                    <p style={{ margin: 0 }}>
                      <button type="button" className="btn btn--ghost btn--sm">
                        Rút đơn này
                      </button>
                    </p>
                  ) : null}

                  {application.status === "ACCEPTED" ? (
                    <p style={{ margin: 0 }}>
                      <Link
                        href={`/workspace/${application.projectId}`}
                        className="btn btn--primary btn--sm"
                      >
                        Vào không gian làm việc
                      </Link>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <SiteFooter />
      <BottomNav current="/student/applications" />
    </>
  );
}
