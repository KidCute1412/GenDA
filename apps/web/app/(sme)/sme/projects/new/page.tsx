import type { Metadata } from "next";
import { SiteHeader } from "../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../components/layout/site-footer";
import { BottomNav } from "../../../../../components/layout/bottom-nav";
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
      <SiteHeader hideOnMobile />

      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "800px" }}>
          
          <div style={{ marginBottom: "var(--space-6)" }}>
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
      <BottomNav />
    </>
  );
}
