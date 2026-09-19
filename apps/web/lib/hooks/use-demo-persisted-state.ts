"use client";

import { useEffect, useState } from "react";

const DEMO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredValue<T> = { value: T; expiresAt: number };

/** Browser-only persistence for prototype interactions. Data automatically resets after seven days. */
export function useDemoPersistedState<T>(key: string, fallback: T, ttlMs = DEMO_TTL_MS) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(`genda-demo:${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredValue<T> | T;
        if (typeof parsed === "object" && parsed !== null && "expiresAt" in parsed && "value" in parsed) {
          if (parsed.expiresAt > Date.now()) setValue(parsed.value);
          else window.localStorage.removeItem(`genda-demo:${key}`);
        } else {
          // Migrate values saved by the prior prototype implementation.
          setValue(parsed as T);
        }
      } catch {
        window.localStorage.removeItem(`genda-demo:${key}`);
      }
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(`genda-demo:${key}`, JSON.stringify({ value, expiresAt: Date.now() + ttlMs } satisfies StoredValue<T>));
  }, [hydrated, key, ttlMs, value]);

  return [value, setValue] as const;
}
