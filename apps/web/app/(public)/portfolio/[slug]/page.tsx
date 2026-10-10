import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { BottomNav } from "../../../../components/layout/bottom-nav";
import { Alert } from "../../../../components/ui/alert";
import { ArrowRight, Check, ICON_WEIGHT, SealCheck, Star } from "../../../../components/ui/icons";
import { ShareLinkButton } from "../../../../features/portfolio/components/share-link-button";
import { VisibilityToggle } from "../../../../features/portfolio/components/visibility-toggle";
import { CURRENT_STUDENT, PORTFOLIO } from "../../../../mocks/data";

export function generateStaticParams() {
  return [{ slug: CURRENT_STUDENT.slug }];
}

export const metadata: Metadata = {
  title: `Hồ sơ năng lực của ${CURRENT_STUDENT.name}`,
  description:
    "Hồ sơ năng lực với các dự án đã được doanh nghiệp nghiệm thu và xác thực trên GenDA."
};

/**
 * Màn hình 7 — Trang Portfolio công khai (docs/design.md 7.7).
 *
 * Bố cục Bento Grid: ô đầu tiên chiếm trọn hàng vì đó là dự án nổi bật, các ô
 * sau chia đôi. Số ô đúng bằng số mục nội dung, không có ô trống chèn cho đủ lưới.
 *
 * Điểm mấu chốt của màn hình này là tính KHÔNG THỂ TỰ KHAI: mọi mục ở đây do hệ
 * thống sinh ra sau khi doanh nghiệp nghiệm thu (FR-CERT-02). Giao diện phải nói
 * rõ điều đó, vì nếu nhà tuyển dụng tưởng đây là hồ sơ tự nhập thì toàn bộ giá
 * trị của Lớp Niềm Tin biến mất.
 */

/**
 * Điểm đánh giá mã hóa hai lớp: hàng sao VÀ con số. Hàng sao một mình là kênh
 * thị giác thuần túy; con số là thứ trình đọc màn hình đọc được.
 */
function Rating({ value }: { value: number }) {
  return (
    <p className="cluster" style={{ gap: "var(--space-2)" }}>
      <span className="cluster" style={{ gap: "2px" }} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            weight={index < value ? "fill" : "regular"}
            style={{
              width: 16,
              height: 16,
              color:
                index < value ? "var(--color-status-verified)" : "var(--color-border-input)"
            }}
          />
        ))}
      </span>
      <span className="text-caption num">
        {value.toFixed(1).replace(".", ",")} trên 5 điểm
      </span>
    </p>
  );
}

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Bản dựng giao diện chỉ có một hồ sơ mẫu; bản thật tra theo slug.
  const student = CURRENT_STUDENT;
  const entries = PORTFOLIO;

  /**
   * Chủ hồ sơ thấy thêm các thẻ gạt ẩn/hiện; khách chỉ thấy các mục đang công
   * khai. Ở bản thật, biến này lấy từ phiên đăng nhập, không lấy từ đường dẫn.
   */
  const isOwner = slug === student.slug;

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="industrial-canvas has-bottom-nav" style={{ paddingBottom: "var(--space-16)" }}>
        
        {/* THANH THƯỚC ĐO KỸ THUẬT & ĐIỀU HƯỚNG */}
        <div style={{ borderBottom: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
          <div className="container" style={{ paddingBlock: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <nav aria-label="Đường dẫn phân cấp" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <ol className="breadcrumbs" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>HOME</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li>
                  <Link href="/student/profile" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>STUDENT</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>PORTFOLIO // {slug.toUpperCase()}</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                <SealCheck weight={ICON_WEIGHT} aria-hidden="true" />
                VERIFIED ID // VN-HCM
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                {entries.length} DỰ ÁN NGHIỆM THU
              </span>
            </div>
          </div>
        </div>

        {/* HERO SECTION CHUẨN NEO-INDUSTRIAL LEDGER */}
        <section 
          style={{ 
            backgroundColor: "var(--machinery-border)", 
            color: "#ffffff", 
            borderBottom: "2px solid var(--machinery-border)",
            paddingBlock: "var(--space-8) var(--space-10)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Họa tiết lưới tọa độ mờ cơ khí */}
          <div 
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
              opacity: 0.5
            }} 
          />

          <div className="container split" style={{ alignItems: "flex-end", position: "relative", zIndex: 1 }}>
            <div className="stack stack--sm">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", letterSpacing: "0.12em", color: "var(--orange-500)", fontWeight: 800 }}>
                <span style={{ width: "8px", height: "8px", backgroundColor: "var(--orange-500)", display: "inline-block" }} />
                <span>GENDA CERTIFIED TALENT DOSSIER</span>
              </div>

              <h1 style={{ 
                fontFamily: "var(--font-sans)", 
                fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", 
                fontWeight: 900, 
                lineHeight: 1.05, 
                letterSpacing: "-0.03em", 
                textTransform: "uppercase", 
                margin: "var(--space-2) 0",
                color: "#ffffff"
              }}>
                {student.name}
              </h1>

              <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.8)", fontFamily: "ui-monospace, monospace" }}>
                {student.major} · {student.year} · {student.school}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "var(--space-3)" }}>
                {student.skills.map((skill) => (
                  <span 
                    key={skill} 
                    style={{ 
                      backgroundColor: "rgba(0, 0, 0, 0.4)", 
                      color: "#ffffff", 
                      border: "1px solid rgba(255,255,255,0.25)",
                      padding: "3px 10px",
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "2px"
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ justifySelf: "start", marginTop: "var(--space-4)" }}>
              {isOwner ? (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <ShareLinkButton slug={student.slug} />
                  <Link href="/student/profile" className="btn--tactile-zinc" style={{ height: "40px", fontSize: "12px" }}>
                    Chỉnh sửa hồ sơ
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* CONTAINER NỘI DUNG VỚI THƯỚC ĐO CƠ KHÍ & BENTO GRID */}
        <div className="container" style={{ paddingTop: "var(--space-8)" }}>
          
          {/* BANNER BẢO CHỨNG NIỀM TIN CÔNG NGHIỆP */}
          <div 
            style={{ 
              border: "2px solid var(--machinery-border)", 
              backgroundColor: "var(--color-surface-card)", 
              padding: "var(--space-4) var(--space-5)",
              boxShadow: "3px 3px 0px var(--machinery-shadow)",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              marginBottom: "var(--space-6)"
            }}
          >
            <div style={{ backgroundColor: "var(--orange-500)", color: "#ffffff", padding: "6px", borderRadius: "2px", flexShrink: 0, marginTop: "2px" }}>
              <SealCheck weight="fill" style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 800, color: "var(--orange-500)", letterSpacing: "0.08em" }}>
                {"// LỚP NIỀM TIN XÁC THỰC BỞI DOANH NGHIỆP"}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: 1.5, color: "var(--color-text-body)" }}>
                Toàn bộ dữ liệu dưới đây do hệ thống tự sinh và đóng dấu mã hóa sau khi doanh nghiệp đối tác hoàn tất nghiệm thu và chuyển quỹ. Sinh viên không thể tự biên tập nội dung, bảo chứng tính xác thực 100% cho nhà tuyển dụng.
              </p>
            </div>
          </div>

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="industrial-ruler" style={{ marginBottom: "var(--space-4)" }}>
              DỰ ÁN ĐÃ NGHIỆM THU ({entries.length} MODULES)
            </div>

            <div className="bento">
              {entries.map((entry) => (
                <article 
                  key={entry.id} 
                  className="module-bay"
                  style={{ 
                    padding: "var(--space-6)", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between",
                    backgroundColor: "var(--color-surface-card)"
                  }}
                >
                  <div>
                    {/* Header Thẻ Dự án Cơ khí */}
                    <div className="module-bay__header">
                      <span className="module-bay__id">PROJECT // {entry.id.toUpperCase()}</span>
                      <span className="num" style={{ fontWeight: 700, color: "var(--color-text-muted)" }}>{entry.period}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                      <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>
                          {entry.title}
                        </h2>
                        <p style={{ margin: "4px 0 0", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)" }}>
                          Đối tác: <strong style={{ color: "var(--color-text-heading)" }}>{entry.smeName}</strong> ({entry.smeNote}) — Vai trò: <span style={{ color: "var(--orange-500)", fontWeight: 700 }}>{entry.role}</span>
                        </p>
                      </div>

                      <span className="badge badge--verified" style={{ flexShrink: 0 }}>
                        <Check weight={ICON_WEIGHT} aria-hidden="true" />
                        ĐÃ NGHIỆM THU
                      </span>
                    </div>

                    {/* Danh sách Kỹ năng */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBlock: "var(--space-4)" }}>
                      {entry.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="chip"
                          style={{ 
                            fontSize: "11px", 
                            height: "26px", 
                            paddingInline: "8px", 
                            borderColor: "var(--machinery-border)",
                            backgroundColor: "var(--color-surface-subtle)"
                          }}
                        >
                          <Check weight={ICON_WEIGHT} aria-hidden="true" style={{ color: "var(--color-status-verified)", marginRight: "4px" }} />
                          {skill}
                        </span>
                      ))}
                    </div>

                    <hr className="rule" style={{ borderColor: "var(--machinery-border)", borderStyle: "dashed" }} />

                    {/* Nhận xét của Doanh nghiệp */}
                    <div style={{ marginBlock: "var(--space-4)" }}>
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                        {"// DOANH NGHIỆP ĐỐI TÁC ĐÁNH GIÁ"}
                      </div>
                      <blockquote 
                        style={{ 
                          margin: 0, 
                          padding: "10px 14px", 
                          backgroundColor: "var(--color-surface-subtle)", 
                          borderLeft: "3px solid var(--orange-500)",
                          fontStyle: "italic",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          color: "var(--color-text-heading)"
                        }}
                      >
                        {'"'}{entry.review}{'"'}
                      </blockquote>
                      <div style={{ marginTop: "var(--space-3)" }}>
                        <Rating value={entry.rating} />
                      </div>
                    </div>
                  </div>

                  {/* Chân Thẻ: Xem sản phẩm, mã nguồn & Toggle ẩn hiện */}
                  <div 
                    style={{ 
                      paddingTop: "var(--space-4)", 
                      borderTop: "2px solid var(--machinery-border)", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      flexWrap: "wrap", 
                      gap: "var(--space-3)",
                      marginTop: "var(--space-4)"
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <a 
                        href={entry.demoUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn--tactile-zinc"
                        style={{ height: "34px", fontSize: "11px", textDecoration: "none" }}
                      >
                        Xem sản phẩm
                        <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                      </a>
                      <a 
                        href={entry.sourceUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="chip"
                        style={{ height: "34px", fontSize: "11px", textDecoration: "none", backgroundColor: "var(--color-surface-card)" }}
                      >
                        Mã nguồn
                      </a>
                    </div>

                    {isOwner ? (
                      <VisibilityToggle title={entry.title} defaultVisible={entry.visible} />
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* SECTION KÊU GỌI HÀNH ĐỘNG NEO-INDUSTRIAL */}
        <section 
          style={{ 
            marginTop: "var(--space-12)",
            backgroundColor: "var(--color-surface-card)", 
            borderTop: "2px solid var(--machinery-border)",
            borderBottom: "2px solid var(--machinery-border)",
            paddingBlock: "var(--space-10)" 
          }}
        >
          <div className="container" style={{ textAlign: "center", maxWidth: "640px" }}>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--orange-500)", fontWeight: 800, letterSpacing: "0.12em" }}>
              PROTOCOL 2026 // GET VERIFIED
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-2) 0" }}>
              BẠN CŨNG MUỐN SỞ HỮU HỒ SƠ BẢO CHỨNG?
            </h2>
            <p className="text-muted" style={{ marginInline: "auto", marginBlock: "var(--space-2) var(--space-6)", fontSize: "14px" }}>
              Mỗi dự án hoàn thành trên GenDA đều tự động được ghi nhận vào Ledger năng lực và xác thực trực tiếp bởi doanh nghiệp đối tác.
            </p>
            <Link href="/projects" className="btn--tactile-orange" style={{ height: "46px", paddingInline: "var(--space-8)" }}>
              KHÁM PHÁ DỰ ÁN ĐANG TUYỂN
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
