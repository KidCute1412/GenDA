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

      <main id="main-content" className="container">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/sme/projects">Dự án của tôi</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Đăng dự án mới</li>
          </ol>
        </nav>

        {/* Tiêu đề trang phải đứng TRƯỚC đoạn dẫn. Thiếu nó, trang mở đầu bằng
            một đoạn văn lửng lơ và cấp tiêu đề đầu tiên lại nằm trong thẻ, khiến
            cả người đọc lẫn trình đọc màn hình mất điểm neo của trang. */}
        <div className="section--tight" style={{ maxWidth: "760px" }}>
          <h1>Đăng dự án mới</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Ba bước, khoảng năm phút. Bạn lưu bản nháp giữa chừng được và quay lại soạn tiếp lúc nào cũng
            được.
          </p>
        </div>

        <div style={{ maxWidth: "760px", paddingBottom: "var(--space-section)" }}>
          <ProjectWizard />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
