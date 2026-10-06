import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { CvOnboarding } from "../../../../features/users/components/cv-onboarding";

export const metadata: Metadata = {
  title: "CV của tôi",
  description: "Nộp hoặc thay CV dạng PDF gửi kèm các đơn ứng tuyển."
};

/**
 * CV của sinh viên: xem / thay CV, đồng thời là bước nộp CV bắt buộc của tài khoản mới tạo
 * (CvRequiredGate ở /projects chuyển về đây kèm `next`).
 */
export default async function StudentCvPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <>
      <SiteHeader hideOnMobile />

      <StudentRouteGuard>
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "720px" }}>
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "0 0 var(--space-1)" }}>
                CV CỦA TÔI
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                CV dạng PDF được gửi kèm mỗi đơn ứng tuyển để doanh nghiệp hiểu bạn đã làm gì. Tài khoản mới cần nộp CV trước khi xem các dự án đang tuyển.
              </p>
            </div>

            <section className="module-bay" style={{ padding: "var(--space-6)" }}>
              <div className="module-bay__header">
                <span className="module-bay__id">MODULE // CV</span>
                <span>TẢI LÊN CV (PDF)</span>
              </div>
              <CvOnboarding next={next} />
            </section>
          </div>
        </main>
      </StudentRouteGuard>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
