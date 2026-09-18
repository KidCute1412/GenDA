import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../../components/layout/site-header";
import { SiteFooter } from "../../../components/layout/site-footer";
import { Button } from "../../../components/ui/button";
import { StatusBadge } from "../../../components/ui/status-badge";
import { EmptyState } from "../../../components/ui/feedback";
import { AUDIT_LOG, PENDING_VERIFICATIONS, PROJECTS } from "../../../mocks/data";
import { formatDate, formatVnd } from "../../../lib/utils/format";

export const metadata: Metadata = {
  title: "Bảng điều khiển quản trị",
  description: "Duyệt dự án, duyệt minh chứng sinh viên và tra cứu nhật ký kiểm toán."
};

/**
 * Màn hình 8 — Bảng Điều khiển Quản trị viên (docs/design.md 7.8).
 *
 * Ba hàng đợi gộp vào MỘT trang có tab, không tách thành ba route (Quyết định
 * thiết kế DD-02): quản trị viên làm việc theo phiên xử lý hàng đợi và chuyển
 * qua lại liên tục giữa ba khu vực, gộp tab giúp giữ ngữ cảnh và giảm số lần
 * tải trang.
 *
 * Đây là màn hình có MẬT ĐỘ CAO NHẤT của hệ thống: người dùng là đội vận hành
 * làm việc lặp lại hằng ngày, họ cần nhìn thấy nhiều dòng cùng lúc hơn là nhiều
 * khoảng trắng. Nhật ký kiểm toán vì thế dùng bảng dữ liệu thật với chữ số bảng
 * để các cột thẳng hàng, không bọc từng dòng thành thẻ (design.md 4.9).
 */
const TABS = [
  { key: "projects", label: "Duyệt dự án" },
  { key: "students", label: "Duyệt thẻ sinh viên" },
  { key: "audit", label: "Nhật ký kiểm toán" }
];

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.find((item) => item.key === tab)?.key ?? "projects";

  const pendingProjects = PROJECTS.filter((project) => project.status === "PENDING_REVIEW");

  const counts: Record<string, number> = {
    projects: pendingProjects.length,
    students: PENDING_VERIFICATIONS.length,
    audit: AUDIT_LOG.length
  };

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="container">
        <div className="section--tight">
          <h1>Bảng điều khiển quản trị</h1>
          <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
            Cam kết vận hành: duyệt xong mỗi dự án mới trong vòng 4 giờ làm việc.
          </p>
        </div>

        <nav className="tabs" aria-label="Khu vực làm việc">
          {TABS.map((item) => (
            <Link
              key={item.key}
              href={item.key === "projects" ? "/admin" : `/admin?tab=${item.key}`}
              className="tab"
              aria-current={item.key === active ? "page" : undefined}
            >
              {item.label}
              <span className="text-caption num">{counts[item.key]}</span>
            </Link>
          ))}
        </nav>

        <div style={{ paddingBottom: "var(--space-section)" }}>
          {/* --- Hàng đợi duyệt dự án (FR-PRJ-03, FR-PRJ-04) --- */}
          {active === "projects" ? (
            pendingProjects.length === 0 ? (
              <EmptyState
                title="Hàng đợi trống"
                advice="Không còn dự án nào chờ duyệt. Dự án mới gửi lên sẽ xuất hiện ở đây kèm thời điểm gửi."
              />
            ) : (
              <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {pendingProjects.map((project) => {
                  const total = project.milestones.reduce((sum, m) => sum + m.budget, 0);
                  const balanced = total === project.budget;

                  return (
                    <li key={project.id} className="card stack">
                      <div className="cluster cluster--between">
                        <div>
                          <p className="text-caption">
                            {project.smeName}, {project.smeIndustry}, {project.smeSize}
                          </p>
                          <h2 style={{ fontSize: "var(--text-h4-size)" }}>{project.title}</h2>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      <p style={{ margin: 0, maxWidth: "70ch" }}>{project.problem}</p>

                      <div>
                        <p className="text-caption">Tiêu chí nghiệm thu do doanh nghiệp khai</p>
                        <ul style={{ marginTop: "var(--space-2)", paddingLeft: "var(--space-5)" }}>
                          {project.acceptance.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Kiểm tra bất biến FR-MIL-02 hiển thị sẵn cho quản trị
                          viên, để họ không phải tự cộng tay từng mốc. */}
                      <div
                        className="stack stack--sm"
                        style={{
                          padding: "var(--space-4)",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "var(--color-surface-subtle)"
                        }}
                      >
                        {project.milestones.map((milestone) => (
                          <p key={milestone.id} className="cluster cluster--between num" style={{ margin: 0 }}>
                            <span className="text-muted">
                              Mốc {milestone.order}: {milestone.title}, hạn{" "}
                              {formatDate(milestone.deadline)}
                            </span>
                            <span>{formatVnd(milestone.budget)}</span>
                          </p>
                        ))}
                        <hr className="rule" />
                        <p
                          className="cluster cluster--between num"
                          style={{ margin: 0, fontWeight: "var(--weight-semibold)" }}
                        >
                          <span>Tổng các mốc so với ngân sách dự án</span>
                          <span
                            style={{
                              color: balanced
                                ? "var(--color-status-verified-text)"
                                : "var(--color-status-danger-text)"
                            }}
                          >
                            {formatVnd(total)} / {formatVnd(project.budget)}
                            {balanced ? " (khớp)" : " (lệch)"}
                          </span>
                        </p>
                      </div>

                      <div className="card__footer cluster cluster--end">
                        <Button variant="danger">Từ chối kèm lý do</Button>
                        <Button>Duyệt xuất bản</Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : null}

          {/* --- Hàng đợi duyệt thẻ sinh viên (FR-USR-03) --- */}
          {active === "students" ? (
            <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {PENDING_VERIFICATIONS.map((item) => (
                <li key={item.id} className="card cluster cluster--between">
                  <div>
                    <h2 style={{ fontSize: "var(--text-h4-size)" }}>{item.name}</h2>
                    <p className="text-muted" style={{ marginTop: "var(--space-1)" }}>
                      {item.school}
                    </p>
                    <p className="cluster" style={{ marginTop: "var(--space-2)" }}>
                      <span className="badge badge--neutral">{item.method}</span>
                      <span className="text-caption num">Gửi ngày {formatDate(item.submittedAt)}</span>
                    </p>
                  </div>

                  <div className="cluster">
                    <Button variant="outline" size="sm">
                      Xem minh chứng
                    </Button>
                    <Button variant="danger" size="sm">
                      Từ chối kèm lý do
                    </Button>
                    <Button size="sm">Xác thực</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {/* --- Nhật ký kiểm toán (FR-ADM-02, FR-ADM-03) --- */}
          {active === "audit" ? (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="table-scroll">
                <table className="data-table">
                  <caption className="visually-hidden">
                    Nhật ký mọi biến động trạng thái trên hệ thống, mới nhất xếp trước
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Thời điểm</th>
                      <th scope="col">Tác nhân</th>
                      <th scope="col">Vai trò</th>
                      <th scope="col">Hành động</th>
                      <th scope="col">Đối tượng</th>
                      <th scope="col">Lý do ghi nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AUDIT_LOG.map((entry) => (
                      <tr key={entry.id}>
                        <td className="num">{entry.at}</td>
                        <td>{entry.actor}</td>
                        <td>
                          <span className="text-caption">{entry.role}</span>
                        </td>
                        <td>{entry.action}</td>
                        <td>{entry.target}</td>
                        <td style={{ whiteSpace: "normal", maxWidth: "28ch" }}>{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
