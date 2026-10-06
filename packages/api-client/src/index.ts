import createClient from "openapi-fetch";
import type { paths } from "./schema";

export type { paths, components } from "./schema";

export function createApiClient(baseUrl: string, options: { credentials?: RequestCredentials } = {}) {
  return createClient<paths>({ baseUrl, ...options });
}
