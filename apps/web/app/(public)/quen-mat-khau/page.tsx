import Link from "next/link";
import { SiteFooter } from "../../../components/layout/site-footer";
import { SiteHeader } from "../../../components/layout/site-header";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { PasswordResetRequest } from "../../../features/auth/components/password-reset-request";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader hideOnMobile />
      <main id="main-content" className="industrial-canvas has-bottom-nav">
        <div className="container" style={{ maxWidth: "640px", paddingBlock: "var(--space-16)" }}>
          <section className="module-bay stack" style={{ padding: "var(--space-8)" }}>
            <h1 style={{ margin: 0 }}>ĐẶT LẠI MẬT KHẨU</h1>
            <p className="text-muted">Nhập email đã dùng để đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
            <PasswordResetRequest />
            <Link href="/login" className="text-muted">Quay lại đăng nhập</Link>
          </section>
        </div>
      </main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
