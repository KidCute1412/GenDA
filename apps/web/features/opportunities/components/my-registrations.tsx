"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { formatVnd } from "../../../lib/utils/format";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { cancelRegistration } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { RegistrationStatus } from "../../demo-ledger/types";
import { KIND_META, PAY_UNIT_LABEL, formatSession, isOver, nextSession, sortedSessions } from "../model";
import { useToday } from "../hooks/use-today";

/** Cùng bảng màu nhóm trạng thái với thẻ đơn ứng tuyển (app-status--*). */
const STATUS: Record<RegistrationStatus, { label: string; group: string }> = {
  CONFIRMED: { label: "Đã giữ chỗ", group: "accepted" },
  PENDING: { label: "Chờ đơn vị duyệt", group: "pending" },
  DECLINED: { label: "Không được chọn", group: "rejected" },
  CANCELLED: { label: "Đã hủy", group: "withdrawn" }
};

/**
 * Lịch cộng tác viên / sự kiện đã đăng ký, đặt dưới danh sách đơn ứng tuyển ở "Đơn của tôi". Xếp theo
 * buổi sắp tới; tin đã qua hết buổi xuống cuối.
 */
export function MyRegistrations() {
  const ledger = useDemoLedger();
  const today = useToday();
  const { session } = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  if (!today) return null;
  const user = ledger.users.find((item) => item.email === session?.email);
  const rows = ledger.registrations
    .filter((item) => item.userId === user?.id)
    .map((registration) => ({ registration, opportunity: ledger.opportunities.find((item) => item.id === registration.opportunityId) }))
    .filter((row): row is { registration: typeof row.registration; opportunity: NonNullable<typeof row.opportunity> } => Boolean(row.opportunity))
    .sort((a, b) => {
      const left = nextSession(a.opportunity, today) ?? { date: "9999", start: "" };
      const right = nextSession(b.opportunity, today) ?? { date: "9999", start: "" };
      return `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`);
    });

  return (
    <section id="registrations" className="stack" style={{ marginTop: "var(--space-10)", gap: "var(--space-3)" }} aria-labelledby="my-registrations-title">
      <h2 id="my-registrations-title" style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>
        Lịch cộng tác viên & sự kiện
      </h2>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {rows.length === 0 ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Bạn chưa đăng ký tin nào. <Link href="/projects?type=event">Xem sự kiện & workshop đang mở</Link>: đăng ký không cần CV, thù lao từ 50.000đ.
        </p>
      ) : (
        rows.map(({ registration, opportunity }) => {
          const status = STATUS[registration.status];
          const next = nextSession(opportunity, today) ?? sortedSessions(opportunity).at(-1)!;
          const active = registration.status === "PENDING" || registration.status === "CONFIRMED";
          return (
            <article key={registration.id} className={`app-card app-card--${status.group}`}>
              <div className="stack" style={{ gap: "6px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span className={`app-status app-status--${status.group}`}>{status.label}</span>
                  <span className="text-caption" style={{ fontFamily: "ui-monospace, monospace" }}>{KIND_META[opportunity.kind].tag}</span>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                  <Link href={`/opportunities/${opportunity.id}`} style={{ color: "inherit", textDecoration: "none" }}>{opportunity.title}</Link>
                </h3>
                <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
                  {opportunity.orgName} · <strong className="num" style={{ color: "var(--color-text-heading)" }}>{formatVnd(opportunity.pay)}{PAY_UNIT_LABEL[opportunity.payUnit]}</strong>
                </p>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  <span className="num">{formatSession(next)}</span> · {opportunity.location}
                  {isOver(opportunity, today) ? " · đã diễn ra" : ""}
                </p>
              </div>
              <div className="app-card__actions">
                {active && !isOver(opportunity, today) ? (
                  <button type="button" className="btn--tactile-zinc" style={{ height: "34px", fontSize: "11px" }}
                    onClick={() => {
                      if (!session || !window.confirm("Hủy đăng ký này? Chỗ của bạn sẽ được nhường cho người khác.")) return;
                      const result = cancelRegistration(session.email, registration.id);
                      setError(result.ok ? null : result.message);
                    }}>
                    HỦY ĐĂNG KÝ
                  </button>
                ) : null}
                <Link href={`/opportunities/${opportunity.id}`} className="btn--tactile-zinc" style={{ height: "34px", fontSize: "11px" }}>XEM TIN</Link>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
