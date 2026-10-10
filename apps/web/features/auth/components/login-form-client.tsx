"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "../../../features/auth/components/password-field";
import { setDemoSession } from "../services/demo-session";

export function LoginFormClient() {
  const router = useRouter();
  const [email, setEmail] = useState("letuanloc.2203@hcmus.edu.vn");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);

  function handleFillStudent() {
    setEmail("letuanloc.2203@hcmus.edu.vn");
    setPassword("••••••••");
  }

  function handleFillSme() {
    setEmail("contact@coffeelab.vn");
    setPassword("••••••••");
  }

  function quickLogin(name: string, accountEmail: string, role: "STUDENT" | "SME" | "ADMIN", destination: string) {
    setDemoSession({ name, email: accountEmail, role, emailVerified: true });
    router.push(destination);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Tự động phân luồng theo role hoặc email
      if (email.includes("sme") || email.includes("coffee") || email.includes("corp") || email.includes("lab")) {
        setDemoSession({ name: "The Coffee Lab", email, role: "SME", emailVerified: true });
        router.push("/sme/projects");
      } else {
        setDemoSession({ name: "Lê Tuấn Lộc", email, role: "STUDENT", emailVerified: true });
        router.push("/student/profile");
      }
    }, 600);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
          XÁC THỰC TÀI KHOẢN
        </h2>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--orange-500)", fontWeight: 700 }}>
          AUTH // 01
        </span>
      </div>
      <p className="text-muted" style={{ marginTop: "2px", marginBottom: 0, fontSize: "12px" }}>
        Dùng chung một tài khoản cho cả sinh viên và doanh nghiệp.
      </p>

      {/* Preset Đăng nhập mẫu (Click là điền ngay) */}
      <div style={{ marginTop: "var(--space-3)", padding: "8px 10px", backgroundColor: "var(--color-surface-subtle)", border: "1px dashed var(--machinery-border)" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
          {"// CHỌN TÀI KHOẢN DEMO CÓ SẴN:"}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={handleFillStudent}
            className="chip"
            style={{ 
              fontSize: "11px", 
              height: "26px", 
              paddingInline: "8px", 
              cursor: "pointer",
              borderColor: email === "letuanloc.2203@hcmus.edu.vn" ? "var(--orange-500)" : "var(--machinery-border)",
              backgroundColor: email === "letuanloc.2203@hcmus.edu.vn" ? "var(--color-surface-card)" : "transparent"
            }}
          >
            Sinh viên (Lê Tuấn Lộc)
          </button>
          <button
            type="button"
            onClick={handleFillSme}
            className="chip"
            style={{ 
              fontSize: "11px", 
              height: "26px", 
              paddingInline: "8px", 
              cursor: "pointer",
              borderColor: email === "contact@coffeelab.vn" ? "var(--orange-500)" : "var(--machinery-border)",
              backgroundColor: email === "contact@coffeelab.vn" ? "var(--color-surface-card)" : "transparent"
            }}
          >
            Doanh nghiệp (The Coffee Lab)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack" style={{ marginTop: "var(--space-3)", gap: "var(--space-3)" }}>
        <div className="stack" style={{ gap: "var(--space-2)" }}>
          <TextField
            id="login-email"
            label="EMAIL ĐĂNG NHẬP"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
          />

          <div>
            <PasswordField 
              label="MẬT KHẨU BẢO MẬT" 
              autoComplete="current-password" 
              required={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
              <Link 
                href="/quen-mat-khau" 
                className="text-caption"
                style={{ fontFamily: "ui-monospace, monospace", textDecoration: "underline", color: "var(--color-text-muted)", fontSize: "11px" }}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn--tactile-orange" 
          style={{ width: "100%", height: "40px", fontSize: "12px", cursor: isLoading ? "wait" : "pointer" }}
        >
          {isLoading ? "ĐANG XÁC THỰC..." : "XÁC NHẬN ĐĂNG NHẬP"}
        </button>
      </form>

      {/* Phím tắt Prototype */}
      <div style={{ marginTop: "var(--space-3)", paddingTop: "var(--space-2)", borderTop: "1px dashed var(--machinery-border)" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
          {"// VÀO THẲNG GIAO DIỆN (BYPASS):"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)" }}>
          <button type="button" onClick={() => quickLogin("Lê Tuấn Lộc", "letuanloc.2203@hcmus.edu.vn", "STUDENT", "/student/profile")} className="btn--tactile-zinc" style={{ height: "30px", fontSize: "10px", padding: 0 }}>
            SINH VIÊN
          </button>
          <button type="button" onClick={() => quickLogin("The Coffee Lab", "contact@coffeelab.vn", "SME", "/sme/projects")} className="btn--tactile-zinc" style={{ height: "30px", fontSize: "10px", padding: 0 }}>
            DOANH NGHIỆP
          </button>
          <button type="button" onClick={() => quickLogin("Đỗ Minh Triết", "admin@genda.vn", "ADMIN", "/admin")} className="btn--tactile-zinc" style={{ height: "30px", fontSize: "10px", padding: 0 }}>
            QUẢN TRỊ
          </button>
        </div>
      </div>
    </div>
  );
}
