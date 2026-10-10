"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AuthSessionContext, type AuthSessionState } from "../hooks/use-auth-session";
import { AUTH_SESSION_EVENT, authChannel, loadAuthSession } from "../services/auth-api";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthSessionState, "retry">>({ session: null, hydrated: false, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const sync = async () => {
      const current = ++revision;
      try {
        const session = await loadAuthSession();
        if (active && current === revision) setState({ session, hydrated: true, error: "" });
      } catch {
        if (active && current === revision) setState(previous => ({ ...previous, hydrated: true, error: "Không thể kiểm tra phiên đăng nhập. Hãy thử lại." }));
      }
    };
    const onVisible = () => { if (document.visibilityState === "visible") void sync(); };
    const channel = authChannel();
    void sync();
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", onVisible);
    channel?.addEventListener("message", sync);
    const timer = window.setInterval(onVisible, 4 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", onVisible);
      channel?.removeEventListener("message", sync);
    };
  }, [attempt]);
  return <AuthSessionContext.Provider value={{ ...state, retry: () => setAttempt(value => value + 1) }}>{children}</AuthSessionContext.Provider>;
}
