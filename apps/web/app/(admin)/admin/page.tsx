import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { StatusBadge } from "../../../components/ui/status-badge";
import { EmptyState } from "../../../components/ui/feedback";
import { AUDIT_LOG, PENDING_VERIFICATIONS, PROJECTS } from "../../../mocks/data";
import { formatDate, formatVnd } from "../../../lib/utils/format";
import { 
  Check, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  WarningCircle, 
  Paperclip,
  ICON_WEIGHT 
} from "../../../components/ui/icons";

export const metadata: Metadata = {
  title: "Bảng điều khiển quản trị // GENDA-OPS",
  description: "Duyệt dự án, duyệt minh chứng sinh viên và tra cứu nhật ký kiểm toán."
};

/**
 * Màn hình 8 — Bảng Điều khiển Quản trị viên (docs/design.md 7.8, DD-10 Neo-Industrial Ledger).
 *
 * Mật độ hiển thị cao nhất hệ thống: Đội vận hành cần nhìn rõ các thông số kỹ thuật,
 * trạng thái hàng đợi và kiểm toán hệ thống trên bảng mạch cơ khí chính xác.
 */
const TABS = [
  { key: "projects", label: "Duyệt dự án", code: "QUEUE.01" },
  { key: "students", label: "Duyệt thẻ sinh viên", code: "QUEUE.02" },
  { key: "audit", label: "Nhật ký kiểm toán", code: "LEDGER.LOG" }
];

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.find((item) => item.key === tab)?.key ?? "projects";

  const pendingProjects = PROJECTS.filter((project) => project.status === "PENDING_REVIEW");

  const counts: Record<string, number> = {
    projects: pendingProjects.length,
    students: PENDING_VERIFICATIONS.length,
    audit: AUDIT_LOG.length
  };

  return (
    <>
      <SiteHeader />

      <main id="main-content" style={{ minHeight: "calc(100vh - 64px - 200px)", paddingBottom: "var(--space-20)" }}>
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
                <span style={{ color: "var(--orange-500)", fontWeight: 800 }}>OPS // TERMINAL</span>
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
                  Hệ thống kiểm soát và điều phối vận hành sàn GenDA. Giám sát toàn bộ dòng dữ liệu, phê duyệt danh sách dự án và xác thực hồ sơ sinh viên TP.HCM.
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
                  boxShadow: "3px 3px 0px var(--machinery-shadow)" 
                }}
              >
                <div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>CHỜ DUYỆT DỰ ÁN</div>
                  <div className="num" style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--orange-500)" }}>{counts.projects}</div>
                </div>
                <div style={{ width: "1px", backgroundColor: "var(--machinery-border)", marginInline: "4px" }} />
                <div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>CHỜ XÁC MINH THẺ</div>
                  <div className="num" style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-text-heading)" }}>{counts.students}</div>
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
                  {counts[item.key]}
                </span>
              </Link>
            ))}
          </nav>

          {/* TAB 1: HÀNG ĐỢI DUYỆT DỰ ÁN */}
          {active === "projects" ? (
            pendingProjects.length === 0 ? (
              <EmptyState
                title="Hàng đợi dự án trống"
                advice="Hiện không có dự án nào đang chờ thẩm định. Dự án mới từ doanh nghiệp sẽ xuất hiện tại đây kèm thời điểm gửi."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                {pendingProjects.map((project) => {
                  const total = project.milestones.reduce((sum, m) => sum + m.budget, 0);
                  const balanced = total === project.budget;

                  return (
                    <article key={project.id} className="module-bay" style={{ padding: "var(--space-6)" }}>
                      <div className="module-bay__header" style={{ borderColor: "var(--machinery-border)" }}>
                        <span className="module-bay__id">
                          SUBMISSION // {project.id.toUpperCase()}
                        </span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                            HẠN DỰ KIẾN: {project.deadline}
                          </span>
                          <StatusBadge status={project.status} />
                        </div>
                      </div>

                      {/* Thông tin chính dự án */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
                        <div style={{ maxWidth: "75ch" }}>
                          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                            DOANH NGHIỆP: <strong style={{ color: "var(--color-text-heading)" }}>{project.smeName}</strong> ({project.smeIndustry} • {project.smeSize}) • LH: {project.smeContact}
                          </div>
                          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, textTransform: "uppercase", margin: "4px 0 var(--space-3)" }}>
                            {project.title}
                          </h2>
                          <p style={{ color: "var(--color-text-body)", fontSize: "14px", lineHeight: 1.6 }}>
                            {project.problem}
                          </p>
                        </div>

                        <div 
                          style={{ 
                            border: "2px solid var(--machinery-border)", 
                            backgroundColor: "var(--color-surface-subtle)", 
                            padding: "12px 16px", 
                            minWidth: "200px",
                            textAlign: "right"
                          }}
                        >
                          <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block" }}>
                            TỔNG NGÂN SÁCH DỰ ÁN
                          </span>
                          <span className="num" style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--color-text-heading)" }}>
                            {formatVnd(project.budget)}
                          </span>
                        </div>
                      </div>

                      {/* Tiêu chí nghiệm thu */}
                      <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", backgroundColor: "var(--color-surface-subtle)", border: "1px solid var(--machinery-border)" }}>
                        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-heading)", marginBottom: "8px" }}>
                          {"// TIÊU CHÍ NGHIỆM THU DO DOANH NGHIỆP KHAI BÁO:"}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "var(--space-4)", fontSize: "13px", color: "var(--color-text-body)" }}>
                          {project.acceptance.map((item) => (
                            <li key={item} style={{ marginBottom: "4px" }}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Bảng kiểm tra bất biến mốc bàn giao FR-MIL-02 */}
                      <div 
                        style={{ 
                          marginTop: "var(--space-4)", 
                          border: "2px solid var(--machinery-border)",
                          backgroundColor: "var(--color-surface-card)"
                        }}
                      >
                        <div 
                          style={{ 
                            padding: "8px 14px", 
                            backgroundColor: "var(--color-surface-subtle)", 
                            borderBottom: "1px solid var(--machinery-border)",
                            fontFamily: "ui-monospace, monospace",
                            fontSize: "11px",
                            fontWeight: 800,
                            display: "flex",
                            justifyContent: "space-between"
                          }}
                        >
                          <span>KIỂM TRA BẤT BIẾN MỐC BÀN GIAO (FR-MIL-02)</span>
                          <span style={{ color: balanced ? "var(--color-status-verified-text)" : "var(--color-status-danger-text)" }}>
                            {balanced ? "✓ TỶ LỆ KHỚP 100%" : "⚠ LỆCH NGÂN SÁCH"}
                          </span>
                        </div>

                        <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                          {project.milestones.map((milestone) => (
                            <div 
                              key={milestone.id} 
                              className="num" 
                              style={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                fontSize: "13px", 
                                paddingBlock: "4px",
                                borderBottom: "1px dashed var(--machinery-border)" 
                              }}
                            >
                              <span style={{ color: "var(--color-text-muted)" }}>
                                MỐC {milestone.order}: {milestone.title} (Hạn: {formatDate(milestone.deadline)})
                              </span>
                              <span style={{ fontWeight: 700 }}>{formatVnd(milestone.budget)}</span>
                            </div>
                          ))}

                          <div 
                            className="num" 
                            style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              paddingTop: "8px", 
                              fontWeight: 800, 
                              fontSize: "14px" 
                            }}
                          >
                            <span>TỔNG CỘNG CÁC MỐC</span>
                            <span 
                              style={{ 
                                color: balanced ? "var(--color-status-verified-text)" : "var(--color-status-danger-text)" 
                              }}
                            >
                              {formatVnd(total)} / {formatVnd(project.budget)} {balanced ? "(ĐẠT CHUẨN)" : "(SAI LỆCH)"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "flex-end", 
                          alignItems: "center", 
                          gap: "var(--space-3)", 
                          marginTop: "var(--space-6)",
                          paddingTop: "var(--space-4)",
                          borderTop: "2px solid var(--machinery-border)"
                        }}
                      >
                        <button 
                          type="button" 
                          className="btn--tactile-zinc"
                          style={{ height: "40px", fontSize: "12px" }}
                        >
                          Từ chối kèm lý do
                        </button>
                        <button 
                          type="button" 
                          className="btn--tactile-orange"
                          style={{ height: "40px", fontSize: "12px" }}
                        >
                          <Check weight={ICON_WEIGHT} aria-hidden="true" />
                          Duyệt xuất bản dự án
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : null}

          {/* TAB 2: HÀNG ĐỢI DUYỆT THẺ SINH VIÊN */}
          {active === "students" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {PENDING_VERIFICATIONS.map((item) => (
                <div 
                  key={item.id} 
                  className="module-bay"
                  style={{ 
                    padding: "var(--space-5)",
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    flexWrap: "wrap", 
                    gap: "var(--space-4)" 
                  }}
                >
                  <div>
                    <div className="module-bay__header" style={{ borderColor: "var(--machinery-border)", marginBottom: "8px" }}>
                      <span className="module-bay__id">VERIFICATION // {item.id.toUpperCase()}</span>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                        GỬI NGÀY {formatDate(item.submittedAt)}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
                        {item.name}
                      </h2>
                      <span className="badge badge--progress" style={{ margin: 0 }}>
                        <Clock weight={ICON_WEIGHT} aria-hidden="true" />
                        CHỜ XỬ LÝ
                      </span>
                    </div>

                    <p className="text-muted" style={{ marginTop: "4px", fontSize: "13px", fontFamily: "ui-monospace, monospace" }}>
                      {item.school}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                      <span className="badge badge--neutral" style={{ fontSize: "10px" }}>
                        <Paperclip weight={ICON_WEIGHT} aria-hidden="true" />
                        PHƯƠNG THỨC: {item.method.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button 
                      type="button" 
                      className="btn--tactile-zinc"
                      style={{ height: "38px", fontSize: "11px" }}
                    >
                      Xem minh chứng
                    </button>
                    <button 
                      type="button" 
                      className="btn--tactile-zinc"
                      style={{ height: "38px", fontSize: "11px", color: "var(--color-status-danger-text)" }}
                    >
                      Từ chối
                    </button>
                    <button 
                      type="button" 
                      className="btn--tactile-orange"
                      style={{ height: "38px", fontSize: "11px" }}
                    >
                      <ShieldCheck weight={ICON_WEIGHT} aria-hidden="true" />
                      Xác thực thẻ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* TAB 3: NHẬT KÝ KIỂM TOÁN */}
          {active === "audit" ? (
            <div 
              style={{ 
                border: "2px solid var(--machinery-border)", 
                boxShadow: "6px 6px 0px var(--machinery-shadow)",
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
    </>
  );
}
