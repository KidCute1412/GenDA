"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getDemoUiValue, setDemoUiValue } from "../../features/demo-ledger/store";
import { useDemoLedger } from "../../features/demo-ledger/use-demo-ledger";

const DEMO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** UI-only prototype state stored inside the single demo ledger. */
export function useDemoPersistedState<T>(key: string, fallback: T, ttlMs = DEMO_TTL_MS) {
  useDemoLedger();
  const value = getDemoUiValue(key, fallback);
  const setValue: Dispatch<SetStateAction<T>> = useCallback((next) => {
    const current = getDemoUiValue(key, fallback);
    setDemoUiValue(key, typeof next === "function" ? (next as (previous: T) => T)(current) : next, ttlMs);
  }, [fallback, key, ttlMs]);
  return [value, setValue] as const;
}
