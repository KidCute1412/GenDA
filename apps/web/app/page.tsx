import Link from "next/link";
import { SiteHeader } from "../components/layout/site-header";
import { SiteFooter } from "../components/layout/site-footer";
import { BottomNav } from "../components/layout/bottom-nav";
import { ButtonLink } from "../components/ui/button";
import { StatusBadge } from "../components/ui/status-badge";
import { ArrowRight, Check, ICON_WEIGHT } from "../components/ui/icons";
import { CURRENT_STUDENT, PORTFOLIO, PROJECTS, TODAY } from "../mocks/data";
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
    title: "Portfolio xác thực",
    lead: "Không ai tự khai được, kể cả bạn",
    body: "Làm xong và được nghiệm thu, hệ thống tự viết mục portfolio cho bạn: tên doanh nghiệp, việc đã làm, thời gian, đánh giá. Bạn chỉ chọn ẩn hay hiện, phần nội dung thì khóa."
  }
];

export default function HomePage() {
  const published = PROJECTS.filter((project) => project.status === "PUBLISHED");
  const featured = published.slice(0, 3);
  const preview = published[0];
  const previewScore = matchScore(preview.skills, CURRENT_STUDENT.skills);
  const sample = PORTFOLIO[0];

  return (
    <>
      <SiteHeader current="/" />

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
          <div className="container hero-editorial">
          <div>
            <div className="industrial-ruler">
              <span>SYS.SPEC // PROTOCOL 2026 // VN-HCM</span>
            </div>
            
            <h1 className="industrial-display" style={{ marginBlock: "var(--space-2) var(--space-4)" }}>
              From Learn <br />
              to <span className="industrial-highlight">Earn.</span>
            </h1>
            
            <p className="lede" style={{ color: "#52525b", maxWidth: "48ch", fontSize: "1.125rem", lineHeight: 1.6 }}>
              Cỗ máy chuẩn hóa giao kèo dự án vi mô (1.000.000 — 5.000.000 VNĐ). 
              Thiết lập mốc nghiệm thu cơ khí, ký quỹ mô phỏng minh bạch và đóng dấu chứng nhận năng lực bất biến.
            </p>

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
          <article className="module-bay stack stack--sm">
            <div className="module-bay__header">
              <span className="module-bay__id">BAY-01 // ACTIVE</span>
              <span>EST. 2026</span>
            </div>

            <div className="cluster cluster--between" style={{ margin: 0 }}>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" }}>
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
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.5rem", fontWeight: 800, color: "#09090b" }}>
                {formatVnd(preview.budget)}
              </span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, background: "#f4f4f5", border: "1px solid #18181b", padding: "3px 8px" }}>
                {preview.milestones.length} PHÂN ĐOẠN (MỐC)
              </span>
            </div>

            <hr style={{ border: 0, borderTop: "2px dashed #d4d4d8", margin: "var(--space-2) 0" }} />

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
                      border: "1px solid #18181b", 
                      background: owned ? "#18181b" : "#ffffff", 
                      color: owned ? "#ffffff" : "#18181b" 
                    }}
                  >
                    {owned ? "[x] " : "[ ] "}{skill}
                  </li>
                );
              })}
            </ul>

            <div className="cluster cluster--between" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, color: "#71717a", paddingTop: "var(--space-3)" }}>
              <span>HẠN CHÓT: {formatDate(preview.deadline)}</span>
              <span style={{ color: "var(--orange-600)" }}>CÒN {daysUntil(preview.deadline, TODAY)} NGÀY</span>
            </div>
          </article>
          </div>
        </section>

        {/* Bốn con số cam kết — Thông số vận hành cơ khí */}
        <section className="container hero-spill" style={{ paddingBottom: "var(--space-8)" }}>
          <dl className="stat-strip" style={{ borderTop: "2px solid var(--machinery-border)" }}>
            {COMMITMENTS.map((commitment, idx) => (
              <div key={commitment.label} style={{ borderLeft: idx > 0 ? "1px dashed var(--machinery-border)" : "none", paddingLeft: idx > 0 ? "var(--space-4)" : "0" }}>
                <dt className="visually-hidden">{commitment.label}</dt>
                <dd style={{ margin: 0 }}>
                  <span className="stat__value" style={{ fontFamily: "ui-monospace, monospace", color: "var(--orange-500)" }}>{commitment.value}</span>
                  <span className="stat__label" aria-hidden="true" style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 600 }}>
                    {commitment.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Khối Trust Layer: Giao thức an toàn 4 trụ cột */}
        <section id="trust-layer" className="container section" style={{ borderTop: "2px solid var(--machinery-border)" }}>
          <div style={{ maxWidth: "720px" }}>
            <div className="industrial-ruler">
              <span>PROTOCOL.TRUST // 4 LAYERS</span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, textTransform: "uppercase" }}>Bốn Tầng Giao Kèo Niềm Tin</h2>
            <p className="lede" style={{ marginTop: "var(--space-3)", color: "var(--color-text-body)" }}>
              Giải quyết triệt để sự đứt gãy niềm tin giữa sinh viên và doanh nghiệp SMEs thông qua 4 giao thức chuẩn hóa bất biến.
            </p>
          </div>

          <div>
            <ol className="editorial-list" style={{ marginTop: "var(--space-8)" }}>
              {PILLARS.map((pillar, index) => (
                <li key={pillar.title} className="editorial-list__item" style={{ borderTop: "1px solid var(--machinery-border)" }}>
                  <span className="editorial-list__num" aria-hidden="true" style={{ fontFamily: "ui-monospace, monospace", color: "var(--orange-500)", fontWeight: 800 }}>
                    [0{index + 1}]
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
                  Không phải một tấm chứng chỉ chung chung. Là một mục hồ sơ do hệ thống tự viết sau khi
                  doanh nghiệp nghiệm thu, nhà tuyển dụng đọc vào là biết chắc công việc đã thật sự diễn ra.
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
                  <Link href={`/portfolio/le-tuan-loc`} className="btn btn--outline btn--sm">
                    Xem hồ sơ đầy đủ
                    <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BottomNav current="/" />
    </>
  );
}
