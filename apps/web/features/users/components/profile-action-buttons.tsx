"use client";

import { useRef, useState } from "react";
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

export function ReuploadVerificationButton() {
  const [submitted, setSubmitted] = useDemoPersistedState("student-verification:resubmitted", false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  if (submitted) return <span className="badge badge--progress">ĐANG CHỜ DUYỆT</span>;
  return (
    <div className="stack stack--sm" style={{ alignItems: "flex-start" }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="visually-hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) setFileName(file.name);
      }} />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>CHỌN ẢNH THẺ MỚI</Button>
      {fileName ? <Button type="button" size="sm" onClick={() => setSubmitted(true)}>GỬI LẠI MINH CHỨNG</Button> : null}
      {fileName ? <span className="text-caption">Đã chọn: {fileName}</span> : null}
    </div>
  );
}
