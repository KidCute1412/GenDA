import { SiteHeader } from "../../../components/layout/site-header";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { ProjectListSkeleton } from "../../../components/ui/feedback";

/**
 * Trạng thái Đang tải của danh sách dự án (docs/design.md 8.1).
 *
 * Next.js render tệp này trong lúc màn hình `/projects` đang được chuẩn bị, nên
 * skeleton ở đây là hiện thực THẬT của trạng thái loading chứ không phải một
 * mẫu trưng bày. Khung xương mô phỏng đúng hình khối của danh sách sắp hiện ra,
 * nên bố cục không giật khi dữ liệu về (CLS).
 */
export default function Loading() {
  return (
    <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="container has-bottom-nav">
        <div className="section--tight">
          <h1>Dự án đang tuyển</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Mọi dự án ở đây đều đã qua kiểm duyệt, có mốc bàn giao và ngân sách rõ ràng từ trước.
          </p>
        </div>

        <ProjectListSkeleton rows={4} />
      </main>

      <BottomNav />
    </>
  );
}
