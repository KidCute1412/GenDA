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
            - Nền màu đậm vì đòn bẩy làm ấm số 2 ở 4.9.1 yêu cầu dùng màu thương
              hiệu HÀO PHÓNG làm nền cả khối. Nền tint teal-50 sáng gần bằng nền
              trắng nên không tạo ra nhịp màu nào. */}
        <section className="band--brand-strong on-dark">
          <div className="container hero-editorial">
          <div>
            <p className="eyebrow">Dự án thật, trả công thật</p>
            <h1 className="text-display hero-display" style={{ marginBlock: "var(--space-4) var(--space-5)" }}>
              From Learn to Earn
            </h1>
            {/* Đoạn dẫn giữ trong ba dòng ở desktop: hero phải nằm trọn trong
                một màn hình, người đọc không cần cuộn mới thấy nút hành động. */}
            <p className="lede">
              Bạn cần một dự án thật để đưa vào CV. Doanh nghiệp gần bạn cần người làm nhưng ngại giao cho
              người lạ. GenDA đứng giữa lo phần niềm tin.
            </p>

            <div className="cluster hero-cta" style={{ marginTop: "var(--space-8)", gap: "var(--space-3)" }}>
              <ButtonLink href="/projects" size="lg">
                Tôi là sinh viên, tìm dự án
              </ButtonLink>
              <ButtonLink href="/sme/projects/new" size="lg" variant="outline">
                Tôi là doanh nghiệp, cần người làm
              </ButtonLink>
            </div>
          </div>

          {/* Cột phải của hero: MỘT DỰ ÁN THẬT đang tuyển, dựng bằng đúng các
              component mà trang /projects dùng.

              Trước đây chỗ này là lưới 2x2 bốn con số cỡ lớn. Khối đó là mẫu bị
              dùng lại nhiều nhất trên các trang do máy sinh, và tệ hơn: nó nói
              về nền tảng chứ không cho xem nền tảng. Đặt một dự án thật vào đây
              trả lời ngay câu hỏi đầu tiên của người mới vào — "trên này có việc
              gì?" — và chứng minh sản phẩm tồn tại thay vì mô tả nó. */}
          <article className="card hero-feature stack stack--sm">
            <p className="cluster cluster--between" style={{ margin: 0 }}>
              <span className="text-caption">{preview.smeName}, {preview.smeIndustry}</span>
              <StatusBadge status="PUBLISHED" />
            </p>

            <h2 style={{ fontSize: "var(--text-h4-size)" }}>
              <Link href={`/projects/${preview.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                {preview.title}
              </Link>
            </h2>

            <p className="cluster cluster--between" style={{ margin: 0 }}>
              <span className="project-row__money">{formatVnd(preview.budget)}</span>
              <span className="text-caption num">
                {preview.milestones.length} mốc bàn giao
              </span>
            </p>

            <hr className="rule" />

            <ul className="pill-list">
              {preview.skills.map((skill) => {
                const owned = previewScore.matched.includes(skill);
                return (
                  <li key={skill} className={`skill-pill ${owned ? "skill-pill--matched" : ""}`}>
                    {owned ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                    {skill}
                  </li>
                );
              })}
            </ul>

            <p className="text-caption num" style={{ margin: 0 }}>
              Hạn {formatDate(preview.deadline)}, còn {daysUntil(preview.deadline, TODAY)} ngày
            </p>
          </article>
          </div>
        </section>

        {/* Bốn con số cam kết, dạng dải NGANG gọn ngay dưới hero.
            Vẫn là cam kết sản phẩm lấy từ requirement.md, nhưng trình bày ở cỡ
            vừa phải để chúng là thông tin, không phải khẩu hiệu. */}
        <section className="container hero-spill" style={{ paddingBottom: "var(--space-8)" }}>
          <dl className="stat-strip">
            {COMMITMENTS.map((commitment) => (
              <div key={commitment.label}>
                <dt className="visually-hidden">{commitment.label}</dt>
                <dd style={{ margin: 0 }}>
                  <span className="stat__value">{commitment.value}</span>
                  <span className="stat__label" aria-hidden="true">
                    {commitment.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Khối sáng ngay sau vùng màu đậm. Nhịp màu của trang là ĐẬM → SÁNG →
            SÁNG → ĐẬM: hai vùng màu neo hai đầu, phần giữa để thở. Nếu khối nào
            cũng tô màu thì màu lại mất hết sức nặng. */}
        <section id="trust-layer" className="container section">
          <div style={{ maxWidth: "720px" }}>
            <h2>Bốn lớp bảo vệ niềm tin</h2>
            <p className="lede" style={{ marginTop: "var(--space-4)" }}>
              Vấn đề ở đây không phải thiếu người làm, mà là lần đầu hợp tác thì hai bên chẳng có cơ sở
              nào để tin nhau. Bốn lớp dưới đây là cách chúng tôi xử lý chuyện đó.
            </p>
          </div>

          <div>
            {/* Danh sách ĐÁNH SỐ CÓ KẺ NGANG, không phải bốn thẻ giống hệt nhau
                xếp lưới đều: khi mọi thứ trông quan trọng như nhau thì không gì
                quan trọng cả. */}
            <ol className="editorial-list" style={{ marginTop: "var(--space-10)" }}>
              {PILLARS.map((pillar, index) => (
                <li key={pillar.title} className="editorial-list__item">
                  {/* Số cỡ lớn chìm màu chỉ làm nhịp thị giác, nên aria-hidden:
                      thứ tự đã nằm sẵn trong ngữ nghĩa của thẻ <ol>. */}
                  <span className="editorial-list__num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "var(--text-h4-size)" }}>{pillar.title}</h3>
                    <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>
                      {pillar.lead}
                    </p>
                  </div>
                  <p style={{ margin: 0 }}>{pillar.body}</p>
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
        <section className="band band--achieve-strong on-dark">
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
                  <Link href={`/portfolio/nguyen-hai-nam`} className="btn btn--outline btn--sm">
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
