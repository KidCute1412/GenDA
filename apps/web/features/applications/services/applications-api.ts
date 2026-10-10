import type { components } from "@genda/api-client";
import { getAuthMutationHeaders } from "../../auth/services/auth-api";
import { sessionApi, withSession } from "../../auth/services/session-request";

export type MyApplication = components["schemas"]["ContributorApplicationResponse"];
export type ApplicationStatus = MyApplication["status"];
export type ProjectApplicants = components["schemas"]["ProjectApplicantsResponse"];
export type Applicant = components["schemas"]["ApplicantResponse"];
export type ApplicationCount = components["schemas"]["ApplicationCountResponse"];

/** Mã điều kiện còn thiếu trong lỗi APPLICATION_NOT_ELIGIBLE (details.missing). */
export const MISSING_COPY: Record<string, string> = {
  ACCOUNT_INACTIVE: "Tài khoản chưa hoạt động.",
  PROFILE_INCOMPLETE: "Hồ sơ còn thiếu nền tảng, chuyên môn hoặc kỹ năng.",
  CV_NOT_READY: "Chưa có CV PDF qua kiểm tra kỹ thuật.",
  TIER_REQUIRED: "Hạng hiện tại chưa đủ cho mức dự án này."
};

export function applyToProject(projectId: string, coverLetter: string) {
  return withSession(
    async () => sessionApi.POST("/api/v1/applications", { headers: await getAuthMutationHeaders(), body: { projectId, coverLetter } }),
    "Không thể gửi đơn ứng tuyển."
  );
}

export function listMyApplications() {
  return withSession(() => sessionApi.GET("/api/v1/applications/me"), "Không thể tải đơn ứng tuyển của bạn.");
}

export function withdrawApplication(applicationId: string) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/applications/{applicationId}/withdraw", {
        headers: await getAuthMutationHeaders(),
        params: { path: { applicationId } }
      }),
    "Không thể rút đơn."
  );
}

export function listApplicants(projectId: string) {
  return withSession(
    () => sessionApi.GET("/api/v1/sme/projects/{projectId}/applications", { params: { path: { projectId } } }),
    "Không thể tải danh sách ứng viên."
  );
}

export function countApplications(projectIds: string[]) {
  if (projectIds.length === 0) return Promise.resolve([] as ApplicationCount[]);
  return withSession(
    () => sessionApi.GET("/api/v1/sme/applications/counts", { params: { query: { projectId: projectIds } } }),
    "Không thể đếm đơn ứng tuyển."
  );
}

export function shortlistApplicant(applicationId: string) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/sme/applications/{applicationId}/shortlist", {
        headers: await getAuthMutationHeaders(),
        params: { path: { applicationId } }
      }),
    "Không thể đưa ứng viên vào danh sách rút gọn."
  );
}

export function acceptApplicant(applicationId: string) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/sme/applications/{applicationId}/accept", {
        headers: await getAuthMutationHeaders(),
        params: { path: { applicationId } }
      }),
    "Không thể chấp nhận ứng viên."
  );
}

export function fetchApplicantCv(applicationId: string): Promise<Blob> {
  return withSession(
    () =>
      sessionApi.GET("/api/v1/sme/applications/{applicationId}/cv", {
        params: { path: { applicationId } },
        parseAs: "blob"
      }) as Promise<{ data?: Blob; error?: unknown; response: Response }>,
    "Không thể mở CV của ứng viên."
  );
}

/** Mở PDF ở tab mới: mở tab trước khi chờ tải để trình duyệt không chặn như cửa sổ bật lên. */
export async function openPdf(load: () => Promise<Blob>) {
  const tab = window.open("", "_blank");
  try {
    const url = URL.createObjectURL(await load());
    if (tab) tab.location.href = url;
    else window.location.assign(url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
