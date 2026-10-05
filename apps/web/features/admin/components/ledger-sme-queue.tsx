"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { moderateSmeRegistration } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { DemoUser } from "../../demo-ledger/types";

const pendingSmes = (users: DemoUser[]) => users.filter((user) => user.role === "SME" && user.smeApprovalStatus === "PENDING");

/** Số hồ sơ doanh nghiệp đang chờ duyệt, hiển thị trên tab của trang quản trị. */
export function LedgerSmeQueueCount() {
  const ledger = useDemoLedger();
  return <>{pendingSmes(ledger.users).length}</>;
}

/**
 * Hàng đợi duyệt đăng ký doanh nghiệp: quản trị viên đối chiếu mã số thuế (hoặc website
 * khi doanh nghiệp chưa có mã số thuế) rồi duyệt hoặc từ chối. Từ chối bắt buộc có lý do
 * (ít nhất 10 ký tự) để doanh nghiệp biết cần bổ sung gì.
 */
export function LedgerSmeQueue() {
  const ledger = useDemoLedger();
  const { session } = useDemoSession();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (session?.role !== "ADMIN") return null;
  const pending = pendingSmes(ledger.users);

  const act = (sme: DemoUser, decision: "approve" | "reject") => {
    const result = moderateSmeRegistration(session.email, sme.id, decision, reasons[sme.id]);
    setError(result.ok ? null : result.message);
    setNotice(result.ok ? `${decision === "approve" ? "Đã duyệt" : "Đã từ chối"} doanh nghiệp ${sme.name}.` : null);
  };

  return (
    <section className="stack" style={{ marginBottom: "var(--space-8)" }}>
      <div className="industrial-ruler">ĐĂNG KÝ DOANH NGHIỆP CHỜ DUYỆT</div>
      {error ? <Alert variant="danger" live="assertive">{error}</Alert> : null}
      {notice ? <Alert variant="success" live="polite">{notice}</Alert> : null}
      {pending.length === 0 ? (
        <p className="text-muted" style={{ margin: 0 }}>Không có hồ sơ doanh nghiệp nào đang chờ duyệt.</p>
      ) : null}
      {pending.map((sme) => {
        const reason = reasons[sme.id] ?? "";
        return (
          <article className="module-bay module-bay--static stack stack--sm" key={sme.id} style={{ padding: "var(--space-5)" }}>
            <h2 style={{ margin: 0 }}>{sme.name}</h2>
            <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", fontFamily: "ui-monospace, monospace", fontSize: "13px" }}>
              <dt className="text-muted">EMAIL</dt>
              <dd style={{ margin: 0 }}>{sme.email}</dd>
              {sme.taxCode ? (
                <>
                  <dt className="text-muted">MÃ SỐ THUẾ</dt>
                  <dd style={{ margin: 0 }}>{sme.taxCode}</dd>
                </>
              ) : (
                <>
                  <dt className="text-muted">WEBSITE</dt>
                  <dd style={{ margin: 0 }}>
                    {sme.companyWebsite ? (
                      <a href={sme.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                        {sme.companyWebsite}
                      </a>
                    ) : (
                      "—"
                    )}{" "}
                    <span className="text-muted">(chưa có mã số thuế)</span>
                  </dd>
                </>
              )}
            </dl>
            <TextAreaField
              id={`sme-reason-${sme.id}`}
              label="Lý do từ chối"
              hint="Bắt buộc khi từ chối, ít nhất 10 ký tự."
              value={reason}
              onChange={(event) => setReasons((current) => ({ ...current, [sme.id]: event.target.value }))}
              rows={3}
            />
            <div className="cluster">
              <Button variant="outline" disabled={reason.trim().length < 10} onClick={() => act(sme, "reject")}>
                Từ chối
              </Button>
              <Button onClick={() => act(sme, "approve")}>Duyệt doanh nghiệp</Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
