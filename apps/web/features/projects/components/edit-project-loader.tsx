"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { ErrorState, Skeleton } from "../../../components/ui/feedback";
import { StatusBadge } from "../../../components/ui/status-badge";
import { describeProjectError } from "../level-copy";
import { getMyProject, type ManagedProject } from "../sme-api";
import { ProjectWizard } from "./project-wizard";

/** Mở lại một dự án của SME: bản nháp thì sửa tiếp được, trạng thái khác thì chỉ báo vì sao không sửa. */
export function EditProjectLoader({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ManagedProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyProject(projectId)
      .then((loaded) => active && setProject(loaded))
      .catch((cause) => active && setError(describeProjectError(cause)));
    return () => {
      active = false;
    };
  }, [projectId]);

  if (error) {
    return (
      <ErrorState
        detail={error}
        action={
          <Link href="/sme/projects" className="btn btn--outline">
            Về danh sách dự án
          </Link>
        }
      />
    );
  }
  if (!project) {
    return (
      <div className="stack" aria-busy="true" aria-label="Đang tải dự án">
        <Skeleton height="28px" width="60%" />
        <Skeleton height="160px" />
      </div>
    );
  }
  if (project.status !== "DRAFT") {
    return (
      <div className="stack">
        <div>
          <StatusBadge status={project.status} />
        </div>
        <Alert variant="info" title="Dự án này không còn là bản nháp">
          {project.status === "PENDING_REVIEW"
            ? "Dự án đang chờ quản trị viên duyệt nên tạm khóa chỉnh sửa. Nếu bị trả về, bạn sửa tiếp được tại đây."
            : "Dự án đã qua bước duyệt nên không chỉnh sửa nội dung được nữa."}
        </Alert>
        <div className="cluster">
          <Link href="/sme/projects" className="btn btn--outline">
            Về danh sách dự án
          </Link>
          {project.status === "PUBLISHED" ? (
            <Link href={`/projects/${project.id}`} className="btn btn--primary">
              Xem trang công khai
            </Link>
          ) : null}
        </div>
      </div>
    );
  }
  return <ProjectWizard initialProject={project} />;
}
