"use client";

import { useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";

/**
 * Modal Xác nhận Quan trọng cho hành động KHÔNG THỂ ĐẢO NGƯỢC
 * (docs/design.md 7.5, FR-APP-05, BR-13).
 *
 * Chọn một ứng viên sẽ tự động từ chối tất cả những bạn còn lại trong cùng một
 * giao dịch. Không có nút hoàn tác, nên hộp thoại phải LIỆT KÊ RÕ TỪNG HỆ QUẢ
 * trước khi SME bấm, chứ không hỏi cụt lủn "Bạn có chắc không?" — câu đó không
 * cho người dùng thêm thông tin nào để quyết định.
 *
 * Bố trí nút theo design-tokens.md 3.6: nút xác nhận bên PHẢI, nút hủy bên
 * trái, thuận theo hướng đọc và theo quy ước của hệ điều hành.
 */
export function AcceptApplicantButton({
  applicantName,
  otherCount
}: {
  applicantName: string;
  otherCount: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useDemoPersistedState(`accepted-applicant:${applicantName}`, false);

  if (accepted) {
    return <Alert variant="success" title="Đã chọn ứng viên">Dự án đã chuyển sang đang thực hiện. Các ứng viên còn lại đã nhận thông báo kết quả.</Alert>;
  }

  return (
    <>
      <Button 
        onClick={() => dialogRef.current?.showModal()}
        className="btn--tactile-orange"
        style={{ height: "36px", fontSize: "11px" }}
      >
        Chấp nhận ứng viên này
      </Button>

      <dialog ref={dialogRef} className="dialog" aria-labelledby="accept-title">
        <div className="module-bay__header" style={{ borderColor: "var(--orange-500)", marginBottom: "var(--space-4)" }}>
          <span className="module-bay__id" style={{ backgroundColor: "var(--orange-500)", color: "#ffffff" }}>
            ACTION // IRREVERSIBLE
          </span>
          <span style={{ color: "var(--orange-500)", fontWeight: 800, fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
            XÁC NHẬN GIAO DỰ ÁN
          </span>
        </div>

        <h2 id="accept-title" style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase" }}>
          Chọn {applicantName} cho dự án này?
        </h2>

        <p style={{ marginBlock: "var(--space-3) var(--space-4)", fontSize: "13px" }}>
          Khi bạn xác nhận, ba việc xảy ra ngay và không hoàn tác được:
        </p>

        <ul style={{ paddingLeft: "var(--space-5)", marginBottom: "var(--space-4)", fontSize: "13px" }}>
          <li style={{ marginBottom: "var(--space-2)" }}>
            Dự án chuyển sang trạng thái đang thực hiện và ngừng nhận đơn mới.
          </li>
          <li style={{ marginBottom: "var(--space-2)" }}>
            {otherCount} bạn còn lại nhận thông báo từ chối.
          </li>
          <li>Không gian làm việc mở ra cho bạn và {applicantName.split(" ").pop()}.</li>
        </ul>

        <Alert variant="warning">
          Hãy chắc rằng bạn đã đọc thư ngỏ và xem sản phẩm minh chứng của bạn này. Sau bước này bạn không
          đổi người được nữa.
        </Alert>

        <div className="dialog__actions" style={{ marginTop: "var(--space-6)" }}>
          <Button 
            variant="outline" 
            onClick={() => dialogRef.current?.close()}
            className="btn--tactile-zinc"
            style={{ height: "40px", fontSize: "12px" }}
          >
            Để tôi xem lại
          </Button>
          <Button
            loading={pending}
            className="btn--tactile-orange"
            style={{ height: "40px", fontSize: "12px" }}
            onClick={() => {
              setPending(true);
              // Bản dựng giao diện: mô phỏng độ trễ của giao dịch trên máy chủ.
              window.setTimeout(() => {
                setPending(false);
                dialogRef.current?.close();
                setAccepted(true);
              }, 800);
            }}
          >
            Xác nhận chọn {applicantName.split(" ").pop()}
          </Button>
        </div>
      </dialog>
    </>
  );
}
