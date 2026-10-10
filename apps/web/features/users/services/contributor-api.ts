import type { components } from "@genda/api-client";
import { getAuthMutationHeaders, refreshSession } from "../../auth/services/auth-api";
import { ApiRequestError, sessionApi, withSession, withSessionNoContent } from "../../auth/services/session-request";

export type ContributorProfile = components["schemas"]["ContributorProfileResponse"];
export type ContributorProfileInput = components["schemas"]["UpdateContributorProfileRequest"];
export type BackgroundType = ContributorProfileInput["backgroundType"];
export type SkillCatalogItem = components["schemas"]["SkillCatalogItemResponse"];
export type EducationEntry = components["schemas"]["EducationResponse"];
export type EducationInput = components["schemas"]["EducationRequest"];
export type EducationLevel = EducationInput["level"];
export type EducationStatus = EducationInput["status"];
export type ContributorCv = components["schemas"]["CvResponse"];
export type ApplicationReadiness = components["schemas"]["ApplicationReadinessResponse"];
export type Experience = components["schemas"]["ExperienceResponse"];
export type ContributorTier = Experience["tier"];
export type ProjectLevel = Experience["levels"][number]["level"];

export async function loadProfileData(): Promise<{ profile: ContributorProfile; skills: SkillCatalogItem[] }> {
  const [profile, skills] = await Promise.all([
    withSession(() => sessionApi.GET("/api/v1/users/me/profile"), "Không thể tải hồ sơ của bạn."),
    withSession(() => sessionApi.GET("/api/v1/skills"), "Không thể tải danh mục kỹ năng.")
  ]);
  return { profile, skills };
}

export async function saveProfile(input: ContributorProfileInput): Promise<ContributorProfile> {
  const profile = await withSession(
    async () => sessionApi.PUT("/api/v1/users/me/profile", { headers: await getAuthMutationHeaders(), body: input }),
    "Không thể lưu hồ sơ. Vui lòng thử lại."
  );
  // Tên hiển thị nằm trong phiên đăng nhập: làm mới để header đổi theo.
  await refreshSession();
  return profile;
}

export function listEducation() {
  return withSession(() => sessionApi.GET("/api/v1/users/me/education"), "Không thể tải học vấn.");
}

export function addEducation(input: EducationInput) {
  return withSession(
    async () => sessionApi.POST("/api/v1/users/me/education", { headers: await getAuthMutationHeaders(), body: input }),
    "Không thể thêm học vấn."
  );
}

export function updateEducation(educationId: string, input: EducationInput) {
  return withSession(
    async () =>
      sessionApi.PUT("/api/v1/users/me/education/{educationId}", {
        headers: await getAuthMutationHeaders(),
        params: { path: { educationId } },
        body: input
      }),
    "Không thể lưu học vấn."
  );
}

export function deleteEducation(educationId: string) {
  return withSessionNoContent(
    async () =>
      sessionApi.DELETE("/api/v1/users/me/education/{educationId}", {
        headers: await getAuthMutationHeaders(),
        params: { path: { educationId } }
      }),
    "Không thể xóa học vấn."
  );
}

/** CV hiện tại, hoặc null khi chưa nộp (backend trả 404 CV_NOT_FOUND). */
export async function getCv(): Promise<ContributorCv | null> {
  try {
    return await withSession(() => sessionApi.GET("/api/v1/users/me/cv"), "Không thể tải CV.");
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === "CV_NOT_FOUND") return null;
    throw error;
  }
}

export function uploadCv(file: File) {
  return withSession(
    async () =>
      sessionApi.PUT("/api/v1/users/me/cv", {
        headers: await getAuthMutationHeaders(),
        body: { file: file as unknown as string },
        bodySerializer: () => {
          const form = new FormData();
          form.append("file", file, file.name);
          return form;
        }
      }),
    "Không thể nộp CV. Vui lòng thử lại."
  );
}

export function fetchCvFile(): Promise<Blob> {
  return withSession(
    () => sessionApi.GET("/api/v1/users/me/cv/file", { parseAs: "blob" }) as Promise<{ data?: Blob; error?: unknown; response: Response }>,
    "Không thể mở CV."
  );
}

export function getReadiness() {
  return withSession(() => sessionApi.GET("/api/v1/users/me/readiness"), "Không thể tải danh sách điều kiện ứng tuyển.");
}

export function getExperience() {
  return withSession(() => sessionApi.GET("/api/v1/users/me/experience"), "Không thể tải hạng và điểm kinh nghiệm.");
}
