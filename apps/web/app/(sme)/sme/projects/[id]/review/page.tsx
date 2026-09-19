import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../../../components/layout/site-header";
import { SiteFooter } from "../../../../../../components/layout/site-footer";
import { StatusBadge } from "../../../../../../components/ui/status-badge";
import { EmptyState } from "../../../../../../components/ui/feedback";
import { ButtonLink } from "../../../../../../components/ui/button";
import { ArrowRight, Check, ICON_WEIGHT, SealCheck } from "../../../../../../components/ui/icons";
import { AcceptApplicantButton } from "../../../../../../features/applications/components/accept-applicant-button";
import { ShortlistToggleButton } from "../../../../../../features/applications/components/shortlist-toggle-button";
import { APPLICANTS, PROJECTS, getProject } from "../../../../../../mocks/data";
import { matchScore } from "../../../../../../lib/utils/format";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? `Ứng viên: ${project.title}` : "Không tìm thấy dự án" };
}

/**
 * Màn hình 5 — Xem & Lựa chọn Ứng viên (docs/design.md 7.5).
 *
 * Danh sách sắp xếp giảm dần theo điểm phù hợp (FR-MAT-03), nhưng điểm LUÔN đi
 * kèm diễn giải trùng mấy trên mấy: SME cần hiểu vì sao một bạn xếp trên, chứ
 * không phải tin vào một con số do hệ thống đưa ra.
 *
 * Thứ tự thông tin trong mỗi thẻ bám đúng cách SME thật sự thẩm định (HTA 3,
 * bước 2): trước hết là bạn này có phải sinh viên thật không (huy hiệu xác
 * thực), rồi tới kỹ năng, rồi mới tới thư ngỏ và sản phẩm minh chứng.
 */
export default async function ReviewApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);

  if (!project) notFound();

  const applicants = [...APPLICANTS].sort(
    (a, b) => matchScore(project.skills, b.skills).percent - matchScore(project.skills, a.skills).percent
  );

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="industrial-canvas" style={{ paddingBottom: "var(--space-16)" }}>
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
                  <Link href="/sme/projects" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>SME PROJECTS</Link>
                </li>
                <li aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>/</li>
                <li aria-current="page" style={{ fontWeight: 700, color: "var(--orange-500)" }}>APPLICANTS // {project.id.toUpperCase()}</li>
              </ol>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
              <span className="badge badge--verified" style={{ margin: 0 }}>
                CANDIDATES: {applicants.length}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}>
                MATCH ENGINE ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "var(--space-6)" }}>
          
          {/* HEADER TRANG REVIEW */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div className="industrial-ruler">SELECTION PROTOCOL // CHỌN NHÂN SỰ DỰ ÁN</div>
            <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
              XÉT DUYỆT ỨNG VIÊN
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "70ch" }}>
              Dự án: <strong style={{ color: "var(--color-text-heading)" }}>{project.title}</strong> ({project.smeName}) — Bạn chọn đúng một ứng viên để kích hoạt mốc bàn giao đầu tiên và ký quỹ dự án.
            </p>
          </div>

          {applicants.length === 0 ? (
            <div className="module-bay" style={{ padding: "var(--space-10)", textAlign: "center" }}>
              <EmptyState
                title="CHƯA CÓ ĐƠN ỨNG TUYỂN NÀO"
                advice="Các dự án vừa xuất bản thường nhận được đơn nộp sau 1-2 ngày. Bạn có thể kiểm tra lại mô tả đề bài và tiêu chí nghiệm thu."
                action={
                  <Link href={`/projects/${project.id}`} className="btn--tactile-zinc" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>
                    XEM LẠI ĐỀ BÀI CÔNG KHAI
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="stack" style={{ gap: "var(--space-4)" }}>
              {applicants.map((applicant) => {
                const score = matchScore(project.skills, applicant.skills);

                return (
                  <article 
                    key={applicant.id} 
                    className="module-bay"
                    style={{ 
                      padding: "var(--space-6)",
                      backgroundColor: "var(--color-surface-card)",
                      borderColor: applicant.shortlisted ? "var(--orange-500)" : "var(--machinery-border)"
                    }}
                  >
                    <div className="module-bay__header" style={{ borderColor: applicant.shortlisted ? "var(--orange-500)" : "var(--machinery-border)" }}>
                      <span className="module-bay__id" style={{ backgroundColor: applicant.shortlisted ? "var(--orange-500)" : "var(--machinery-border)" }}>
                        CANDIDATE // {applicant.id.toUpperCase()}
                      </span>
                      {applicant.shortlisted ? (
                        <span style={{ color: "var(--orange-500)", fontWeight: 800, fontFamily: "ui-monospace, monospace", fontSize: "11px" }}>
                          ★ ĐÃ ĐÁNH DẤU RÚT GỌN
                        </span>
                      ) : (
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                          HỒ SƠ MỚI
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <h2 style={{ fontSize: "1.35rem", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
                            {applicant.name}
                          </h2>
                          {applicant.verified ? (
                            <span className="badge badge--verified" style={{ margin: 0 }}>
                              <SealCheck weight={ICON_WEIGHT} aria-hidden="true" />
                              SINH VIÊN ĐÃ XÁC THỰC
                            </span>
                          ) : (
                            <span className="badge badge--progress" style={{ margin: 0 }}>
                              CHỜ XÁC MINH THẺ
                            </span>
                          )}
                        </div>

                        <p className="text-muted" style={{ margin: "4px 0 0", fontSize: "12px", fontFamily: "ui-monospace, monospace" }}>
                          {applicant.major} · {applicant.year} · {applicant.school}
                        </p>
                      </div>

                      {/* Điểm số so khớp cơ khí */}
                      <div 
                        style={{ 
                          border: "2px solid var(--machinery-border)", 
                          padding: "6px 12px", 
                          backgroundColor: "var(--color-surface-subtle)",
                          textAlign: "right"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)" }}>
                            ĐỘ PHÙ HỢP:
                          </span>
                          <strong className="num" style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--orange-500)" }}>
                            {score.percent}%
                          </strong>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "ui-monospace, monospace" }}>
                          Khớp {score.matchedCount}/{score.total} kỹ năng
                        </span>
                      </div>
                    </div>

                    {/* Danh sách kỹ năng */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBlock: "var(--space-4)" }}>
                      {applicant.skills.map((skill) => {
                        const needed = project.skills.includes(skill);
                        return (
                          <span 
                            key={skill} 
                            className="chip"
                            style={{ 
                              fontSize: "11px", 
                              height: "26px", 
                              paddingInline: "8px", 
                              borderColor: needed ? "var(--orange-500)" : "var(--machinery-border)",
                              backgroundColor: needed ? "var(--color-surface-subtle)" : "transparent",
                              fontWeight: needed ? 700 : 500
                            }}
                          >
                            {needed ? <Check weight={ICON_WEIGHT} aria-hidden="true" style={{ color: "var(--orange-500)", marginRight: "4px" }} /> : null}
                            {skill}
                          </span>
                        );
                      })}
                    </div>

                    {/* Thư ngỏ */}
                    <div style={{ marginBlock: "var(--space-3)" }}>
                      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                        {"// THƯ NGỎ CỦA ỨNG VIÊN"}
                      </div>
                      <p 
                        style={{ 
                          margin: 0, 
                          padding: "10px 14px", 
                          backgroundColor: "var(--color-surface-subtle)", 
                          borderLeft: "3px solid var(--machinery-border)",
                          fontSize: "13px", 
                          lineHeight: 1.5,
                          maxWidth: "75ch"
                        }}
                      >
                        {applicant.coverLetter}
                      </p>
                    </div>

                    {/* Chân Thẻ & Action buttons */}
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
                      <a 
                        href={applicant.portfolioUrl} 
                        target="_blank"
                        rel="noreferrer"
                        className="btn--tactile-zinc"
                        style={{ height: "36px", fontSize: "11px", textDecoration: "none" }}
                      >
                        {applicant.portfolioLabel}
                        <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                      </a>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <ShortlistToggleButton applicantId={applicant.id} initiallyShortlisted={applicant.shortlisted} />

                        <AcceptApplicantButton
                          applicantName={applicant.name}
                          otherCount={applicants.length - 1}
                        />
                      </div>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
