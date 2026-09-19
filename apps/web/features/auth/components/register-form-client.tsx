"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "../../../features/auth/components/password-field";
import { setDemoSession } from "../services/demo-session";

export function RegisterFormClient({ initialRole = "STUDENT" }: { initialRole?: "STUDENT" | "SME" }) {
  const [role, setRole] = useState<"STUDENT" | "SME">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendAfter, setResendAfter] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (resendAfter === 0) return;
    const timer = window.setInterval(() => setResendAfter((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendAfter]);

  function handleFillSample(targetRole: "STUDENT" | "SME") {
    setRole(targetRole);
    setPassword("••••••••");
    if (targetRole === "STUDENT") {
      setName("Lê Tuấn Lộc");
      setEmail("letuanloc.2203@hcmus.edu.vn");
    } else {
      setName("The Coffee Lab");
      setEmail("contact@coffeelab.vn");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setDemoSession({ name, email, role, emailVerified: false });
      setRegistered(true);
      setResendAfter(30);
    }, 600);
  }

  if (registered) {
    const next = role === "SME" ? "/sme/projects/new?emailVerified=1" : "/projects?emailVerified=1";
    const verificationHref = `/verify-email?token=genda-demo-valid-2026&next=${encodeURIComponent(next)}`;

    return (
      <div className="stack">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
          KIỂM TRA HỘP THƯ CỦA BẠN
        </h2>
        <p className="text-muted">
          Một liên kết kích hoạt đã được gửi tới <strong>{email}</strong>. Liên kết có hiệu lực trong 15 phút.
        </p>
        <div style={{ border: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-subtle)", padding: "var(--space-4)" }}>
          <p className="text-caption" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>EMAIL ACTIVATION // SENT</p>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "13px" }}>Mở email và bấm “Xác minh địa chỉ email” để kích hoạt tài khoản.</p>
        </div>
        <Link href={verificationHref} className="btn--tactile-orange" style={{ height: "42px", textDecoration: "none" }}>
          MỞ EMAIL XÁC MINH
        </Link>
        <div className="cluster" style={{ gap: "var(--space-2)" }}>
          <button
            type="button"
            className="btn--tactile-zinc"
            disabled={resendAfter > 0}
            onClick={() => {
              setResent(true);
              setResendAfter(30);
            }}
          >
            {resendAfter > 0 ? `GỬI LẠI SAU ${resendAfter}S` : "GỬI LẠI EMAIL"}
          </button>
          {resent ? <span className="text-muted" aria-live="polite">Đã gửi lại liên kết kích hoạt.</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
          THIẾT LẬP TÀI KHOẢN
        </h2>
        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--orange-500)", fontWeight: 700 }}>
          JOIN // 02
        </span>
      </div>
      <p className="text-muted" style={{ marginTop: "2px", marginBottom: 0, fontSize: "12px" }}>
        Khởi tạo mã định danh năng lực & tham gia mạng lưới GenDA.
      </p>

      {/* Preset Đăng ký nhanh */}
      <div style={{ marginTop: "var(--space-2)", padding: "6px 10px", backgroundColor: "var(--color-surface-subtle)", border: "1px dashed var(--machinery-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "var(--color-text-muted)" }}>
            {"// ĐIỀN MẪU THỬ NHANH:"}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => handleFillSample("STUDENT")}
              className="chip"
              style={{ fontSize: "10px", height: "24px", paddingInline: "6px", cursor: "pointer" }}
            >
              Mẫu Sinh viên
            </button>
            <button
              type="button"
              onClick={() => handleFillSample("SME")}
              className="chip"
              style={{ fontSize: "10px", height: "24px", paddingInline: "6px", cursor: "pointer" }}
            >
              Mẫu Doanh nghiệp
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack" style={{ marginTop: "var(--space-2)", gap: "var(--space-2)" }}>
        
        {/* Bộ chọn vai trò cơ khí (Hardware Radio Switcher) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBlock: "2px" }}>
          <label 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "6px 8px", 
              border: `2px solid ${role === "STUDENT" ? "var(--orange-500)" : "var(--machinery-border)"}`,
              backgroundColor: role === "STUDENT" ? "var(--color-surface-subtle)" : "var(--color-surface-card)",
              cursor: "pointer"
            }}
          >
            <input 
              type="radio" 
              name="role" 
              value="STUDENT" 
              checked={role === "STUDENT"} 
              onChange={() => setRole("STUDENT")}
              style={{ accentColor: "var(--orange-500)", margin: 0 }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <strong style={{ display: "block", fontSize: "11px", fontFamily: "ui-monospace, monospace" }}>SINH VIÊN</strong>
              <span style={{ fontSize: "10px", color: "var(--color-text-muted)", display: "block" }}>Nhận dự án thực</span>
            </div>
          </label>

          <label 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "6px 8px", 
              border: `2px solid ${role === "SME" ? "var(--orange-500)" : "var(--machinery-border)"}`,
              backgroundColor: role === "SME" ? "var(--color-surface-subtle)" : "var(--color-surface-card)",
              cursor: "pointer"
            }}
          >
            <input 
              type="radio" 
              name="role" 
              value="SME" 
              checked={role === "SME"} 
              onChange={() => setRole("SME")}
              style={{ accentColor: "var(--orange-500)", margin: 0 }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <strong style={{ display: "block", fontSize: "11px", fontFamily: "ui-monospace, monospace" }}>DOANH NGHIỆP</strong>
              <span style={{ fontSize: "10px", color: "var(--color-text-muted)", display: "block" }}>Đăng bài toán kỹ thuật</span>
            </div>
          </label>
        </div>

        <div className="stack" style={{ gap: "6px" }}>
          <TextField
            id="register-name"
            label="HỌ VÀ TÊN / DOANH NGHIỆP"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lê Tuấn Lộc / The Coffee Lab"
          />

          <TextField
            id="register-email"
            label="EMAIL KÍCH HOẠT"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
          />

          <PasswordField 
            label="MẬT KHẨU BẢO MẬT" 
            autoComplete="new-password" 
            showStrength
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn--tactile-orange" 
          style={{ width: "100%", height: "40px", fontSize: "12px", marginTop: "4px", cursor: isLoading ? "wait" : "pointer" }}
        >
          {isLoading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN MỚI"}
        </button>

        <p className="text-caption" style={{ textAlign: "center", fontSize: "10px", color: "var(--color-text-muted)", margin: 0 }}>
          Đồng ý với <Link href="/phap-ly/quy-che-san" style={{ textDecoration: "underline" }}>Quy chế sàn</Link> & <Link href="/phap-ly/bao-mat" style={{ textDecoration: "underline" }}>Bảo mật</Link>.
        </p>
      </form>
    </div>
  );
}
