"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { EmptyState, ErrorState, ProjectListSkeleton } from "../../../components/ui/feedback";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatDate, formatVnd } from "../../../lib/utils/format";
import { LEVEL_COPY, describeProjectError } from "../level-copy";
import { listMyProjects, type ManagedProject } from "../sme-api";
import { countApplications, type ApplicationCount } from "../../applications/services/applications-api";

/**
 * Danh sách dự án của SME, nhóm theo trạng thái (FR-PRJ-09), đọc từ backend.
 *
 * Tab chạy bằng tham số URL nên người dùng quay lại đúng tab đang xem khi bấm Back.
 * Mỗi trạng thái có đúng một việc cần làm, nên mỗi dòng chỉ có một hành động chính.
 *
 * Mật độ ở khu này CHẶT hơn khu marketing: đây là màn hình làm việc, người dùng
 * cần thấy nhiều dòng trong một lần nhìn (design.md 4.9, biến thiên mật độ).
 */
export const SME_PROJECT_TABS = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "draft", label: "Bản nháp", match: (s: string) => s === "DRAFT" },
  { key: "review", label: "Chờ duyệt", match: (s: string) => s === "PENDING_REVIEW" },
  { key: "open", label: "Đang tuyển", match: (s: string) => s === "PUBLISHED" },
  { key: "running", label: "Đang thực hiện", match: (s: string) => s === "IN_PROGRESS" },
  { key: "done", label: "Hoàn tất", match: (s: string) => s === "COMPLETED" }
] as const;

function primaryAction(project: ManagedProject, count?: ApplicationCount) {
  switch (project.status) {
    case "DRAFT":
      return { href: `/sme/projects/${project.id}/edit`, label: project.latestReturn ? "Sửa theo góp ý" : "Soạn tiếp", primary: true };
    case "PENDING_REVIEW":
      return { href: `/sme/projects/${project.id}/edit`, label: "Xem trạng thái duyệt", primary: false };
    case "PUBLISHED":
      return { href: `/sme/projects/${project.id}/review`, label: `Xem ứng viên (${count?.total ?? 0})`, primary: true };
    case "IN_PROGRESS":
      return { href: `/workspace/${project.id}?ledger=1`, label: "Vào workspace", primary: true };
    default:
      return { href: `/projects/${project.id}`, label: "Xem trang công khai", primary: true };
  }
}

export function SmeProjectList({ tab }: { tab?: string }) {
  const [projects, setProjects] = useState<ManagedProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, ApplicationCount>>({});
  const activeTab = SME_PROJECT_TABS.find((item) => item.key === tab) ?? SME_PROJECT_TABS[0];

  useEffect(() => {
    let active = true;
    listMyProjects()
      .then(async (loaded) => {
        if (!active) return;
        setProjects(loaded);
        // Số đơn chỉ để gợi ý; lỗi khi đếm không chặn danh sách dự án.
        const staffed = loaded.filter((project) => project.status === "PUBLISHED" || project.status === "IN_PROGRESS");
        const rows = await countApplications(staffed.map((project) => project.id)).catch(() => [] as ApplicationCount[]);
        if (active) setCounts(Object.fromEntries(rows.map((row) => [row.projectId, row])));
      })
      .catch((cause) => active && setError(describeProjectError(cause)));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <ErrorState detail={error} />;
  if (!projects) return <ProjectListSkeleton rows={3} />;

  const visible = projects.filter((project) => activeTab.match(project.status));

  return (
    <>
      {/* THANH TAB LỌC TRẠNG THÁI KIỂU HARDWARE SWITCHER */}
      <nav
        aria-label="Lọc theo trạng thái"
        style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "8px", marginBottom: "var(--space-6)", borderBottom: "2px solid var(--machinery-border)" }}
      >
        {SME_PROJECT_TABS.map((item) => {
          const count = projects.filter((project) => item.match(project.status)).length;
          const isSelected = item.key === activeTab.key;
          return (
            <Link
              key={item.key}
              href={item.key === "all" ? "/sme/projects" : `/sme/projects?tab=${item.key}`}
              className="chip"
              aria-current={isSelected ? "page" : undefined}
              style={{
                height: "34px",
                paddingInline: "12px",
                fontSize: "11px",
                fontFamily: "ui-monospace, monospace",
                textDecoration: "none",
                whiteSpace: "nowrap",
                backgroundColor: isSelected ? "var(--machinery-border)" : "var(--color-surface-card)",
                color: isSelected ? "#ffffff" : "var(--color-text-body)",
                borderColor: "var(--machinery-border)"
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  marginLeft: "6px",
                  padding: "1px 6px",
                  fontSize: "10px",
                  borderRadius: "2px",
                  backgroundColor: isSelected ? "var(--brand-500)" : "var(--color-surface-subtle)",
                  color: isSelected ? "#ffffff" : "var(--color-text-muted)"
                }}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <div className="module-bay" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <EmptyState
            title="CHƯA CÓ DỰ ÁN NÀO Ở MỤC NÀY"
            advice="Khi bạn đăng một bài toán mới, hệ thống lưu nháp, chuyển cho quản trị viên đối chiếu phạm vi với mức độ rồi xuất bản cho người ứng tuyển."
            action={
              <Link href="/sme/projects/new" className="btn--tactile-brand" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>
                ĐĂNG DỰ ÁN ĐẦU TIÊN
              </Link>
            }
          />
        </div>
      ) : (
        <div className="stack" style={{ gap: "var(--space-4)" }}>
          {visible.map((project) => {
            const count = counts[project.id];
            const action = primaryAction(project, count);
            const missing = project.status === "DRAFT" ? project.submissionIssues.length : 0;
            return (
              <article key={project.id} className="module-bay" style={{ padding: "var(--space-5) var(--space-6)", backgroundColor: "var(--color-surface-card)" }}>
                <div className="module-bay__header">
                  <span className="module-bay__id">PROJECT // {project.id.toUpperCase()}</span>
                  <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {project.deadline ? `HẠN CHÓT: ${formatDate(project.deadline)}` : "CHƯA CÓ HẠN CHÓT"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", alignItems: "center" }}>
                  <div className="stack" style={{ gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <StatusBadge status={project.status} />
                      {project.complexity ? (
                        <span className="badge badge--neutral" style={{ margin: 0 }}>
                          MỨC {LEVEL_COPY[project.complexity].label.toUpperCase()}
                        </span>
                      ) : null}
                      {project.status === "PUBLISHED" && count && count.open > 0 ? (
                        <span className="badge badge--progress" style={{ margin: 0 }}>
                          {count.open} ĐƠN ĐANG CHỜ
                        </span>
                      ) : null}
                      {missing > 0 ? (
                        <span className="badge badge--warning" style={{ margin: 0 }}>
                          CÒN {missing} MỤC CẦN BỔ SUNG
                        </span>
                      ) : null}
                    </div>

                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>{project.title}</h2>

                    <p className="text-muted" style={{ margin: 0, fontSize: "12px", fontFamily: "ui-monospace, monospace" }}>
                      {project.milestones.length} MỐC BÀN GIAO
                      {project.skills.length ? ` // ${project.skills.map((skill) => skill.name).join(" • ")}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "8px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block" }}>
                        NGÂN SÁCH DỰ ÁN:
                      </span>
                      <strong className="num" style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--color-text-heading)" }}>
                        {project.budget ? formatVnd(project.budget) : "Chưa nhập"}
                      </strong>
                    </div>
                    <Link
                      href={action.href}
                      className={action.primary ? "btn--tactile-brand" : "btn--tactile-zinc"}
                      style={{ height: "36px", fontSize: "11px", textDecoration: "none" }}
                    >
                      {action.label.toUpperCase()}
                    </Link>
                  </div>
                </div>

                {project.status === "DRAFT" && project.latestReturn ? (
                  <div style={{ marginTop: "var(--space-4)" }}>
                    <Alert variant="warning" title="Quản trị viên trả dự án về để chỉnh sửa">
                      {project.latestReturn.reason}
                      {project.latestReturn.suggestedComplexity
                        ? ` Mức độ đề xuất: ${LEVEL_COPY[project.latestReturn.suggestedComplexity].label}.`
                        : null}
                    </Alert>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
