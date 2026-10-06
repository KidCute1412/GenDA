"use client";

import { useRef, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Dropzone } from "../../../components/ui/dropzone";
import { FileText, ICON_WEIGHT } from "../../../components/ui/icons";
import { formatDate } from "../../../lib/utils/format";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { getCvFileUrl, uploadStudentCv } from "../../demo-ledger/store";
import type { DemoCv } from "../../demo-ledger/types";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Nút mở CV ở tab mới — dùng cho cả sinh viên (xem lại CV của mình) và doanh nghiệp (xem CV ứng viên). */
export function ViewCvButton({ userId, cv }: { userId: string; cv: DemoCv }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => window.open(getCvFileUrl(userId), "_blank", "noopener")}>
      XEM CV ({cv.name})
    </Button>
  );
}

/**
 * Nộp / thay CV dạng PDF của sinh viên đang đăng nhập.
 * Chưa có CV: hiện vùng kéo thả. Đã có CV: hiện thẻ tệp kèm nút xem và thay tệp khác.
 */
export function CvUploader({ id = "cv-file" }: { id?: string }) {
  const { session } = useDemoSession();
  const ledger = useDemoLedger();
  const student = ledger.users.find((user) => user.email === session?.email);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file || !session) return;
    setBusy(true);
    try {
      const result = uploadStudentCv(session.email, file, await readAsDataUrl(file));
      setError(result.ok ? null : result.message);
    } catch {
      setError("Không đọc được tệp. Hãy chọn lại tệp PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack stack--sm">
      {error ? <Alert variant="danger" title="Chưa nộp được CV" live="assertive">{error}</Alert> : null}

      {student?.cv ? (
        <div style={{ border: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-subtle)", padding: "var(--space-4)" }}>
          <div className="cluster" style={{ alignItems: "flex-start" }}>
            <FileText weight={ICON_WEIGHT} aria-hidden="true" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", overflowWrap: "anywhere" }}>{student.cv.name}</strong>
              <span className="text-caption">
                PDF · {formatFileSize(student.cv.size)} · Nộp ngày {formatDate(student.cv.uploadedAt.slice(0, 10))}
              </span>
            </div>
          </div>
          <div className="cluster" style={{ marginTop: "var(--space-3)", gap: "var(--space-2)" }}>
            <ViewCvButton userId={student.id} cv={student.cv} />
            <Button type="button" variant="outline" size="sm" loading={busy} onClick={() => replaceRef.current?.click()}>
              THAY CV KHÁC
            </Button>
            <input
              ref={replaceRef}
              id={id}
              type="file"
              accept="application/pdf,.pdf"
              className="visually-hidden"
              tabIndex={-1}
              onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }}
            />
          </div>
        </div>
      ) : (
        <Dropzone
          id={id}
          accept="application/pdf,.pdf"
          hint="Chỉ nhận tệp PDF, tối đa 2 MB."
          onFilesSelected={(files) => void upload(files[0])}
        />
      )}
    </div>
  );
}
