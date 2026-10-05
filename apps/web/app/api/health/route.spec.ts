// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@genda/api-client", () => ({
  createApiClient: () => ({ GET: get })
}));
import { GET } from "./route";

afterEach(() => { vi.unstubAllEnvs(); get.mockReset(); });

describe("frontend readiness proxy", () => {
  it("returns the backend contract on success", async () => {
    vi.stubEnv("API_INTERNAL_URL", "http://backend:3001");
    get.mockResolvedValue({ data: { status: "ok", service: "genda-api" } });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", service: "genda-api" });
  });

  it("fails safely when the backend is unavailable", async () => {
    vi.stubEnv("API_INTERNAL_URL", "http://backend:3001");
    get.mockRejectedValue(new Error("private backend address"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("fails when no hosted backend URL is configured", async () => {
    vi.stubEnv("API_INTERNAL_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_API_URL", undefined);
    expect((await GET()).status).toBe(503);
    expect(get).not.toHaveBeenCalled();
  });
});
