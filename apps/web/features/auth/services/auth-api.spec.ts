import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ GET: vi.fn(), POST: vi.fn() }));
vi.mock("@genda/api-client", () => ({ createApiClient: () => api }));
const result = (status: number, data?: unknown, error?: unknown, headers?: Record<string, string>) => ({
  data, error, response: new Response(null, { status, headers })
});
const user = { id: "u", email: "user@example.com", role: "SME", accountState: "ACTIVE", name: "Company" };

describe("auth transport", () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); vi.stubGlobal("BroadcastChannel", undefined); });
  afterEach(() => vi.unstubAllGlobals());

  it("shares session loading and never refreshes a server failure", async () => {
    api.GET.mockResolvedValue(result(503, undefined, { code: "SERVICE_UNAVAILABLE" }));
    const { loadAuthSession } = await import("./auth-api");
    const first = loadAuthSession();
    const second = loadAuthSession();
    expect(first).toBe(second);
    await expect(first).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    expect(api.POST).not.toHaveBeenCalled();
  });

  it("refreshes only an unauthorized session and returns the real user", async () => {
    api.GET.mockResolvedValueOnce(result(401)).mockResolvedValueOnce(result(401))
      .mockResolvedValueOnce(result(200, { token: "csrf" }));
    api.POST.mockResolvedValue(result(200, user));
    const { loadAuthSession } = await import("./auth-api");
    expect(await loadAuthSession()).toEqual(user);
    expect(api.POST).toHaveBeenCalledWith("/api/v1/auth/refresh", { headers: { "X-CSRF-Token": "csrf" } });
  });

  it("returns anonymous only for an invalid refresh session", async () => {
    api.GET.mockResolvedValueOnce(result(401)).mockResolvedValueOnce(result(401))
      .mockResolvedValueOnce(result(200, { token: "csrf" }));
    api.POST.mockResolvedValue(result(401, undefined, { code: "INVALID_REFRESH_TOKEN" }));
    const { loadAuthSession } = await import("./auth-api");
    expect(await loadAuthSession()).toBeNull();
  });

  it("renews stale CSRF once and requires API success for registration", async () => {
    api.GET.mockResolvedValueOnce(result(200, { token: "old" })).mockResolvedValueOnce(result(200, { token: "new" }));
    api.POST.mockResolvedValueOnce(result(403, undefined, { code: "CSRF_TOKEN_INVALID" }))
      .mockResolvedValueOnce(result(201, user));
    const { registerAccount } = await import("./auth-api");
    expect(await registerAccount({ email: "user@example.com", name: "Company", password: "Password@1", role: "SME" })).toEqual(user);
    expect(api.POST).toHaveBeenCalledTimes(2);
    expect(api.POST.mock.calls[1][1].headers).toEqual({ "X-CSRF-Token": "new" });
  });

  it("shows rate-limit wait and preserves failed logout", async () => {
    api.GET.mockResolvedValue(result(200, { token: "csrf" }));
    api.POST.mockResolvedValue(result(429, undefined, { code: "AUTH_RATE_LIMITED" }, { "Retry-After": "900" }));
    const { login, logout } = await import("./auth-api");
    await expect(login("user@example.com", "Password@1", false)).rejects.toThrow("900 giây");
    api.POST.mockResolvedValue(result(503, undefined, { code: "SERVICE_UNAVAILABLE" }));
    await expect(logout()).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });
});
