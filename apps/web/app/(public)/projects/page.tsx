import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { BottomNav } from "../../../components/layout/bottom-nav";
import { ButtonLink } from "../../../components/ui/button";
import { EmptyState } from "../../../components/ui/feedback";
import { Check, MagnifyingGlass } from "../../../components/ui/icons";
import { daysUntil, formatDate, formatVnd } from "../../../lib/utils/format";
import { browsePublishedProjects, listSkills } from "../../../features/projects/api";
import { OpportunityBrowser } from "../../../features/opportunities/components/opportunity-browser";
import { OpportunityTypeTabs } from "../../../features/opportunities/components/opportunity-type-tabs";
import { kindFromParam } from "../../../features/opportunities/model";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tìm cơ hội",
  description: "Dự án trọn gói 1–5 triệu, việc cộng tác viên theo buổi và sự kiện, workshop trả thù lao từ 50.000đ."
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
 *
 * Trang là "Tìm cơ hội" với ba tab loại (docs/opportunities.md): Dự án (mặc định, nội dung bên
 * dưới), Cộng tác viên (?type=gig) và Sự kiện & workshop (?type=event). Hai tab sau đọc ledger demo
 * nên dùng hòn đảo client OpportunityBrowser và không gọi API dự án.
 */

const BUDGET_BUCKETS = [
  { key: "1-2", label: "1 đến 2 triệu", min: 1_000_000, max: 2_000_000 },
  { key: "2-3", label: "2 đến 3 triệu", min: 2_000_000, max: 3_000_000 },
  { key: "3-5", label: "3 đến 5 triệu", min: 3_000_000, max: 5_000_000 }
];

type SearchParams = { q?: string; skill?: string | string[]; budget?: string; page?: string; type?: string };

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

function pageHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.budget) query.set("budget", params.budget);
  toList(params.skill).forEach((skill) => query.append("skill", skill));
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/projects?${qs}` : "/projects";
}

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const kind = kindFromParam(params.type);

  if (kind) {
    // Số dự án cho nhãn tab; backend không chạy thì tab vẫn dùng được, chỉ thiếu con số
    const projectCount = await browsePublishedProjects({ page: 1, pageSize: 1 }).then((page) => page.total, () => undefined);
    return (
      <>
        <SiteHeader hideOnMobile />
        <main id="main-content" className="container has-bottom-nav projects-page" style={{ paddingTop: "var(--space-8)" }}>
          <PageHead />
          <OpportunityTypeTabs active={kind} projectCount={projectCount} />
          <OpportunityBrowser kind={kind} />
        </main>
        <SiteFooter />
        <BottomNav />
      </>
    );
  }

  const activeSkills = toList(params.skill);
  const keyword = (params.q ?? "").trim();
  const bucket = BUDGET_BUCKETS.find((b) => b.key === params.budget);
  const hasFilter = Boolean(keyword || activeSkills.length > 0 || bucket);

  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [projectPage, filterableSkills] = await Promise.all([
    browsePublishedProjects({
      q: keyword || undefined,
      skill: activeSkills.length > 0 ? activeSkills : undefined,
      minBudget: bucket?.min,
      maxBudget: bucket?.max,
      page: currentPage,
      pageSize: 12
    }),
    listSkills()
  ]);
  const results = projectPage.data;
  const pageCount = Math.max(1, Math.ceil(projectPage.total / projectPage.pageSize));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <SiteHeader hideOnMobile />

      {/* projects-page: chạy hiệu ứng vào trang (vạch quét + các khối hiện lần lượt), xem components.css */}
      <main id="main-content" className="container has-bottom-nav projects-page" style={{ paddingTop: "var(--space-8)" }}>
        <PageHead />
        <OpportunityTypeTabs active="PROJECT" projectCount={projectPage.total} />

        {/* --- Thanh tìm kiếm & bộ lọc --- */}
        <div className="enter" style={{ marginBottom: "var(--space-8)", "--e": 4 } as CSSProperties}>
          <form action="/projects" method="get" role="search" className="stack stack--sm">
            {/* Nhãn ẩn: ô tìm kiếm vẫn cần tên cho trình đọc màn hình */}
            <label className="visually-hidden" htmlFor="project-search">
              Tìm theo tên dự án, doanh nghiệp hoặc kỹ năng
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
              <button type="submit" className="btn--tactile-brand" style={{ height: "42px", paddingInline: "var(--space-5)" }}>
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

        <div className="stack stack--sm enter" style={{ marginBottom: "var(--space-10)", "--e": 5 } as CSSProperties}>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="field__label" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>
              {"// LỌC THEO KỸ NĂNG"}
            </legend>
            <ul className="pill-list">
              {filterableSkills.map((skill) => {
                const on = activeSkills.includes(skill.code);
                return (
                  <li key={skill.code}>
                    <Link
                      href={toggleSkillHref(params, skill.code)}
                      className="chip"
                      aria-pressed={on}
                      scroll={false}
                    >
                      {on ? <Check weight="bold" aria-hidden="true" /> : null}
                      {skill.name}
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
          <div className="enter" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--machinery-border)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-4)", "--e": 6 } as CSSProperties}>
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", fontWeight: 700, margin: 0, textTransform: "uppercase" }} aria-live="polite">
              KẾT QUẢ QUÉT: <span style={{ color: "var(--brand-500)" }}>{projectPage.total}</span> DỰ ÁN
            </p>
            <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
              SORT: DEADLINE ASC
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
            <>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {results.map((project, idx) => {
                const remaining = daysUntil(project.deadline, today);
                const bayId = `MOD-${String(idx + 1).padStart(2, "0")}`;

                return (
                  <li key={project.id} className="project-row project-row--enter" style={{ "--i": idx } as CSSProperties}>
                    <div className="stack stack--sm">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                        <span className="tag-hardware">
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
                        {project.skills.map((skill) => (
                          <li key={skill.code} className="skill-pill">
                            {skill.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cột phải: mọi số tiền nằm trên cùng một trục dọc, căn phải */}
                    <div className="project-row__meta stack stack--sm">
                      <p className="project-row__money">{formatVnd(project.budget)}</p>

                      <p className="text-caption num" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
                        HẠN: {formatDate(project.deadline)} (CÒN {remaining}D)
                      </p>

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
            {pageCount > 1 ? (
              <nav className="cluster cluster--between" aria-label="Phân trang dự án" style={{ marginTop: "var(--space-6)" }}>
                {currentPage > 1 ? (
                  <ButtonLink href={pageHref(params, currentPage - 1)} variant="outline" className="btn--tactile-zinc">
                    Trang trước
                  </ButtonLink>
                ) : <span />}
                <span className="text-caption num">Trang {currentPage}/{pageCount}</span>
                {currentPage < pageCount ? (
                  <ButtonLink href={pageHref(params, currentPage + 1)} variant="outline" className="btn--tactile-zinc">
                    Trang sau
                  </ButtonLink>
                ) : <span />}
              </nav>
            ) : null}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
      <BottomNav />
    </>
  );
}

function PageHead() {
  return (
    <div className="section--tight projects-page__head" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-6)", marginBottom: "var(--space-6)" }}>
      <h1 className="industrial-display projects-page__title" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
        CƠ HỘI ĐANG MỞ
      </h1>
    </div>
  );
}
