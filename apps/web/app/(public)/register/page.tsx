import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/field";
import { PasswordField } from "../../../features/auth/components/password-field";

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: "Tạo tài khoản sinh viên hoặc doanh nghiệp trên GenDA."
};

/**
 * Đăng ký (FR-AUTH-01, FR-AUTH-02).
 *
 * Vai trò chọn bằng nhóm radio hiện rõ ngay đầu form, không giấu trong dropdown:
 * đây là quyết định phân nhánh toàn bộ trải nghiệm về sau, người dùng phải thấy
 * cả hai lựa chọn cùng lúc mới so sánh được.
 *
 * Radio dùng thẻ <label> bọc cả khối nên vùng chạm là toàn bộ ô, vượt xa ngưỡng
 * 44x44px của WCAG 2.5.8 thay vì chỉ cái chấm tròn 16px.
 */
const ROLES = [
  {
    value: "STUDENT",
    title: "Tôi là sinh viên",
    body: "Tìm dự án thật, làm theo mốc, nhận portfolio được doanh nghiệp xác nhận."
  },
  {
    value: "SME",
    title: "Tôi là doanh nghiệp",
    body: "Đăng một việc cần làm, chọn một bạn sinh viên, nghiệm thu theo từng mốc."
  }
];

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content" className="container">
        <div style={{ maxWidth: "560px", marginInline: "auto" }} className="section">
          <h1>Tạo tài khoản GenDA</h1>
          <p className="lede" style={{ marginBlock: "var(--space-3) var(--space-8)" }}>
            Miễn phí với cả sinh viên và doanh nghiệp. Chúng tôi không thu phí nền tảng ở bản MVP.
          </p>

          <form className="stack">
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="field__label" style={{ marginBottom: "var(--space-3)" }}>
                Bạn tham gia với vai trò nào?
              </legend>

              <div className="stack stack--sm">
                {ROLES.map((role, index) => (
                  <label key={role.value} className="card" style={{ cursor: "pointer", display: "block" }}>
                    <span className="cluster" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        defaultChecked={index === 0}
                        style={{ width: "20px", height: "20px", marginTop: "2px", flexShrink: 0 }}
                      />
                      <span>
                        <span
                          style={{
                            display: "block",
                            fontWeight: "var(--weight-semibold)",
                            color: "var(--color-text-heading)"
                          }}
                        >
                          {role.title}
                        </span>
                        <span className="text-muted">{role.body}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div style={{ marginTop: "var(--space-2)" }}>
              <TextField
                id="register-name"
                label="Họ và tên, hoặc tên doanh nghiệp"
                required
                autoComplete="name"
                placeholder="Nguyễn Hải Nam"
              />

              <TextField
                id="register-email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="ban@vidu.com"
                hint="Chúng tôi gửi một thư xác minh tới địa chỉ này trước khi bạn đăng dự án hoặc ứng tuyển."
              />

              <PasswordField autoComplete="new-password" showStrength />
            </div>

            <Button type="submit" size="lg" block>
              Tạo tài khoản
            </Button>

            <p className="text-caption" style={{ textAlign: "center" }}>
              Khi tạo tài khoản, bạn đồng ý với{" "}
              <Link href="/phap-ly/quy-che-san">quy chế hoạt động sàn</Link> và{" "}
              <Link href="/phap-ly/bao-mat">chính sách bảo mật</Link>.
            </p>

            <p style={{ textAlign: "center" }}>
              Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
