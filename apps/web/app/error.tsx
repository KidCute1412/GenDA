"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { ErrorState } from "../components/ui/feedback";

/**
 * Trạng thái Lỗi ở cấp toàn ứng dụng (docs/design.md 8.3).
 *
 * Next.js render tệp này khi một màn hình ném lỗi, nên đây là hiện thực thật
 * của trạng thái lỗi. Ba quy tắc được tuân thủ:
 *  - Không hiển thị đoạn mã kỹ thuật cho người dùng. `error.message` có thể là
 *    "Uncaught TypeError..." nên nó chỉ được ghi vào console cho lập trình viên,
 *    còn người dùng đọc một câu tiếng Việt bình thường.
 *  - Hiển thị mã truy vết (NFR-OPS-02) để đội hỗ trợ tra đúng yêu cầu đã hỏng.
 *  - Nút thử lại gọi `reset()` để dựng lại đúng nhánh bị lỗi, KHÔNG tải lại cả
 *    trang, nên người dùng không mất những gì đang làm dở ở chỗ khác.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="container section">
      <ErrorState
        detail="Có lỗi xảy ra ở phía chúng tôi khi mở màn hình này. Lỗi đã được ghi nhận, bạn thử lại giúp chúng tôi một lần nữa."
        requestId={error.digest}
        action={<Button onClick={reset}>Thử lại ngay</Button>}
      />
    </main>
  );
}
