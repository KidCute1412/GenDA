"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cvOnboardingHref } from "../../users/components/cv-required-gate";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "../../../features/auth/components/password-field";
import { AuthApiError, registerAccount } from "../services/auth-api";
import { RecaptchaField, verifyRecaptcha } from "./recaptcha-field";
import { isValidTaxCode, isValidWebsite, validateSmeIdentity } from "../../../lib/utils/sme-identity";

export function RegisterFormClient({ initialRole = "STUDENT" }: { initialRole?: "STUDENT" | "SME" }) {
  const [role, setRole] = useState<"STUDENT" | "SME">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  // Định danh doanh nghiệp: mã số thuế, hoặc website công ty nếu chưa có mã số thuế
  const [taxCode, setTaxCode] = useState("");
  const [noTaxCode, setNoTaxCode] = useState(false);
  const [website, setWebsite] = useState("");
  const [smeTouched, setSmeTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendAfter, setResendAfter] = useState(0);
  const [resent, setResent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Đổi key để gắn lại widget reCAPTCHA (bắt giải lại) khi xác minh thất bại
  const [captchaKey, setCaptchaKey] = useState(0);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (resendAfter === 0) return;
    const timer = window.setInterval(() => setResendAfter((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendAfter]);

  function handleFillSample(targetRole: "STUDENT" | "SME") {
    setRole(targetRole);
    setPassword("Demo@12345");
    setConfirmPassword("Demo@12345");
    if (targetRole === "STUDENT") {
      setName("Sinh viên mới");
      setEmail(`student.${Date.now()}@example.com`);
    } else {
      setName("Doanh nghiệp mới");
      setEmail(`sme.${Date.now()}@example.com`);
      setNoTaxCode(false);
      setTaxCode("0316789012");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    if (role === "SME" && smeIdentityError) {
      setSmeTouched(true);
      return;
    }
    if (!agreed) {
      setFormError("Bạn cần đồng ý với Quy chế sàn và Chính sách bảo mật để tạo tài khoản.");
      return;
    }
    if (!captchaToken) {
      setFormError("Hãy tick ô reCAPTCHA \"Tôi không phải người máy\" trước khi tạo tài khoản.");
      return;
    }
    setFormError("");
    setIsLoading(true);

    if (!(await verifyRecaptcha(captchaToken))) {
      setIsLoading(false);
      setCaptchaToken(null);
      setCaptchaKey((key) => key + 1);
      setFormError("Xác minh reCAPTCHA không thành công hoặc đã hết hạn. Hãy tick lại rồi thử lần nữa.");
      return;
    }

    try {
      await registerAccount({
        name,
        email,
        password,
        role,
        taxCode: role === "SME" && !noTaxCode ? taxCode : undefined,
        companyWebsite: role === "SME" && noTaxCode ? website : undefined
      });
      // Doanh nghiệp: chưa tạo phiên đăng nhập, chờ quản trị viên duyệt
      if (role === "SME") {
        setRegistered(true);
        return;
      }
      setRegistered(true);
      setResendAfter(30);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "EMAIL_ALREADY_REGISTERED") {
        setFormError("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
      } else if (error instanceof AuthApiError && error.code === "SME_IDENTITY_REQUIRED") {
        setFormError("Doanh nghiệp cần mã số thuế hợp lệ hoặc website công ty.");
      } else {
        setFormError(error instanceof Error ? error.message : "Không thể tạo tài khoản.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const smeIdentityError = role === "SME" ? validateSmeIdentity(noTaxCode ? { companyWebsite: website } : { taxCode }) : null;
  // Báo lỗi khi đã bấm gửi, hoặc khi người dùng đã gõ xong một giá trị sai định dạng
  const taxCodeError =
    role === "SME" && !noTaxCode && (smeTouched || (taxCode.replace(/\D/g, "").length >= 10 && !isValidTaxCode(taxCode)))
      ? smeIdentityError ?? undefined
      : undefined;
  const websiteError =
    role === "SME" && noTaxCode && (smeTouched || (website.includes(".") && !isValidWebsite(website) && website.length > 6))
      ? smeIdentityError ?? undefined
      : undefined;

  const confirmMismatch =
    confirmPassword.length > 0 &&
    confirmPassword !== password &&
    (confirmTouched || confirmPassword.length >= password.length);

  if (registered && role === "SME") {
    return (
      <div className="stack">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
          HỒ SƠ ĐANG CHỜ DUYỆT
        </h2>
        <p className="text-muted">
          Đăng ký doanh nghiệp <strong>{name}</strong> đã được gửi. Quản trị viên GenDA sẽ đối chiếu{" "}
          {noTaxCode ? "website công ty" : "mã số thuế"} trước khi kích hoạt tài khoản.
        </p>
        <div style={{ border: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-subtle)", padding: "var(--space-4)" }}>
          <p className="text-caption" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>SME REGISTRATION // PENDING REVIEW</p>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "13px" }}>
            Khi được duyệt, chúng tôi gửi thông báo tới <strong>{email}</strong> và bạn có thể đăng nhập để đăng dự án.
            Nếu bị từ chối, thông báo sẽ nêu rõ lý do.
          </p>
        </div>
        <Link href="/login" className="btn--tactile-zinc" style={{ height: "42px", textDecoration: "none" }}>
          VỀ TRANG ĐĂNG NHẬP
        </Link>
      </div>
    );
  }

  if (registered) {
    const next = role === "SME" ? "/sme/projects/new?emailVerified=1" : cvOnboardingHref("/projects?emailVerified=1");
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
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
        THIẾT LẬP TÀI KHOẢN
      </h2>
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

        {/* Doanh nghiệp: bắt buộc mã số thuế; chưa có thì nhập website công ty thay thế */}
        {role === "SME" ? (
          <div
            style={{
              padding: "var(--space-3)",
              border: "1px dashed var(--machinery-border)",
              backgroundColor: "var(--color-surface-subtle)"
            }}
          >
            {noTaxCode ? (
              <TextField
                id="register-website"
                label="WEBSITE CÔNG TY"
                type="url"
                inputMode="url"
                required
                autoComplete="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="congty.vn"
                hint="Dùng thay cho mã số thuế. Chúng tôi sẽ đối chiếu website khi duyệt tài khoản."
                error={websiteError}
              />
            ) : (
              <TextField
                id="register-tax-code"
                label="MÃ SỐ THUẾ"
                required
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="0312345678"
                hint="10 chữ số, hoặc dạng 0123456789-001 nếu là chi nhánh."
                error={taxCodeError}
              />
            )}
            <label
              htmlFor="register-no-tax-code"
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}
            >
              <input
                id="register-no-tax-code"
                type="checkbox"
                checked={noTaxCode}
                onChange={(e) => {
                  setNoTaxCode(e.target.checked);
                  setSmeTouched(false);
                }}
                style={{ width: "16px", height: "16px", margin: 0, accentColor: "var(--orange-500)", cursor: "pointer" }}
              />
              Chưa có mã số thuế, dùng website công ty thay thế
            </label>
          </div>
        ) : null}

        <div className="stack" style={{ gap: "6px" }}>
          {/* Màn hình rộng xếp từng cặp trường thành hai cột để biểu mẫu vừa màn hình laptop */}
          <div className="auth-form-pair">
          <TextField
            id="register-name"
            label="HỌ VÀ TÊN / DOANH NGHIỆP"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lê Tuấn Lộc"
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
          </div>

          <div className="auth-form-pair">

          <PasswordField 
            label="MẬT KHẨU BẢO MẬT" 
            autoComplete="new-password" 
            showStrength
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Nhập lại mật khẩu: báo lệch khi đã gõ đủ độ dài mật khẩu, hoặc sau khi bấm gửi */}
          <PasswordField
            label="NHẬP LẠI MẬT KHẨU"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmMismatch ? "Mật khẩu nhập lại không khớp. Hãy gõ lại đúng mật khẩu đã đặt." : undefined}
          />
          </div>
        </div>

        {/* Bắt buộc tick đồng ý điều khoản trước khi tạo tài khoản */}
        <label
          htmlFor="register-agree"
          style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", lineHeight: 1.45, cursor: "pointer" }}
        >
          <input
            id="register-agree"
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setFormError("");
            }}
            style={{ width: "18px", height: "18px", marginTop: "1px", flexShrink: 0, accentColor: "var(--orange-500)", cursor: "pointer" }}
          />
          <span>
            Tôi đồng ý với{" "}
            <Link href="/phap-ly/quy-che-san" target="_blank" style={{ textDecoration: "underline", color: "var(--orange-500)" }}>
              Quy chế sàn
            </Link>{" "}
            &{" "}
            <Link href="/phap-ly/bao-mat" target="_blank" style={{ textDecoration: "underline", color: "var(--orange-500)" }}>
              Bảo mật
            </Link>
            .
          </span>
        </label>

        <RecaptchaField
          key={captchaKey}
          onChange={(token) => {
            setCaptchaToken(token);
            if (token) setFormError("");
          }}
        />

        {formError ? (
          <p role="alert" style={{ margin: 0, fontSize: "12px", color: "var(--color-danger-text, #b91c1c)" }}>
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !agreed || !captchaToken}
          className="btn--tactile-orange"
          style={{
            width: "100%",
            height: "40px",
            fontSize: "12px",
            marginTop: "4px",
            cursor: isLoading ? "wait" : !agreed || !captchaToken ? "not-allowed" : "pointer",
            opacity: agreed && captchaToken ? 1 : 0.55
          }}
        >
          {isLoading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN MỚI"}
        </button>
      </form>
    </div>
  );
}
