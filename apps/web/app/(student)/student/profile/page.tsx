import type { Metadata } from "next";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { SiteHeader } from "../../../../components/layout/site-header";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { StudentProfileEditor } from "../../../../features/users/components/student-profile-editor";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Xem và cập nhật thông tin học tập, kỹ năng của sinh viên."
};

export default function StudentProfilePage() {
  return (
    <>
      <SiteHeader hideOnMobile />
      <StudentRouteGuard>
      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "0 0 var(--space-1)" }}>
              HỒ SƠ CỦA TÔI
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
              Hồ sơ này là căn cứ để doanh nghiệp đối tác đánh giá và giao việc. Khai báo chính xác các kỹ năng chuẩn để hệ thống tự động so khớp các bài toán kỹ thuật phù hợp nhất.
            </p>
          </div>

          {/* BANNER THÔNG BÁO XÁC THỰC */}
          <div 
            style={{ 
              border: "2px solid var(--machinery-border)", 
              backgroundColor: "var(--color-surface-card)", 
              padding: "var(--space-4) var(--space-5)",
              marginBottom: "var(--space-6)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <div style={{ 
                backgroundColor: verified ? "var(--color-status-verified)" : "var(--brand-500)", 
                color: "#ffffff", 
                padding: "6px", 
                borderRadius: "2px", 
                flexShrink: 0,
                marginTop: "2px"
              }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 900 }}>
                  {verified ? "✓" : "!"}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                  <strong style={{ fontSize: "13px", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "var(--color-text-heading)" }}>
                    {banner.title}
                  </strong>
                  <span className="badge badge--verified" style={{ fontSize: "10px", padding: "1px 6px" }}>
                    {CURRENT_STUDENT.verification}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-body)", lineHeight: 1.5 }}>
                  {banner.body}
                </p>
                {CURRENT_STUDENT.verification === "REJECTED" ? (
                  <div style={{ marginTop: "var(--space-3)" }}>
                    <ReuploadVerificationButton />
                  </div>
                ) : null}
              </div>
            </div>
            <StudentProfileEditor />
          </div>
        </div>
      </main>
      </StudentRouteGuard>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
