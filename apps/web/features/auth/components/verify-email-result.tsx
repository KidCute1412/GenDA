"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { activateDemoSession } from "../services/demo-session";

type VerificationState = "checking" | "verified" | "expired" | "invalid";

function resolveToken(token?: string): Exclude<VerificationState, "checking"> {
  if (token === "genda-demo-valid-2026") return "verified";
  if (token === "genda-demo-expired-2026") return "expired";
  return "invalid";
}

export function VerifyEmailResult({ token, next }: { token?: string; next: string }) {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => setState(resolveToken(token)), 700);
    return () => window.clearTimeout(timer);
  }, [token]);

  if (state === "checking") {
    return (
      <section className="module-bay stack" aria-live="polite" style={{ padding: "var(--space-8)" }}>
        <div className="industrial-ruler">AUTH // EMAIL VERIFICATION</div>
        <h1 style={{ margin: 0 }}>ĐANG XÁC MINH ĐỊA CHỈ EMAIL</h1>
        <p className="text-muted">Vui lòng chờ trong giây lát.</p>
      </section>
    );
  }

  if (state === "verified") {
    return (
      <section className="module-bay stack" style={{ padding: "var(--space-8)" }}>
        <div className="industrial-ruler">AUTH // EMAIL VERIFIED</div>
        <h1 style={{ margin: 0 }}>EMAIL ĐÃ ĐƯỢC XÁC MINH</h1>
        <Alert variant="success" title="Tài khoản đã kích hoạt">
          Địa chỉ email của bạn đã được xác nhận. Bạn có thể tiếp tục sử dụng các tính năng theo vai trò tài khoản.
        </Alert>
        <Button type="button" onClick={() => { activateDemoSession(); router.push(next); }}>TIẾP TỤC</Button>
      </section>
    );
  }

  const expired = state === "expired";
  return (
    <section className="module-bay stack" style={{ padding: "var(--space-8)" }}>
      <div className="industrial-ruler">AUTH // VERIFICATION REQUIRED</div>
      <h1 style={{ margin: 0 }}>{expired ? "LIÊN KẾT ĐÃ HẾT HẠN" : "LIÊN KẾT KHÔNG HỢP LỆ"}</h1>
      <Alert variant="warning" title={expired ? "Yêu cầu liên kết mới" : "Không thể xác minh email"}>
        {expired ? "Vì lý do bảo mật, liên kết kích hoạt chỉ có hiệu lực trong thời gian giới hạn." : "Liên kết này không còn dùng được. Hãy yêu cầu gửi lại email kích hoạt."}
      </Alert>
      <Button type="button" onClick={() => window.location.assign("/login?mode=register")}>QUAY LẠI ĐĂNG KÝ</Button>
    </section>
  );
}
