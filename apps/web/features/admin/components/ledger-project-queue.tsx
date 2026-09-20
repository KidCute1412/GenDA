"use client";

import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { moderateProject } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { formatVnd } from "../../../lib/utils/format";

export function LedgerProjectQueue() {
  const ledger = useDemoLedger();
  const { session, hydrated } = useDemoSession();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pending = ledger.projects.filter((project) => project.status === "PENDING_REVIEW" && project.createdAt !== "2026-09-01");
  if (!hydrated) return null;
  if (session?.role !== "ADMIN") return <Alert variant="warning" title="Chỉ quản trị viên được thao tác">Đăng nhập bằng tài khoản quản trị để duyệt dự án.</Alert>;
  if (pending.length === 0) return null;
  const act = (projectId: string, decision: "approve" | "reject") => { const result = moderateProject(session.email, projectId, decision, reason); setError(result.ok ? null : result.message); if (result.ok) setReason(""); };
  return <section className="stack" style={{ marginBottom: "var(--space-8)" }}>
    <div className="industrial-ruler">HÀNG ĐỢI TỪ LEDGER DEMO</div>
    {error ? <Alert variant="danger">{error}</Alert> : null}
    {pending.map((project) => <article className="module-bay stack stack--sm" key={project.id} style={{ padding: "var(--space-5)" }}>
      <div className="module-bay__header"><span className="module-bay__id">PROJECT // {project.id.toUpperCase()}</span><span>{formatVnd(project.budget)}</span></div>
      <h2>{project.title}</h2><p>{project.problem}</p>
      <TextAreaField id={`reject-${project.id}`} label="Lý do từ chối" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
      <div className="cluster"><Button variant="outline" disabled={reason.trim().length < 10} onClick={() => act(project.id, "reject")}>Từ chối</Button><Button onClick={() => act(project.id, "approve")}>Duyệt xuất bản</Button></div>
    </article>)}
  </section>;
}
