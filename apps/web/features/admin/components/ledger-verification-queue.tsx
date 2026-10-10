"use client";
import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { moderateStudentVerification } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
export function LedgerVerificationQueue() { const ledger = useDemoLedger(); const { session } = useDemoSession(); const [reason, setReason] = useState(""); const [error, setError] = useState<string | null>(null); const pending = ledger.users.filter((user) => user.verificationStatus === "PENDING"); if (!pending.length || session?.role !== "ADMIN") return null; const act = (id: string, decision: "approve" | "reject") => { const result = moderateStudentVerification(session.email, id, decision, reason); setError(result.ok ? null : result.message); }; return <section className="stack" style={{ marginBottom: "var(--space-8)" }}><div className="industrial-ruler">MINH CHỨNG TỪ LEDGER DEMO</div>{error ? <Alert variant="danger">{error}</Alert> : null}{pending.map((student) => <article className="module-bay stack stack--sm" key={student.id} style={{ padding: "var(--space-5)" }}><h2>{student.name}</h2><p>{student.email}</p><TextAreaField id={`verify-reason-${student.id}`} label="Lý do từ chối" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} /><div className="cluster"><Button variant="outline" disabled={reason.trim().length < 10} onClick={() => act(student.id, "reject")}>Từ chối</Button><Button onClick={() => act(student.id, "approve")}>Xác thực</Button></div></article>)}</section>; }
