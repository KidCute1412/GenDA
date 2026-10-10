import type { Metadata } from "next";
import { SiteHeader } from "../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../components/layout/site-footer";
import { BottomNav } from "../../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../../features/auth/components/role-route-guard";
import { OpportunityForm } from "../../../../../features/opportunities/components/opportunity-form";

export const metadata: Metadata = {
  title: "Đăng tin cộng tác viên / sự kiện",
  description: "Tuyển cộng tác viên theo buổi hoặc người tham gia sự kiện, workshop. Thù lao từ 50.000đ."
};

/** Đăng tin cơ hội ngắn (docs/opportunities.md). Khung trang là Server Component, form là hòn đảo client. */
export default function NewOpportunityPage() {
  return (
    <RoleRouteGuard role="SME">
      <SiteHeader hideOnMobile />
      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "800px" }}>
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
              ĐĂNG TIN CỘNG TÁC VIÊN / SỰ KIỆN
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
              Cho việc ngắn, nhiều người, trả theo buổi hoặc theo người. Cần một người làm trọn gói theo mốc bàn giao thì đăng dự án.
            </p>
          </div>
          <div className="module-bay" style={{ padding: "var(--space-8)", backgroundColor: "var(--color-surface-card)" }}>
            <OpportunityForm />
          </div>
        </div>
      </main>
      <SiteFooter />
      <BottomNav />
    </RoleRouteGuard>
  );
}
