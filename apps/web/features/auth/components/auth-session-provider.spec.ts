import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { AuthSessionProvider } from "./auth-session-provider";
import { useAuthSession, type AuthSessionState } from "../hooks/use-auth-session";

const load = vi.hoisted(() => vi.fn());
vi.mock("../services/auth-api", () => ({ loadAuthSession: load, AUTH_SESSION_EVENT: "auth:test", authChannel: () => null }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("preserves a known session on network failure and allows retry", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const user = { id: "u", email: "user@example.com", role: "SME", name: "Company", accountState: "ACTIVE" };
  let state!: AuthSessionState;
  function Probe() { state = useAuthSession(); return null; }
  const root = createRoot(document.createElement("div"));
  try {
    load.mockResolvedValueOnce(user);
    await act(async () => root.render(createElement(AuthSessionProvider, null, createElement(Probe))));
    expect(state.session).toEqual(user);
    load.mockRejectedValueOnce(new Error("offline"));
    await act(async () => { window.dispatchEvent(new Event("auth:test")); });
    expect(state.session).toEqual(user);
    expect(state.error).toContain("Không thể kiểm tra");
    load.mockResolvedValueOnce(null);
    await act(async () => state.retry());
    expect(state.session).toBeNull();
    expect(state.error).toBe("");
  } finally {
    await act(async () => root.unmount());
  }
});
