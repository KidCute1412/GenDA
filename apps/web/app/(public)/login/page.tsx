import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "../../../features/auth/components/password-field";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản GenDA của bạn."
};

/** Đăng nhập (FR-AUTH-03, FR-AUTH-05). */
export default function LoginPage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content" className="container">
        <div style={{ maxWidth: "440px", marginInline: "auto" }} className="section">
          <h1>Đăng nhập</h1>
          <p className="lede" style={{ marginBlock: "var(--space-3) var(--space-8)" }}>
            Cùng một tài khoản dùng cho cả hai vai trò sinh viên và doanh nghiệp.
          </p>

          <form className="stack">
            <div>
              <TextField
                id="login-email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="ban@vidu.com"
              />

              {/* Dùng chung PasswordField với màn hình đăng ký: nút hiện/ẩn mật
                  khẩu và quy tắc cho phép dán (WCAG 2.2 AA 3.3.8) nằm sẵn trong
                  component, nên không màn hình nào có thể quên mất một trong hai. */}
              <PasswordField label="Mật khẩu" autoComplete="current-password" />

              <p style={{ marginTop: "calc(-1 * var(--space-2))" }}>
                <Link href="/quen-mat-khau" className="text-caption">
                  Quên mật khẩu?
                </Link>
              </p>
            </div>

            <Button type="submit" size="lg" block>
              Đăng nhập
            </Button>

            <p style={{ textAlign: "center" }}>
              Chưa có tài khoản? <Link href="/register">Tạo tài khoản miễn phí</Link>
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
