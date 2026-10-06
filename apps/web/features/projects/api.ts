import type { components } from "@genda/api-client";
import { BackendApiError, getServerApiClient } from "../../lib/api/client";

export type SkillCatalogItem = components["schemas"]["SkillCatalogItemResponse"];
export type ProjectSummary = components["schemas"]["ProjectSummaryResponse"];
export type ProjectDetail = components["schemas"]["ProjectDetailResponse"];
export type ProjectPage = components["schemas"]["ProjectPageResponse"];

type BrowseProjectsInput = {
  q?: string;
  skill?: string[];
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  pageSize?: number;
};

export async function listSkills(): Promise<SkillCatalogItem[]> {
  const { data, error, response } = await getServerApiClient().GET("/api/v1/skills", {
    cache: "no-store"
  });
  if (error || !data) throw toApiError(error, response.status, "Không thể tải danh mục kỹ năng.");
  return data;
}

export async function browsePublishedProjects(input: BrowseProjectsInput): Promise<ProjectPage> {
  const { data, error, response } = await getServerApiClient().GET("/api/v1/projects", {
    params: { query: input },
    cache: "no-store"
  });
  if (error || !data) throw toApiError(error, response.status, "Không thể tải danh sách dự án.");
  return data;
}

export async function getPublishedProject(projectId: string): Promise<ProjectDetail | null> {
  const { data, error, response } = await getServerApiClient().GET("/api/v1/projects/{projectId}", {
    params: { path: { projectId } },
    cache: "no-store"
  });
  if (response.status === 404) return null;
  if (error || !data) throw toApiError(error, response.status, "Không thể tải chi tiết dự án.");
  return data;
}

function toApiError(error: unknown, status: number, fallback: string) {
  const payload = error as { message?: string; requestId?: string } | undefined;
  return new BackendApiError(payload?.message ?? fallback, status, payload?.requestId);
}
