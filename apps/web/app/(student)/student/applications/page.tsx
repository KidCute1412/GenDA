import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { ApplicationsBoard } from "../../../../features/applications/components/applications-board";
import { MyRegistrations } from "../../../../features/opportunities/components/my-registrations";

export const metadata: Metadata = {
  title: "Đơn của tôi",
  description: "Theo dõi đơn ứng tuyển dự án và lịch cộng tác viên, sự kiện bạn đã đăng ký."
};

/**
 * Quản lý đơn ứng tuyển của sinh viên (FR-APP-06, FR-APP-07): danh sách có tab lọc
 * theo trạng thái (đang chờ duyệt / được nhận / không được nhận / đã rút) kèm số đếm,
 * xem ApplicationsBoard.
 */
export default function ApplicationsPage() {
  return (
    <>
      <SiteHeader hideOnMobile />

      <StudentRouteGuard>
      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
              ĐƠN CỦA TÔI
            </h1>
          </div>

          <ApplicationsBoard />
          <MyRegistrations />
        </div>
      </main>
      </StudentRouteGuard>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
