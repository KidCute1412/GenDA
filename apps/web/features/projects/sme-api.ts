import type { components } from "@genda/api-client";
import { getAuthMutationHeaders } from "../auth/services/auth-api";
import { sessionApi, withSession } from "../auth/services/session-request";

export type ManagedProject = components["schemas"]["ManagedProjectResponse"];
export type ProjectDraftInput = components["schemas"]["ProjectDraftRequest"];
export type ProjectCreationPolicy = components["schemas"]["ProjectCreationPolicyResponse"];
export type ProjectComplexity = components["schemas"]["ProjectCreationPolicyResponse"]["levels"][number]["complexity"];
export type ReadinessIssue = ManagedProject["submissionIssues"][number];
export type CatalogSkill = components["schemas"]["SkillCatalogItemResponse"];

/** Chính sách ngân sách và danh mục kỹ năng đều do backend sở hữu; frontend chỉ hiển thị lại. */
export async function loadAuthoringReferenceData(): Promise<{ policy: ProjectCreationPolicy; skills: CatalogSkill[] }> {
  const [policy, skills] = await Promise.all([
    withSession(() => sessionApi.GET("/api/v1/projects/creation-policy"), "Không thể tải chính sách ngân sách."),
    withSession(() => sessionApi.GET("/api/v1/skills"), "Không thể tải danh mục kỹ năng.")
  ]);
  return { policy, skills };
}

export function listMyProjects() {
  return withSession(() => sessionApi.GET("/api/v1/sme/projects"), "Không thể tải danh sách dự án của bạn.");
}

export function getMyProject(projectId: string) {
  return withSession(
    () => sessionApi.GET("/api/v1/sme/projects/{projectId}", { params: { path: { projectId } } }),
    "Không thể tải dự án."
  );
}

export function createDraft(input: ProjectDraftInput) {
  return withSession(
    async () => sessionApi.POST("/api/v1/sme/projects", { headers: await getAuthMutationHeaders(), body: input }),
    "Không thể lưu bản nháp."
  );
}

export function saveDraft(projectId: string, input: ProjectDraftInput) {
  return withSession(
    async () =>
      sessionApi.PUT("/api/v1/sme/projects/{projectId}", {
        headers: await getAuthMutationHeaders(),
        params: { path: { projectId } },
        body: input
      }),
    "Không thể lưu bản nháp."
  );
}

export function submitProject(projectId: string) {
  return withSession(
    async () =>
      sessionApi.POST("/api/v1/sme/projects/{projectId}/submit", {
        headers: await getAuthMutationHeaders(),
        params: { path: { projectId } }
      }),
    "Không thể gửi dự án đi duyệt."
  );
}
