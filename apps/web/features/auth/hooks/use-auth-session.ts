"use client";

import { createContext, useContext } from "react";
import type { AuthSession } from "../services/auth-api";

export type AuthSessionState = { session: AuthSession | null; hydrated: boolean; error: string; retry: () => void };
export const AuthSessionContext = createContext<AuthSessionState | null>(null);

export function useAuthSession() {
  const state = useContext(AuthSessionContext);
  if (!state) throw new Error("AuthSessionProvider is required");
  return state;
}
