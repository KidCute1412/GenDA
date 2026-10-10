import { createApiClient } from "@genda/api-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return Response.json({ status: "unavailable" }, { status: 503 });
  try {
    const { data, error } = await createApiClient(baseUrl).GET("/api/v1/health", {
      signal: AbortSignal.timeout(10_000)
    });
    if (error || !data) return Response.json({ status: "unavailable" }, { status: 503 });
    return Response.json(data);
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
