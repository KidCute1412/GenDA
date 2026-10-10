"use client";

import Link from "next/link";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { OpportunityStatus } from "../../demo-ledger/types";
import { formatVnd } from "../../../lib/utils/format";
import { KIND_META, PAY_UNIT_LABEL, confirmedCount } from "../model";

const STATUS_TEXT: Record<OpportunityStatus, string> = { PENDING_REVIEW: "Chờ duyệt", PUBLISHED: "Đang mở", REJECTED: "Chưa được duyệt" };

/** Tin cộng tác viên / sự kiện của doanh nghiệp đang đăng nhập, kèm số người đã chốt và số người chờ duyệt. */
export function MyOpportunitiesPanel() {
  const ledger = useDemoLedger();
  const { session, hydrated } = useAuthSession();
  if (!hydrated || session?.role !== "SME") return null;
  const owner = ledger.users.find((user) => user.email === session.email);
  const mine = ledger.opportunities.filter((item) => item.ownerId === owner?.id);

  return (
    <section className="stack" style={{ marginBottom: "var(--space-8)" }} aria-labelledby="my-opportunities-title">
      <div className="cluster cluster--between">
        <h2 id="my-opportunities-title" className="industrial-ruler" style={{ margin: 0 }}>TIN CỘNG TÁC VIÊN & SỰ KIỆN · {mine.length}</h2>
        <Link href="/sme/opportunities/new" className="btn--tactile-zinc" style={{ height: "36px", fontSize: "11px", textDecoration: "none" }}>
          + ĐĂNG TIN CỘNG TÁC VIÊN / SỰ KIỆN
        </Link>
      </div>
      {mine.length === 0 ? (
        <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
          Cần nhiều người cho một buổi (khán giả, người dùng thử, cộng tác viên sự kiện)? Đăng tin ngắn, thù lao từ 50.000đ.
        </p>
      ) : (
        <ul className="opp-people" style={{ marginTop: 0 }}>
          {mine.map((item) => {
            const pending = ledger.registrations.filter((reg) => reg.opportunityId === item.id && reg.status === "PENDING").length;
            return (
              <li key={item.id}>
                <span className="stack" style={{ gap: "2px", minWidth: 0 }}>
                  <span className="opp-row__tagline">
                    <span className={`opp-kind opp-kind--${item.kind.toLowerCase()}`}>{KIND_META[item.kind].tag}</span>
                    <span>{STATUS_TEXT[item.status].toUpperCase()}</span>
                  </span>
                  <Link href={`/opportunities/${item.id}`} style={{ fontWeight: 700 }}>{item.title}</Link>
                  <span className="text-caption num">
                    {formatVnd(item.pay)}{PAY_UNIT_LABEL[item.payUnit]} · đã chốt {confirmedCount(ledger.registrations, item.id)}/{item.slots}
                    {pending > 0 ? ` · ${pending} người chờ bạn duyệt` : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
