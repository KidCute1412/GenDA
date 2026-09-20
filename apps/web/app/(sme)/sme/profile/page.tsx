import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../features/auth/components/role-route-guard";
import { AccountSessionActions } from "../../../../features/auth/components/account-session-actions";
import { Briefcase, ICON_WEIGHT } from "../../../../components/ui/icons";
import { PROJECTS } from "../../../../mocks/data";

export const metadata: Metadata = {
  title: "Hồ sơ doanh nghiệp",
  description: "Thông tin tổ chức và quản lý phiên làm việc của doanh nghiệp."
};

export default function SmeProfilePage() {
  const publishedCount = PROJECTS.filter((p) => p.smeName === "The Coffee Lab").length;

  return (
    <>
      <SiteHeader hideOnMobile />

      <RoleRouteGuard role="SME">
        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          {/* THANH THƯỚC ĐO KỸ THUẬT & ĐIỀU HƯỚNG */}
          <div className="page-breadcrumb-bar" style={{ borderBottom: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
            <div className="container" style={{ paddingBlock: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <nav aria-label="Đường dẫn phân cấp" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
                <ol className="breadcrumbs" style={{ margin: 0, padding: 0 }}>
                  <li>
                    <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>HOME</Link>
                  </li>
                  <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                  <li>
                    <Link href="/sme/projects" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>SME PORTAL</Link>
                  </li>
                  <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                  <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>PROFILE</li>
                </ol>
              </nav>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
                <span className="badge badge--verified" style={{ margin: 0 }}>
                  STATUS // ACTIVE
                </span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  ORG: THE COFFEE LAB
                </span>
              </div>
            </div>
          </div>

          <div className="container" style={{ paddingTop: "var(--space-6)" }}>
            {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div className="industrial-ruler">ENTERPRISE DOSSIER // HỒ SƠ DOANH NGHIỆP</div>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                HỒ SƠ DOANH NGHIỆP
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                Thông tin pháp nhân và tài khoản đại diện đăng bài toán kỹ thuật trên nền tảng GenDA.
              </p>
            </div>

            <div className="stack" style={{ gap: "var(--space-6)" }}>
              {/* Thông tin doanh nghiệp */}
              <article className="module-bay stack" style={{ padding: "var(--space-6)" }}>
                <div className="module-bay__header">
                  <span className="module-bay__id">ORG-01 // VERIFIED PARTNER</span>
                  <span>EST. 2026</span>
                </div>

                <div className="stack stack--sm">
                  <div className="cluster" style={{ gap: "var(--space-3)" }}>
                    <Briefcase weight={ICON_WEIGHT} aria-hidden="true" style={{ width: 24, height: 24, color: "var(--orange-500)" }} />
                    <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>The Coffee Lab</h2>
                  </div>
                  <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
                    Chuỗi đồ uống đặc sản & F&B tại Quận 1, TP.HCM. Quy mô 8 nhân sự.
                  </p>
                </div>

                <hr style={{ border: 0, borderTop: "2px dashed var(--machinery-border)", margin: "var(--space-3) 0" }} />

                <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
                  <div className="module-bay" style={{ padding: "var(--space-4)", boxShadow: "3px 3px 0px var(--machinery-shadow)" }}>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", display: "block" }}>
                      LĨNH VỰC HOẠT ĐỘNG
                    </span>
                    <strong style={{ fontSize: "14px", color: "var(--color-text-heading)", textTransform: "uppercase" }}>
                      F&B / Ẩm thực & Bán lẻ
                    </strong>
                  </div>

                  <div className="module-bay" style={{ padding: "var(--space-4)", boxShadow: "3px 3px 0px var(--machinery-shadow)" }}>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", display: "block" }}>
                      DỰ ÁN ĐÃ ĐĂNG
                    </span>
                    <strong style={{ fontSize: "14px", color: "var(--color-text-heading)" }}>
                      {publishedCount} Dự án
                    </strong>
                  </div>

                  <div className="module-bay" style={{ padding: "var(--space-4)", boxShadow: "3px 3px 0px var(--machinery-shadow)" }}>
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", display: "block" }}>
                      HẠN MỨC GIAO KÈO
                    </span>
                    <strong style={{ fontSize: "14px", color: "var(--color-action-primary)" }}>
                      1 - 5 triệu VNĐ / bài toán
                    </strong>
                  </div>
                </div>
              </article>

              {/* Phiên đăng nhập & Quản trị tài khoản */}
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
