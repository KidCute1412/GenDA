import type { ReactNode } from "react";
import { ProjectsSwoosh } from "../../../features/projects/components/projects-swoosh";

/**
 * Layout của /projects: chỉ để gắn chuyển cảnh "lướt" khi vừa vào trang danh sách dự án.
 * Layout giữ nguyên khi bấm bộ lọc (đổi query) nên hiệu ứng không chạy lại mỗi lần lọc.
 * Ai cũng xem được dự án; điều kiện hồ sơ, CV và hạng chỉ được kiểm tra lúc gửi đơn.
 */
export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ProjectsSwoosh />
    </>
  );
}
