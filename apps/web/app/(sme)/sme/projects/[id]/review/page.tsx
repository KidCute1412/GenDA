import type { Metadata } from "next";
import { SiteHeader } from "../../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../../components/layout/site-footer";
import { BottomNav } from "../../../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../../../features/auth/components/role-route-guard";
import { ApplicantReview } from "../../../../../../features/applications/components/applicant-review";

export const metadata: Metadata = {
  title: "Xét duyệt ứng viên",
  description: "Xem ứng viên theo độ khớp kỹ năng, hạng và CV, rồi chọn một người cho dự án."
};

/** Màn hình 5, xét và chọn ứng viên (docs/design.md 7.5). Dữ liệu từ API ứng tuyển thật. */
export default async function ReviewApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RoleRouteGuard role="SME">
      <>
        <SiteHeader hideOnMobile />
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)" }}>
            <ApplicantReview projectId={id} />
          </div>
        </main>
        <SiteFooter />
        <BottomNav />
      </>
    </RoleRouteGuard>
  );
}
