"use client";

import { useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";

export function AdminActionButtons({ targetId, approveLabel, reviewLabel }: { targetId: string; approveLabel: string; reviewLabel?: string }) {
  const [status, setStatus] = useDemoPersistedState<"pending" | "approved" | "rejected">(`admin:${targetId}`, "pending");
  const [reason, setReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const rejectDialogRef = useRef<HTMLDialogElement>(null);

  if (status === "approved") return <span className="badge badge--verified">ĐÃ DUYỆT</span>;
  if (status === "rejected") return <span className="badge badge--danger">ĐÃ TỪ CHỐI</span>;

  function openRejectDialog() {
    setReason("");
    rejectDialogRef.current?.showModal();
  }

  function closeRejectDialog() {
    rejectDialogRef.current?.close();
  }

  return (
    <div className="stack stack--sm" style={{ alignItems: "flex-end" }}>
      {reviewLabel ? <Button type="button" variant="outline" size="sm" onClick={() => setReviewing((value) => !value)}>{reviewLabel}</Button> : null}
      {reviewing ? <Alert variant="info" title="Minh chứng đã nộp">Hệ thống đã mở bản xem trước minh chứng. Quản trị viên có thể duyệt hoặc từ chối sau khi kiểm tra.</Alert> : null}
      <div className="cluster">
        <Button type="button" variant="outline" size="sm" onClick={openRejectDialog}>TỪ CHỐI</Button>
        <Button type="button" size="sm" onClick={() => setStatus("approved")}>{approveLabel}</Button>
      </div>

      <dialog ref={rejectDialogRef} className="dialog" aria-labelledby={`reject-title-${targetId}`}>
        <h2 id={`reject-title-${targetId}`}>Xác nhận từ chối</h2>
        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
          Lý do sẽ được lưu trong nhật ký kiểm toán và gửi đến người dùng để họ biết cần khắc phục điều gì.
        </p>
        <TextAreaField
          id={`reason-${targetId}`}
          label="Lý do từ chối"
          hint="Nêu rõ nội dung chưa đạt và hướng xử lý tiếp theo."
          required
          rows={5}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: Minh chứng chưa đủ rõ nét để xác thực thông tin. Vui lòng nộp lại ảnh thẻ còn hiệu lực."
        />
        <div className="dialog__actions">
          <Button type="button" variant="outline" onClick={closeRejectDialog}>Hủy</Button>
          <Button
            type="button"
            disabled={reason.trim().length < 10}
            onClick={() => {
              setStatus("rejected");
              closeRejectDialog();
            }}
          >
            Xác nhận từ chối
          </Button>
        </div>
        {reason.trim().length < 10 ? <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>Nhập ít nhất 10 ký tự để xác nhận từ chối.</p> : null}
      </dialog>
    </div>
  );
}
