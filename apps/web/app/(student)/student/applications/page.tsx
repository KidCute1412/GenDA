import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { ButtonLink } from "../../../../components/ui/button";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { EmptyState } from "../../../../components/ui/feedback";
import { MY_APPLICATIONS } from "../../../../mocks/data";
import { WithdrawApplicationButton } from "../../../../features/applications/components/withdraw-application-button";
import { CreatedApplicationsPanel } from "../../../../features/applications/components/created-applications-panel";
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
      <SiteHeader hideOnMobile />

      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        {/* THANH THƯỚC ĐO KỸ THUẬT & ĐIỀU HƯỚNG */}
        <div style={{ borderBottom: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
          <div className="container" style={{ paddingBlock: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <nav aria-label="Đường dẫn phân cấp" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <ol className="breadcrumbs" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>HOME</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>STUDENT // APPLICATIONS</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                ACTIVE BIDS // {applications.length}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                LEDGER VERIFIED
              </span>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div className="industrial-ruler">SUBMISSIONS LEDGER // THEO DÕI ĐƠN ỨNG TUYỂN</div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
              ĐƠN CỦA TÔI
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
              Theo dõi tiến trình xét duyệt từ doanh nghiệp đối tác theo thời gian thực. Bạn có thể rút đơn bất cứ lúc nào trước khi đối tác chốt ứng viên chính thức.
            </p>
          </div>

          <CreatedApplicationsPanel />

          {applications.length === 0 ? (
            <div className="module-bay" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <EmptyState
                title="BẠN CHƯA CÓ ĐƠN ỨNG TUYỂN NÀO"
                advice="Khám phá các bài toán kỹ thuật từ doanh nghiệp vừa và nhỏ với ngân sách từ 1-5 triệu VNĐ, có cơ chế ký quỹ và nghiệm thu rõ ràng."
                action={
                  <Link href="/projects" className="btn--tactile-orange" style={{ height: "42px", fontSize: "12px", textDecoration: "none" }}>
                    KHÁM PHÁ DỰ ÁN ĐANG TUYỂN
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="stack" style={{ gap: "var(--space-4)" }}>
              {applications.map((application) => (
                <article 
                  key={application.id} 
                  className="module-bay"
                  style={{ 
                    padding: "var(--space-5) var(--space-6)",
                    backgroundColor: "var(--color-surface-card)"
                  }}
                >
                  <div className="module-bay__header">
                    <span className="module-bay__id">BID // {application.id.toUpperCase()}</span>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                      NỘP LÚC {formatDate(application.submittedAt)}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", alignItems: "center" }}>
                    
                    {/* Thông tin dự án */}
                    <div className="stack" style={{ gap: "6px" }}>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--orange-500)", fontWeight: 700 }}>
                        {application.smeName.toUpperCase()}
                      </span>

                      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>
                        <Link
                          href={`/projects/${application.projectId}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {application.projectTitle}
                        </Link>
                      </h2>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "2px" }}>
                        <StatusBadge status={application.status} />
                        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                          {NEXT_STEP[application.status]}
                        </span>
                      </div>
                    </div>

                    {/* Ngân sách & Nút hành động xúc giác */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "8px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block" }}>
                          NGÂN SÁCH ĐỀ BÀI:
                        </span>
                        <strong className="num" style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--color-text-heading)" }}>
                          {formatVnd(application.budget)}
                        </strong>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                        {application.status === "SUBMITTED" || application.status === "SHORTLISTED" ? (
                          <WithdrawApplicationButton applicationId={application.id} />
                        ) : null}

                        {application.status === "ACCEPTED" ? (
                          <Link
                            href={`/workspace/${application.projectId}`}
                            className="btn--tactile-orange"
                            style={{ height: "36px", fontSize: "11px", textDecoration: "none" }}
                          >
                            VÀO WORKSPACE BÀN GIAO
                          </Link>
                        ) : null}

                        <Link
                          href={`/projects/${application.projectId}`}
                          className="btn--tactile-zinc"
                          style={{ height: "34px", fontSize: "11px", textDecoration: "none" }}
                        >
                          Xem đề bài
                        </Link>
                      </div>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
