"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dropzone } from "../../../components/ui/dropzone";
import { TextAreaField, TextField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";

/**
 * Khu vực nộp kết quả bàn giao của sinh viên (docs/design.md 7.6, FR-MIL-03).
 *
 * Vùng kéo thả bắt buộc bấm được bằng bàn phím — xem components/ui/dropzone.tsx.
 *
 * Nút nộp bị khóa cho tới khi có ít nhất một trong hai thứ: tệp đính kèm hoặc
 * liên kết sản phẩm. Nộp một mốc trống là lỗi thật sự chứ không phải chuyện
 * nhỏ: nó đẩy mốc sang trạng thái chờ nghiệm thu và làm doanh nghiệp mất công
 * mở ra xem một thứ rỗng.
 */
export function DeliverableForm({ milestoneTitle }: { milestoneTitle: string }) {
  const [link, setLink] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const canSubmit = link.trim().length > 0 && status === "idle";

  if (status === "done") {
    return (
      <Alert variant="success" title="Đã gửi kết quả bàn giao" live="polite">
        Doanh nghiệp nhận được thông báo ngay bây giờ. Trong lúc chờ, bạn vẫn xem lại được những gì mình
        vừa nộp ở phần lịch sử bên dưới.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        setStatus("sending");
        window.setTimeout(() => setStatus("done"), 700);
      }}
    >
      <div className="field">
        <span className="field__label">Tệp đính kèm</span>
        <Dropzone
          id="deliverable-files"
          accept=".zip,.pdf,.png,.jpg,.jpeg,.fig"
          hint="ZIP, PDF hoặc ảnh, mỗi tệp tối đa 20MB."
          multiple
        />
      </div>

      <TextField
        id="deliverable-link"
        label="Liên kết sản phẩm"
        type="url"
        required
        value={link}
        onChange={(event) => setLink(event.target.value)}
        placeholder="https://ten-du-an.vercel.app"
        hint="Đường dẫn để doanh nghiệp xem được kết quả mà không cần cài gì."
      />

      <TextAreaField
        id="deliverable-note"
        label="Ghi chú bàn giao"
        rows={4}
        placeholder="Bạn đã làm xong những gì ở mốc này, và có chỗ nào cần doanh nghiệp lưu ý khi xem không."
        hint="Nếu có phần chưa làm được, nói trước ở đây sẽ đỡ mất một vòng sửa qua lại."
      />

      <Button type="submit" disabled={!canSubmit} loading={status === "sending"}>
        Gửi kết quả bàn giao
      </Button>

      {/* Nút disabled bắt buộc kèm lý do (design-tokens.md 3.1) */}
      {link.trim().length === 0 ? (
        <p className="hint-disabled" style={{ marginTop: "var(--space-2)" }}>
          Điền liên kết sản phẩm để gửi được mốc &ldquo;{milestoneTitle}&rdquo;.
        </p>
      ) : null}
    </form>
  );
}
