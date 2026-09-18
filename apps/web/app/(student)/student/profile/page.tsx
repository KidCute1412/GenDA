import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { Alert } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { SelectField, TextField } from "../../../../components/ui/field";
import { SkillMultiSelect } from "../../../../features/projects/components/skill-multi-select";
import { VerificationPanel } from "../../../../features/auth/components/verification-panel";
import { CURRENT_STUDENT } from "../../../../mocks/data";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Khai báo hồ sơ năng lực và xác thực tài khoản sinh viên."
};

/**
 * Màn hình 2 — Hồ sơ & Xác thực Sinh viên (docs/design.md 7.2).
 *
 * Banner xác thực có bốn trạng thái, mỗi trạng thái mã hóa đủ BA LỚP theo quy
 * tắc Redundant Coding: màu nền + biểu tượng + nhãn chữ (design.md 4.5). Bảng
 * dưới đây giữ cả bốn ở một chỗ để không trạng thái nào bị bỏ quên khi sửa về
 * sau — nhất là `REJECTED`, trạng thái dễ bị bỏ sót nhất vì hiếm gặp khi thử.
 *
 * Giọng văn của từng dòng theo đòn bẩy làm ấm số 1 (4.9.1): nói với người dùng
 * chuyện gì đang xảy ra và mất bao lâu, thay vì đọc tên trạng thái hệ thống.
 */
const VERIFICATION_BANNER = {
  UNVERIFIED: {
    variant: "info" as const,
    title: "Bạn cần xác thực tài khoản sinh viên",
    body: "Xác thực xong bạn mới nộp được đơn ứng tuyển. Đây là cách chúng tôi bảo đảm với doanh nghiệp rằng người nhận việc đúng là sinh viên đang theo học."
  },
  PENDING: {
    variant: "warning" as const,
    title: "Chúng tôi đang xem minh chứng của bạn",
    body: "Thường mất dưới 24 giờ. Bạn cứ xem trước các dự án đang tuyển, chỉ cần chờ tới lúc bấm nộp đơn."
  },
  VERIFIED: {
    variant: "success" as const,
    title: "Đã xác thực sinh viên chính quy",
    body: "Bạn nộp đơn ứng tuyển được ngay bây giờ. Huy hiệu xác thực cũng hiện trên hồ sơ để doanh nghiệp thấy."
  },
  REJECTED: {
    variant: "danger" as const,
    title: "Minh chứng chưa được chấp nhận",
    body: "Ảnh thẻ bị mờ nên chúng tôi không đọc được ngày hết hạn. Bạn chụp lại ở nơi đủ sáng và gửi lần nữa giúp chúng tôi."
  }
};

export default function StudentProfilePage() {
  const banner = VERIFICATION_BANNER[CURRENT_STUDENT.verification];
  const verified = CURRENT_STUDENT.verification === "VERIFIED";

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="container has-bottom-nav">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Hồ sơ của tôi</li>
          </ol>
        </nav>

        <div className="section--tight">
          <h1>Hồ sơ của tôi</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Đây là thứ doanh nghiệp đọc trước khi quyết định chọn bạn. Khai đủ kỹ năng cũng giúp hệ thống
            gợi ý đúng dự án hơn.
          </p>
        </div>

        <Alert variant={banner.variant} title={banner.title}>
          {banner.body}
          {CURRENT_STUDENT.verification === "REJECTED" ? (
            <p style={{ marginTop: "var(--space-3)" }}>
              <Button variant="outline" size="sm">
                Tải lên ảnh thẻ mới
              </Button>
            </p>
          ) : null}
        </Alert>

        <div className="layout-aside section--tight">
          <div className="stack stack--lg">
            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Thông tin cơ bản</h2>
              <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
                Tên và trường hiển thị công khai trên hồ sơ năng lực của bạn.
              </p>

              <form>
                <TextField
                  id="profile-name"
                  label="Họ và tên"
                  required
                  defaultValue={CURRENT_STUDENT.name}
                  autoComplete="name"
                />

                <SelectField id="profile-school" label="Trường đang theo học" required defaultValue={CURRENT_STUDENT.school}>
                  <option>ĐH Khoa học Tự nhiên, ĐHQG-HCM</option>
                  <option>ĐH Bách khoa, ĐHQG-HCM</option>
                  <option>ĐH Kinh tế - Luật, ĐHQG-HCM</option>
                  <option>ĐH Sư phạm Kỹ thuật TP.HCM</option>
                  <option>ĐH FPT TP.HCM</option>
                  <option>Trường khác</option>
                </SelectField>

                <TextField
                  id="profile-major"
                  label="Ngành học"
                  required
                  defaultValue={CURRENT_STUDENT.major}
                />

                <Button type="submit">Lưu thông tin</Button>
              </form>
            </section>

            <section className="card">
              <h2 style={{ fontSize: "var(--text-h3-size)" }}>Kỹ năng của bạn</h2>
              <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
                Chọn từ danh mục có sẵn, không nhập tự do. Hệ thống so khớp kỹ năng theo đúng tên này để
                chấm độ phù hợp với từng dự án.
              </p>

              <SkillMultiSelect name="skills" defaultSelected={CURRENT_STUDENT.skills} max={8} />
            </section>
          </div>

          <aside>
            <section className="card">
              <h2 style={{ fontSize: "var(--text-h4-size)" }}>Xác thực sinh viên</h2>

              {verified ? (
                <div className="stack stack--sm" style={{ marginTop: "var(--space-4)" }}>
                  <p className="text-muted" style={{ margin: 0 }}>
                    Đã xác thực qua email trường:
                  </p>
                  <p style={{ margin: 0, color: "var(--color-text-heading)" }}>
                    {CURRENT_STUDENT.schoolEmail}
                  </p>
                  <p className="text-caption" style={{ margin: 0 }}>
                    Nếu bạn đổi trường hoặc email trường hết hiệu lực, hãy xác thực lại.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: "var(--space-4)" }}>
                  <VerificationPanel />
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter />
      <BottomNav current="/student/profile" />
    </>
  );
}
