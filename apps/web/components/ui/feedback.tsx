import type { ReactNode } from "react";
import { SpotEmpty, SpotError } from "./spots";

/**
 * Ba trong bốn trạng thái giao diện chuẩn mực của docs/design.md Mục 8
 * (NFR-UX-02). Trạng thái thứ tư — Success — không phải một component tĩnh mà
 * là hành vi sau thao tác, nên nằm ở từng màn hình.
 */

/* --------------------------------------------------------------------------
   8.1 — Đang tải: Skeleton Shimmer
   Tuyệt đối không dùng vòng quay spinner giữa trang trắng. Skeleton phải mô
   phỏng ĐÚNG hình khối của nội dung sắp hiển thị; đó là lý do nó tồn tại: khử
   giật bố cục (CLS).
   -------------------------------------------------------------------------- */

export function Skeleton({ width, height, className }: { width?: string; height?: string; className?: string }) {
  return (
    <span
      className={`skeleton ${className ?? ""}`}
      style={{ display: "block", width: width ?? "100%", height: height ?? "1em" }}
      aria-hidden="true"
    />
  );
}

/** Giữ chỗ cho danh sách dự án ở `/projects` — đúng số dòng, đúng chiều cao. */
export function ProjectListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Đang tải danh sách dự án</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="project-row" aria-hidden="true">
          <div className="stack stack--sm">
            <Skeleton width="30%" height="0.75rem" />
            <Skeleton width="70%" height="1.5rem" />
            <div className="cluster">
              <Skeleton width="72px" height="1.25rem" />
              <Skeleton width="60px" height="1.25rem" />
              <Skeleton width="84px" height="1.25rem" />
            </div>
          </div>
          <div className="project-row__meta stack stack--sm">
            <Skeleton width="140px" height="1.25rem" />
            <Skeleton width="100px" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   8.2 — Trống: Helpful Guidance
   Không để màn hình trắng trơn gây hoang mang. Bắt buộc đủ bốn phần: hình minh
   họa, thông điệp, lời khuyên cụ thể, và nút hành động.
   -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  advice,
  action
}: {
  title: string;
  advice: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-block">
      <SpotEmpty />
      <h3>{title}</h3>
      <p className="text-muted">{advice}</p>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------------------
   8.3 — Lỗi: Humane & Actionable
   Không hiển thị đoạn mã kỹ thuật ("AxiosError", "Uncaught TypeError"). Thông
   báo tiếng Việt nêu rõ nguyên nhân, kèm mã truy vết (NFR-OPS-02) để đội hỗ trợ
   tra được đúng yêu cầu, và nút thử lại gọi lại API mà không tải lại cả trang.
   -------------------------------------------------------------------------- */

export function ErrorState({
  title = "Chúng tôi chưa tải được dữ liệu này",
  detail,
  requestId,
  action
}: {
  title?: string;
  detail: string;
  requestId?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-block" role="alert">
      <SpotError />
      <h3>{title}</h3>
      <p className="text-muted">{detail}</p>
      {requestId ? (
        <p className="text-caption num">
          Mã yêu cầu: {requestId} - gửi mã này cho chúng tôi nếu bạn cần hỗ trợ.
        </p>
      ) : null}
      {action}
    </div>
  );
}
