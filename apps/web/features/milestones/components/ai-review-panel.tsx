"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { ErrorState } from "../../../components/ui/feedback";
import { ApiRequestError } from "../../auth/services/session-request";
import { analyzeHandoff, giveAiFeedback, type ExecutionMilestone, type Handoff } from "../services/milestones-api";

const STATUS = {
  EVIDENCE_FOUND: { label: "Có bằng chứng liên quan", tone: "success" },
  NOT_SHOWN: { label: "Chưa thấy bằng chứng", tone: "warning" },
  CANNOT_ASSESS: { label: "Chưa đủ thông tin", tone: "neutral" }
} as const;

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
  const legacy = review?.state === "SUCCEEDED" && !review.summary;
  const counts = review?.items.reduce((result, item) => ({ ...result, [item.status]: result[item.status] + 1 }), {
    EVIDENCE_FOUND: 0, NOT_SHOWN: 0, CANNOT_ASSESS: 0
  });

  return <section className="stack stack--sm ai-review" aria-label={`AI rà soát bản ${handoff.revision}`}>
    <header className="ai-review__header">
      <div><p className="ai-review__eyebrow">TECHNICAL REVIEW / REV {String(handoff.revision).padStart(2, "0")}</p><h4>AI rà soát bàn giao</h4></div>
      {review?.state === "SUCCEEDED" ? <span className="ai-review__stamp">{legacy ? "BẢN CŨ" : "HOÀN TẤT"}</span> : null}
    </header>
    <p className="text-caption">Đối chiếu tham khảo theo tiêu chí đã chốt. SME vẫn là người quyết định nghiệm thu.</p>

    {review?.state === "SUCCEEDED" ? <>
      {review.summary ? <section className="ai-review__summary" aria-label="Tóm tắt phân tích">
        <p className="ai-review__eyebrow">EXECUTIVE SUMMARY</p><p>{review.summary}</p>
        {counts ? <div className="ai-review__counts" aria-label="Tổng hợp theo trạng thái">
          <span><strong>{counts.EVIDENCE_FOUND}</strong> Có bằng chứng</span><span><strong>{counts.NOT_SHOWN}</strong> Chưa thấy</span><span><strong>{counts.CANNOT_ASSESS}</strong> Chưa thể xác minh</span>
        </div> : null}
      </section> : null}

      {review.findings?.length ? <section className="stack stack--sm"><h5>Phát hiện chính</h5><ul className="ai-review__list">{review.findings.map((finding, index) => <li key={index}>{finding}</li>)}</ul></section> : null}

      <div className="stack stack--sm" aria-label="Phân tích theo tiêu chí">
        {review.items.map((item, index) => {
          const status = STATUS[item.status];
          return <article key={item.criterionId} className="ai-review__criterion">
            <div className="ai-review__criterion-head"><span className="ai-review__index">CRITERION {String(index + 1).padStart(2, "0")}</span><span className={`ai-review__status ai-review__status--${status.tone}`}>{status.label}</span></div>
            <h5>{milestone.criteria.find(c => c.id === item.criterionId)?.text ?? item.criterionId}</h5>
            {item.analysis ? <p>{item.analysis}</p> : null}
            {item.evidence.length ? <div className="ai-review__evidence"><p className="ai-review__eyebrow">BẰNG CHỨNG TRONG NGUỒN</p>{item.evidence.map((evidence, quoteIndex) => {
              const source = review.sources.find(s => s.id === evidence.source);
              return <blockquote key={quoteIndex}><p>“{evidence.quote}”</p><cite>{source?.label ?? evidence.source}{source?.page ? ` · trang ${source.page}` : ""}</cite></blockquote>;
            })}</div> : <p className="text-caption">Không có trích dẫn cho nhận xét này.</p>}
            {item.gap ? <div className="ai-review__detail"><strong>Khoảng trống / chưa xác minh</strong><p>{item.gap}</p></div> : null}
            {item.nextStep ? <div className="ai-review__detail ai-review__detail--action"><strong>Bước kiểm tra tiếp theo</strong><p>{item.nextStep}</p></div> : null}
            {item.question ? <p className="text-caption"><strong>Câu hỏi làm rõ:</strong> {item.question}</p> : null}
          </article>;
        })}
      </div>

      {review.overallNote ? <p className="ai-review__note">{review.overallNote}</p> : null}
      {review.warnings.length ? <Alert variant="warning" title="Giới hạn nguồn"><ul className="ai-review__list">{review.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></Alert> : null}
      <details className="ai-review__details"><summary>Giới hạn và thông tin lần phân tích</summary><div className="stack stack--sm">
        {review.limitations?.length ? <ul className="ai-review__list">{review.limitations.map((limitation, index) => <li key={index}>{limitation}</li>)}</ul> : null}
        <p>Model: <code>{review.model}</code>{review.promptVersion ? ` · Prompt ${review.promptVersion}` : ""}</p>
        <p>Thời điểm: {new Date(review.finishedAt ?? review.startedAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
        {review.inputTokens != null || review.outputTokens != null ? <p>Token vào/ra: {review.inputTokens ?? "—"} / {review.outputTokens ?? "—"}</p> : null}
      </div></details>

      <div className="cluster"><Button variant="ghost" size="sm" onClick={() => void respond(true)}>Có ích</Button><Button variant="ghost" size="sm" onClick={() => void respond(false)}>Chưa có ích</Button>{feedback ? <span role="status" className="text-caption">{feedback}</span> : null}</div>
    </> : <>
      {review?.state === "FAILED" ? <Alert variant="warning" title="AI chưa hoàn tất">Bạn có thể thử lại. Bàn giao và nghiệm thu vẫn hoạt động bình thường. Mã lỗi: {review.errorCode}</Alert> : null}
      {processing ? <p role="status">AI đang phân tích. Bạn vẫn có thể tiếp tục các thao tác khác.</p> : null}
      {current ? <>
        <p className="text-caption">Bấm phân tích để gửi ghi chú và nội dung PDF/TXT của bản này đến Google Gemini.</p>
        <Button variant="outline" loading={busy} disabled={!available || processing} onClick={() => void analyze()}>{review?.state === "FAILED" ? "Thử phân tích lại" : "Phân tích bằng AI"}</Button>
        {!available ? <p className="text-caption">AI chưa được cấu hình. Bạn vẫn có thể nộp bài và nghiệm thu.</p> : null}
      </> : !review ? <p className="text-caption">Bản cũ chưa có kết quả AI. Chỉ phân tích bản bàn giao hiện tại.</p> : null}
    </>}
    {review?.state !== "SUCCEEDED" ? review?.warnings.map((warning, index) => <p key={index} className="text-caption">{warning}</p>) : null}
    {error ? <ErrorState detail={error.message} requestId={error.requestId} action={<Button variant="outline" onClick={() => setError(null)}>Đóng thông báo</Button>} /> : null}
  </section>;
}
