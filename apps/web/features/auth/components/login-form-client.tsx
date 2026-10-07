"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "./password-field";
import { AuthApiError, login } from "../services/auth-api";
import { RecaptchaField, verifyRecaptcha } from "./recaptcha-field";

const STUDENT_HOME = "/projects";
const DEMO_PASSWORD = "Demo@12345";

export function LoginFormClient() {
  const router = useRouter();
  const [email, setEmail] = useState("letuanloc.2203@hcmus.edu.vn");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [formError, setFormError] = useState("");

  function fillDemo(accountEmail: string) {
    setEmail(accountEmail);
    setPassword(DEMO_PASSWORD);
    setFormError("");
  }

  async function loginDemo(accountEmail: string) {
    fillDemo(accountEmail);
    setIsLoading(true);
    try {
      const session = await login(accountEmail, DEMO_PASSWORD, false);
      const destination = session.role === "SME" ? "/sme/projects" : session.role === "ADMIN" ? "/admin" : STUDENT_HOME;
      router.replace(destination);
      router.refresh();
    } catch (error) {
      if (error instanceof AuthApiError) {
        const suffix = error.requestId ? ` Mã yêu cầu: ${error.requestId}.` : "";
        setFormError(`${error.message}${suffix}`);
      } else {
        setFormError("Không thể kết nối tới hệ thống đăng nhập. Hãy thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!captchaToken) {
      setFormError("Hãy hoàn thành bước xác minh chống người máy trước khi đăng nhập.");
      return;
    }
    setFormError("");
    setIsLoading(true);

    try {
      if (!(await verifyRecaptcha(captchaToken))) {
        throw new AuthApiError("RECAPTCHA_FAILED", "Xác minh reCAPTCHA không thành công hoặc đã hết hạn.");
      }
      const session = await login(email, password, rememberDevice);
      const destination = session.role === "SME" ? "/sme/projects" : session.role === "ADMIN" ? "/admin" : STUDENT_HOME;
      router.replace(destination);
      router.refresh();
    } catch (error) {
      setCaptchaToken(null);
      setCaptchaKey((value) => value + 1);
      if (error instanceof AuthApiError) {
        const suffix = error.requestId ? ` Mã yêu cầu: ${error.requestId}.` : "";
        setFormError(`${error.message}${suffix}`);
      } else {
        setFormError("Không thể kết nối tới hệ thống đăng nhập. Hãy thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
        XÁC THỰC TÀI KHOẢN
      </h2>
      <p className="text-muted" style={{ marginTop: "2px", marginBottom: 0, fontSize: "12px" }}>
        Dùng chung một tài khoản cho sinh viên, doanh nghiệp và quản trị viên.
      </p>

      <div style={{ marginTop: "var(--space-3)", padding: "8px 10px", backgroundColor: "var(--color-surface-subtle)", border: "1px dashed var(--machinery-border)" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
          {"// TÀI KHOẢN DEMO, MẬT KHẨU: Demo@12345"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button type="button" onClick={() => void loginDemo("letuanloc.2203@hcmus.edu.vn")} className="chip">
            Sinh viên
          </button>
          <button type="button" onClick={() => void loginDemo("contact@coffeelab.vn")} className="chip">
            Doanh nghiệp
          </button>
          <button type="button" onClick={() => void loginDemo("admin@genda.vn")} className="chip">
            Quản trị
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack" style={{ marginTop: "var(--space-3)", gap: "var(--space-3)" }}>
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <TextField id="login-email" label="EMAIL ĐĂNG NHẬP" type="email" required autoComplete="email"
            value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" />
          <div>
            <PasswordField label="MẬT KHẨU BẢO MẬT" autoComplete="current-password" required
              value={password} onChange={(event) => setPassword(event.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <input type="checkbox" checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)} />
                Ghi nhớ thiết bị trong 7 ngày
              </label>
              <Link href="/quen-mat-khau" className="text-caption"
                style={{ fontFamily: "ui-monospace, monospace", textDecoration: "underline", color: "var(--color-text-muted)", fontSize: "11px" }}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </div>

        <div>
          <RecaptchaField key={captchaKey} onChange={(token) => { setCaptchaToken(token); if (token) setFormError(""); }} />
          {formError ? <p role="alert" style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-danger-text)" }}>{formError}</p> : null}
        </div>

        <button type="submit" disabled={isLoading || !captchaToken} className="btn--tactile-orange"
          style={{ width: "100%", height: "40px", fontSize: "12px", cursor: isLoading ? "wait" : !captchaToken ? "not-allowed" : "pointer", opacity: captchaToken ? 1 : 0.55 }}>
          {isLoading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN ĐĂNG NHẬP"}
        </button>
      </form>
    </div>
  );
}
