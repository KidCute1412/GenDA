"use client";
import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { setPortfolioVisibility } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";

export function LedgerPortfolioPanel() {
  const ledger = useDemoLedger(); const { session } = useDemoSession(); const [error, setError] = useState<string | null>(null);
  const owner = ledger.users.find((user) => user.email === session?.email);
  const entries = ledger.portfolios.map((portfolio) => ({ portfolio, project: ledger.projects.find((project) => project.id === portfolio.projectId), review: ledger.reviews.find((review) => review.id === portfolio.reviewId) })).filter((entry) => entry.project && (entry.portfolio.visible || entry.portfolio.studentId === owner?.id));
  if (!entries.length) return null;
  return <section className="stack" style={{ marginBottom: "var(--space-8)" }}><div className="industrial-ruler">PORTFOLIO XÁC THỰC TỪ LEDGER</div>{error ? <Alert variant="danger">{error}</Alert> : null}{entries.map(({ portfolio, project, review }) => <article key={portfolio.id} className="module-bay stack stack--sm" style={{ padding: "var(--space-5)" }}><div className="module-bay__header"><span>VERIFIED // {project?.id.toUpperCase()}</span><span>{portfolio.visible ? "CÔNG KHAI" : "ĐANG ẨN"}</span></div><h2>{project?.title}</h2><p>{project?.smeName} · {project?.summary}</p>{review ? <blockquote>“{review.comment}” · {review.rating}/5</blockquote> : <p className="text-muted">Đang chờ doanh nghiệp gửi đánh giá.</p>}{portfolio.studentId === owner?.id ? <Button variant="outline" onClick={() => { const result = setPortfolioVisibility(session?.email ?? "", portfolio.id, !portfolio.visible); setError(result.ok ? null : result.message); }}>{portfolio.visible ? "Ẩn khỏi trang công khai" : "Hiện công khai"}</Button> : null}</article>)}</section>;
}
