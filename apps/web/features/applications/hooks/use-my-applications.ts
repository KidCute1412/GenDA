"use client";

import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { MY_APPLICATIONS, type Application } from "../../../mocks/data";

export type ApplicationStatus = Application["status"];

/** Đơn ứng tuyển của sinh viên đang đăng nhập, kèm thông tin dự án để hiển thị. */
export type MyApplication = Application;

/**
 * Nhóm trạng thái theo câu hỏi thật của sinh viên: "đơn nào còn đang chờ, đơn nào được
 * nhận, đơn nào trượt". SUBMITTED và SHORTLISTED đều là "đang chờ doanh nghiệp quyết".
 */
export const APPLICATION_GROUPS = [
  { key: "pending", label: "Đang chờ duyệt", statuses: ["SUBMITTED", "SHORTLISTED"] },
  { key: "accepted", label: "Được nhận", statuses: ["ACCEPTED"] },
  { key: "rejected", label: "Không được nhận", statuses: ["REJECTED"] },
  { key: "withdrawn", label: "Đã rút", statuses: ["WITHDRAWN"] }
] as const satisfies ReadonlyArray<{ key: string; label: string; statuses: readonly ApplicationStatus[] }>;

export type ApplicationGroupKey = (typeof APPLICATION_GROUPS)[number]["key"];

export function groupOf(status: ApplicationStatus): ApplicationGroupKey {
  return APPLICATION_GROUPS.find((group) => (group.statuses as readonly ApplicationStatus[]).includes(status))?.key ?? "pending";
}

/**
 * Một nguồn duy nhất: ledger demo (đã gồm sẵn các đơn mẫu lẫn đơn sinh viên vừa nộp).
 * Thông tin dự án lấy từ ledger, thiếu thì lấy từ dữ liệu mẫu.
 */
export function useMyApplications(): { hydrated: boolean; isStudent: boolean; items: MyApplication[] } {
  const ledger = useDemoLedger();
  const { session, hydrated } = useDemoSession();
  const isStudent = session?.role === "STUDENT";
  if (!hydrated || !isStudent) return { hydrated, isStudent, items: [] };

  const student = ledger.users.find((user) => user.email === session.email);
  const items = ledger.applications
    .filter((application) => application.studentId === student?.id)
    .map((application) => {
      const project = ledger.projects.find((item) => item.id === application.projectId);
      const sample = MY_APPLICATIONS.find((item) => item.id === application.id);
      return {
        id: application.id,
        projectId: application.projectId,
        projectTitle: project?.title ?? sample?.projectTitle ?? "Dự án",
        smeName: project?.smeName ?? sample?.smeName ?? "",
        budget: project?.budget ?? sample?.budget ?? 0,
        submittedAt: application.submittedAt,
        status: application.status as ApplicationStatus
      };
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return { hydrated, isStudent, items };
}
