"use client";

import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { CvUploader } from "./cv-uploader";

/** Chỉ quay về đường dẫn nội bộ, tránh `next` trỏ ra trang ngoài. */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
}

/** Bước bắt buộc của tài khoản sinh viên mới: nộp CV rồi mới vào danh sách dự án. */
export function CvOnboarding({ next }: { next?: string }) {
  const { session } = useDemoSession();
  const ledger = useDemoLedger();
  const hasCv = Boolean(ledger.users.find((user) => user.email === session?.email)?.cv);

  return (
    <div className="stack">
      {hasCv ? (
        <Alert variant="success" title="Đã nhận CV của bạn" live="polite">
          Doanh nghiệp sẽ xem CV này khi bạn ứng tuyển. Bạn có thể thay CV khác bất cứ lúc nào ở trang Hồ sơ.
        </Alert>
      ) : (
        <Alert variant="info" title="Nộp CV để bắt đầu xem dự án">
          Mỗi đơn ứng tuyển đều gửi kèm CV này cho doanh nghiệp, nên chúng tôi cần nó trước khi bạn xem các công việc đang tuyển.
        </Alert>
      )}

      <CvUploader id="onboarding-cv" />

      {hasCv ? (
        <Link href={safeNext(next)} className="btn--tactile-orange" style={{ height: "48px", textDecoration: "none" }}>
          XEM DỰ ÁN ĐANG TUYỂN
        </Link>
      ) : (
        <p className="hint-disabled">Nộp CV (PDF) xong bạn sẽ vào được danh sách dự án.</p>
      )}
    </div>
  );
}
