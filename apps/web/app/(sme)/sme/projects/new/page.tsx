import type { Metadata } from "next";
import { SiteHeader } from "../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../components/layout/site-footer";
import { BottomNav } from "../../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../../features/auth/components/role-route-guard";
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
    <RoleRouteGuard role="SME">
      <>
        <SiteHeader hideOnMobile />

        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "960px" }}>
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                ĐĂNG DỰ ÁN MỚI
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
                Ba bước, khoảng năm phút. Bạn lưu bản nháp được ở bất kỳ bước nào rồi quay lại bổ sung sau.
              </p>
            </div>

            <div className="module-bay" style={{ padding: "clamp(var(--space-3), 4vw, var(--space-8))", backgroundColor: "var(--color-surface-card)" }}>
              <ProjectWizard />
            </div>
          </div>
        </main>

        <SiteFooter />
        <BottomNav />
      </>
    </RoleRouteGuard>
  );
}
