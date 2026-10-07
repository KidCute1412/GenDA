"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { EmptyState } from "../../../components/ui/feedback";
import { TextAreaField } from "../../../components/ui/field";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { moderateOpportunity } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { formatVnd } from "../../../lib/utils/format";
import { KIND_META, PAY_UNIT_LABEL, formatSession, sortedSessions } from "../../opportunities/model";

/** Số tin cộng tác viên / sự kiện chờ duyệt, cho nhãn tab quản trị. */
export function LedgerOpportunityQueueCount() {
  const ledger = useDemoLedger();
  return <>{ledger.opportunities.filter((item) => item.status === "PENDING_REVIEW").length}</>;
}

/**
 * Hàng đợi duyệt tin cộng tác viên / sự kiện (FR-OPP-04). Ngoài nội dung, quản trị viên soát dấu hiệu
 * lừa đảo kiểu "tuyển cộng tác viên": đòi đặt cọc, mua hàng, thù lao cao bất thường so với việc.
 */
export function LedgerOpportunityQueue() {
  const ledger = useDemoLedger();
  const { session, hydrated } = useDemoSession();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  if (!hydrated) return null;
  if (session?.role !== "ADMIN") return <Alert variant="warning" title="Chỉ quản trị viên được thao tác">Đăng nhập bằng tài khoản quản trị để duyệt tin.</Alert>;
  const pending = ledger.opportunities.filter((item) => item.status === "PENDING_REVIEW");

  function act(id: string, decision: "approve" | "reject") {
    const result = moderateOpportunity(session!.email, id, decision, reasons[id]);
    setError(result.ok ? null : result.message);
  }

  if (pending.length === 0) {
    return <EmptyState title="Không có tin nào chờ duyệt" advice="Tin cộng tác viên và sự kiện mới từ doanh nghiệp sẽ hiện ở đây." />;
  }

  return (
    <section className="stack">
      <Alert variant="info" title="Soát lừa đảo trước khi duyệt">
        Từ chối nếu tin đòi người tham gia đặt cọc, mua sản phẩm, nộp phí giữ chỗ, hoặc thù lao cao bất thường so với công việc mô tả.
      </Alert>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {pending.map((item) => (
        <article key={item.id} className="module-bay stack stack--sm" style={{ padding: "var(--space-5)" }}>
          <div className="module-bay__header">
            <span className="module-bay__id">{KIND_META[item.kind].tag} // {item.orgName.toUpperCase()}</span>
            <span className="num">{formatVnd(item.pay)}{PAY_UNIT_LABEL[item.payUnit]} · {item.slots} chỗ</span>
          </div>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{item.title}</h2>
          <p style={{ margin: 0 }}>{item.details}</p>
          <p className="text-caption num" style={{ margin: 0 }}>
            {sortedSessions(item).map(formatSession).join(" | ")} · {item.mode === "ONLINE" ? "Trực tuyến" : "Tại chỗ"}: {item.location}
          </p>
          <TextAreaField id={`reject-opp-${item.id}`} label="Lý do từ chối" rows={2} value={reasons[item.id] ?? ""}
            onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} />
          <div className="cluster">
            <Button variant="outline" disabled={(reasons[item.id] ?? "").trim().length < 10} onClick={() => act(item.id, "reject")}>Từ chối</Button>
            <Button onClick={() => act(item.id, "approve")}>Duyệt đăng tin</Button>
          </div>
        </article>
      ))}
    </section>
  );
}
