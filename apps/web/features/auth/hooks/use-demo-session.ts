"use client";

import { useEffect, useState } from "react";
import { AUTH_SESSION_EVENT, loadAuthSession, type AuthSession } from "../services/auth-api";

/** Keeps client-only demo authentication state in sync without server/client hydration drift. */
export function useDemoSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const next = await loadAuthSession();
        if (active) setSession(next);
      } finally {
        if (active) setHydrated(true);
      }
    };
    void sync();
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    return () => {
      active = false;
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
    };
  }, []);

  return { session, hydrated };
}
