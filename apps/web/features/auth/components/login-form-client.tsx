"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "./password-field";
import { login } from "../services/auth-api";

export function LoginFormClient({ registered = false }: { registered?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    setIsLoading(true);
    try {
      const session = await login(email, password, rememberDevice);
      router.replace(session.role === "SME" ? "/sme/projects" : session.role === "ADMIN" ? "/admin" : "/projects");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể kết nối. Hãy thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>XÁC THỰC TÀI KHOẢN</h2>
      {registered ? <p role="status">Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.</p> : null}
      <p className="text-muted">Đăng nhập bằng tài khoản GenDA của bạn.</p>
      <form onSubmit={handleSubmit} className="stack" style={{ gap: "var(--space-3)" }}>
        <TextField id="login-email" label="EMAIL ĐĂNG NHẬP" type="email" required autoComplete="email"
          value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" />
        <PasswordField label="MẬT KHẨU" autoComplete="current-password" required
          value={password} onChange={(event) => setPassword(event.target.value)} />
        <label className="cluster" style={{ fontSize: "12px" }}>
          <input type="checkbox" checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} />
          Ghi nhớ thiết bị trong 7 ngày
        </label>
        {formError ? <p role="alert" style={{ color: "var(--color-danger-text)", margin: 0 }}>{formError}</p> : null}
        <button type="submit" disabled={isLoading} className="btn--tactile-brand" style={{ width: "100%", height: "40px" }}>
          {isLoading ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP"}
        </button>
      </form>
    </div>
  );
}
