"use client";

import Link from "next/link";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatVnd } from "../../../lib/utils/format";

export function CreatedApplicationsPanel() {
  const ledger = useDemoLedger();
  const { session, hydrated } = useDemoSession();
  if (!hydrated || session?.role !== "STUDENT") return null;
  const student = ledger.users.find((user) => user.email === session.email);
  const mine = ledger.applications.filter((application) => application.studentId === student?.id);
  if (mine.length === 0) return null;
  return (
    <section className="stack" style={{ marginBottom: "var(--space-6)" }}>
      <div className="industrial-ruler">ĐƠN VỪA GỬI // LƯU 7 NGÀY</div>
      {mine.map((application) => (
        <article key={application.id} className="module-bay" style={{ padding: "var(--space-5)" }}>
          <div className="module-bay__header"><span className="module-bay__id">BID // {application.id.toUpperCase()}</span><span>{application.submittedAt}</span></div>
          {(() => { const project = ledger.projects.find((item) => item.id === application.projectId); return <><h2 style={{ margin: 0, fontSize: "1.1rem" }}>{project?.title}</h2><p className="text-muted">{project?.smeName} · <strong className="num">{formatVnd(project?.budget ?? 0)}</strong></p></>; })()}
          <div className="cluster"><StatusBadge status={application.status} />{application.status === "ACCEPTED" ? <Link href="/workspace/demo" className="btn--tactile-orange">Vào workspace</Link> : null}</div>
        </article>
      ))}
    </section>
  );
}
