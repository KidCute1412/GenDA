"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Dropzone } from "../../../components/ui/dropzone";
import { Skeleton } from "../../../components/ui/feedback";
import { FileText, ICON_WEIGHT, ShieldCheck } from "../../../components/ui/icons";
import { formatDate } from "../../../lib/utils/format";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { ApiRequestError } from "../../auth/services/session-request";
import { announceStandingChanged } from "../hooks/use-contributor-standing";
import { fetchCvFile, getCv, uploadCv, type ContributorCv } from "../services/contributor-api";
import { syncLedgerContributor } from "../services/ledger-bridge";

const MAX_BYTES = 2 * 1024 * 1024;

/** Lý do backend từ chối tệp (CvRejectionReason), viết thành việc contributor làm được ngay. */
const REJECTION_COPY: Record<string, string> = {
  EMPTY: "Tệp trống. Hãy xuất lại CV ra PDF rồi nộp lại.",
  TOO_LARGE: "CV vượt quá 2 MB. Hãy nén PDF hoặc xuất lại với ảnh nhẹ hơn.",
  NOT_PDF: "Tệp này không phải PDF thật. Đổi đuôi tệp thành .pdf là chưa đủ: hãy dùng chức năng Xuất PDF hoặc In thành PDF.",
  CORRUPTED: "Không mở được tệp PDF này, có thể tệp đã hỏng hoặc tải chưa xong. Hãy xuất lại rồi nộp lại.",
  PASSWORD_PROTECTED: "PDF đang khóa bằng mật khẩu nên doanh nghiệp sẽ không mở được. Hãy lưu một bản không đặt mật khẩu."
};

export function formatFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function rejectionMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.code === "CV_REJECTED_TECHNICAL") return REJECTION_COPY[String(error.details.reason)] ?? REJECTION_COPY.CORRUPTED;
    if (error.status === 413) return REJECTION_COPY.TOO_LARGE;
    return error.message;
  }
  return "Không nộp được CV. Vui lòng thử lại.";
}

/**
 * Nộp / thay CV PDF (design.md 7.7). Backend kiểm tra kỹ thuật ngay khi nhận: đạt thì CV chuyển READY, không
 * đạt thì báo lý do cụ thể và GIỮ NGUYÊN CV đang dùng. READY không có nghĩa nội dung CV đã được xác minh.
 */
export function CvUploader({ id = "cv-file", onUploaded }: { id?: string; onUploaded?: (cv: ContributorCv) => void }) {
  const { session } = useAuthSession();
  const replaceRef = useRef<HTMLInputElement>(null);
  const [cv, setCv] = useState<ContributorCv | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCv()
      .then((current) => { if (active) setCv(current); })
      .catch((error) => { if (active) { setCv(null); setLoadError(error instanceof Error ? error.message : "Không thể tải CV."); } });
    return () => { active = false; };
  }, []);

  async function upload(file: File | undefined) {
    if (!file || busy) return;
    setRejection(null);
    // Chặn sớm tệp chắc chắn bị từ chối để khỏi tải lên vô ích; backend vẫn kiểm tra lại đầy đủ.
    if (file.size > MAX_BYTES) { setRejection(REJECTION_COPY.TOO_LARGE); return; }
    setBusy(true);
    try {
      const uploaded = await uploadCv(file);
      setCv(uploaded);
      onUploaded?.(uploaded);
      announceStandingChanged();
      if (session) await syncLedgerContributor({ email: session.email, name: session.name }, uploaded, file).catch(() => undefined);
    } catch (error) {
      setRejection(rejectionMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function view() {
    // Mở tab trước khi chờ tải tệp, để trình duyệt không coi đây là cửa sổ bật lên tự động.
    const tab = window.open("", "_blank");
    try {
      const url = URL.createObjectURL(await fetchCvFile());
      if (tab) tab.location.href = url;
      else window.location.assign(url);
    } catch {
      tab?.close();
      setRejection("Không mở được CV. Vui lòng thử lại.");
    }
  }

  if (cv === undefined) return <Skeleton height="6rem" />;

  return (
    <div className="stack stack--sm">
      {loadError ? <Alert variant="warning" title="Chưa tải được CV hiện tại">{loadError}</Alert> : null}
      {rejection ? (
        <Alert variant="danger" title="CV chưa được nhận" live="assertive">
          {rejection}
          {cv ? " CV đang dùng vẫn được giữ nguyên." : null}
        </Alert>
      ) : null}

      {cv ? (
        <div className="cv-card" data-busy={busy ? "true" : undefined}>
          <div className="cv-card__file">
            <FileText weight={ICON_WEIGHT} aria-hidden="true" className="cv-card__icon" />
            <div style={{ minWidth: 0 }}>
              <strong className="cv-card__name">{cv.fileName}</strong>
              <span className="text-caption num">
                PDF · {formatFileSize(cv.sizeBytes)} · {cv.pageCount} trang · Nộp ngày {formatDate(cv.uploadedAt.slice(0, 10))}
              </span>
            </div>
          </div>
          <p className="cv-card__status">
            <ShieldCheck weight={ICON_WEIGHT} aria-hidden="true" />
            Đã kiểm tra kỹ thuật. Nội dung CV chưa được GenDA xác minh.
          </p>
          <div className="cluster" style={{ gap: "var(--space-2)" }}>
            <Button type="button" variant="outline" size="sm" onClick={() => void view()}>
              Xem CV
            </Button>
            <Button type="button" variant="outline" size="sm" loading={busy} onClick={() => replaceRef.current?.click()}>
              Thay CV khác
            </Button>
            <input
              ref={replaceRef}
              id={id}
              type="file"
              accept="application/pdf,.pdf"
              className="visually-hidden"
              tabIndex={-1}
              aria-label="Chọn tệp CV PDF mới"
              onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }}
            />
          </div>
        </div>
      ) : (
        <div aria-busy={busy}>
          <Dropzone id={id} accept="application/pdf,.pdf" hint="Chỉ nhận PDF, tối đa 2 MB, không đặt mật khẩu." onFilesSelected={(files) => void upload(files[0])} />
          {busy ? <p className="field__hint" role="status">Đang kiểm tra tệp...</p> : null}
        </div>
      )}
    </div>
  );
}
