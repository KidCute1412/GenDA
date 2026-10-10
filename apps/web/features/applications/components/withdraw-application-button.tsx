"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { announceApplicationsChanged } from "../hooks/use-my-applications";
import { withdrawApplication } from "../services/applications-api";

/** Rút đơn còn đang chờ (FR-APP-06). Bấm hai lần để tránh rút nhầm. */
export function WithdrawApplicationButton({ applicationId, onError }: { applicationId: string; onError?: (message: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function withdraw() {
    setBusy(true);
    try {
      await withdrawApplication(applicationId);
      announceApplicationsChanged();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Không thể rút đơn.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return confirming ? (
    <Button type="button" variant="danger" size="sm" loading={busy} onClick={() => void withdraw()}>
      XÁC NHẬN RÚT ĐƠN
    </Button>
  ) : (
    <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
      RÚT ĐƠN NÀY
    </Button>
  );
}
