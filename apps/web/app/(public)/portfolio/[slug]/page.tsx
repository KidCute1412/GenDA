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

      <main id="main-content" className="has-bottom-nav">
        {/* Phần đầu hồ sơ đặt trên vùng màu đậm. Đây là trang nhà tuyển dụng mở
            ra đầu tiên, nên nó cần sức nặng thị giác của một trang giới thiệu
            chứ không phải vẻ của một biểu mẫu. */}
        <section className="band--brand-strong" style={{ paddingBlock: "var(--space-12)" }}>
          <div className="container split" style={{ alignItems: "flex-end" }}>
            <div className="stack stack--sm">
              <h1>{student.name}</h1>
              <p className="lede" style={{ margin: 0 }}>
                {student.major}, {student.year}, {student.school}
              </p>

              <p className="cluster" style={{ marginTop: "var(--space-2)" }}>
                <span className="badge badge--verified">
                  <SealCheck weight={ICON_WEIGHT} aria-hidden="true" />
                  Sinh viên đã xác thực
                </span>
                <span className="text-caption num">
                  {entries.length} dự án đã được doanh nghiệp nghiệm thu
                </span>
              </p>

              <ul className="pill-list" style={{ marginTop: "var(--space-3)" }}>
                {student.skills.map((skill) => (
                  <li key={skill} className="skill-pill">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            {/* justify-self để nút không bị lưới kéo giãn hết bề ngang cột:
                nút rộng 520px đọc ra như một thanh, không ra như một nút. */}
            {isOwner ? (
              <span style={{ justifySelf: "start" }}>
                <ShareLinkButton slug={student.slug} />
              </span>
            ) : null}
          </div>
        </section>

        <div className="container" style={{ paddingTop: "var(--space-8)" }}>
        {/* Lời giải thích cơ chế đặt NGAY trên danh sách, vì người đọc chính của
            trang này là nhà tuyển dụng chưa từng biết GenDA là gì. */}
        <Alert variant="success" title="Vì sao hồ sơ này đáng tin">
          Mỗi mục dưới đây do hệ thống tự sinh sau khi doanh nghiệp nghiệm thu công việc, kèm đánh giá do
          chính họ viết. {student.name.split(" ").pop()} chọn được ẩn hay hiện từng mục, nhưng không sửa
          được nội dung bên trong.
        </Alert>

        <section className="section">
          <h2 className="visually-hidden">Các dự án đã hoàn thành</h2>

          <div className="bento">
            {entries.map((entry) => (
              <article key={entry.id} className="card stack">
                <div className="cluster cluster--between">
                  <span className="badge badge--verified">
                    <Check weight={ICON_WEIGHT} aria-hidden="true" />
                    Đã xác thực hoàn thành
                  </span>
                  <span className="text-caption num">{entry.period}</span>
                </div>

                <div>
                  <h3>{entry.title}</h3>
                  <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>
                    {entry.smeName}, {entry.smeNote}. Vai trò: {entry.role}.
                  </p>
                </div>

                <ul className="pill-list">
                  {entry.skills.map((skill) => (
                    <li key={skill} className="skill-pill skill-pill--matched">
                      <Check weight={ICON_WEIGHT} aria-hidden="true" />
                      {skill}
                    </li>
                  ))}
                </ul>

                <hr className="rule" />

                <div>
                  <p className="text-caption">Doanh nghiệp nhận xét</p>
                  <blockquote className="pull-quote" style={{ marginTop: "var(--space-2)" }}>
                    {entry.review}
                  </blockquote>
                  <div style={{ marginTop: "var(--space-3)" }}>
                    <Rating value={entry.rating} />
                  </div>
                </div>

                <div className="card__footer cluster cluster--between">
                  <span className="cluster">
                    <a href={entry.demoUrl} className="btn btn--outline btn--sm">
                      Xem sản phẩm
                      <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                    </a>
                    <a href={entry.sourceUrl} className="btn btn--ghost btn--sm">
                      Xem mã nguồn
                    </a>
                  </span>

                  {isOwner ? (
                    <VisibilityToggle title={entry.title} defaultVisible={entry.visible} />
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
        </div>

        <section className="band band--achieve-strong">
          <div className="container" style={{ textAlign: "center" }}>
            <h2>Bạn cũng muốn có một hồ sơ như thế này?</h2>
            <p className="lede" style={{ marginInline: "auto", marginBlock: "var(--space-3) var(--space-6)" }}>
              Mỗi dự án hoàn thành trên GenDA đều tự động trở thành một mục trong hồ sơ của bạn.
            </p>
            <Link href="/projects" className="btn btn--primary btn--lg">
              Xem dự án đang tuyển
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
