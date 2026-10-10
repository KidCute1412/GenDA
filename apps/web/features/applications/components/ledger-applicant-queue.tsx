"use client";
import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { StatusBadge } from "../../../components/ui/status-badge";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { setApplicationStatus } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import Link from "next/link";
import { ViewCvButton } from "../../users/components/cv-uploader";

export function LedgerApplicantQueue() {
  const ledger = useDemoLedger(); const { session, hydrated } = useDemoSession(); const [error, setError] = useState<string | null>(null);
  if (!hydrated || session?.role !== "SME") return null;
  const owner = ledger.users.find((user) => user.email === session.email);
  const rows = ledger.applications.map((application) => ({ application, project: ledger.projects.find((project) => project.id === application.projectId), student: ledger.users.find((user) => user.id === application.studentId) })).filter((row) => row.project?.ownerId === owner?.id && row.application.submittedAt !== "2026-08-28" && row.application.submittedAt !== "2026-09-15" && row.application.submittedAt !== "2026-09-08");
  if (!rows.length) return null;
  const act = (id: string, status: "SHORTLISTED" | "ACCEPTED") => { const result = setApplicationStatus(session.email, id, status); setError(result.ok ? null : result.message); };
  return <section className="stack" style={{ marginBottom: "var(--space-8)" }}><div className="industrial-ruler">ĐƠN ỨNG TUYỂN TỪ LEDGER DEMO</div>{error ? <Alert variant="danger">{error}</Alert> : null}{rows.map(({ application, project, student }) => <article key={application.id} className="module-bay stack stack--sm" style={{ padding: "var(--space-5)" }}><div className="module-bay__header"><span>{student?.name}</span><StatusBadge status={application.status} /></div><h2>{project?.title}</h2><p>{application.coverLetter}</p>{application.cv ? <div><ViewCvButton userId={application.studentId} cv={application.cv} /></div> : <p className="text-caption">Đơn này chưa đính kèm CV.</p>}{["SUBMITTED", "SHORTLISTED"].includes(application.status) ? <div className="cluster"><Button variant="outline" onClick={() => act(application.id, "SHORTLISTED")}>Rút gọn</Button><Button onClick={() => act(application.id, "ACCEPTED")}>Chấp nhận</Button></div> : null}{application.status === "ACCEPTED" ? <Link href="/workspace/demo" className="btn--tactile-brand">Vào workspace</Link> : null}</article>)}</section>;
}
