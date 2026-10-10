import type { Metadata } from "next";
import { SiteHeader } from "../../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../../components/layout/site-footer";
import { BottomNav } from "../../../../../../components/layout/bottom-nav";
import { RoleRouteGuard } from "../../../../../../features/auth/components/role-route-guard";
import { EditProjectLoader } from "../../../../../../features/projects/components/edit-project-loader";

export const metadata: Metadata = {
  title: "Soạn tiếp dự án",
  description: "Sửa bản nháp dự án rồi gửi duyệt."
};

/** Mở lại bản nháp đã lưu (hoặc bị quản trị viên trả về) trong cùng wizard 3 bước. */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RoleRouteGuard role="SME">
      <>
        <SiteHeader hideOnMobile />

        <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
          <div className="container" style={{ paddingTop: "var(--space-6)", maxWidth: "960px" }}>
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
                SOẠN TIẾP DỰ ÁN
              </h1>
              <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
                Nội dung bạn đã lưu được giữ nguyên. Sửa xong, gửi duyệt lại ở bước cuối.
              </p>
            </div>

            <div className="module-bay" style={{ padding: "clamp(var(--space-3), 4vw, var(--space-8))", backgroundColor: "var(--color-surface-card)" }}>
              <EditProjectLoader projectId={id} />
            </div>
          </div>
        </main>

        <SiteFooter />
        <BottomNav />
      </>
    </RoleRouteGuard>
  );
}
