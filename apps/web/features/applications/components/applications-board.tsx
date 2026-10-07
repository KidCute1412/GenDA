"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatDate, formatVnd } from "../../../lib/utils/format";
import { WithdrawApplicationButton } from "./withdraw-application-button";
import {
  APPLICATION_GROUPS,
  groupOf,
  useMyApplications,
  type ApplicationGroupKey,
  type ApplicationStatus
} from "../hooks/use-my-applications";

/**
 * Bảng "Đơn của tôi": trả lời ngay câu hỏi "đơn nào đang chờ, đơn nào được nhận, đơn
 * nào không được nhận" bằng một hàng tab có số đếm. Tab đang chọn ghi vào URL
 * (?status=pending...) để tải lại hay chia sẻ link vẫn giữ đúng tab.
 *
 * Mỗi đơn đi kèm MỘT dòng nói rõ điều gì đang xảy ra và bạn cần làm gì tiếp, vì nhãn
 * trạng thái một mình không trả lời được "vậy giờ tôi chờ hay làm gì nữa?".
 */
const NEXT_STEP: Record<ApplicationStatus, string> = {
  SUBMITTED: "Doanh nghiệp đang xem. Bạn rút đơn được cho tới khi họ chọn người.",
  SHORTLISTED: "Bạn đã vào danh sách rút gọn. Doanh nghiệp có thể liên hệ để hỏi thêm.",
  ACCEPTED: "Bạn đã được chọn. Vào không gian làm việc để xem mốc bàn giao đầu tiên.",
  REJECTED: "Lần này doanh nghiệp chọn bạn khác. Đơn này đã khép lại.",
  WITHDRAWN: "Bạn đã rút đơn này."
};

/** Nhãn trạng thái theo ngữ cảnh đơn ứng tuyển (nhãn mặc định của badge dành cho mốc). */
const STATUS_LABEL: Partial<Record<ApplicationStatus, string>> = {
  SUBMITTED: "Đang chờ duyệt",
  SHORTLISTED: "Vào danh sách rút gọn",
  ACCEPTED: "Được nhận",
  REJECTED: "Không được nhận"
};

type TabKey = "all" | ApplicationGroupKey;

export function ApplicationsBoard() {
  const { hydrated, items } = useMyApplications();
  const [tab, setTab] = useState<TabKey>("all");

  // Đọc tab từ URL sau khi gắn vào trang (trang được dựng tĩnh nên không đọc lúc render)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("status");
    if (fromUrl && APPLICATION_GROUPS.some((group) => group.key === fromUrl)) setTab(fromUrl as TabKey);
  }, []);

  function selectTab(next: TabKey) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", next);
    window.history.replaceState(null, "", url);
  }

  if (!hydrated) {
    return <p className="text-muted">Đang tải đơn ứng tuyển…</p>;
  }

  const counts = Object.fromEntries(
    APPLICATION_GROUPS.map((group) => [group.key, items.filter((item) => groupOf(item.status) === group.key).length])
  ) as Record<ApplicationGroupKey, number>;
  const visible = tab === "all" ? items : items.filter((item) => groupOf(item.status) === tab);
  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "all", label: "Tất cả", count: items.length },
    ...APPLICATION_GROUPS.map((group) => ({ key: group.key, label: group.label, count: counts[group.key] }))
  ];

  if (items.length === 0) {
    return (
      <div className="module-bay" style={{ padding: "var(--space-10)", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Bạn chưa nộp đơn nào</h2>
        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
          Tìm một dự án hợp kỹ năng của bạn, ngân sách 1–5 triệu, có mốc bàn giao rõ ràng.
        </p>
        <Link href="/projects" className="btn--tactile-orange" style={{ height: "42px", fontSize: "12px" }}>
          Tìm dự án đang tuyển
        </Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: "var(--space-5)" }}>
      <div className="app-tabs" role="tablist" aria-label="Lọc đơn theo trạng thái">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`app-tab app-tab--${item.key}`}
            onClick={() => selectTab(item.key)}
          >
            <span>{item.label}</span>
            <span className="app-tab__count" aria-label={`${item.count} đơn`}>{item.count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted" role="status" style={{ margin: 0 }}>
          Không có đơn nào ở mục này.
        </p>
      ) : (
        <div className="stack" role="tabpanel" style={{ gap: "var(--space-3)" }}>
          {visible.map((application) => {
            const group = groupOf(application.status);
            return (
              <article key={application.id} className={`app-card app-card--${group}`}>
                <div className="stack" style={{ gap: "6px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <StatusBadge status={application.status} label={STATUS_LABEL[application.status]} />
                    <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Nộp ngày {formatDate(application.submittedAt.slice(0, 10))}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>
                    <Link href={`/projects/${application.projectId}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {application.projectTitle}
                    </Link>
                  </h2>
                  <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
                    {application.smeName} · <strong className="num" style={{ color: "var(--color-text-heading)" }}>{formatVnd(application.budget)}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-body)" }}>{NEXT_STEP[application.status]}</p>
                </div>

                <div className="app-card__actions">
                  {application.status === "ACCEPTED" ? (
                    <Link href={`/workspace/${application.projectId}`} className="btn--tactile-orange" style={{ height: "36px", fontSize: "11px" }}>
                      Vào workspace
                    </Link>
                  ) : null}
                  {application.status === "SUBMITTED" || application.status === "SHORTLISTED" ? (
                    <WithdrawApplicationButton applicationId={application.id} />
                  ) : null}
                  <Link href={`/projects/${application.projectId}`} className="btn--tactile-zinc" style={{ height: "34px", fontSize: "11px" }}>
                    Xem đề bài
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
