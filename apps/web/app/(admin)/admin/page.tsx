import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { AUDIT_LOG } from "../../../mocks/data";
import { LedgerAuditPanel } from "../../../features/admin/components/ledger-audit-panel";
import { ProjectReviewQueue, ProjectReviewQueueCount } from "../../../features/admin/components/project-review-queue";
import { LedgerOpportunityQueue, LedgerOpportunityQueueCount } from "../../../features/admin/components/ledger-opportunity-queue";
import { RoleRouteGuard } from "../../../features/auth/components/role-route-guard";

export const metadata: Metadata = {
  title: "Bảng điều khiển quản trị // GENDA-OPS",
  description: "Duyệt dự án, duyệt đăng ký doanh nghiệp và tra cứu nhật ký kiểm toán."
};

/**
 * Màn hình 8 — Bảng Điều khiển Quản trị viên (docs/design.md 7.8, DD-10 Neo-Industrial Ledger).
 *
 * Mật độ hiển thị cao nhất hệ thống: Đội vận hành cần nhìn rõ các thông số kỹ thuật,
 * trạng thái hàng đợi và kiểm toán hệ thống trên bảng mạch cơ khí chính xác.
 */
const TABS = [
  { key: "projects", label: "Duyệt dự án", code: "QUEUE.01" },
  { key: "opportunities", label: "Duyệt tin ngắn", code: "QUEUE.02" },
  { key: "audit", label: "Nhật ký kiểm toán", code: "LEDGER.LOG" }
];

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.find((item) => item.key === tab)?.key ?? "projects";

  const counts: Record<string, number> = {
    audit: AUDIT_LOG.length
  };

  return (
    <RoleRouteGuard role="ADMIN">
      <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="has-bottom-nav" style={{ minHeight: "calc(100vh - 64px - 200px)", paddingBottom: "var(--space-20)" }}>
        {/* Terminal Header Bar */}
        <section 
          style={{ 
            backgroundColor: "var(--color-surface-subtle)", 
            borderBottom: "2px solid var(--machinery-border)",
            paddingBlock: "var(--space-8)"
          }}
        >
          <div className="container">
            {/* Technical Breadcrumbs & Identity */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--brand-500)", fontWeight: 800 }}>OPS // TERMINAL</span>
                <span>/</span>
                <span>CONTROL_BAY</span>
                <span>/</span>
                <span style={{ textTransform: "uppercase", color: "var(--color-text-heading)", fontWeight: 700 }}>{active}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-status-verified-text)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--green-600)", display: "inline-block" }} />
                  SYSTEM ACTIVE
                </span>
                <span className="text-muted">{"// SLA: ≤ 4.0H"}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <div>
                <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", margin: 0 }}>
                  Bảng Điều Khiển Quản Trị
                </h1>
                <p className="text-muted" style={{ marginTop: "var(--space-2)", fontSize: "14px", maxWidth: "65ch" }}>
                  Hệ thống kiểm soát và điều phối vận hành sàn GenDA. Theo dõi dòng dữ liệu, phê duyệt dự án và xác minh hồ sơ doanh nghiệp.
                </p>
              </div>

              {/* Machinery Stat Strip */}
              <div 
                style={{ 
                  display: "flex", 
                  gap: "12px", 
                  backgroundColor: "var(--color-surface-card)", 
                  padding: "10px 16px", 
                  border: "2px solid var(--machinery-border)", 
                }}
              >
                <div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>CHỜ DUYỆT DỰ ÁN</div>
                  <div className="num" style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--brand-500)" }}><ProjectReviewQueueCount /></div>
                </div>
                <div style={{ width: "1px", backgroundColor: "var(--machinery-border)", marginInline: "4px" }} />
                <div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>LOG KIỂM TOÁN</div>
                  <div className="num" style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-text-heading)" }}>{counts.audit}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section with Tabs */}
        <section className="container" style={{ marginTop: "var(--space-8)" }}>
          <nav className="tabs" aria-label="Khu vực làm việc quản trị" style={{ marginBottom: "var(--space-8)" }}>
            {TABS.map((item) => (
              <Link
                key={item.key}
                href={item.key === "projects" ? "/admin" : `/admin?tab=${item.key}`}
                className="tab"
                aria-current={item.key === active ? "page" : undefined}
              >
                <span style={{ opacity: 0.6, fontSize: "10px" }}>{item.code} ·</span>
                <span>{item.label}</span>
                <span 
                  className="num" 
                  style={{ 
                    marginLeft: "4px",
                    padding: "2px 6px", 
                    borderRadius: "2px", 
                    backgroundColor: item.key === active ? "rgba(255, 255, 255, 0.25)" : "var(--machinery-border)",
                    color: item.key === active ? "#ffffff" : "var(--color-text-heading)",
                    fontSize: "11px",
                    fontWeight: 800
                  }}
                >
                  {item.key === "projects" ? <ProjectReviewQueueCount /> : item.key === "opportunities" ? <LedgerOpportunityQueueCount /> : counts[item.key]}
                </span>
              </Link>
            ))}
          </nav>

          {/* TAB 4: TIN CỘNG TÁC VIÊN / SỰ KIỆN (docs/opportunities.md) */}
          {active === "opportunities" ? <LedgerOpportunityQueue /> : null}

          {/* TAB 1: HÀNG ĐỢI DUYỆT DỰ ÁN */}
          {active === "projects" ? <ProjectReviewQueue /> : null}

          {/* TAB: NHẬT KÝ KIỂM TOÁN */}
          {active === "audit" ? <LedgerAuditPanel /> : null}
          {active === "audit" ? (
            <div 
              style={{ 
                border: "2px solid var(--machinery-border)", 
                backgroundColor: "var(--color-surface-card)"
              }}
            >
              <div 
                style={{ 
                  padding: "10px 16px", 
                  backgroundColor: "var(--color-surface-subtle)", 
                  borderBottom: "2px solid var(--machinery-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 800 }}>
                  LEDGER AUDIT LOG // IMMUTABLE RECORD (FR-ADM-02, FR-ADM-03)
                </span>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  TỔNG SỐ BẢN GHI: {AUDIT_LOG.length}
                </span>
              </div>

              <div className="table-scroll">
                <table className="data-table">
                  <caption className="visually-hidden">
                    Nhật ký mọi biến động trạng thái trên hệ thống, mới nhất xếp trước
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">THỜI ĐIỂM</th>
                      <th scope="col">TÁC NHÂN</th>
                      <th scope="col">VAI TRÒ</th>
                      <th scope="col">HÀNH ĐỘNG</th>
                      <th scope="col">ĐỐI TƯỢNG</th>
                      <th scope="col">LÝ DO GHI NHẬN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_LOG.map((entry) => (
                      <tr key={entry.id}>
                        <td className="num" style={{ fontWeight: 600 }}>{entry.at}</td>
                        <td style={{ fontWeight: 700 }}>{entry.actor}</td>
                        <td>
                          <span 
                            className={`badge ${
                              entry.role === "QUẢN TRỊ" 
                                ? "badge--warning" 
                                : entry.role === "DOANH NGHIỆP" 
                                  ? "badge--neutral" 
                                  : "badge--verified"
                            }`}
                            style={{ fontSize: "10px", margin: 0 }}
                          >
                            {entry.role}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--color-text-heading)" }}>{entry.action}</td>
                        <td style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px" }}>{entry.target}</td>
                        <td style={{ whiteSpace: "normal", maxWidth: "32ch", fontSize: "12px", color: "var(--color-text-muted)" }}>
                          {entry.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter />
      <BottomNav />
      </>
    </RoleRouteGuard>
  );
}
