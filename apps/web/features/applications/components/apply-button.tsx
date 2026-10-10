"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { TextAreaField, TextField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { CheckCircle, ICON_WEIGHT } from "../../../components/ui/icons";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { getDemoSession } from "../../auth/services/demo-session";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import type { CreatedApplication } from "./created-applications-panel";

/**
 * Hộp thoại Ứng tuyển (docs/design.md 7.4, FR-APP-01).
 *
 * Dùng phần tử <dialog> của trình duyệt mở bằng showModal(). Bốn hành vi bắt
 * buộc ở design-tokens.md 3.6 — bẫy tiêu điểm, phím Esc đóng, trả tiêu điểm về
 * đúng nút đã mở, lớp phủ ::backdrop — đều là hành vi CÓ SẴN của nền tảng nên
 * không cần thư viện và không cần tự viết lại. <dialog> mở bằng showModal()
 * cũng ngầm mang role="dialog" và ngữ nghĩa modal, nên chỉ cần aria-labelledby.
 *
 * Chặn mềm theo BR-03: sinh viên chưa xác thực vẫn mở được hộp thoại để ĐỌC
 * yêu cầu, nhưng không gửi được đơn. Chặn ngay từ nút bấm sẽ khiến bạn ấy không
 * hiểu vì sao mình bị chặn.
 */
type Status = "idle" | "submitting" | "done";

export function ApplyButton({
  projectTitle,
  projectId,
  smeName,
  budget,
  verified
}: {
  projectTitle: string;
  projectId: string;
  smeName: string;
  budget: number;
  verified: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [letter, setLetter] = useState("");
  const [touched, setTouched] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useDemoPersistedState(`application:${projectTitle}:submitted`, false);
  const [createdApplications, setCreatedApplications] = useDemoPersistedState<CreatedApplication[]>("applications:created", []);
  const { session, hydrated } = useDemoSession();

  // Kiểm tra hợp lệ tức thời, nhưng chỉ hiện lỗi SAU khi người dùng đã rời ô —
  // báo đỏ ngay từ ký tự đầu tiên là phạt người ta vì tội đang gõ dở.
  const letterError =
    touched && letter.trim().length > 0 && letter.trim().length < 80
      ? "Thư ngỏ cần ít nhất 80 ký tự. Hãy nói rõ bạn đã làm gì tương tự và khi nào bạn rảnh."
      : undefined;

  const isStudent = session?.role === "STUDENT";
  const hasVerifiedEmail = session?.emailVerified === true;
  const canSubmit = isStudent && verified && hasVerifiedEmail && letter.trim().length >= 80 && status === "idle";

  function open() {
    if (!isStudent) return;
    setStatus(alreadyApplied ? "done" : "idle");
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    // Bản dựng giao diện: mô phỏng độ trễ mạng để thấy được trạng thái đang gửi.
    window.setTimeout(() => {
      setAlreadyApplied(true);
      const session = getDemoSession();
      if (session && !createdApplications.some((application) => application.projectId === projectId && application.ownerEmail === session.email)) {
        setCreatedApplications((current) => [...current, { id: `a-${Date.now()}`, projectId, projectTitle, smeName, budget, ownerEmail: session.email, submittedAt: new Date().toLocaleDateString("vi-VN"), status: "SUBMITTED" }]);
      }
      setStatus("done");
    }, 700);
  }

  return (
    <>
      {hydrated && !isStudent ? <Alert variant="warning" title="Chỉ sinh viên được ứng tuyển">Hãy đăng nhập bằng tài khoản sinh viên đã xác minh để gửi đơn cho dự án này.</Alert> : null}
      <button
        type="button"
        className="btn--tactile-orange"
        style={{ width: "100%", height: "48px" }}
        onClick={open}
        disabled={hydrated && !isStudent}
      >
        {alreadyApplied ? "ĐÃ NỘP ĐƠN" : "ỨNG TUYỂN NGAY"}
      </button>

      <dialog ref={dialogRef} className="dialog dialog--lg" aria-labelledby="apply-title" style={{ border: "2px solid var(--machinery-border)", boxShadow: "8px 8px 0px var(--machinery-shadow)", borderRadius: 0 }}>
        {status === "done" ? (
          /* Trạng thái Thành công (design.md 8.4): xác nhận rõ ràng, tạo cảm
             giác đóng gói, và nói luôn bước kế tiếp thay vì bỏ người dùng lơ lửng. */
          <div className="stack">
            <h2 id="apply-title" className="cluster">
              <CheckCircle
                weight={ICON_WEIGHT}
                aria-hidden="true"
                style={{ color: "var(--color-status-verified)" }}
              />
              Đã gửi đơn của bạn
            </h2>

            <p>
              Doanh nghiệp sẽ thấy đơn của bạn ngay bây giờ. Bạn không cần gửi lại lần nữa, và có thể rút
              đơn bất cứ lúc nào trước khi được duyệt.
            </p>

            <Alert variant="info">
              Theo dõi trạng thái đơn ở mục <Link href="/student/applications">Đơn của tôi</Link>. Khi
              doanh nghiệp phản hồi, chúng tôi sẽ báo cho bạn qua email.
            </Alert>

            <div className="dialog__actions">
              <Button variant="outline" onClick={close}>
                Đóng
              </Button>
              <Link href="/student/applications" className="btn btn--primary">
                Xem đơn của tôi
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="apply-title">Ứng tuyển: {projectTitle}</h2>

            <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
              Doanh nghiệp chỉ chọn một bạn duy nhất cho dự án này, nên phần thư ngỏ là thứ tạo khác biệt.
            </p>

            {!verified ? (
              /* Chặn theo BR-03 — nền hổ phách + icon + chữ, ba lớp mã hóa */
              <Alert variant="warning" title="Bạn cần xác thực tài khoản sinh viên trước">
                Đây là cách chúng tôi bảo đảm với doanh nghiệp rằng người nhận việc đúng là sinh viên đang
                theo học. Xác thực xong bạn quay lại nộp đơn được ngay, thường mất dưới 24 giờ.{" "}
                <Link href="/student/profile">Xác thực hồ sơ của tôi</Link>
              </Alert>
            ) : null}

            {!hasVerifiedEmail ? (
              <Alert variant="warning" title="Bạn cần xác minh email trước">
                Tài khoản đã đăng ký nhưng email chưa được kích hoạt. <Link href="/verify-email?token=genda-demo-valid-2026&next=%2Fprojects%3FemailVerified%3D1">Mở liên kết xác minh</Link> để tiếp tục.
              </Alert>
            ) : null}

            <div style={{ marginTop: "var(--space-5)" }}>
              <TextAreaField
                id="cover-letter"
                label="Thư ngỏ"
                required
                rows={7}
                value={letter}
                disabled={!verified || !hasVerifiedEmail}
                onChange={(event) => setLetter(event.target.value)}
                onBlur={() => setTouched(true)}
                error={letterError}
                hint="Nói rõ bạn đã làm gì tương tự, bạn rảnh vào lúc nào, và phần nào bạn chưa chắc tay."
                placeholder="Em đã làm một trang tương tự cho..."
              />

              <TextField
                id="portfolio-url"
                label="Liên kết sản phẩm minh chứng"
                type="url"
                disabled={!verified || !hasVerifiedEmail}
                placeholder="https://github.com/ten-cua-ban"
                hint="GitHub, Behance, Drive hay bất cứ nơi nào doanh nghiệp xem được sản phẩm của bạn."
              />
            </div>

            <div className="dialog__actions">
              <Button type="button" variant="outline" onClick={close}>
                Để sau
              </Button>
              <Button type="submit" disabled={!canSubmit} loading={status === "submitting"}>
                Gửi đơn ứng tuyển
              </Button>
            </div>

            {/* Nút disabled BẮT BUỘC đi kèm dòng giải thích lý do (BR-07,
                design-tokens.md 3.1) — nếu không người dùng chỉ thấy nút xám. */}
            {verified && hasVerifiedEmail && letter.trim().length < 80 ? (
              <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
                Viết thư ngỏ ít nhất 80 ký tự để gửi được đơn.
              </p>
            ) : null}
          </form>
        )}
      </dialog>
    </>
  );
}
