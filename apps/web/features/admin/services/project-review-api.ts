import { getAuthMutationHeaders } from "../../auth/services/auth-api";
import { sessionApi, withSession } from "../../auth/services/session-request";
import type { ProjectComplexity } from "../../projects/sme-api";

export function listPendingProjects() {
  return withSession(() => sessionApi.GET("/api/v1/admin/projects/pending"), "Không thể tải hàng đợi duyệt dự án.");
}

export function publishProject(projectId: string) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/admin/projects/{projectId}/publish", {
        headers: await getAuthMutationHeaders(),
        params: { path: { projectId } }
      }),
    "Không thể xuất bản dự án."
  );
}

export function returnProject(projectId: string, reason: string, suggestedComplexity?: ProjectComplexity) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/admin/projects/{projectId}/return", {
        headers: await getAuthMutationHeaders(),
        params: { path: { projectId } },
        body: { reason, suggestedComplexity }
      }),
    "Không thể trả dự án về."
  );
}
