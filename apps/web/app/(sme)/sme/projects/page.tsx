import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../../components/layout/site-header";
import { SiteFooter } from "../../../../components/layout/site-footer";
import { ButtonLink } from "../../../../components/ui/button";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { EmptyState } from "../../../../components/ui/feedback";
import { PROJECTS, TODAY } from "../../../../mocks/data";
import { daysUntil, formatDate, formatVnd } from "../../../../lib/utils/format";

export const metadata: Metadata = {
  title: "Dự án của tôi",
  description: "Quản lý các dự án bạn đã đăng theo từng trạng thái."
};

/**
 * Danh sách dự án của SME, nhóm theo trạng thái (FR-PRJ-09).
 *
 * Tab chạy bằng tham số URL nên màn hình vẫn là Server Component và người dùng
 * quay lại đúng tab đang xem khi bấm nút Back của trình duyệt.
 *
 * Mật độ ở khu này CHẶT hơn khu marketing: đây là màn hình làm việc, người dùng
 * cần thấy nhiều dòng trong một lần nhìn (design.md 4.9, biến thiên mật độ).
 */
const TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "draft", label: "Bản nháp", match: (s: string) => s === "DRAFT" },
  { key: "review", label: "Chờ duyệt", match: (s: string) => s === "PENDING_REVIEW" },
  { key: "open", label: "Đang tuyển", match: (s: string) => s === "PUBLISHED" },
  { key: "running", label: "Đang thực hiện", match: (s: string) => s === "IN_PROGRESS" },
  { key: "done", label: "Hoàn tất", match: (s: string) => s === "COMPLETED" }
];

/**
 * Mỗi trạng thái có một việc cần làm khác nhau. Đặt đúng một hành động chính
 * cho mỗi dòng, thay vì bày hết mọi nút lên rồi để người dùng tự đoán.
 */
function primaryAction(project: (typeof PROJECTS)[number]) {
  switch (project.status) {
    case "DRAFT":
      return { href: "/sme/projects/new", label: "Soạn tiếp", variant: "primary" };
    case "PUBLISHED":
      return {
        href: `/sme/projects/${project.id}/review`,
        label: `Xem ${project.applicantCount} ứng viên`,
        variant: "primary"
      };
    case "IN_PROGRESS":
      return { href: `/workspace/${project.id}`, label: "Vào không gian làm việc", variant: "primary" };
    default:
      return { href: `/projects/${project.id}`, label: "Xem dự án", variant: "outline" };
  }
}

export default async function SmeProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.find((item) => item.key === tab) ?? TABS[0];
  const projects = PROJECTS.filter((project) => activeTab.match(project.status));

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
            <li aria-current="page">Dự án của tôi</li>
          </ol>
        </nav>

        <div className="section--tight cluster cluster--between">
          <div>
            <h1>Dự án của tôi</h1>
            <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
              Quản lý các bài toán bạn đã đăng và theo dõi tiến độ từng dự án.
            </p>
          </div>
          <ButtonLink href="/sme/projects/new">Đăng dự án mới</ButtonLink>
        </div>

        <nav className="tabs" aria-label="Lọc theo trạng thái">
          {TABS.map((item) => {
            const count = PROJECTS.filter((project) => item.match(project.status)).length;
            return (
              <Link
                key={item.key}
                href={item.key === "all" ? "/sme/projects" : `/sme/projects?tab=${item.key}`}
                className="tab"
                aria-current={item.key === activeTab.key ? "page" : undefined}
              >
                {item.label}
                <span className="text-caption num">{count}</span>
              </Link>
            );
          })}
        </nav>

        {projects.length === 0 ? (
          <EmptyState
            title="Chưa có dự án nào ở mục này"
            advice="Khi bạn đăng một bài toán mới, nó sẽ đi qua bản nháp, chờ duyệt, rồi mới hiện ra cho sinh viên ứng tuyển."
            action={<ButtonLink href="/sme/projects/new">Đăng dự án mới</ButtonLink>}
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {projects.map((project) => {
              const action = primaryAction(project);
              return (
                <li key={project.id} className="project-row">
                  <div className="stack stack--sm">
                    <p className="cluster">
                      <StatusBadge status={project.status} />
                      {project.status === "PUBLISHED" && project.applicantCount > 0 ? (
                        <span className="text-caption num">
                          {project.applicantCount} người đã ứng tuyển
                        </span>
                      ) : null}
                    </p>

                    <h2 style={{ fontSize: "var(--text-h4-size)" }}>{project.title}</h2>

                    <p className="text-muted num" style={{ margin: 0 }}>
                      {project.milestones.length} mốc bàn giao, hạn {formatDate(project.deadline)}
                      {project.status === "PUBLISHED" || project.status === "IN_PROGRESS"
                        ? `, còn ${daysUntil(project.deadline, TODAY)} ngày`
                        : ""}
                    </p>
                  </div>

                  <div className="project-row__meta stack stack--sm">
                    <p className="project-row__money">{formatVnd(project.budget)}</p>
                    <p style={{ margin: 0 }}>
                      <Link href={action.href} className={`btn btn--${action.variant} btn--sm`}>
                        {action.label}
                      </Link>
                    </p>
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
