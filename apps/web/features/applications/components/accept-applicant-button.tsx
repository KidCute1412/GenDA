"use client";

import { useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";

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

  return (
    <>
      <Button onClick={() => dialogRef.current?.showModal()}>Chấp nhận ứng viên này</Button>

      <dialog ref={dialogRef} className="dialog" aria-labelledby="accept-title">
        <h2 id="accept-title">Chọn {applicantName} cho dự án này?</h2>

        <p style={{ marginBlock: "var(--space-3) var(--space-4)" }}>
          Khi bạn xác nhận, ba việc xảy ra ngay và không hoàn tác được:
        </p>

        <ul style={{ paddingLeft: "var(--space-5)", marginBottom: "var(--space-4)" }}>
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

        <div className="dialog__actions">
          <Button variant="outline" onClick={() => dialogRef.current?.close()}>
            Để tôi xem lại
          </Button>
          <Button
            loading={pending}
            onClick={() => {
              setPending(true);
              // Bản dựng giao diện: mô phỏng độ trễ của giao dịch trên máy chủ.
              window.setTimeout(() => {
                setPending(false);
                dialogRef.current?.close();
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
