import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { ButtonLink } from "../../../components/ui/button";
import { EmptyState } from "../../../components/ui/feedback";
import { Check, ICON_WEIGHT, MagnifyingGlass } from "../../../components/ui/icons";
import { CURRENT_STUDENT, PROJECTS, SKILL_CATALOG, TODAY } from "../../../mocks/data";
import { daysUntil, formatDate, formatVnd, matchScore } from "../../../lib/utils/format";

export const metadata: Metadata = {
  title: "Dự án đang tuyển",
  description: "Tìm mini-project phù hợp với kỹ năng của bạn, ngân sách từ 1 đến 5 triệu đồng."
};

/**
 * Màn hình 4 — Khám phá & Lọc Dự án (docs/design.md 7.4).
 *
 * Trình bày theo DANH SÁCH CÓ CỘT THẲNG HÀNG, không phải lưới thẻ. Lý do ở
 * design.md 4.9: đây là màn hình để SO SÁNH các dự án với nhau, mà lưới thẻ bắt
 * mắt nhảy zigzag nên không so được ngân sách. Ở đây mọi số tiền nằm trên đúng
 * một trục dọc, căn phải, dùng chữ số bảng.
 *
 * Bộ lọc chạy hoàn toàn bằng tham số URL nên màn hình này vẫn là Server
 * Component: không cần JavaScript phía client, và người dùng chia sẻ được đường
 * dẫn kèm bộ lọc đang bật.
 */

const BUDGET_BUCKETS = [
  { key: "1-2", label: "1 đến 2 triệu", min: 1_000_000, max: 2_000_000 },
  { key: "2-3", label: "2 đến 3 triệu", min: 2_000_000, max: 3_000_000 },
  { key: "3-5", label: "3 đến 5 triệu", min: 3_000_000, max: 5_000_000 }
];

/** Chỉ mở bộ lọc cho các kỹ năng đang thực sự có dự án, tránh ngõ cụt 0 kết quả. */
const FILTERABLE_SKILLS = SKILL_CATALOG.filter((skill) =>
  PROJECTS.some((project) => project.status === "PUBLISHED" && project.skills.includes(skill))
);

type SearchParams = { q?: string; skill?: string | string[]; budget?: string };

function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Dựng lại query string sau khi bật/tắt một kỹ năng — giữ nguyên các lọc khác. */
function toggleSkillHref(params: SearchParams, skill: string) {
  const active = toList(params.skill);
  const next = active.includes(skill) ? active.filter((s) => s !== skill) : [...active, skill];

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.budget) query.set("budget", params.budget);
  next.forEach((s) => query.append("skill", s));

  const qs = query.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

function toggleBudgetHref(params: SearchParams, bucket: string) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.budget !== bucket) query.set("budget", bucket);
  toList(params.skill).forEach((s) => query.append("skill", s));

  const qs = query.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeSkills = toList(params.skill);
  const keyword = (params.q ?? "").trim().toLowerCase();
  const bucket = BUDGET_BUCKETS.find((b) => b.key === params.budget);
  const hasFilter = Boolean(keyword || activeSkills.length > 0 || bucket);

  const results = PROJECTS.filter((project) => project.status === "PUBLISHED")
    .filter((project) =>
      keyword
        ? project.title.toLowerCase().includes(keyword) ||
          project.smeName.toLowerCase().includes(keyword) ||
          project.skills.some((skill) => skill.toLowerCase().includes(keyword))
        : true
    )
    .filter((project) =>
      activeSkills.length > 0 ? activeSkills.every((skill) => project.skills.includes(skill)) : true
    )
    .filter((project) => (bucket ? project.budget >= bucket.min && project.budget <= bucket.max : true))
    // Sắp xếp giảm dần theo điểm phù hợp (FR-MAT-03)
    .sort(
      (a, b) =>
        matchScore(b.skills, CURRENT_STUDENT.skills).percent -
        matchScore(a.skills, CURRENT_STUDENT.skills).percent
    );

  return (
    <>
      <SiteHeader current="/projects" />

      <main id="main-content" className="container has-bottom-nav">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Dự án đang tuyển</li>
          </ol>
        </nav>

        <div className="section--tight">
          <h1>Dự án đang tuyển</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Mọi dự án ở đây đều đã qua kiểm duyệt, có mốc bàn giao và ngân sách rõ ràng từ trước.
          </p>
        </div>

        {/* --- Thanh tìm kiếm & bộ lọc --- */}
        <div>
          <form action="/projects" method="get" role="search" className="stack stack--sm">
            <label className="field__label" htmlFor="project-search">
              Tìm theo tên dự án, doanh nghiệp hoặc kỹ năng
            </label>
            <div className="search-row">
              <input
                id="project-search"
                className="input"
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Ví dụ: landing page, SEO, Figma"
              />
              <button type="submit" className="btn btn--primary">
                <MagnifyingGlass weight={ICON_WEIGHT} aria-hidden="true" />
                Tìm
              </button>
            </div>
            {/* Giữ lại các lọc đang bật khi người dùng gửi ô tìm kiếm */}
            {activeSkills.map((skill) => (
              <input key={skill} type="hidden" name="skill" value={skill} />
            ))}
            {params.budget ? <input type="hidden" name="budget" value={params.budget} /> : null}
          </form>
        </div>

        <div className="stack stack--sm" style={{ marginTop: "var(--space-6)" }}>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="field__label">Kỹ năng</legend>
            <ul className="pill-list">
              {FILTERABLE_SKILLS.map((skill) => {
                const on = activeSkills.includes(skill);
                return (
                  <li key={skill}>
                    <Link
                      href={toggleSkillHref(params, skill)}
                      className="chip"
                      aria-pressed={on}
                      scroll={false}
                    >
                      {on ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                      {skill}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="field__label">Khoảng ngân sách</legend>
            <ul className="pill-list">
              {BUDGET_BUCKETS.map((b) => {
                const on = params.budget === b.key;
                return (
                  <li key={b.key}>
                    <Link
                      href={toggleBudgetHref(params, b.key)}
                      className="chip"
                      aria-pressed={on}
                      scroll={false}
                    >
                      {on ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                      {b.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {hasFilter ? (
            <p>
              <Link href="/projects" className="btn btn--ghost btn--sm">
                Xóa toàn bộ bộ lọc
              </Link>
            </p>
          ) : null}
        </div>

        {/* --- Kết quả --- */}
        <div className="section--tight">
          <p className="text-muted" aria-live="polite">
            {results.length} dự án phù hợp
          </p>

          {results.length === 0 ? (
            <EmptyState
              title="Chưa có dự án nào khớp với bộ lọc này"
              advice="Hãy thử bỏ bớt một kỹ năng hoặc nới khoảng ngân sách. Dự án mới được duyệt mỗi ngày nên bạn quay lại sau cũng được."
              action={
                <ButtonLink href="/projects" variant="outline">
                  Xóa bộ lọc
                </ButtonLink>
              }
            />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {results.map((project) => {
                const score = matchScore(project.skills, CURRENT_STUDENT.skills);
                const remaining = daysUntil(project.deadline, TODAY);

                return (
                  <li key={project.id} className="project-row">
                    <div className="stack stack--sm">
                      <p className="text-caption">
                        {project.smeName}, {project.smeIndustry}
                      </p>

                      <h2 style={{ fontSize: "var(--text-h3-size)" }}>
                        <Link
                          href={`/projects/${project.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {project.title}
                        </Link>
                      </h2>

                      <p className="text-muted" style={{ margin: 0, maxWidth: "62ch" }}>
                        {project.summary}
                      </p>

                      <ul className="pill-list">
                        {project.skills.map((skill) => {
                          const owned = score.matched.includes(skill);
                          return (
                            <li
                              key={skill}
                              className={`skill-pill ${owned ? "skill-pill--matched" : ""}`}
                            >
                              {/* Kỹ năng trùng khớp có DẤU TÍCH, không chỉ đổi màu nền */}
                              {owned ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                              {skill}
                              {owned ? (
                                <span className="visually-hidden">(bạn đã có kỹ năng này)</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Cột phải: mọi số tiền nằm trên cùng một trục dọc, căn phải */}
                    <div className="project-row__meta stack stack--sm">
                      <p className="project-row__money">{formatVnd(project.budget)}</p>

                      <p className="text-caption num" style={{ margin: 0 }}>
                        Hạn {formatDate(project.deadline)}, còn {remaining} ngày
                      </p>

                      {/* Điểm phù hợp LUÔN đi kèm diễn giải trùng mấy trên mấy
                          (FR-MAT-02): một con số trần không kiểm chứng được. */}
                      <p className="match-score" style={{ margin: 0 }}>
                        <span className="match-score__value">{score.percent}%</span>
                        <span className="text-caption">
                          phù hợp, trùng {score.matchedCount}/{score.total} kỹ năng
                        </span>
                      </p>

                      <p style={{ margin: 0 }}>
                        <Link href={`/projects/${project.id}`} className="btn btn--outline btn--sm">
                          Xem chi tiết
                        </Link>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomNav current="/projects" />
    </>
  );
}
