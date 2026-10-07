import type { Metadata } from "next";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { SiteHeader } from "../../../../components/layout/site-header";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { StudentProfileEditor } from "../../../../features/users/components/student-profile-editor";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Xem và cập nhật thông tin cá nhân, chuyên môn và kỹ năng."
};

export default function StudentProfilePage() {
  return (
    <>
      <SiteHeader hideOnMobile />
      <StudentRouteGuard>
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)" }}>
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, margin: "0 0 var(--space-1)" }}>
                Hồ sơ của tôi
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                Cập nhật thông tin nền tảng tự khai, chuyên môn và kỹ năng chuẩn để doanh nghiệp hiểu đúng năng lực của bạn.
              </p>
            </div>
            <StudentProfileEditor />
          </div>
        </main>
      </StudentRouteGuard>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
