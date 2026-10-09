import type { Metadata } from "next";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { SiteHeader } from "../../../../components/layout/site-header";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { ContributorProfileWorkspace } from "../../../../features/users/components/contributor-profile-workspace";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Hạng, điểm kinh nghiệm, hồ sơ tự khai, học vấn và CV của bạn."
};

export default function StudentProfilePage() {
  return (
    <>
      <SiteHeader hideOnMobile />
      <StudentRouteGuard>
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)" }}>
            <h1 className="visually-hidden">Hồ sơ của tôi</h1>
            <ContributorProfileWorkspace />
          </div>
        </main>
      </StudentRouteGuard>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
