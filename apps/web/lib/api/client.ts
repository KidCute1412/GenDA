import { createApiClient } from "@genda/api-client";

export function getApiClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("Configure NEXT_PUBLIC_API_URL before calling the backend.");
  return createApiClient(baseUrl);
}
