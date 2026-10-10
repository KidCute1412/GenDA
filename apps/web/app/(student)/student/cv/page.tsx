import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { CvUploader } from "../../../../features/users/components/cv-uploader";

export const metadata: Metadata = {
  title: "CV của tôi",
  description: "Nộp hoặc thay CV dạng PDF gửi kèm các đơn ứng tuyển."
};

/** Chỉ quay về đường dẫn nội bộ, tránh `next` trỏ ra trang ngoài. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

/** CV của contributor (design.md 7.7). Không còn là cổng chặn xem dự án: CV chỉ cần khi gửi đơn. */
export default async function StudentCvPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const back = safeNext((await searchParams).next);

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
                CV dạng PDF được gửi kèm mỗi đơn ứng tuyển. Hệ thống chỉ kiểm tra kỹ thuật (đúng PDF, mở được, tối đa 2 MB); doanh nghiệp là người đọc nội dung.
              </p>
            </div>

            <section className="module-bay module-bay--static">
              <div className="module-bay__header">
                <span className="module-bay__id">BAY // CV</span>
                <span>TẢI LÊN CV (PDF)</span>
              </div>
              <CvUploader id="cv-page-file" />
            </section>

            <p className="cluster" style={{ marginTop: "var(--space-4)", gap: "var(--space-4)" }}>
              {back ? <Link href={back}>Quay lại trang trước</Link> : null}
              <Link href="/student/profile">Xem hạng và hồ sơ của bạn</Link>
            </p>
          </div>
        </main>
      </StudentRouteGuard>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
