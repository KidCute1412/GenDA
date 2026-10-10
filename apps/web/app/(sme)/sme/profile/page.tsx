import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../features/auth/components/role-route-guard";
import { AccountSessionActions } from "../../../../features/auth/components/account-session-actions";
import { SmeProfileForm } from "../../../../features/users/components/sme-profile-form";

export const metadata: Metadata = {
  title: "Hồ sơ doanh nghiệp",
  description: "Thông tin tổ chức và quản lý phiên làm việc của doanh nghiệp."
};

export default function SmeProfilePage() {

  return (
    <>
      <SiteHeader hideOnMobile />

      <RoleRouteGuard role="SME">
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)" }}>
            {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                HỒ SƠ DOANH NGHIỆP
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                Thông tin pháp nhân và tài khoản đại diện đăng bài toán kỹ thuật trên nền tảng GenDA.
              </p>
            </div>

            <div className="stack" style={{ gap: "var(--space-6)" }}>
              {/* Thông tin doanh nghiệp */}
              <SmeProfileForm />

              <AccountSessionActions />
            </div>
          </div>
        </main>
      </RoleRouteGuard>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
