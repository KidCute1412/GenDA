import { createApiClient, type components } from "@genda/api-client";
import { getAuthMutationHeaders, refreshSession } from "../../auth/services/auth-api";

export type StudentProfile = components["schemas"]["StudentProfileResponse"];
export type UpdateStudentProfileInput = components["schemas"]["UpdateStudentProfileRequest"];
export type SkillCatalogItem = components["schemas"]["SkillCatalogItemResponse"];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const api = createApiClient(API_URL, { credentials: "include" });

export class StudentProfileApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly requestId?: string) {
    super(message);
  }
}

function toError(error: unknown, fallbackCode: string, fallbackMessage: string) {
  const value = error as { code?: string; message?: string; requestId?: string } | undefined;
  return new StudentProfileApiError(
    value?.code ?? fallbackCode,
    value?.message ?? fallbackMessage,
    value?.requestId
  );
}

export async function loadStudentProfileData(): Promise<{
  profile: StudentProfile;
  skills: SkillCatalogItem[];
}> {
  const [profileResult, skillsResult] = await Promise.all([
    api.GET("/api/v1/users/me/profile"),
    api.GET("/api/v1/skills")
  ]);

  if (!profileResult.data) {
    throw toError(profileResult.error, "PROFILE_LOAD_FAILED", "Không thể tải hồ sơ của bạn.");
  }
  if (!skillsResult.data) {
    throw toError(skillsResult.error, "SKILL_CATALOG_LOAD_FAILED", "Không thể tải danh mục kỹ năng.");
  }

  return { profile: profileResult.data, skills: skillsResult.data };
}

export async function updateStudentProfile(input: UpdateStudentProfileInput): Promise<StudentProfile> {
  const result = await api.PUT("/api/v1/users/me/profile", {
    headers: await getAuthMutationHeaders(),
    body: input
  });

  if (!result.data) {
    throw toError(result.error, "PROFILE_UPDATE_FAILED", "Không thể lưu hồ sơ. Vui lòng thử lại.");
  }

  await refreshSession();
  return result.data;
}
