"use client";

import { Button } from "../../../components/ui/button";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";

export function ProfileSaveButton() {
  const [savedAt, setSavedAt] = useDemoPersistedState<string | null>("student-profile:saved-at", null);
  return (
    <div className="stack stack--sm" style={{ alignItems: "flex-start" }}>
      <Button type="button" onClick={() => setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }))}>LƯU THÔNG TIN HỒ SƠ</Button>
      {savedAt ? <span className="text-caption" aria-live="polite">Đã lưu lúc {savedAt}</span> : null}
    </div>
  );
}
