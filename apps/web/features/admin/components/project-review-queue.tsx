"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { EmptyState, ErrorState, ProjectListSkeleton } from "../../../components/ui/feedback";
import { SelectField, TextAreaField } from "../../../components/ui/field";
import { StatusBadge } from "../../../components/ui/status-badge";
import { formatDate, formatVnd } from "../../../lib/utils/format";
import { COMPLEXITY_ORDER, ISSUE_COPY, LEVEL_COPY, describeProjectError } from "../../projects/level-copy";
import type { ManagedProject, ProjectComplexity } from "../../projects/sme-api";
import { listPendingProjects, publishProject, returnProject } from "../services/project-review-api";

const MIN_REASON = 10;

/**
 * Hàng đợi duyệt dự án (design.md 7.8, FR-PRJ-04, FR-PRJ-11).
 *
 * Mỗi thẻ đặt scope, kỹ năng, deadline, mốc, mức độ và ngân sách trong CÙNG một vùng đối chiếu để admin
 * so phạm vi với mức độ SME khai. Admin chỉ có hai quyết định: xuất bản, hoặc trả về kèm lý do (và mức độ
 * đề xuất). Admin không sửa nội dung thay SME.
 */
export function ProjectReviewQueue() {
  const [projects, setProjects] = useState<ManagedProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    listPendingProjects()
      .then(setProjects)
      .catch((cause) => setError(describeProjectError(cause)));
  }, []);

  useEffect(load, [load]);

  if (error) return <ErrorState detail={error} action={<Button onClick={load}>Thử lại</Button>} />;
  if (!projects) return <ProjectListSkeleton rows={2} />;

  function done(projectId: string, message: string) {
    setProjects((current) => current?.filter((project) => project.id !== projectId) ?? null);
    setNotice(message);
  }

  return (
    <div className="stack" style={{ gap: "var(--space-6)" }}>
      {notice ? (
        <Alert variant="success" live="polite">
          {notice}
        </Alert>
      ) : null}
      {projects.length === 0 ? (
        <EmptyState
          title="Hàng đợi dự án trống"
          advice="Hiện không có dự án nào đang chờ thẩm định. Dự án mới từ doanh nghiệp sẽ xuất hiện tại đây theo thứ tự gửi."
        />
      ) : (
        projects.map((project) => <ReviewCard key={project.id} project={project} onDone={done} />)
      )}
    </div>
  );
}

function ReviewCard({ project, onDone }: { project: ManagedProject; onDone: (id: string, message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [suggested, setSuggested] = useState<ProjectComplexity | "">("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = project.milestones.reduce((sum, milestone) => sum + milestone.budget, 0);
  const balanced = total === project.budget;
  const level = project.complexity ? LEVEL_COPY[project.complexity] : null;

  async function act(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
      dialogRef.current?.close();
      onDone(project.id, message);
    } catch (cause) {
      setError(describeProjectError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="module-bay" style={{ padding: "var(--space-6)" }}>
      <div className="module-bay__header" style={{ borderColor: "var(--machinery-border)" }}>
        <span className="module-bay__id">SUBMISSION // {project.id.toUpperCase()}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", color: "var(--color-text-muted)" }}>
            GỬI LÚC: {project.submittedAt ? new Date(project.submittedAt).toLocaleString("vi-VN") : "—"}
          </span>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ maxWidth: "75ch" }}>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
            DOANH NGHIỆP: <strong style={{ color: "var(--color-text-heading)" }}>{project.smeName}</strong> ({project.industry} •{" "}
            {project.smeSize}) • LH: {project.smeContact}
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, textTransform: "uppercase", margin: "4px 0 var(--space-2)" }}>
            {project.title}
          </h2>
          <p style={{ margin: "0 0 var(--space-2)", fontWeight: 600 }}>{project.summary}</p>
          <p style={{ color: "var(--color-text-body)", fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{project.problem}</p>
          <p className="text-muted" style={{ fontSize: "12px", fontFamily: "ui-monospace, monospace" }}>
            KỸ NĂNG: {project.skills.map((skill) => skill.name).join(" • ")} // HẠN DỰ ÁN:{" "}
            {project.deadline ? formatDate(project.deadline) : "—"}
          </p>
        </div>

        {/* Đối chiếu mức độ với ngân sách: hai con số admin cần nhìn cạnh nhau */}
        <div style={{ border: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-subtle)", padding: "12px 16px", minWidth: "220px", textAlign: "right" }}>
          <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block" }}>
            MỨC ĐỘ SME KHAI
          </span>
          <strong style={{ display: "block", fontSize: "1.1rem", textTransform: "uppercase" }}>{level?.label ?? "—"}</strong>
          <span style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", color: "var(--color-text-muted)", display: "block", marginTop: "8px" }}>
            TỔNG NGÂN SÁCH DỰ ÁN
          </span>
          <span className="num" style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--color-text-heading)" }}>
            {project.budget ? formatVnd(project.budget) : "—"}
          </span>
          {level ? <span className="text-caption" style={{ display: "block", maxWidth: "28ch", marginLeft: "auto" }}>{level.scope}</span> : null}
        </div>
      </div>

      <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", backgroundColor: "var(--color-surface-subtle)", border: "1px solid var(--machinery-border)" }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-text-heading)", marginBottom: "8px" }}>
          {"// TIÊU CHÍ NGHIỆM THU DO DOANH NGHIỆP KHAI BÁO:"}
        </div>
        <ul style={{ margin: 0, paddingLeft: "var(--space-4)", fontSize: "13px", color: "var(--color-text-body)" }}>
          {project.acceptanceCriteria.map((item) => (
            <li key={item} style={{ marginBottom: "4px" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Bảng kiểm tra bất biến mốc bàn giao FR-MIL-02 */}
      <div style={{ marginTop: "var(--space-4)", border: "2px solid var(--machinery-border)", backgroundColor: "var(--color-surface-card)" }}>
        <div style={{ padding: "8px 14px", backgroundColor: "var(--color-surface-subtle)", borderBottom: "1px solid var(--machinery-border)", fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 800, display: "flex", justifyContent: "space-between" }}>
          <span>KIỂM TRA BẤT BIẾN MỐC BÀN GIAO (FR-MIL-02)</span>
          <span style={{ color: balanced ? "var(--color-status-verified-text)" : "var(--color-status-danger-text)" }}>
            {balanced ? "✓ TỶ LỆ KHỚP 100%" : "⚠ LỆCH NGÂN SÁCH"}
          </span>
        </div>
        <div style={{ padding: "var(--space-3) var(--space-4)" }}>
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="num" style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", fontSize: "13px", padding: "4px 0" }}>
              <span>
                {milestone.order}. {milestone.title} — hạn {milestone.deadline ? formatDate(milestone.deadline) : "—"}
              </span>
              <strong>{formatVnd(milestone.budget)}</strong>
            </div>
          ))}
        </div>
      </div>

      {project.submissionIssues.length ? (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Alert variant="warning" title="Dự án không còn đủ điều kiện xuất bản">
            {project.submissionIssues.map((issue) => ISSUE_COPY[issue].message).join(" ")}
          </Alert>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Alert variant="danger">{error}</Alert>
        </div>
      ) : null}

      <div className="cluster cluster--end" style={{ marginTop: "var(--space-5)" }}>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setReason("");
            setSuggested("");
            dialogRef.current?.showModal();
          }}
        >
          Trả về chỉnh sửa
        </Button>
        <Button
          type="button"
          disabled={busy || project.submissionIssues.length > 0}
          onClick={() => void act(() => publishProject(project.id), `Đã xuất bản "${project.title}".`)}
        >
          Duyệt xuất bản
        </Button>
      </div>

      <dialog ref={dialogRef} className="dialog" aria-labelledby={`return-title-${project.id}`}>
        <h2 id={`return-title-${project.id}`}>Trả dự án về cho doanh nghiệp</h2>
        <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
          Doanh nghiệp thấy lý do này cạnh bản nháp và tự sửa phạm vi, mức độ hoặc ngân sách. Quyết định được lưu vào nhật
          ký kiểm toán.
        </p>
        <TextAreaField
          id={`return-reason-${project.id}`}
          label="Lý do trả về"
          hint="Nêu rõ điểm chưa khớp, ví dụ phạm vi lớn hơn mức độ đã khai."
          required
          rows={5}
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: Phạm vi gồm cả tích hợp thanh toán, khối lượng tương đương mức Nâng cao."
        />
        <SelectField
          id={`return-level-${project.id}`}
          label="Mức độ đề xuất (không bắt buộc)"
          value={suggested}
          onChange={(event) => setSuggested(event.target.value as ProjectComplexity | "")}
        >
          <option value="">Không đề xuất</option>
          {COMPLEXITY_ORDER.map((complexity) => (
            <option key={complexity} value={complexity}>
              {LEVEL_COPY[complexity].label}
            </option>
          ))}
        </SelectField>
        <div className="dialog__actions">
          <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={busy || reason.trim().length < MIN_REASON}
            onClick={() =>
              void act(
                () => returnProject(project.id, reason.trim(), suggested || undefined),
                `Đã trả "${project.title}" về cho doanh nghiệp.`
              )
            }
          >
            Xác nhận trả về
          </Button>
        </div>
        {reason.trim().length < MIN_REASON ? (
          <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
            Nhập ít nhất {MIN_REASON} ký tự để xác nhận.
          </p>
        ) : null}
      </dialog>
    </article>
  );
}

/** Số dự án chờ duyệt cho huy hiệu trên tab. */
export function ProjectReviewQueueCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    listPendingProjects()
      .then((projects) => active && setCount(projects.length))
      .catch(() => active && setCount(null));
    return () => {
      active = false;
    };
  }, []);
  return <>{count ?? "–"}</>;
}
