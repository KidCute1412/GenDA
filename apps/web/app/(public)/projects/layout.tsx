import type { ReactNode } from "react";
import { ProjectsSwoosh } from "../../../features/projects/components/projects-swoosh";
import { CvRequiredGate } from "../../../features/users/components/cv-required-gate";

/**
 * Layout của /projects: chỉ để gắn chuyển cảnh "lướt" khi vừa vào trang danh sách dự án.
 * Layout giữ nguyên khi bấm bộ lọc (đổi query) nên hiệu ứng không chạy lại mỗi lần lọc.
 * Đồng thời chặn tài khoản sinh viên mới chưa nộp CV, chuyển sang /student/cv.
 */
export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CvRequiredGate>
        {children}
        <ProjectsSwoosh />
      </CvRequiredGate>
    </>
  );
}
