"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { decideRegistration } from "../../demo-ledger/store";
import type { DemoOpportunity, DemoRegistration } from "../../demo-ledger/types";
import { slotsLeft } from "../model";

/**
 * Khu quản lý người đăng ký, chỉ đơn vị đăng tin thấy. Cộng tác viên: duyệt từng người đăng ký;
 * sự kiện: chỉ theo dõi số chỗ, vì đăng ký sự kiện là giữ chỗ ngay.
 */
export function RegistrationManager({ opportunity, registrations, ownerEmail }: { opportunity: DemoOpportunity; registrations: DemoRegistration[]; ownerEmail: string }) {
  const [error, setError] = useState<string | null>(null);
  const mine = registrations.filter((item) => item.opportunityId === opportunity.id);
  const pending = mine.filter((item) => item.status === "PENDING");
  const confirmed = mine.filter((item) => item.status === "CONFIRMED");
  const left = slotsLeft(opportunity, registrations);

  function decide(id: string, decision: "confirm" | "decline") {
    const result = decideRegistration(ownerEmail, id, decision);
    setError(result.ok ? null : result.message);
  }

  return (
    <section className="module-bay stack stack--sm" style={{ padding: "var(--space-5)" }} aria-labelledby="opp-manage-title">
      <div className="module-bay__header">
        <span id="opp-manage-title">NGƯỜI ĐĂNG KÝ // TIN CỦA BẠN</span>
        <span className="module-bay__id">{confirmed.length}/{opportunity.slots}</span>
      </div>
      <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
        Đã chốt {confirmed.length} người, còn {left} chỗ{opportunity.kind === "GIG" ? `, ${pending.length} người chờ bạn duyệt.` : "."}
      </p>
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {opportunity.kind === "GIG" ? (
        pending.length === 0 ? (
          <p className="text-caption" style={{ margin: 0 }}>Chưa có ai chờ duyệt.</p>
        ) : (
          <ul className="opp-people">
            {pending.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span className="cluster" style={{ gap: "var(--space-2)" }}>
                  <button type="button" className="btn--tactile-zinc" style={{ height: "32px", fontSize: "11px" }} onClick={() => decide(item.id, "decline")}>TỪ CHỐI</button>
                  <button type="button" className="btn--tactile-brand" style={{ height: "32px", fontSize: "11px" }} disabled={left === 0} onClick={() => decide(item.id, "confirm")}>NHẬN</button>
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {confirmed.length > 0 ? (
        <details className="opp-people-details">
          <summary>Danh sách đã chốt ({confirmed.length})</summary>
          <ul className="opp-people">
            {confirmed.map((item) => <li key={item.id}><span>{item.name}</span></li>)}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
