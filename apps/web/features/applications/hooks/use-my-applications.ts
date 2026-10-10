"use client";

import { useCallback, useEffect, useState } from "react";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { listMyApplications, type ApplicationStatus, type MyApplication } from "../services/applications-api";

export type { ApplicationStatus, MyApplication };

/** Phát sau khi gửi hoặc rút đơn, để bảng đơn và số đếm trên menu tải lại. */
export const APPLICATIONS_CHANGED_EVENT = "genda:applications-changed";

export function announceApplicationsChanged() {
  window.dispatchEvent(new Event(APPLICATIONS_CHANGED_EVENT));
}

/**
 * Nhóm trạng thái theo câu hỏi thật của contributor: "đơn nào còn đang chờ, đơn nào được nhận, đơn nào trượt".
 * SUBMITTED và SHORTLISTED đều là "đang chờ doanh nghiệp quyết".
 */
export const APPLICATION_GROUPS = [
  { key: "pending", label: "Đang chờ duyệt", statuses: ["SUBMITTED", "SHORTLISTED"] },
  { key: "accepted", label: "Được nhận", statuses: ["ACCEPTED"] },
  { key: "rejected", label: "Không được nhận", statuses: ["REJECTED"] },
  { key: "withdrawn", label: "Đã rút", statuses: ["WITHDRAWN"] }
] as const satisfies ReadonlyArray<{ key: string; label: string; statuses: readonly ApplicationStatus[] }>;

export type ApplicationGroupKey = (typeof APPLICATION_GROUPS)[number]["key"];

export function groupOf(status: ApplicationStatus): ApplicationGroupKey {
  return APPLICATION_GROUPS.find((group) => (group.statuses as readonly ApplicationStatus[]).includes(status))?.key ?? "pending";
}

/** Đơn ứng tuyển của contributor đang đăng nhập, từ API (FR-APP-07). */
export function useMyApplications(): {
  hydrated: boolean;
  isStudent: boolean;
  loading: boolean;
  error: string | null;
  items: MyApplication[];
  reload: () => Promise<void>;
} {
  const { session, hydrated } = useDemoSession();
  const isStudent = session?.role === "CONTRIBUTOR";
  const [items, setItems] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await listMyApplications());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải đơn ứng tuyển của bạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isStudent) { setItems([]); setLoading(false); return; }
    void reload();
    const refresh = () => void reload();
    window.addEventListener(APPLICATIONS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(APPLICATIONS_CHANGED_EVENT, refresh);
  }, [hydrated, isStudent, reload]);

  return { hydrated, isStudent, loading, error, items, reload };
}
