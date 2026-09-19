"use client";

import { useLayoutEffect, useState } from "react";
import { DEMO_SESSION_EVENT, getDemoSession, type DemoSession } from "../services/demo-session";

/** Keeps client-only demo authentication state in sync without server/client hydration drift. */
export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read browser storage before the next paint so role-based navigation does not flash guest UI.
  useLayoutEffect(() => {
    const sync = () => setSession(getDemoSession());
    sync();
    setHydrated(true);
    window.addEventListener(DEMO_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { session, hydrated };
}
