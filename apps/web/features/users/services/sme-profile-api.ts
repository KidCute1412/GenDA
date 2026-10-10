import type { components } from "@genda/api-client";
import { getAuthMutationHeaders, refreshSession } from "../../auth/services/auth-api";
import { sessionApi, withSession } from "../../auth/services/session-request";

export type SmeProfile = components["schemas"]["SmeProfileResponse"];
export type SmeProfileInput = components["schemas"]["UpdateSmeProfileRequest"];

export function getSmeProfile() {
  return withSession(() => sessionApi.GET("/api/v1/users/me/sme-profile"), "Không thể tải hồ sơ doanh nghiệp.");
}

export async function saveSmeProfile(input: SmeProfileInput) {
  const profile = await withSession(
    async () => sessionApi.PUT("/api/v1/users/me/sme-profile", { headers: await getAuthMutationHeaders(), body: input }),
    "Không thể lưu hồ sơ doanh nghiệp. Vui lòng thử lại."
  );
  // The profile is already saved; a session refresh failure must not report that the save failed.
  await refreshSession().catch(() => undefined);
  return profile;
}
