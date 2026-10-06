import Link from "next/link";
import { SiteHeader } from "../components/layout/site-header";
import { SiteFooter } from "../components/layout/site-footer";
import { BottomNav } from "../components/layout/bottom-nav";
import { ButtonLink } from "../components/ui/button";
import { StatusBadge } from "../components/ui/status-badge";
import { Typewriter } from "../components/ui/typewriter";
import { HeroPattern } from "../components/ui/hero-pattern";
import { ArrowRight, Check, ICON_WEIGHT } from "../components/ui/icons";
import { CURRENT_STUDENT, PROJECTS, TODAY } from "../mocks/data";
import { daysUntil, formatDate, formatVnd, matchScore } from "../lib/utils/format";

/**
 * Màn hình 1 — Trang chủ (docs/design.md 7.1).
 *
 * Bốn khối sau hero dùng BỐN họ bố cục khác nhau (lưới số, danh sách đánh số,
 * lưới thẻ, hai cột lệch). Lặp lại một họ bố cục cho mọi khối là cách nhanh
 * nhất biến trang dài thành đều đều, không có cao trào (design.md 4.9).
 */

/**
 * Bốn con số này là CAM KẾT SẢN PHẨM lấy từ docs/requirement.md, không phải số
 * liệu tăng trưởng. Nền tảng chưa vận hành nên không có traction thật để nêu;
 * bịa ra con số người dùng sẽ là bằng chứng xã hội giả (design.md 4.9).
 */
const COMMITMENTS = [
  { value: "1-5tr", label: "Ngân sách mỗi dự án, đủ nhỏ để làm xong trong vài tuần" },
  { value: "1", label: "Một sinh viên một dự án, không chia nhóm, không tranh công" },
  { value: "4 giờ", label: "Thời gian chúng tôi cam kết duyệt xong một dự án mới" },
  { value: "0đ", label: "Phí nền tảng thu của bạn và của doanh nghiệp" }
];

const PILLARS = [
  {
    title: "Ghép nối theo kỹ năng",
    lead: "Bạn biết vì sao mình hợp",
    body: "Hệ thống chấm độ phù hợp dựa trên kỹ năng bạn đã khai, và luôn nói rõ trùng mấy trên mấy chứ không đưa một con số rồi bắt bạn tin. Điểm này để tham khảo, người chọn vẫn là doanh nghiệp."
  },
  {
    title: "Mốc bàn giao",
    lead: "Biết trước mình được trả theo nhịp nào",
    body: "Công việc được chia thành từng mốc có tiền và hạn riêng, chốt ngay lúc doanh nghiệp đăng dự án. Bạn đọc xong rồi mới quyết định có ứng tuyển hay không."
  },
  {
    title: "Ký quỹ mô phỏng",
    lead: "Chúng tôi nói thật cả về giới hạn của mình",
    body: "Ở bản đầu tiên này, GenDA ghi nhận trạng thái tiền của từng mốc để hai bên cùng nhìn vào một chỗ, nhưng chưa giữ tiền thật. Điều đó được nói rõ ở mọi màn hình liên quan, thay vì để bạn tự phát hiện ra sau."
  },
  {
    title: "Ứng tuyển bằng CV",
    lead: "Nộp một lần, dùng cho mọi đơn",
    body: "Bạn tải CV dạng PDF lên một lần, mỗi đơn ứng tuyển đều tự gửi kèm để doanh nghiệp đọc cùng thư ngỏ. Có kinh nghiệm mới thì thay CV, các đơn sau dùng bản mới."
  }
];

/** Ví dụ một dòng kinh nghiệm sinh viên đưa vào CV sau khi dự án được nghiệm thu. */
const CV_HIGHLIGHT = {
  title: "Trang giới thiệu vùng trồng cho hợp tác xã rau Củ Chi",
  smeName: "HTX Rau an toàn Tân Phú Trung",
  period: "12/06/2026 - 04/07/2026",
  skills: ["Next.js", "React", "UI/UX"],
  review:
    "Bạn chủ động hỏi lại những chỗ đề bài của bên mình viết chưa rõ, nên không phải làm lại lần nào. Trang chạy nhanh, các cô chú trong hợp tác xã tự vào xem trên điện thoại được."
};

export default function HomePage() {
  const published = PROJECTS.filter((project) => project.status === "PUBLISHED");
  const featured = published.slice(0, 3);
  const preview = published[0];
  const previewScore = matchScore(preview.skills, CURRENT_STUDENT.skills);
  const sample = CV_HIGHLIGHT;

  return (
    <>
      <SiteHeader hideOnMobile />

      <main id="main-content" className="has-bottom-nav">
        {/* Hero LỆCH TRÁI, lưới 1.35fr / 1fr, đặt trên VÙNG MÀU ĐẬM chiếm trọn
            bề ngang. Hai quyết định tách bạch:
            - Lệch trái vì hero căn giữa có pill badge là bố cục mặc định của mọi
              công cụ dựng trang, và căn giữa làm mọi dòng nặng ngang nhau nên
              không dẫn được mắt (design.md 4.9).
            - Khối có nền riêng vì đòn bẩy làm ấm số 2 ở 4.9.1: hero là một
              TẤM KEM BO GÓC LỚN nằm lọt trong panel trắng của trang, không
              phải một dải màu chạy chạm mép màn hình. */}
        {/* Hero NEO-INDUSTRIAL LEDGER: Teenage Engineering Metaphor */}
        <section className="industrial-hero">
          <HeroPattern />
          <div className="hero-content">
          <div className="container hero-editorial">
          <div>
            <h1 className="industrial-display" style={{ marginBlock: "0 var(--space-4)" }}>
              <Typewriter
                parts={[
                  { text: "From Learn", breakAfter: true },
                  { text: "to " },
                  { text: "Earn.", className: "industrial-highlight" }
                ]}
              />
            </h1>
            
            <div className="cluster hero-cta" style={{ marginTop: "var(--space-8)", gap: "var(--space-4)" }}>
              <Link href="/projects" className="btn--tactile-orange">
                Tìm việc / Nhận dự án
                <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
              </Link>
              <Link href="/sme/projects/new" className="btn--tactile-zinc">
                Đăng bài toán kỹ thuật
              </Link>
            </div>
          </div>

          {/* Cột phải: Module Bay - Khối giao kèo phần cứng cơ khí */}
          <div className="hero-card-stage">
          <article className="module-bay stack stack--sm">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY-01 // ACTIVE</span>
              <span>EST. 2026</span>
            </div>

            <div className="cluster cluster--between" style={{ margin: 0 }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                {preview.smeName} &bull; {preview.smeIndustry}
              </span>
              <StatusBadge status="PUBLISHED" />
            </div>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              <Link href={`/projects/${preview.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                {preview.title}
              </Link>
            </h2>

            <div className="cluster cluster--between" style={{ margin: "var(--space-2) 0" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-heading)" }}>
                {formatVnd(preview.budget)}
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, background: "var(--color-surface-subtle)", border: "1px solid var(--machinery-border)", color: "var(--color-text-heading)", padding: "3px 8px" }}>
                {preview.milestones.length} PHÂN ĐOẠN (MỐC)
              </span>
            </div>

            <hr style={{ border: 0, borderTop: "2px dashed var(--machinery-border)", margin: "var(--space-2) 0" }} />

            <ul className="pill-list">
              {preview.skills.map((skill) => {
                const owned = previewScore.matched.includes(skill);
                return (
                  <li 
                    key={skill} 
                    style={{ 
                      fontFamily: "ui-monospace, monospace", 
                      fontSize: "11px", 
                      fontWeight: 700, 
                      padding: "4px 10px", 
                      border: "1px solid var(--machinery-border)", 
                      background: owned ? "var(--machinery-border)" : "var(--color-surface-card)", 
                      color: owned ? "#ffffff" : "var(--color-text-heading)" 
                    }}
                  >
                    {owned ? "[x] " : "[ ] "}{skill}
                  </li>
                );
              })}
            </ul>

            <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", paddingTop: "var(--space-3)" }}>
              <span>HẠN CHÓT: {formatDate(preview.deadline)}</span>
              <span style={{ color: "var(--color-action-primary)" }}>CÒN {daysUntil(preview.deadline, TODAY)} NGÀY</span>
            </div>
          </article>
          </div>
          </div>

          {/* Bốn con số cam kết — Thông số vận hành cơ khí */}
          <div className="container hero-stats">
            <section className="spec-panel" aria-label="Bốn cam kết của GenDA">
              <div className="module-bay__header">
                <span className="module-bay__id">SPEC // 4 CAM KẾT</span>
                <span>VẬN HÀNH 2026</span>
              </div>
              <dl className="spec-panel__grid">
                {COMMITMENTS.map((commitment, idx) => (
                  <div key={commitment.label} className="spec-panel__cell">
                    <dt className="visually-hidden">{commitment.label}</dt>
                    <dd>
                      <span className="spec-panel__code" aria-hidden="true">[0{idx + 1}]</span>
                      <span className="stat__value spec-panel__value">{commitment.value}</span>
                      <span className="stat__label spec-panel__label" aria-hidden="true">{commitment.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          </div>
        </section>

        {/* Khối Trust Layer: Giao thức an toàn 4 trụ cột */}
        <section id="trust-layer" className="container section" style={{ borderTop: "2px solid var(--machinery-border)" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "2rem", fontWeight: 800, textTransform: "uppercase" }}>
              <span aria-hidden="true" style={{ width: "14px", height: "14px", flexShrink: 0, borderRadius: "2px", backgroundColor: "var(--orange-500)" }} />
              Bốn Tầng Giao Kèo Niềm Tin
            </h2>
            <p className="lede" style={{ marginTop: "var(--space-3)", color: "var(--color-text-body)", maxWidth: "none" }}>
              Xóa khoảng cách niềm tin sinh viên – SMEs bằng 4 giao thức chuẩn hóa.
            </p>
          </div>

          <div>
            <ol className="editorial-list" style={{ marginTop: "var(--space-8)" }}>
              {PILLARS.map((pillar, index) => (
                <li key={pillar.title} className="editorial-list__item" style={{ borderTop: "1px solid var(--machinery-border)" }}>
                  <span className="editorial-list__num editorial-list__num--bracket" aria-hidden="true" style={{ fontFamily: "ui-monospace, monospace", color: "var(--orange-500)", fontWeight: 800 }}>
                    <span className="editorial-list__bracket editorial-list__bracket--open">[</span>
                    <span className="editorial-list__digits">0{index + 1}</span>
                    <span className="editorial-list__bracket editorial-list__bracket--close">]</span>
                  </span>
                  <div>
                    <h3 style={{ fontSize: "var(--text-h4-size)", fontWeight: 800, textTransform: "uppercase" }}>{pillar.title}</h3>
                    <p style={{ marginTop: "var(--space-1)", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {"// "}{pillar.lead}
                    </p>
                  </div>
                  <p style={{ margin: 0, color: "var(--color-text-body)", lineHeight: 1.6 }}>{pillar.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band band--subtle">
          <div className="container">
          <div className="section-head cluster cluster--between">
            <h2>Đang tuyển ngay bây giờ</h2>
            <Link href="/projects" className="text-muted">
              Xem tất cả
            </Link>
          </div>

          {/* Một thẻ lớn + hai thẻ nhỏ, không phải ba thẻ bằng nhau. Thẻ đầu
              được thêm đoạn mô tả để xứng với diện tích nó chiếm — phóng to một
              thẻ mà không cho nó thêm nội dung thì chỉ tạo ra khoảng trống. */}
          <div className="feature-grid">
            {featured.map((project, index) => {
              const lead = index === 0;
              return (
                <article key={project.id} className="card card--interactive stack stack--sm">
                  <div className="cluster cluster--between">
                    <span className="text-caption">{project.smeIndustry}</span>
                    <span className="text-caption num">
                      còn {daysUntil(project.deadline, TODAY)} ngày
                    </span>
                  </div>

                  <h3 style={{ fontSize: lead ? "var(--text-h3-size)" : "var(--text-h4-size)" }}>
                    <Link
                      href={`/projects/${project.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {project.title}
                    </Link>
                  </h3>

                  {lead ? (
                    <p className="text-muted" style={{ margin: 0, maxWidth: "48ch" }}>
                      {project.summary}
                    </p>
                  ) : null}

                  <p className="project-row__money">{formatVnd(project.budget)}</p>

                  <hr className="rule" />

                  <p className="text-muted" style={{ margin: 0 }}>
                    {project.smeName}, hạn {formatDate(project.deadline)}
                  </p>

                  <ul className="pill-list">
                    {project.skills.map((skill) => (
                      <li key={skill} className="skill-pill">
                        {skill}
                      </li>
                    ))}
                  </ul>

                  {/* Thẻ lớn được xem trước cách chia tiền theo mốc — thứ mà
                      sinh viên thật sự cần biết trước khi quyết định ứng tuyển. */}
                  {lead ? (
                    <ul
                      className="stack stack--sm"
                      style={{ listStyle: "none", margin: 0, padding: 0 }}
                    >
                      {project.milestones.map((milestone) => (
                        <li
                          key={milestone.id}
                          className="cluster cluster--between num"
                          style={{
                            paddingTop: "var(--space-2)",
                            borderTop: "1px solid var(--color-border-subtle)"
                          }}
                        >
                          <span className="text-muted" style={{ margin: 0 }}>
                            Mốc {milestone.order}: {milestone.title}
                          </span>
                          <span className="text-caption">{formatVnd(milestone.budget)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {lead ? (
                    <div className="card__footer">
                      <Link href={`/projects/${project.id}`} className="btn btn--outline btn--sm">
                        Xem chi tiết và ứng tuyển
                        <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                      </Link>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          </div>
        </section>

        {/* Vùng màu thứ hai, tô XANH LÁ ĐẬM. Màu xanh lá của GenDA nghĩa là
            "thành quả đã được xác thực" (design.md 4.4.2), nên khối nói về thứ
            sinh viên nhận được cuối hành trình là chỗ duy nhất xứng đáng được tô
            nguyên khối bằng màu đó. Dùng tiết chế thì nó mới còn là phần thưởng
            thị giác. */}
        <section className="band band--achieve-strong">
          <div className="container">
            <h2>Cuối cùng bạn nhận được gì</h2>

            <div className="split" style={{ marginTop: "var(--space-8)" }}>
              <div>
                <p className="lede" style={{ marginBottom: "var(--space-6)" }}>
                  Không phải một tấm chứng chỉ chung chung. Là một dự án thật có doanh nghiệp nghiệm thu và
                  đánh giá, đủ để bạn ghi vào CV và kể lại cụ thể trong buổi phỏng vấn tiếp theo.
                </p>

                <blockquote className="pull-quote">
                  {sample.review}
                  <cite>{sample.smeName}</cite>
                </blockquote>
              </div>

              <article className="card">
                <StatusBadge status="COMPLETED" label="Đã xác thực hoàn thành" />

                <h3 style={{ fontSize: "var(--text-h4-size)", marginTop: "var(--space-3)" }}>
                  {sample.title}
                </h3>

                <dl className="text-muted" style={{ margin: "var(--space-3) 0" }}>
                  <div className="cluster">
                    <dt>Đơn vị giao việc:</dt>
                    <dd style={{ margin: 0 }}>{sample.smeName}</dd>
                  </div>
                  <div className="cluster">
                    <dt>Thời gian:</dt>
                    <dd style={{ margin: 0 }} className="num">
                      {sample.period}
                    </dd>
                  </div>
                </dl>

                <ul className="pill-list">
                  {sample.skills.map((skill) => (
                    <li key={skill} className="skill-pill skill-pill--matched">
                      <Check weight={ICON_WEIGHT} aria-hidden="true" />
                      {skill}
                    </li>
                  ))}
                </ul>

                <div className="card__footer">
                  <Link href="/student/cv" className="btn btn--outline btn--sm">
                    Cập nhật CV của bạn
                    <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
