import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { ButtonLink } from "../../../../components/ui/button";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { EmptyState } from "../../../../components/ui/feedback";
import { PROJECTS, TODAY } from "../../../../mocks/data";
import { daysUntil, formatDate, formatVnd } from "../../../../lib/utils/format";
import { CreatedProjectsPanel } from "../../../../features/projects/components/created-projects-panel";

export const metadata: Metadata = {
  title: "Dự án của tôi",
  description: "Quản lý các dự án bạn đã đăng theo từng trạng thái."
};

/**
 * Danh sách dự án của SME, nhóm theo trạng thái (FR-PRJ-09).
 *
 * Tab chạy bằng tham số URL nên màn hình vẫn là Server Component và người dùng
 * quay lại đúng tab đang xem khi bấm nút Back của trình duyệt.
 *
 * Mật độ ở khu này CHẶT hơn khu marketing: đây là màn hình làm việc, người dùng
 * cần thấy nhiều dòng trong một lần nhìn (design.md 4.9, biến thiên mật độ).
 */
const TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "draft", label: "Bản nháp", match: (s: string) => s === "DRAFT" },
  { key: "review", label: "Chờ duyệt", match: (s: string) => s === "PENDING_REVIEW" },
  { key: "open", label: "Đang tuyển", match: (s: string) => s === "PUBLISHED" },
  { key: "running", label: "Đang thực hiện", match: (s: string) => s === "IN_PROGRESS" },
  { key: "done", label: "Hoàn tất", match: (s: string) => s === "COMPLETED" }
];

/**
 * Mỗi trạng thái có một việc cần làm khác nhau. Đặt đúng một hành động chính
 * cho mỗi dòng, thay vì bày hết mọi nút lên rồi để người dùng tự đoán.
 */
function primaryAction(project: (typeof PROJECTS)[number]) {
  switch (project.status) {
    case "DRAFT":
      return { href: "/sme/projects/new", label: "Soạn tiếp", variant: "primary" };
    case "PUBLISHED":
      return {
        href: `/sme/projects/${project.id}/review`,
        label: `Xem ${project.applicantCount} ứng viên`,
        variant: "primary"
      };
    case "IN_PROGRESS":
      return { href: `/workspace/${project.id}`, label: "Vào không gian làm việc", variant: "primary" };
    default:
      return { href: `/projects/${project.id}`, label: "Xem dự án", variant: "outline" };
  }
}

export default async function SmeProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.find((item) => item.key === tab) ?? TABS[0];
  const projects = PROJECTS.filter((project) => activeTab.match(project.status));

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="industrial-canvas" style={{ paddingBottom: "var(--space-16)" }}>
        {/* THANH THƯỚC ĐO KỸ THUẬT & ĐIỀU HƯỚNG */}
        <div style={{ borderBottom: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
          <div className="container" style={{ paddingBlock: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <nav aria-label="Đường dẫn phân cấp" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <ol className="breadcrumbs" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>HOME</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li>
                  <span style={{ color: "var(--color-text-muted)" }}>SME PORTAL</span>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>PROJECTS // MANAGER</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                ORG: THE COFFEE LAB
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                TOTAL: {PROJECTS.length} PROJECTS
              </span>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* HEADER TRANG SME */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
            <div>
              <div className="industrial-ruler">ENTERPRISE CONSOLE // QUẢN LÝ DỰ ÁN</div>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                DỰ ÁN CỦA TÔI
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
                Kiểm soát vòng đời bài toán kỹ thuật từ lúc lập đề bài, xét duyệt ứng viên đến giám sát nghiệm thu mốc và giải ngân ký quỹ.
              </p>
            </div>
            
            <Link 
              href="/sme/projects/new" 
              className="btn--tactile-orange"
              style={{ height: "42px", fontSize: "12px", textDecoration: "none" }}
            >
              + ĐĂNG DỰ ÁN MỚI
            </Link>
          </div>

          {/* THANH TAB LỌC TRẠNG THÁI KIỂU HARDWARE SWITCHER */}
          <div 
            style={{ 
              display: "flex", 
              gap: "4px", 
              overflowX: "auto", 
              paddingBottom: "8px", 
              marginBottom: "var(--space-6)",
              borderBottom: "2px solid var(--machinery-border)"
            }}
          >
            {TABS.map((item) => {
              const count = PROJECTS.filter((project) => item.match(project.status)).length;
              const isSelected = item.key === activeTab.key;
              return (
                <Link
                  key={item.key}
                  href={item.key === "all" ? "/sme/projects" : `/sme/projects?tab=${item.key}`}
                  className="chip"
                  aria-current={isSelected ? "page" : undefined}
                  style={{
                    height: "34px",
                    paddingInline: "12px",
                    fontSize: "11px",
                    fontFamily: "ui-monospace, monospace",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    backgroundColor: isSelected ? "var(--machinery-border)" : "var(--color-surface-card)",
                    color: isSelected ? "#ffffff" : "var(--color-text-body)",
                    borderColor: "var(--machinery-border)"
                  }}
                >
                  <span>{item.label}</span>
                  <span 
                    style={{ 
                      marginLeft: "6px", 
                      padding: "1px 6px", 
                      fontSize: "10px", 
                      borderRadius: "2px",
                      backgroundColor: isSelected ? "var(--orange-500)" : "var(--color-surface-subtle)",
                      color: isSelected ? "#ffffff" : "var(--color-text-muted)"
                    }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>

          <CreatedProjectsPanel />

          {/* NỘI DUNG DANH SÁCH DỰ ÁN */}
          {projects.length === 0 ? (
            <div className="module-bay" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <EmptyState
                title="CHƯA CÓ DỰ ÁN NÀO Ở MỤC NÀY"
                advice="Khi bạn đăng một bài toán mới, hệ thống sẽ hỗ trợ lưu nháp, kiểm duyệt tiêu chí nghiệm thu rồi xuất bản cho sinh viên nộp đơn."
                action={
                  <Link href="/sme/projects/new" className="btn--tactile-orange" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>
                    ĐĂNG DỰ ÁN ĐẦU TIÊN
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="stack" style={{ gap: "var(--space-4)" }}>
              {projects.map((project) => {
                const action = primaryAction(project);
                return (
                  <article 
                    key={project.id} 
                    className="module-bay"
                    style={{ 
                      padding: "var(--space-5) var(--space-6)",
                      backgroundColor: "var(--color-surface-card)"
                    }}
                  >
                    <div className="module-bay__header">
                      <span className="module-bay__id">PROJECT // {project.id.toUpperCase()}</span>
                      <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                        HẠN CHÓT: {formatDate(project.deadline)}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", alignItems: "center" }}>
                      
                      {/* Cột thông tin */}
                      <div className="stack" style={{ gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <StatusBadge status={project.status} />
                          {project.status === "PUBLISHED" && project.applicantCount > 0 ? (
                            <span className="badge badge--progress" style={{ margin: 0 }}>
                              {project.applicantCount} ỨNG VIÊN ĐÃ NỘP
                            </span>
                          ) : null}
                        </div>

                        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>
                          <Link
                            href={`/projects/${project.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {project.title}
                          </Link>
                        </h2>

                        <p className="text-muted" style={{ margin: 0, fontSize: "12px", fontFamily: "ui-monospace, monospace" }}>
                          {project.milestones.length} MỐC BÀN GIAO // {project.skills.join(" • ")}
                          {project.status === "PUBLISHED" || project.status === "IN_PROGRESS"
                            ? ` (CÒN ${daysUntil(project.deadline, TODAY)} NGÀY)`
                            : ""}
                        </p>
                      </div>

                      {/* Cột ngân sách & Nút hành động */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "8px" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block" }}>
                            NGÂN SÁCH DỰ ÁN:
                          </span>
                          <strong className="num" style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--color-text-heading)" }}>
                            {formatVnd(project.budget)}
                          </strong>
                        </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                          <Link
                            href={action.href}
                            className={action.variant === "primary" ? "btn--tactile-orange" : "btn--tactile-zinc"}
                            style={{ height: "36px", fontSize: "11px", textDecoration: "none" }}
                          >
                            {action.label.toUpperCase()}
                          </Link>

                          {project.status !== "DRAFT" ? (
                            <Link
                              href={`/projects/${project.id}`}
                              className="chip"
                              style={{ height: "36px", fontSize: "11px", textDecoration: "none", backgroundColor: "var(--color-surface-subtle)" }}
                            >
                              Xem trang công khai
                            </Link>
                          ) : null}
                        </div>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
