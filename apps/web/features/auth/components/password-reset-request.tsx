"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/field";

export function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <Alert variant="success" title="Đã gửi hướng dẫn đặt lại mật khẩu">Nếu địa chỉ {email} thuộc một tài khoản GenDA, bạn sẽ nhận được email với liên kết đặt lại mật khẩu trong ít phút.</Alert>;
  return (
    <form className="stack" onSubmit={(event) => { event.preventDefault(); if (email) setSent(true); }}>
      <TextField id="password-reset-email" label="EMAIL ĐĂNG KÝ" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <Button type="submit">GỬI LIÊN KẾT ĐẶT LẠI</Button>
    </form>
  );
}
