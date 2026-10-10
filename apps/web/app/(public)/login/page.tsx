import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { LoginFormClient } from "../../../features/auth/components/login-form-client";
import { RegisterFormClient } from "../../../features/auth/components/register-form-client";
import { AuthIntro } from "../../../features/auth/components/auth-intro";
import { AuthCard } from "../../../features/auth/components/auth-card";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản GenDA của bạn."
};

type AuthSearchParams = { mode?: string; role?: string };

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const params = await searchParams;
  const isRegister = params.mode === "register";
  const selectedRole = params.role === "sme" ? "SME" : "STUDENT";

  return (
    <>
      <SiteHeader hideOnMobile />

      <main 
        id="main-content" 
        className="industrial-canvas has-bottom-nav auth-shell"
        style={{ 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center", 
          padding: "var(--space-3) var(--space-4)" 
        }}
      >
        <div style={{ width: "100%" }}>
          
          <AuthCard initialMode={isRegister ? "register" : "login"}>

            {/* CỘT HÌNH: cảnh minh họa morph giữa Đăng nhập (ngày, đi làm) và Đăng ký (đêm, ngồi học) */}
            <AuthIntro />

            {/* CỘT BIỂU MẪU: bên phải khi đăng nhập, trượt sang trái khi đăng ký */}
            <div className="auth-form-col" style={{ 
              padding: "var(--space-6) var(--space-6)", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              backgroundColor: "var(--color-surface-card)" 
            }}>
              <div>
                
                {/* Switcher Tab Cơ khí: ĐĂNG NHẬP // TẠO TÀI KHOẢN */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "4px", 
                  backgroundColor: "var(--color-surface-subtle)", 
                  padding: "3px", 
                  border: "2px solid var(--machinery-border)",
                  marginBottom: "var(--space-4)"
                }}>
                  <Link
                    href="/login"
                    scroll={false}
                    className="chip"
                    aria-pressed={!isRegister}
                    style={{ 
                      justifyContent: "center", 
                      border: 0, 
                      boxShadow: "none", 
                      height: "32px", 
                      fontSize: "11px",
                      backgroundColor: !isRegister ? "var(--machinery-border)" : "transparent",
                      color: !isRegister ? "#ffffff" : "var(--color-text-body)"
                    }}
                  >
                    [1] ĐĂNG NHẬP
                  </Link>

                  <Link
                    href="/login?mode=register"
                    scroll={false}
                    className="chip"
                    aria-pressed={isRegister}
                    style={{ 
                      justifyContent: "center", 
                      border: 0, 
                      boxShadow: "none", 
                      height: "32px", 
                      fontSize: "11px",
                      backgroundColor: isRegister ? "var(--machinery-border)" : "transparent",
                      color: isRegister ? "#ffffff" : "var(--color-text-body)"
                    }}
                  >
                    [2] TẠO TÀI KHOẢN
                  </Link>
                </div>

                {/* Nội dung tương ứng (Đã hỗ trợ mock đăng nhập & chọn tài khoản mẫu) */}
                {/* Đổi key theo chế độ để biểu mẫu mới chạy animation hiện lên */}
                <div key={isRegister ? "register" : "login"} className="auth-form-swap">
                  {!isRegister ? (
                    <LoginFormClient />
                  ) : (
                    <RegisterFormClient initialRole={selectedRole} />
                  )}
                </div>
              </div>

              {/* Chân điều hướng nhanh giữa 2 chế độ */}
              <div 
                style={{ 
                  textAlign: "center", 
                  paddingTop: "var(--space-3)", 
                  fontSize: "11px", 
                  fontFamily: "ui-monospace, monospace",
                  borderTop: "1px solid var(--color-border-subtle)",
                  marginTop: "var(--space-3)"
                }}
              >
                {!isRegister ? (
                  <>
                    <span className="text-muted">CHƯA CÓ TÀI KHOẢN? </span>
                    <Link 
                      href="/login?mode=register" 
                      style={{ color: "var(--orange-500)", fontWeight: 700, textDecoration: "none" }}
                    >
                      [CHUYỂN SANG ĐĂNG KÝ]
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-muted">ĐÃ CÓ TÀI KHOẢN? </span>
                    <Link 
                      href="/login" 
                      style={{ color: "var(--orange-500)", fontWeight: 700, textDecoration: "none" }}
                    >
                      [CHUYỂN SANG ĐĂNG NHẬP]
                    </Link>
                  </>
                )}
              </div>
            </div>

          </AuthCard>

          {/* Micro Footer ngay chân card thay cho Fat Footer khổng lồ ở trang Login */}
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              flexWrap: "wrap", 
              gap: "8px", 
              marginTop: "var(--space-2)", 
              fontFamily: "ui-monospace, monospace", 
              fontSize: "11px", 
              color: "var(--color-text-muted)" 
            }}
          >
            <div>© 2026 GENDA PROTOCOL // TRUST-LAYER ECOSYSTEM</div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link href="/phap-ly/quy-che-san" style={{ color: "inherit", textDecoration: "underline" }}>Quy chế sàn</Link>
              <Link href="/phap-ly/bao-mat" style={{ color: "inherit", textDecoration: "underline" }}>Bảo mật</Link>
              <Link href="/ho-tro/cau-hoi-thuong-gap" style={{ color: "inherit", textDecoration: "underline" }}>Hỗ trợ</Link>
            </div>
          </div>

        </div>
      </main>
      <BottomNav />

      {/* Đã tích hợp micro footer ngay dưới thẻ terminal module */}
    </>
  );
}
