"use client";

import { useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { ReviewForm } from "../../reviews/components/review-form";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";

/**
 * Thao tác nghiệm thu của doanh nghiệp (docs/design.md 7.6, FR-MIL-04).
 *
 * Ràng buộc trực quan theo BR-07: cả hai nút chỉ bật khi mốc đang ở trạng thái
 * đã nộp. Khi chưa có kết quả bàn giao, nút hiển thị mờ KÈM dòng giải thích lý
 * do — ngăn lỗi ngay tại giao diện thay vì để API trả về lỗi (Quy tắc Vàng số
 * 5). Nút mờ mà không nói vì sao chỉ khiến người dùng tưởng hệ thống hỏng.
 *
 * "Yêu cầu chỉnh sửa" bắt buộc nhập lý do: một mốc bị trả lại mà không kèm lý
 * do sẽ đẩy sinh viên vào thế đoán mò, và đó chính là kiểu đứt gãy giao tiếp mà
 * nền tảng sinh ra để xử lý.
 *
 * Nút "Nghiệm thu mốc này" dùng biến thể `primary` màu teal, KHÔNG phải màu
 * xanh lá: theo quy tắc khan hiếm ở design.md 4.4.2, xanh lá chỉ dành cho trạng
 * thái đã xác thực, không dành cho nút bấm.
 */
export function ReviewActions({ enabled, isFinalMilestone }: { enabled: boolean; isFinalMilestone: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [outcome, setOutcome] = useState<"none" | "accepted" | "changes">("none");
  const [accepted, setAccepted] = useDemoPersistedState(`milestone-review:${isFinalMilestone}:accepted`, false);

  if (outcome === "accepted" || accepted) {
    return (
      <div className="stack">
        <Alert variant="success" title="Đã nghiệm thu mốc này" live="polite">
          Nghiệm thu chỉ cập nhật kết quả bàn giao. Trạng thái quỹ vẫn phải được SME hoặc quản trị viên ghi nhận thủ công ở khu vực quỹ mô phỏng.
        </Alert>
        {isFinalMilestone ? (
          <section className="card stack stack--sm">
            <Alert variant="success" title="Dự án đã hoàn tất">
              Đây là mốc cuối cùng. Dự án chuyển sang COMPLETED; SME cần gửi đánh giá để hệ thống sinh portfolio xác thực.
            </Alert>
            <ReviewForm studentName="Lê Tuấn Lộc" portfolioSlug="le-tuan-loc" />
          </section>
        ) : null}
      </div>
    );
  }

  if (outcome === "changes") {
    return (
      <Alert variant="warning" title="Đã gửi yêu cầu chỉnh sửa" live="polite">
        Sinh viên nhận được góp ý của bạn và sẽ nộp lại. Toàn bộ trao đổi được lưu trong lịch sử bàn giao
        phía trên.
      </Alert>
    );
  }

  return (
    <>
      <div className="cluster cluster--between">
        <Button variant="outline" disabled={!enabled} onClick={() => dialogRef.current?.showModal()}>
          Yêu cầu chỉnh sửa
        </Button>
        <Button disabled={!enabled} onClick={() => {
          setOutcome("accepted");
          setAccepted(true);
        }}>
          Nghiệm thu mốc này
        </Button>
      </div>

      {!enabled ? (
        <p className="hint-disabled" style={{ marginTop: "var(--space-3)" }}>
          Hai nút này bật lên khi sinh viên nộp kết quả bàn giao cho mốc đang mở.
        </p>
      ) : null}

      <dialog ref={dialogRef} className="dialog" aria-labelledby="changes-title">
        <h2 id="changes-title">Cần sửa lại chỗ nào?</h2>

        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
          Sinh viên sẽ đọc đúng những dòng này để sửa. Càng chỉ rõ chỗ nào chưa đạt so với tiêu chí đã
          thống nhất thì càng ít phải trả lại lần nữa.
        </p>

        <TextAreaField
          id="changes-reason"
          label="Lý do và phần cần sửa"
          required
          rows={5}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: cỡ chữ phần mô tả trên điện thoại nhỏ hơn 16px, đọc rất khó."
        />

        <div className="dialog__actions">
          <Button variant="outline" onClick={() => dialogRef.current?.close()}>
            Hủy
          </Button>
          <Button
            disabled={reason.trim().length < 10}
            onClick={() => {
              dialogRef.current?.close();
              setOutcome("changes");
            }}
          >
            Gửi yêu cầu chỉnh sửa
          </Button>
        </div>

        {reason.trim().length < 10 ? (
          <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
            Nhập lý do để gửi được yêu cầu.
          </p>
        ) : null}
      </dialog>
    </>
  );
}
