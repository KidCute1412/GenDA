import { createApiClient } from "@genda/api-client";

export function getServerApiClient() {
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("Configure API_INTERNAL_URL or NEXT_PUBLIC_API_URL before calling the backend.");
  }
  return createApiClient(baseUrl);
}

export class BackendApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string
  ) {
    super(requestId ? `${message} [requestId: ${requestId}]` : message);
    this.name = "BackendApiError";
  }
}
