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

      <main id="main-content" className="container">
        <nav aria-label="Đường dẫn phân cấp">
          <ol className="breadcrumbs">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/sme/projects">Dự án của tôi</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Ứng viên</li>
          </ol>
        </nav>

        <div className="section--tight">
          <p className="text-caption">{project.title}</p>
          <h1>Chọn người làm dự án này</h1>
          <p className="lede" style={{ marginTop: "var(--space-3)" }}>
            Bạn chọn đúng một bạn. Xếp trên là những bạn trùng nhiều kỹ năng với yêu cầu của bạn nhất,
            nhưng thư ngỏ mới là thứ nói lên bạn ấy có hiểu việc hay không.
          </p>
        </div>

        {applicants.length === 0 ? (
          <EmptyState
            title="Chưa có ai ứng tuyển"
            advice="Dự án mới đăng thường có đơn đầu tiên sau 1 tới 2 ngày. Mô tả càng cụ thể thì càng nhiều bạn đủ tự tin để nộp."
            action={<ButtonLink href={`/projects/${project.id}`} variant="outline">Xem lại dự án</ButtonLink>}
          />
        ) : (
          <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0, paddingBottom: "var(--space-section)" }}>
            {applicants.map((applicant) => {
              const score = matchScore(project.skills, applicant.skills);

              return (
                <li key={applicant.id} className={`card stack ${applicant.shortlisted ? "card--selected" : ""}`}>
                  <div className="cluster cluster--between">
                    <div>
                      <h2 style={{ fontSize: "var(--text-h3-size)" }}>{applicant.name}</h2>
                      <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>
                        {applicant.major}, {applicant.year}, {applicant.school}
                      </p>
                    </div>

                    <p className="match-score" style={{ margin: 0 }}>
                      <span className="match-score__value">{score.percent}%</span>
                      <span className="text-caption">
                        phù hợp, trùng {score.matchedCount}/{score.total} kỹ năng
                      </span>
                    </p>
                  </div>

                  <div className="cluster">
                    {applicant.verified ? (
                      <span className="badge badge--verified">
                        <SealCheck weight={ICON_WEIGHT} aria-hidden="true" />
                        Sinh viên đã xác thực
                      </span>
                    ) : (
                      /* Chưa xác thực là thông tin quan trọng với SME, nên nói
                         thẳng thay vì lặng lẽ bỏ huy hiệu đi. */
                      <StatusBadge status="PENDING" label="Đang chờ xác thực thẻ sinh viên" />
                    )}
                    {applicant.shortlisted ? (
                      <span className="badge badge--progress">
                        <Check weight={ICON_WEIGHT} aria-hidden="true" />
                        Trong danh sách rút gọn
                      </span>
                    ) : null}
                  </div>

                  <ul className="pill-list">
                    {applicant.skills.map((skill) => {
                      const needed = project.skills.includes(skill);
                      return (
                        <li key={skill} className={`skill-pill ${needed ? "skill-pill--matched" : ""}`}>
                          {needed ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                          {skill}
                          {needed ? (
                            <span className="visually-hidden">(khớp yêu cầu của dự án)</span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>

                  <div>
                    <p className="text-caption">Thư ngỏ</p>
                    <p style={{ marginTop: "var(--space-2)", maxWidth: "70ch" }}>{applicant.coverLetter}</p>
                  </div>

                  <div className="card__footer cluster cluster--between">
                    <a href={applicant.portfolioUrl} className="btn btn--ghost btn--sm">
                      {applicant.portfolioLabel}
                      <ArrowRight weight={ICON_WEIGHT} aria-hidden="true" />
                    </a>

                    <span className="cluster">
                      {/* Danh sách rút gọn là bước TÙY CHỌN (FR-APP-04): nó giúp
                          SME thu hẹp dần mà chưa phải cam kết gì. */}
                      <button type="button" className="btn btn--outline btn--sm">
                        {applicant.shortlisted ? "Bỏ khỏi rút gọn" : "Đánh dấu rút gọn"}
                      </button>

                      <AcceptApplicantButton
                        applicantName={applicant.name}
                        otherCount={applicants.length - 1}
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
