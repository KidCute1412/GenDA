"use client";

import { useEffect, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button, ButtonLink } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/field";
import {
  AuthApiError,
  confirmEmailVerification,
  resendEmailVerification
} from "../services/auth-api";

type VerificationState = "idle" | "submitting" | "verified";

function errorMessage(error: unknown) {
  if (!(error instanceof AuthApiError)) return "Không thể kết nối tới hệ thống xác minh. Hãy thử lại.";
  const messages: Record<string, string> = {
    OTP_INVALID: "Mã OTP không đúng hoặc đã được thay bằng mã mới.",
    OTP_EXPIRED: "Mã OTP đã hết hạn. Hãy yêu cầu gửi mã mới.",
    OTP_ATTEMPTS_EXCEEDED: "Mã OTP đã bị khóa sau quá nhiều lần nhập sai. Hãy gửi mã mới.",
    OTP_RESEND_TOO_SOON: "Bạn vừa nhận mã. Hãy chờ đủ 60 giây trước khi gửi lại.",
    OTP_RATE_LIMITED: "Đã có quá nhiều yêu cầu gửi mã. Hãy thử lại sau.",
    EMAIL_DELIVERY_FAILED: "Hệ thống chưa gửi được email. Hãy thử lại sau."
  };
  const message = messages[error.code] ?? error.message;
  return error.requestId ? `${message} Mã yêu cầu: ${error.requestId}.` : message;
}

export function VerifyEmailResult({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerificationState>("idle");
  const [accountState, setAccountState] = useState<"ACTIVE" | "EMAIL_VERIFIED" | null>(null);
  const [error, setError] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [resendSeconds, setResendSeconds] = useState(initialEmail ? 60 : 0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setResendNotice("");
    setState("submitting");
    try {
      const user = await confirmEmailVerification(email, code);
      setAccountState(user.accountState === "EMAIL_VERIFIED" ? "EMAIL_VERIFIED" : "ACTIVE");
      setState("verified");
    } catch (caught) {
      setError(errorMessage(caught));
      setState("idle");
    }
  }

  async function resend() {
    setError("");
    setResendNotice("");
    setResending(true);
    try {
      await resendEmailVerification(email);
      setCode("");
      setResendSeconds(60);
      setResendNotice("Nếu email này có tài khoản đang chờ xác minh, mã mới sẽ được gửi tới hộp thư.");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setResending(false);
    }
  }

  if (state === "verified") {
    const isSmePending = accountState === "EMAIL_VERIFIED";
    return (
      <section className="module-bay stack" style={{ padding: "var(--space-8)" }}>
        <p className="module-bay__id">EMAIL-OTP // CONSUMED</p>
        <h1 style={{ margin: 0 }}>Email đã được xác minh</h1>
        <Alert variant="success" title={isSmePending ? "Email hợp lệ, doanh nghiệp đang chờ duyệt" : "Tài khoản đã kích hoạt"}>
          {isSmePending
            ? "GenDA đã xác nhận email. Tài khoản doanh nghiệp vẫn cần được đội vận hành xác minh trước khi đăng nhập."
            : "Bạn đã hoàn tất bước xác minh email. Hãy đăng nhập để tiếp tục hồ sơ contributor."}
        </Alert>
        <ButtonLink href="/login" block>Đến trang đăng nhập</ButtonLink>
      </section>
    );
  }

  const emailMissing = email.trim().length === 0;
  const codeInvalid = code.length > 0 && !/^\d{6}$/.test(code);
  const blocked = emailMissing || !/^\d{6}$/.test(code);

  return (
    <section className="module-bay stack" style={{ padding: "var(--space-8)" }}>
      <div>
        <p className="module-bay__id">EMAIL-OTP // PENDING</p>
        <h1 style={{ margin: "var(--space-2) 0 0" }}>Xác minh email đăng ký</h1>
        <p className="text-muted">Nhập mã OTP 6 chữ số đã gửi tới hộp thư của bạn. Mã có hiệu lực trong 10 phút.</p>
      </div>

      {error ? <Alert variant="danger" title="Không thể xác minh" live="assertive">{error}</Alert> : null}
      {resendNotice ? <Alert variant="info" title="Đã tiếp nhận yêu cầu" live="polite">{resendNotice}</Alert> : null}

      <form onSubmit={confirm} className="stack" noValidate>
        <TextField
          id="verification-email"
          label="Email đăng ký"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ban@example.com"
        />
        <TextField
          id="verification-code"
          label="Mã OTP"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          pattern="[0-9]{6}"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          error={codeInvalid ? "Mã OTP phải gồm đúng 6 chữ số." : undefined}
          hint="Bạn có thể dán mã từ email. Không chia sẻ mã này với người khác."
        />

        <Button type="submit" block loading={state === "submitting"} disabled={blocked}>
          Xác nhận email
        </Button>
        {blocked ? <p className="hint-disabled">Nhập email và đủ 6 chữ số để xác nhận.</p> : null}
      </form>

      <div className="cluster cluster--between">
        <span className="text-caption" aria-live="polite">
          {resendSeconds > 0 ? `Có thể gửi lại sau ${resendSeconds} giây.` : "Bạn chưa nhận được mã?"}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={resend}
          loading={resending} disabled={emailMissing || resendSeconds > 0}>
          Gửi lại mã
        </Button>
      </div>
      {(emailMissing || resendSeconds > 0) ? (
        <p className="hint-disabled">{emailMissing ? "Nhập email đăng ký để gửi lại mã." : "Mã mới chỉ được gửi sau thời gian chờ."}</p>
      ) : null}
    </section>
  );
}
