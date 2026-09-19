"use client";

import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { Button } from "../../../components/ui/button";

export function DraftSaveButton() {
  const [savedAt, setSavedAt] = useDemoPersistedState<string | null>("new-project:draft-saved-at", null);
  return (
    <div className="stack stack--sm" style={{ alignItems: "flex-end" }}>
      <Button type="button" variant="secondary" onClick={() => setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }))}>
        LƯU BẢN NHÁP
      </Button>
      {savedAt ? <span className="text-caption" aria-live="polite">Đã lưu lúc {savedAt}</span> : null}
    </div>
  );
}
