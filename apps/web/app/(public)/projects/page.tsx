import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { ButtonLink } from "../../../components/ui/button";
import { EmptyState } from "../../../components/ui/feedback";
import { Check, MagnifyingGlass } from "../../../components/ui/icons";
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
      <SiteHeader hideOnMobile />

      <main id="main-content" className="container has-bottom-nav" style={{ paddingTop: "var(--space-8)" }}>
        <div className="industrial-ruler">
          {"SYS.EXPLORER // REGISTRY // 04 MODULES ACTIVE"}
        </div>

        <nav className="page-breadcrumb-bar" aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs" style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", textTransform: "uppercase" }}>
            <li>
              <Link href="/">ROOT</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: "var(--orange-500)", fontWeight: 700 }}>PROJECTS</li>
          </ol>
        </nav>

        <div className="section--tight" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-6)", marginBottom: "var(--space-8)" }}>
          <h1 className="industrial-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            DỰ ÁN ĐANG TUYỂN
          </h1>
          <p className="lede" style={{ marginTop: "var(--space-3)", color: "var(--color-text-muted)" }}>
            Tất cả dự án được mã hóa hợp đồng kiểm soát theo từng mốc (milestone), giải ngân qua ký quỹ độc lập.
          </p>
        </div>

        {/* --- Thanh tìm kiếm & bộ lọc --- */}
        <div style={{ marginBottom: "var(--space-8)" }}>
          <form action="/projects" method="get" role="search" className="stack stack--sm">
            <label className="field__label" htmlFor="project-search" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.08em" }}>
              {"[SCAN] TÌM THEO TÊN DỰ ÁN, DOANH NGHIỆP HOẶC KỸ NĂNG"}
            </label>
            <div className="search-row" style={{ maxWidth: "720px" }}>
              <input
                id="project-search"
                className="input"
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Nhập từ khóa kỹ thuật (ví dụ: React, Figma, SEO)..."
                style={{ fontFamily: "ui-monospace, monospace" }}
              />
              <button type="submit" className="btn--tactile-orange" style={{ height: "42px", paddingInline: "var(--space-5)" }}>
                <MagnifyingGlass weight="bold" aria-hidden="true" />
                TÌM KIẾM
              </button>
            </div>
            {/* Giữ lại các lọc đang bật khi người dùng gửi ô tìm kiếm */}
            {activeSkills.map((skill) => (
              <input key={skill} type="hidden" name="skill" value={skill} />
            ))}
            {params.budget ? <input type="hidden" name="budget" value={params.budget} /> : null}
          </form>
        </div>

        <div className="stack stack--sm" style={{ marginBottom: "var(--space-10)" }}>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="field__label" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              {"// LỌC THEO KỸ NĂNG"}
            </legend>
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
                      {on ? <Check weight="bold" aria-hidden="true" /> : null}
                      {skill}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset style={{ border: 0, margin: "var(--space-4) 0 0 0", padding: 0 }}>
            <legend className="field__label" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              {"// KHOẢNG NGÂN SÁCH KÝ QUỸ"}
            </legend>
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
                      {on ? <Check weight="bold" aria-hidden="true" /> : null}
                      {b.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {hasFilter ? (
            <p style={{ marginTop: "var(--space-3)" }}>
              <Link
                href="/projects"
                className="btn--tactile-zinc"
                style={{ height: "32px", fontSize: "11px", paddingInline: "12px", textDecoration: "none" }}
              >
                {"[XÓA TOÀN BỘ BỘ LỌC]"}
              </Link>
            </p>
          ) : null}
        </div>

        {/* --- Kết quả --- */}
        <div className="section--tight">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--machinery-border)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 700, margin: 0, textTransform: "uppercase" }} aria-live="polite">
              KẾT QUẢ QUÉT: <span style={{ color: "var(--orange-500)" }}>{results.length}</span> DỰ ÁN
            </p>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
              SORT: MATCH_SCORE DESC
            </span>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="Chưa có dự án nào khớp với bộ lọc này"
              advice="Hãy thử bỏ bớt một kỹ năng hoặc nới khoảng ngân sách. Dự án mới được duyệt mỗi ngày nên bạn quay lại sau cũng được."
              action={
                <ButtonLink href="/projects" variant="outline" className="btn--tactile-zinc">
                  Xóa bộ lọc
                </ButtonLink>
              }
            />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {results.map((project, idx) => {
                const score = matchScore(project.skills, CURRENT_STUDENT.skills);
                const remaining = daysUntil(project.deadline, TODAY);
                const bayId = `MOD-${String(idx + 1).padStart(2, "0")}`;

                return (
                  <li key={project.id} className="project-row">
                    <div className="stack stack--sm">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                        <span style={{ backgroundColor: "var(--machinery-border)", color: "var(--color-surface-card)", padding: "1px 6px", fontWeight: 800, borderRadius: "2px" }}>
                          {bayId}
                        </span>
                        <span>{project.smeName.toUpperCase()}</span>
                        <span>{"//"}</span>
                        <span>{project.smeIndustry.toUpperCase()}</span>
                      </div>

                      <h2 style={{ fontSize: "var(--text-h3-size)", margin: "var(--space-1) 0" }}>
                        <Link
                          href={`/projects/${project.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {project.title}
                        </Link>
                      </h2>

                      <p className="text-muted" style={{ margin: 0, maxWidth: "62ch", lineHeight: 1.5 }}>
                        {project.summary}
                      </p>

                      <ul className="pill-list" style={{ marginTop: "var(--space-2)" }}>
                        {project.skills.map((skill) => {
                          const owned = score.matched.includes(skill);
                          return (
                            <li
                              key={skill}
                              className={`skill-pill ${owned ? "skill-pill--matched" : ""}`}
                            >
                              {owned ? <Check weight="bold" aria-hidden="true" /> : null}
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

                      <p className="text-caption num" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
                        HẠN: {formatDate(project.deadline)} (CÒN {remaining}D)
                      </p>

                      {/* Điểm phù hợp LUÔN đi kèm diễn giải trùng mấy trên mấy (FR-MAT-02) */}
                      <div style={{ margin: 0, display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{
                          fontFamily: "ui-monospace, monospace",
                          fontSize: "12px",
                          fontWeight: 800,
                          backgroundColor: score.percent >= 70 ? "rgba(249, 115, 22, 0.15)" : "var(--color-surface-subtle)",
                          color: score.percent >= 70 ? "var(--orange-500)" : "var(--color-text-muted)",
                          border: `1px solid ${score.percent >= 70 ? "var(--orange-500)" : "var(--machinery-border)"}`,
                          padding: "2px 6px",
                          borderRadius: "2px"
                        }}>
                          [MATCH: {score.percent}%]
                        </span>
                        <span className="text-caption" style={{ fontFamily: "ui-monospace, monospace", fontSize: "10px", marginTop: "2px" }}>
                          KHỚP {score.matchedCount}/{score.total} KỸ NĂNG
                        </span>
                      </div>

                      <div style={{ marginTop: "var(--space-2)" }}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="btn--tactile-zinc"
                          style={{
                            height: "36px",
                            fontSize: "12px",
                            paddingInline: "var(--space-4)",
                            display: "inline-flex"
                          }}
                        >
                          XEM CHI TIẾT
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}
