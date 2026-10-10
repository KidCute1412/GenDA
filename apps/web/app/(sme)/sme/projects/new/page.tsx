import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../components/layout/site-footer";
import { ProjectWizard } from "../../../../../features/projects/components/project-wizard";

export const metadata: Metadata = {
  title: "Đăng dự án mới",
  description: "Mô tả bài toán của bạn trong ba bước và gửi duyệt."
};

/**
 * Màn hình 3 — Wizard Đăng Dự án (docs/design.md 7.3).
 *
 * Trang giữ vai trò Server Component; toàn bộ phần tương tác nằm gọn trong một
 * hòn đảo client duy nhất (`ProjectWizard`). Nhờ vậy khung trang, điều hướng và
 * chân trang không phải tải thêm JavaScript nào.
 */
export default function NewProjectPage() {
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
                  <Link href="/sme/projects" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>SME PROJECTS</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>NEW // WIZARD</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                PROJECT DRAFTING
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                3-STEP PROTOCOL
              </span>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "800px" }}>
          
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div className="industrial-ruler">PROJECT INITIALIZATION // ĐĂNG BÀI TOÁN MỚI</div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
              ĐĂNG DỰ ÁN MỚI
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
              Ba bước, khoảng năm phút. Hệ thống tự động lưu nháp giữa chừng để bạn có thể quay lại bổ sung bất kỳ lúc nào.
            </p>
          </div>

          <div className="module-bay" style={{ padding: "var(--space-8)", backgroundColor: "var(--color-surface-card)" }}>
            <ProjectWizard />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
