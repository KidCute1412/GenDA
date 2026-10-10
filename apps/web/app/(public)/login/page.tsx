import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { LoginFormClient } from "../../../features/auth/components/login-form-client";
import { RegisterFormClient } from "../../../features/auth/components/register-form-client";

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
      <SiteHeader />

      <main 
        id="main-content" 
        className="industrial-canvas" 
        style={{ 
          minHeight: "calc(100vh - 64px)", 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center", 
          padding: "var(--space-3) var(--space-4)" 
        }}
      >
        <div className="container" style={{ maxWidth: "1080px", width: "100%" }}>
          
          <div 
            className="module-bay" 
            style={{ 
              padding: 0, 
              overflow: "hidden", 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              boxShadow: "4px 4px 0px var(--machinery-shadow)"
            }}
          >
            
            {/* CỘT TRÁI: POSTER DECOR CƠ KHÍ & THỊ GIÁC NGHỆ THUẬT (Minimalist Teenage Engineering Aesthetic) */}
            <div style={{ 
              backgroundColor: "var(--machinery-border)", 
              color: "var(--color-surface-card)", 
              padding: "var(--space-6) var(--space-6)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              borderRight: "2px solid var(--machinery-border)"
            }}>
              {/* Họa tiết lưới tọa độ mờ cơ khí */}
              <div 
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  pointerEvents: "none",
                  opacity: 0.6
                }} 
              />

              {/* Header của Poster */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "ui-monospace, monospace", fontSize: "10px", letterSpacing: "0.12em", color: "var(--orange-500)", fontWeight: 800 }}>
                  <span style={{ width: "6px", height: "6px", backgroundColor: "var(--orange-500)", display: "inline-block" }} />
                  <span>GENDA INDUSTRIAL LEDGER</span>
                </div>

                <div style={{ marginTop: "var(--space-4)" }}>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    PROTOCOL 2026 // VN-HCM
                  </span>
                  <h1 style={{ 
                    fontFamily: "var(--font-sans)", 
                    fontSize: "clamp(2rem, 3.5vw, 2.75rem)", 
                    fontWeight: 900, 
                    lineHeight: 1.05, 
                    letterSpacing: "-0.03em", 
                    textTransform: "uppercase", 
                    margin: "var(--space-1) 0",
                    color: "#ffffff"
                  }}>
                    FROM LEARN <br />
                    TO <span style={{ color: "var(--orange-500)" }}>EARN.</span>
                  </h1>
                </div>
              </div>

              {/* Đồ họa linh kiện phần cứng dập chìm */}
              <div style={{ position: "relative", zIndex: 1, marginBlock: "var(--space-4)" }}>
                <div style={{ 
                  border: "1px solid rgba(255,255,255,0.2)", 
                  padding: "12px 16px", 
                  backgroundColor: "rgba(0,0,0,0.25)",
                  fontFamily: "ui-monospace, monospace"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.5)", borderBottom: "1px dashed rgba(255,255,255,0.2)", paddingBottom: "6px", marginBottom: "8px" }}>
                    <span>ENCLAVE HARDWARE</span>
                    <span>OP-01 CHIP</span>
                  </div>
                  
                  {/* Visual LED bars decor */}
                  <div style={{ display: "flex", gap: "5px", alignItems: "flex-end", height: "24px", marginBottom: "8px" }}>
                    <div style={{ width: "6px", height: "40%", backgroundColor: "var(--orange-500)" }} />
                    <div style={{ width: "6px", height: "70%", backgroundColor: "var(--orange-500)" }} />
                    <div style={{ width: "6px", height: "100%", backgroundColor: "var(--orange-500)" }} />
                    <div style={{ width: "6px", height: "55%", backgroundColor: "rgba(255,255,255,0.4)" }} />
                    <div style={{ width: "6px", height: "85%", backgroundColor: "rgba(255,255,255,0.4)" }} />
                    <div style={{ width: "6px", height: "35%", backgroundColor: "rgba(255,255,255,0.4)" }} />
                  </div>

                  <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
                    Mỗi dự án là một khoang gắn module. Mỗi nghiệm thu là một dấu ấn năng lực được bảo chứng.
                  </p>
                </div>
              </div>

              {/* Chân Poster */}
              <div style={{ 
                position: "relative", 
                zIndex: 1, 
                display: "flex", 
                justifyContent: "space-between", 
                fontFamily: "ui-monospace, monospace", 
                fontSize: "10px", 
                color: "rgba(255,255,255,0.5)", 
                borderTop: "1px solid rgba(255,255,255,0.2)", 
                paddingTop: "var(--space-2)" 
              }}>
                <span>SYS.VER: 2026.09</span>
                <span>SECURED & VERIFIED</span>
              </div>
            </div>

            {/* CỘT PHẢI: UNIFIED AUTH TERMINAL (TAB CHUYỂN ĐỔI ĐĂNG NHẬP / TẠO TÀI KHOẢN) */}
            <div style={{ 
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
                {!isRegister ? (
                  <LoginFormClient />
                ) : (
                  <RegisterFormClient initialRole={selectedRole} />
                )}
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

          </div>

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

      {/* Đã tích hợp micro footer ngay dưới thẻ terminal module */}
    </>
  );
}
