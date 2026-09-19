"use client";

import Link from "next/link";
import { useDemoPersistedState } from "../../../lib/hooks/use-demo-persisted-state";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatVnd } from "../../../lib/utils/format";

export type CreatedApplication = { id: string; projectId: string; projectTitle: string; smeName: string; budget: number; submittedAt: string; ownerEmail: string; status: "SUBMITTED" };

export function CreatedApplicationsPanel() {
  const [applications] = useDemoPersistedState<CreatedApplication[]>("applications:created", []);
  const { session, hydrated } = useDemoSession();
  if (!hydrated || session?.role !== "STUDENT") return null;
  const mine = applications.filter((application) => application.ownerEmail === session?.email);
  if (mine.length === 0) return null;
  return (
    <section className="stack" style={{ marginBottom: "var(--space-6)" }}>
      <div className="industrial-ruler">ĐƠN VỪA GỬI // LƯU 7 NGÀY</div>
      {mine.map((application) => (
        <article key={application.id} className="module-bay" style={{ padding: "var(--space-5)" }}>
          <div className="module-bay__header"><span className="module-bay__id">BID // {application.id.toUpperCase()}</span><span>{application.submittedAt}</span></div>
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{application.projectTitle}</h2>
          <p className="text-muted">{application.smeName} · <strong className="num">{formatVnd(application.budget)}</strong></p>
          <div className="cluster"><StatusBadge status={application.status} /><Link href={`/projects/${application.projectId}`} className="btn--tactile-zinc">Xem đề bài</Link></div>
        </article>
      ))}
    </section>
  );
}
