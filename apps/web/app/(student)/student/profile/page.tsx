import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { StudentRouteGuard } from "../../../../features/auth/components/student-route-guard";
import { Alert } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { SelectField, TextField } from "../../../../components/ui/field";
import { SkillMultiSelect } from "../../../../features/projects/components/skill-multi-select";
import { VerificationPanel } from "../../../../features/auth/components/verification-panel";
import { ProfileSaveButton, ReuploadVerificationButton } from "../../../../features/users/components/profile-action-buttons";
import { CvUploader } from "../../../../features/users/components/cv-uploader";
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
      <SiteHeader hideOnMobile />

      <StudentRouteGuard>
      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* TIÊU ĐỀ TRANG NEO-INDUSTRIAL */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "0 0 var(--space-1)" }}>
              HỒ SƠ CỦA TÔI
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "68ch" }}>
              Hồ sơ này là căn cứ để doanh nghiệp đối tác đánh giá và giao việc. Khai báo chính xác các kỹ năng chuẩn để hệ thống tự động so khớp các bài toán kỹ thuật phù hợp nhất.
            </p>
          </div>

          {/* BANNER THÔNG BÁO XÁC THỰC */}
          <div 
            style={{ 
              border: "2px solid var(--machinery-border)", 
              backgroundColor: "var(--color-surface-card)", 
              padding: "var(--space-4) var(--space-5)",
              marginBottom: "var(--space-6)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <div style={{ 
                backgroundColor: verified ? "var(--color-status-verified)" : "var(--orange-500)", 
                color: "#ffffff", 
                padding: "6px", 
                borderRadius: "2px", 
                flexShrink: 0,
                marginTop: "2px"
              }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 900 }}>
                  {verified ? "✓" : "!"}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                  <strong style={{ fontSize: "13px", textTransform: "uppercase", fontFamily: "ui-monospace, monospace", color: "var(--color-text-heading)" }}>
                    {banner.title}
                  </strong>
                  <span className="badge badge--verified" style={{ fontSize: "10px", padding: "1px 6px" }}>
                    {CURRENT_STUDENT.verification}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-body)", lineHeight: 1.5 }}>
                  {banner.body}
                </p>
                {CURRENT_STUDENT.verification === "REJECTED" ? (
                  <div style={{ marginTop: "var(--space-3)" }}>
                    <ReuploadVerificationButton />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* MỘT CỘT: thông tin cơ bản + kỹ năng (tài khoản, đăng xuất, CV đã có lối tắt trong menu người dùng trên header) */}
          <div style={{ maxWidth: "880px" }}>
            <div className="stack stack--lg">
              {/* Chưa xác thực thì vẫn cần chỗ gửi minh chứng sinh viên */}
              {!verified ? (
                <section className="module-bay" style={{ padding: "var(--space-6)" }}>
                  <div className="module-bay__header">
                    <span className="module-bay__id">XÁC THỰC</span>
                    <span>XÁC THỰC SINH VIÊN</span>
                  </div>
                  <VerificationPanel />
                </section>
              ) : null}

              
              {/* SECTION: THÔNG TIN CƠ BẢN */}
              <section className="module-bay" style={{ padding: "var(--space-6)" }}>
                <div className="module-bay__header">
                  <span className="module-bay__id">MODULE // 01</span>
                  <span>THÔNG TIN CƠ BẢN</span>
                </div>

                <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: "12px" }}>
                  Họ tên và trường đại học sẽ hiển thị công khai trên hồ sơ năng lực bảo chứng của bạn.
                </p>

                <form className="stack" style={{ gap: "var(--space-4)" }}>
                  <TextField
                    id="profile-name"
                    label="HỌ VÀ TÊN SINH VIÊN"
                    required
                    defaultValue={CURRENT_STUDENT.name}
                    autoComplete="name"
                  />

                  <SelectField id="profile-school" label="TRƯỜNG ĐANG THEO HỌC" required defaultValue={CURRENT_STUDENT.school}>
                    <option>ĐH Khoa học Tự nhiên, ĐHQG-HCM</option>
                    <option>ĐH Bách khoa, ĐHQG-HCM</option>
                    <option>ĐH Kinh tế - Luật, ĐHQG-HCM</option>
                    <option>ĐH Sư phạm Kỹ thuật TP.HCM</option>
                    <option>ĐH FPT TP.HCM</option>
                    <option>Trường khác</option>
                  </SelectField>

                  <TextField
                    id="profile-major"
                    label="NGÀNH HỌC HIỆN TẠI"
                    required
                    defaultValue={CURRENT_STUDENT.major}
                  />

                  <div style={{ paddingTop: "var(--space-2)" }}>
                    <ProfileSaveButton />
                  </div>
                </form>
              </section>

              {/* SECTION: CV (PDF) — gửi kèm mỗi đơn ứng tuyển */}
              <section className="module-bay" style={{ padding: "var(--space-6)" }}>
                <div className="module-bay__header">
                  <span className="module-bay__id">MODULE // 02</span>
                  <span>CV CỦA TÔI</span>
                </div>

                <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: "12px" }}>
                  CV dạng PDF được gửi kèm mỗi đơn ứng tuyển để doanh nghiệp xem cùng thư ngỏ. Thay CV mới thì các đơn gửi sau sẽ dùng bản mới.
                </p>

                <CvUploader id="profile-cv" />
              </section>

              {/* SECTION: KỸ NĂNG CHUẨN */}
              <section className="module-bay" style={{ padding: "var(--space-6)" }}>
                <div className="module-bay__header">
                  <span className="module-bay__id">MODULE // 03</span>
                  <span>DANH MỤC KỸ NĂNG CHUẨN</span>
                </div>

                <p className="text-muted" style={{ margin: "0 0 var(--space-4)", fontSize: "12px" }}>
                  Hệ thống kiểm soát theo danh mục tiêu chuẩn (không tự nhập tự do) để tính toán tỷ lệ % so khớp kỹ năng chính xác với yêu cầu dự án của SME.
                </p>

                <SkillMultiSelect name="skills" defaultSelected={CURRENT_STUDENT.skills} max={8} />
              </section>
            </div>

          </div>
        </div>
      </main>
      </StudentRouteGuard>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
