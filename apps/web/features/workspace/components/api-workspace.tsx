"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { TextAreaField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/feedback";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Stepper } from "../../../components/ui/stepper";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { ApiRequestError } from "../../auth/services/session-request";
import { getWorkspace, decideHandoff, markFunding, downloadAttachment, type Workspace } from "../../milestones/services/milestones-api";
import { HandoffEditor } from "../../milestones/components/handoff-editor";
import { AiReviewPanel } from "../../milestones/components/ai-review-panel";
import { formatDate, formatVnd } from "../../../lib/utils/format";

export function ApiWorkspace({ projectId }: { projectId: string }) {
  const { session, hydrated } = useAuthSession();
  if (!hydrated) return <Skeleton height="20rem" />;
  if (!session) return <EmptyState title="Đăng nhập để vào workspace" advice="Workspace chỉ dành cho SME sở hữu dự án và contributor được phân công." action={<Link className="btn btn--outline" href="/login">Đăng nhập</Link>} />;
  return <WorkspaceContent key={`${projectId}:${session.id}`} projectId={projectId} />;
}

function WorkspaceContent({ projectId }: { projectId: string }) {
  const { session, hydrated } = useAuthSession();
  const [data, setData] = useState<Workspace | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => {
    try { setData(await getWorkspace(projectId)); setError(null); }
    catch (e) {
      if (e instanceof ApiRequestError && [401, 403, 404].includes(e.status)) setData(null);
      setError(e instanceof ApiRequestError ? e : new ApiRequestError("LOAD_FAILED", "Chưa tải được workspace.", 0));
    }
  }, [projectId]);
  useEffect(() => {
    if (!hydrated || !session) return;
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    void load();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [hydrated, session, load]);
  const active = data?.milestones.find(m => m.id === selected) ?? data?.milestones.find(m => m.status !== "ACCEPTED") ?? data?.milestones.at(-1);
  const handoffs = data?.submissions.filter(h => h.milestoneId === active?.id).slice().reverse() ?? [];
  const latest = handoffs[0];
  async function act(action: () => Promise<unknown>, message: string) {
    setBusy(true); setError(null);
    try { await action(); setSuccess(message); await load(); }
    catch (e) { setError(e instanceof ApiRequestError ? e : new ApiRequestError("ACTION_FAILED", "Chưa thực hiện được thao tác.", 0)); }
    finally { setBusy(false); }
  }
  async function accept() {
    if (!active || !latest) return;
    await act(() => decideHandoff(active.id, latest.id, { decision: "ACCEPTED" }), "Đã nghiệm thu milestone.");
    dialogRef.current?.close();
  }
  if (!hydrated) return <Skeleton height="20rem" />;
  if (!session) return <EmptyState title="Đăng nhập để vào workspace" advice="Workspace chỉ dành cho SME sở hữu dự án và contributor được phân công." action={<Link className="btn btn--outline" href="/login">Đăng nhập</Link>} />;
  if (!data) return error ? <ErrorState detail={error.message} requestId={error.requestId} action={<Button variant="outline" onClick={() => void load()}>Thử tải lại</Button>} /> : <div className="stack"><Skeleton height="5rem" /><Skeleton height="20rem" /></div>;
  return <div className="stack stack--lg">
    <header className="cluster cluster--between"><div><p className="text-caption">{data.smeName}</p><h1>{data.title}</h1></div><StatusBadge status={data.status} /></header>
    {success ? <Alert variant="success" live="polite">{success}</Alert> : null}
    {data.status === "COMPLETED" ? <Alert variant="success" title="Dự án đã hoàn tất">Tất cả milestone đã được SME nghiệm thu. Lịch sử bàn giao và kết quả AI được giữ lại.</Alert> : null}
    {error ? <ErrorState detail={error.message} requestId={error.requestId} action={<Button variant="outline" onClick={() => void load()}>Thử tải lại</Button>} /> : null}
    {!active ? <EmptyState title="Chưa có milestone" advice="Dự án chưa có kế hoạch thực thi. Liên hệ SME để kiểm tra kế hoạch." /> : <div className="layout-aside">
      <div className="stack stack--lg">
        <section className="card stack"><h2>Tiến độ milestone</h2>
          <Stepper ariaLabel="Tiến độ milestone" steps={data.milestones.map(m => ({ label: `Mốc ${m.order}: ${m.title}`, state: m.status === "ACCEPTED" ? "completed" : m.id === active.id ? "current" : "upcoming" }))} />
          <div className="cluster">{data.milestones.map(m => <Button key={m.id} variant={m.id === active.id ? "secondary" : "ghost"} size="sm" aria-pressed={m.id === active.id} onClick={() => { setSelected(m.id); setReason(""); }}>Mốc {m.order}: {m.title}</Button>)}</div>
        </section>
        <section className="card stack"><div className="cluster cluster--between"><h2>Mốc {active.order}: {active.title}</h2><StatusBadge status={active.status} label={active.status === "PENDING" ? "Chờ mốc trước hoàn tất" : undefined} /></div>
          <p className="num">{formatVnd(active.budget)} · Hạn {formatDate(active.deadline)}</p>
          <h3>Tiêu chí đã chốt</h3>
          {active.criteria.length ? <ol>{active.criteria.map(c => <li key={c.id}>{c.text}</li>)}</ol> : <p>Chưa có tiêu chí cụ thể. AI không thể đánh giá milestone này.</p>}
        </section>
        {data.viewerRole === "CONTRIBUTOR" && ["IN_PROGRESS", "CHANGES_REQUESTED"].includes(active.status) ? <HandoffEditor key={`${active.id}:${active.revision}`} milestone={active} storageAvailable={data.storageAvailable} reload={load} /> : null}
        {data.viewerRole === "SME" && active.status === "SUBMITTED" && latest ? <section className="card stack" aria-label="Quyết định nghiệm thu"><h3>Review bản {latest.revision}</h3>
          <TextAreaField id="changes-reason" label="Lý do yêu cầu sửa" hint="Bắt buộc khi yêu cầu chỉnh sửa." maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          <div className="cluster"><Button loading={busy} onClick={() => dialogRef.current?.showModal()}>Nghiệm thu mốc này</Button><Button variant="outline" disabled={busy || !reason.trim()} onClick={() => void act(() => decideHandoff(active.id, latest.id, { decision: "CHANGES_REQUESTED", reason }), "Đã gửi yêu cầu chỉnh sửa.")}>Yêu cầu chỉnh sửa</Button></div>
          {!reason.trim() ? <p className="text-caption">Nhập lý do để gửi yêu cầu chỉnh sửa.</p> : null}
        </section> : null}
        <section className="stack" aria-label="Lịch sử bàn giao"><h2>Lịch sử bàn giao</h2>
          {!handoffs.length ? <EmptyState title="Chưa có bản bàn giao" advice="Contributor nộp ghi chú, liên kết hoặc tệp khi milestone bắt đầu." /> : handoffs.map(h => <article key={h.id} className="card stack" aria-label={`Bản bàn giao ${h.revision}`}>
            <div className="cluster cluster--between"><h3>Bản {h.revision}</h3><time className="text-caption" dateTime={h.submittedAt}>{new Date(h.submittedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time></div>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{h.note}</p>
            {h.links.map(link => <a key={link} href={link} target="_blank" rel="noreferrer" style={{ overflowWrap: "anywhere" }}>{link}</a>)}
            {h.attachments.map(file => <Button key={file.id} variant="outline" size="sm" onClick={() => void act(() => downloadAttachment(file), "Đã tải tệp bàn giao.")}>Tải {file.name}</Button>)}
            {h.decision ? <div className="stack stack--sm"><StatusBadge status={h.decision} />{h.reason ? <p>Lý do của SME: {h.reason}</p> : null}</div> : null}
            <AiReviewPanel milestone={active} handoff={h} current={h.revision === active.revision} available={data.aiAvailable} reload={load} />
          </article>)}
        </section>
      </div>
      <aside className="stack"><section className="card stack"><h2>Quỹ mô phỏng</h2><StatusBadge status={active.funding} /><p className="text-muted">Đây là ghi nhận mô phỏng. GenDA không giữ hoặc chuyển tiền; thanh toán diễn ra ngoài nền tảng.</p>
        {data.viewerRole === "SME" && active.funding === "PENDING_FUNDING" ? <Button variant="outline" loading={busy} onClick={() => void act(() => markFunding(active.id, { target: "FUNDED" }), "Đã ghi nhận quỹ mô phỏng.")}>Ghi nhận đã cấp quỹ</Button> : null}
        {data.viewerRole === "SME" && active.funding === "FUNDED" ? <><Button variant="outline" loading={busy} disabled={active.status !== "ACCEPTED"} onClick={() => void act(() => markFunding(active.id, { target: "RELEASED" }), "Đã ghi nhận giải ngân mô phỏng.")}>Ghi nhận đã giải ngân</Button>{active.status !== "ACCEPTED" ? <p className="text-caption">Chỉ ghi nhận giải ngân sau khi nghiệm thu mốc.</p> : null}</> : null}
      </section></aside>
    </div>}
    <dialog ref={dialogRef} aria-labelledby="accept-title" className="card"><div className="stack"><h2 id="accept-title">Nghiệm thu bản bàn giao này?</h2><p>Quyết định sẽ được lưu cùng người thực hiện và thời điểm. Milestone sau sẽ được mở, hoặc dự án sẽ hoàn tất nếu đây là mốc cuối.</p><div className="cluster"><Button variant="outline" disabled={busy} onClick={() => dialogRef.current?.close()}>Quay lại</Button><Button loading={busy} onClick={() => void accept()}>Xác nhận nghiệm thu</Button></div></div></dialog>
  </div>;
}
