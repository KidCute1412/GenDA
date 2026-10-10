"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "../../auth/services/session-request";
import { getExperience, getReadiness, type ApplicationReadiness, type Experience } from "../services/contributor-api";

/** Phát sau khi hồ sơ hoặc CV đổi, để checklist và hạng ở mọi nơi trên trang tải lại. */
export const STANDING_CHANGED_EVENT = "genda:contributor-standing-changed";

export function announceStandingChanged() {
  window.dispatchEvent(new Event(STANDING_CHANGED_EVENT));
}

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; readiness: ApplicationReadiness; experience: Experience }
  | { status: "error"; error: ApiRequestError };

/** Checklist ứng tuyển và hạng của contributor đang đăng nhập; `enabled=false` khi người xem không phải contributor. */
export function useContributorStanding(enabled: boolean) {
  const [state, setState] = useState<State>({ status: "idle" });

  const load = useCallback(async () => {
    setState((current) => (current.status === "ready" ? current : { status: "loading" }));
    try {
      const [readiness, experience] = await Promise.all([getReadiness(), getExperience()]);
      setState({ status: "ready", readiness, experience });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof ApiRequestError ? error : new ApiRequestError("STANDING_LOAD_FAILED", "Không thể tải hạng và điều kiện ứng tuyển.", 0)
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const reload = () => void load();
    window.addEventListener(STANDING_CHANGED_EVENT, reload);
    return () => window.removeEventListener(STANDING_CHANGED_EVENT, reload);
  }, [enabled, load]);

  return { state, reload: load };
}
