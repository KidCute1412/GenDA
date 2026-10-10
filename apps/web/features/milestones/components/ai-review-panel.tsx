"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { ErrorState } from "../../../components/ui/feedback";
import { ApiRequestError } from "../../auth/services/session-request";
import { analyzeHandoff, giveAiFeedback, type ExecutionMilestone, type Handoff } from "../services/milestones-api";

const EVIDENCE_COPY = {
  EVIDENCE_FOUND: "✓ Có bằng chứng liên quan",
  NOT_SHOWN: "○ Chưa thấy bằng chứng",
  CANNOT_ASSESS: "? Chưa đủ thông tin để đánh giá"
};

export function AiReviewPanel({ milestone, handoff, available, current, reload }: {
  milestone: ExecutionMilestone; handoff: Handoff; available: boolean; current: boolean; reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const review = handoff.aiReview;
  async function analyze() {
    setBusy(true); setError(null);
    try { await analyzeHandoff(milestone.id, handoff.id); await reload(); }
    catch (e) { setError(e instanceof ApiRequestError ? e : new ApiRequestError("AI_UNAVAILABLE", "AI chưa sẵn sàng. Bạn vẫn có thể nghiệm thu bình thường.", 0)); }
    finally { setBusy(false); }
  }
  async function respond(helpful: boolean) {
    if (!review) return;
    try { await giveAiFeedback(review.id, helpful); setFeedback("Đã ghi nhận phản hồi của bạn."); }
    catch (e) { setError(e instanceof ApiRequestError ? e : new ApiRequestError("FEEDBACK_FAILED", "Chưa lưu được phản hồi.", 0)); }
  }
  const processing = busy || (review?.state === "PROCESSING" && Date.now() - Date.parse(review.startedAt) < 120_000);
  return <section className="stack stack--sm" aria-label={`AI rà soát bản ${handoff.revision}`}>
    <h4>AI rà soát bản {handoff.revision}</h4>
    <p className="text-caption">Góp ý tham khảo theo tiêu chí đã chốt. SME tự quyết định nghiệm thu.</p>
    {review?.state === "SUCCEEDED" ? <>
      {review.items.map(item => <div key={item.criterionId} className="stack stack--sm">
        <p><strong>{milestone.criteria.find(c => c.id === item.criterionId)?.text}</strong></p>
        <p>{EVIDENCE_COPY[item.status]}</p>
        {item.evidence.length ? item.evidence.map((evidence, index) => {
          const source = review.sources.find(s => s.id === evidence.source);
          return <blockquote key={index}><p>{evidence.quote}</p><cite>{source?.label}{source?.page ? `, trang ${source.page}` : ""}</cite></blockquote>;
        }) : <p className="text-caption">Không có trích dẫn cho nhận xét này.</p>}
        {item.question ? <p>{item.question}</p> : null}
      </div>)}
      <p className="text-muted">{review.overallNote}</p>
      <div className="cluster"><Button variant="ghost" size="sm" onClick={() => void respond(true)}>Có ích</Button><Button variant="ghost" size="sm" onClick={() => void respond(false)}>Chưa có ích</Button></div>
      {feedback ? <p role="status">{feedback}</p> : null}
    </> : <>
      {review?.state === "FAILED" ? <Alert variant="warning" title="AI chưa hoàn tất">Bạn có thể thử lại. Bàn giao và nghiệm thu vẫn hoạt động bình thường. Mã lỗi: {review.errorCode}</Alert> : null}
      {processing ? <p role="status">AI đang phân tích. Bạn vẫn có thể tiếp tục các thao tác khác.</p> : null}
      {current ? <>
        <p className="text-caption">Bấm phân tích để gửi ghi chú và nội dung PDF/TXT của bản này đến Google Gemini.</p>
        <Button variant="outline" loading={busy} disabled={!available || processing} onClick={() => void analyze()}>{review?.state === "FAILED" ? "Thử phân tích lại" : "Phân tích bằng AI"}</Button>
        {!available ? <p className="text-caption">AI chưa được cấu hình. Bạn vẫn có thể nộp bài và nghiệm thu.</p> : null}
      </> : !review ? <p className="text-caption">Bản cũ chưa có kết quả AI. Chỉ phân tích bản bàn giao hiện tại.</p> : null}
    </>}
    {review?.warnings.map((warning, index) => <p key={index} className="text-caption">{warning}</p>)}
    {error ? <ErrorState detail={error.message} requestId={error.requestId} action={<Button variant="outline" onClick={() => setError(null)}>Đóng thông báo</Button>} /> : null}
  </section>;
}
