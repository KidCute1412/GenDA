import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { SmeProjectList } from "../../../../features/projects/components/sme-project-list";
import { MyOpportunitiesPanel } from "../../../../features/opportunities/components/my-opportunities-panel";
import { RoleRouteGuard } from "../../../../features/auth/components/role-route-guard";

export const metadata: Metadata = {
  title: "Dự án của tôi",
  description: "Quản lý các dự án bạn đã đăng theo từng trạng thái."
};

/**
 * Trang làm việc của SME: dự án và ứng viên từ backend (SmeProjectList), cùng khối cơ hội ngắn còn chạy
 * trên ledger trình duyệt cho tới khi module opportunities có API thật.
 */
export default async function SmeProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  return (
    <RoleRouteGuard role="SME">
      <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* HEADER TRANG SME */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                DỰ ÁN CỦA TÔI
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                Kiểm soát vòng đời bài toán từ lúc lập đề bài, gửi duyệt, xét ứng viên đến nghiệm thu mốc và giải ngân ký quỹ.
              </p>
            </div>
            
            <Link 
              href="/sme/projects/new" 
              className="btn--tactile-brand"
              style={{ height: "42px", fontSize: "12px", textDecoration: "none" }}
            >
              + ĐĂNG DỰ ÁN MỚI
            </Link>
          </div>

          <MyOpportunitiesPanel />

          <SmeProjectList tab={tab} />
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
      </>
    </RoleRouteGuard>
  );
}
