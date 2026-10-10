import { createApiClient } from "@genda/api-client";
import { refreshSession, resetCsrfToken } from "./auth-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Browser client that sends the HttpOnly session cookies. */
export const sessionApi = createApiClient(API_URL, { credentials: "include" });

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: Record<string, unknown> = {},
    public readonly requestId?: string
  ) {
    super(message);
  }
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

/**
 * Runs an authenticated call. The access cookie lives five minutes, so a 401 refreshes the session once and
 * retries; an expired CSRF token is fetched again once. Callers build headers inside `request` so a retry
 * picks up the new token.
 */
export async function withSession<T>(request: () => Promise<ApiResult<T>>, fallbackMessage: string): Promise<T> {
  const result = await send(request, fallbackMessage);
  if (result.data === undefined) throw failure(result, fallbackMessage);
  return result.data;
}

/** Same session handling for endpoints that answer 204 No Content. */
export async function withSessionNoContent(request: () => Promise<ApiResult<unknown>>, fallbackMessage: string): Promise<void> {
  await send(request, fallbackMessage);
}

async function send<T>(request: () => Promise<ApiResult<T>>, fallbackMessage: string): Promise<ApiResult<T>> {
  let result = await request();
  if (result.response.status === 401 && (await refreshSession())) {
    result = await request();
  }
  if (result.response.status === 403 && errorCode(result.error) === "CSRF_TOKEN_INVALID") {
    resetCsrfToken();
    result = await request();
  }
  if (!result.response.ok) throw failure(result, fallbackMessage);
  return result;
}

function failure(result: ApiResult<unknown>, fallbackMessage: string) {
  const error = (result.error ?? {}) as {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
  return new ApiRequestError(
    error.code ?? `HTTP_${result.response.status}`,
    error.message ?? fallbackMessage,
    result.response.status,
    error.details ?? {},
    error.requestId
  );
}

function errorCode(error: unknown) {
  return (error as { code?: string } | undefined)?.code;
}
