"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { ErrorState, Skeleton } from "../../../components/ui/feedback";
import { SelectField, TextAreaField, TextField } from "../../../components/ui/field";
import { Stepper, type Step } from "../../../components/ui/stepper";
import { CheckCircle, ICON_WEIGHT } from "../../../components/ui/icons";
import { MilestoneEditor, defaultSplit, newMilestoneRow, type MilestoneRow } from "../../milestones/components/milestone-editor";
import { BudgetInput } from "./budget-input";
import { ComplexitySelector } from "./complexity-selector";
import { SkillMultiSelect } from "./skill-multi-select";
import { ISSUE_COPY, LEVEL_COPY, describeProjectError, levelRange, readinessIssuesOf } from "../level-copy";
import {
  createDraft,
  loadAuthoringReferenceData,
  saveDraft,
  submitProject,
  type CatalogSkill,
  type ManagedProject,
  type ProjectComplexity,
  type ProjectCreationPolicy,
  type ProjectDraftInput,
  type ReadinessIssue
} from "../sme-api";

/**
 * Màn hình 3 — Wizard Đăng Dự án (docs/design.md 7.3).
 *
 * Chia ba bước là hiện thực của Progressive Disclosure: đăng một dự án đòi hỏi
 * khai chừng mười trường, dồn hết vào một màn hình sẽ gây ngợp nhận thức đúng
 * lúc SME đang bận việc kinh doanh của họ.
 *
 * Bản nháp lưu lên backend ở bất kỳ bước nào (chỉ cần tiêu đề), nên SME bỏ dở
 * rồi quay lại được. Gửi duyệt thì backend kiểm tra đủ thông tin, khoảng ngân
 * sách của mức độ đã chọn và tổng tiền các mốc; giao diện chỉ báo trước.
 *
 * Yêu cầu tiếp cận bắt buộc (design.md 4.6b): sau khi chuyển bước, TIÊU ĐIỂM
 * được đưa về tiêu đề của bước mới. Nếu không, người dùng trình đọc màn hình
 * bấm "Tiếp tục" xong sẽ không biết màn hình vừa đổi, vì tiêu điểm vẫn nằm ở
 * cái nút cũ giờ đã mang nhãn khác.
 */
const STEP_TITLES = ["Mô tả bài toán", "Kỹ năng, mức độ và ngân sách", "Mốc bàn giao và nghiệm thu"];
const INDUSTRIES = ["F&B", "Bán lẻ", "Thương mại điện tử", "Dịch vụ", "Sản xuất", "Khác"];
const SME_SIZES = ["1-10 nhân sự", "11-20 nhân sự", "Trên 20 nhân sự"];
const DEFAULT_BUDGET = 2_000_000;

type WizardState = {
  title: string;
  summary: string;
  problem: string;
  industry: string;
  smeSize: string;
  complexity: ProjectComplexity | null;
  budget: number;
  deadline: string;
  skillCodes: string[];
  acceptance: string;
  milestones: MilestoneRow[];
  /** Khi SME chưa tự sửa tiền các mốc, đổi ngân sách sẽ chia lại hai mốc mặc định. */
  milestonesTouched: boolean;
};

function initialState(project?: ManagedProject): WizardState {
  if (!project) {
    const [first, second] = defaultSplit(DEFAULT_BUDGET);
    return {
      title: "", summary: "", problem: "", industry: "", smeSize: "", complexity: null, budget: DEFAULT_BUDGET,
      deadline: "", skillCodes: [], acceptance: "",
      milestones: [newMilestoneRow({ budget: first }), newMilestoneRow({ budget: second })],
      milestonesTouched: false
    };
  }
  return {
    title: project.title,
    summary: project.summary ?? "",
    problem: project.problem ?? "",
    industry: project.industry ?? "",
    smeSize: project.smeSize ?? "",
    complexity: project.complexity ?? null,
    budget: project.budget ?? DEFAULT_BUDGET,
    deadline: project.deadline ?? "",
    skillCodes: project.skills.map((skill) => skill.code),
    acceptance: project.acceptanceCriteria.join("\n"),
    milestones: project.milestones.length
      ? project.milestones.map((milestone) =>
          newMilestoneRow({
            title: milestone.title ?? "",
            budget: milestone.budget,
            deadline: milestone.deadline ?? "",
            criteria: milestone.criteria
          })
        )
      : [newMilestoneRow({ budget: project.budget ?? DEFAULT_BUDGET })],
    milestonesTouched: true
  };
}

function toInput(state: WizardState): ProjectDraftInput {
  const optional = (value: string) => (value.trim() ? value.trim() : undefined);
  return {
    title: state.title.trim(),
    summary: optional(state.summary),
    problem: optional(state.problem),
    industry: optional(state.industry),
    smeSize: optional(state.smeSize),
    complexity: state.complexity ?? undefined,
    budget: state.budget,
    deadline: optional(state.deadline),
    skillCodes: state.skillCodes,
    acceptanceCriteria: state.acceptance.split("\n").map((line) => line.trim()).filter(Boolean),
    milestones: (() => {
      const globalCriteria = state.acceptance.split("\n").map((line) => line.trim()).filter(Boolean);
      return state.milestones.map((row, index) => {
        // Nếu mốc để trống tiêu chí riêng, fallback dùng tiêu chí chung của dự án cho mốc cuối (hoặc toàn bộ nếu 1 mốc)
        const milestoneCriteria = row.criteria.map((line) => line.trim()).filter(Boolean);
        const criteria =
          milestoneCriteria.length > 0
            ? milestoneCriteria
            : (index === state.milestones.length - 1 ? globalCriteria : []);
        return {
          title: optional(row.title),
          budget: row.budget,
          deadline: optional(row.deadline),
          criteria
        };
      });
    })()
  };
}

/** Hạn chót tính theo lịch Việt Nam, đúng như backend (BR-11): phải sau hôm nay. */
function vietnamDate(offsetDays = 0): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

type ReferenceData = { policy: ProjectCreationPolicy; skills: CatalogSkill[] };

export function ProjectWizard({ initialProject }: { initialProject?: ManagedProject }) {
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>(() => initialState(initialProject));
  const [projectId, setProjectId] = useState<string | null>(initialProject?.id ?? null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ReadinessIssue[]>([]);
  const [stepErrors, setStepErrors] = useState<{ skills?: string; complexity?: string }>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Bỏ qua lần chạy đầu: không cướp tiêu điểm của người dùng khi trang vừa tải.
  const mounted = useRef(false);
  const minDeadline = useMemo(() => vietnamDate(1), []);

  useEffect(() => {
    let active = true;
    loadAuthoringReferenceData()
      .then((data) => active && setReference(data))
      .catch((cause) => active && setLoadError(describeProjectError(cause)));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function patch(next: Partial<WizardState>) {
    setState((current) => ({ ...current, ...next }));
    setSavedAt(null);
  }

  function changeBudget(budget: number) {
    setState((current) => {
      if (current.milestonesTouched || current.milestones.length !== 2) return { ...current, budget };
      const [first, second] = defaultSplit(budget);
      const [a, b] = current.milestones;
      return { ...current, budget, milestones: [{ ...a, budget: first }, { ...b, budget: second }] };
    });
    setSavedAt(null);
  }

  if (loadError) {
    return <ErrorState detail={loadError} action={<Button onClick={() => window.location.reload()}>Thử lại</Button>} />;
  }
  if (!reference) {
    return (
      <div className="stack" aria-busy="true" aria-label="Đang tải biểu mẫu">
        <Skeleton height="28px" width="60%" />
        <Skeleton height="48px" />
        <Skeleton height="160px" />
      </div>
    );
  }

  const { policy, skills } = reference;
  const range = state.complexity ? levelRange(policy, state.complexity) : null;
  const levelLabel = state.complexity ? LEVEL_COPY[state.complexity].label : undefined;
  const allocated = state.milestones.reduce((sum, row) => sum + row.budget, 0);
  const outsideLevel = range !== null && (state.budget < range.minimumBudget || state.budget > range.maximumBudget);
  const lateMilestone = state.milestones.some((row) => state.deadline && row.deadline && row.deadline > state.deadline);
  const submitBlocker = !state.complexity
    ? "Chọn mức độ dự án ở bước 2 trước khi gửi duyệt."
    : outsideLevel
      ? "Ngân sách đang nằm ngoài khoảng của mức độ đã chọn (bước 2)."
      : allocated !== state.budget
        ? "Tổng tiền các mốc phải bằng đúng ngân sách dự án."
        : lateMilestone
          ? "Có mốc hết hạn sau hạn của cả dự án."
          : null;

  const steps: Step[] = STEP_TITLES.map((label, index) => ({
    label,
    state: index < step ? "completed" : index === step ? "current" : "upcoming"
  }));

  async function persist(): Promise<ManagedProject | null> {
    if (!state.title.trim()) {
      setError("Cần ít nhất tiêu đề dự án để lưu bản nháp.");
      setStep(0);
      return null;
    }
    const input = toInput(state);
    const saved = projectId ? await saveDraft(projectId, input) : await createDraft(input);
    if (!projectId) {
      setProjectId(saved.id);
      // Đổi địa chỉ sang trang sửa nháp để tải lại trang vẫn mở đúng bản nháp này, không tạo bản mới.
      window.history.replaceState(null, "", `/sme/projects/${saved.id}/edit`);
    }
    return saved;
  }

  async function onSaveDraft() {
    setBusy("save");
    setError(null);
    setIssues([]);
    try {
      const saved = await persist();
      if (saved) setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    } catch (cause) {
      setError(describeProjectError(cause));
    } finally {
      setBusy(null);
    }
  }

  async function onSubmit() {
    setBusy("submit");
    setError(null);
    setIssues([]);
    try {
      const saved = await persist();
      if (!saved) return;
      await submitProject(saved.id);
      setSubmitted(true);
    } catch (cause) {
      setError(describeProjectError(cause));
      setIssues(readinessIssuesOf(cause));
    } finally {
      setBusy(null);
    }
  }

  function goNext() {
    // Kiểm tra hợp lệ TRƯỚC khi sang bước kế. Chỉ bước đang hiện mới mang
    // thuộc tính `required`, nên reportValidity() chỉ soi đúng những trường
    // người dùng đang nhìn thấy — không bao giờ báo lỗi vào một ô đang bị ẩn.
    if (formRef.current && !formRef.current.reportValidity()) return;
    if (step === 1) {
      const errors = {
        skills: state.skillCodes.length === 0 ? "Chọn ít nhất một kỹ năng." : undefined,
        complexity: state.complexity ? undefined : "Chọn mức độ phù hợp với phạm vi công việc."
      };
      setStepErrors(errors);
      if (errors.skills || errors.complexity) return;
    }
    setStep((current) => current + 1);
  }

  if (submitted) {
    // Trạng thái Thành công (design.md 8.4): xác nhận rõ ràng + bước kế tiếp.
    return (
      <div className="card stack">
        <h2 className="cluster">
          <CheckCircle weight={ICON_WEIGHT} aria-hidden="true" style={{ color: "var(--color-status-verified)" }} />
          Đã gửi dự án đi duyệt
        </h2>
        <p>
          Đội vận hành GenDA sẽ đối chiếu phạm vi công việc với mức độ {levelLabel ?? ""} bạn chọn. Duyệt xong, dự án
          hiện ra cho người ứng tuyển.
        </p>
        <Alert variant="info">
          Trong lúc chờ duyệt, dự án tạm khóa chỉnh sửa. Nếu quản trị viên trả dự án về, bạn sẽ thấy lý do trong danh
          sách dự án và sửa tiếp được ngay.
        </Alert>
        <div className="cluster">
          <Link href="/sme/projects" className="btn btn--primary">
            Về danh sách dự án của tôi
          </Link>
        </div>
      </div>
    );
  }

  const returned = initialProject?.latestReturn;

  return (
    <>
      {returned ? (
        <Alert variant="warning" title="Quản trị viên đã trả dự án về để chỉnh sửa">
          {returned.reason}
          {returned.suggestedComplexity
            ? ` Mức độ đề xuất: ${LEVEL_COPY[returned.suggestedComplexity].label}.`
            : null}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="danger" title="Chưa lưu được">
          {error}
          {issues.length ? (
            <ul style={{ margin: "var(--space-2) 0 0", paddingLeft: "var(--space-5)" }}>
              {issues.map((issue) => (
                <li key={issue}>
                  {ISSUE_COPY[issue].message}{" "}
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(ISSUE_COPY[issue].step)}>
                    Sửa ở bước {ISSUE_COPY[issue].step + 1}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
      >
        <Stepper steps={steps} ariaLabel="Tiến độ đăng dự án" />

        <div className="card" style={{ marginTop: "var(--space-8)" }}>
          {/* h2 chứ không phải h1: h1 của trang nằm ở page.tsx.
              tabIndex -1 để nhận được tiêu điểm bằng mã mà không chen vào thứ tự Tab. */}
          <h2 ref={headingRef} tabIndex={-1}>
            Bước {step + 1}: {STEP_TITLES[step]}
          </h2>

          {/* Cả ba bước LUÔN nằm trong cây DOM, chỉ ẩn/hiện bằng thuộc tính `hidden`,
              để bấm "Quay lại" không làm mất thứ SME vừa nhập (WCAG 2.2 — 3.3.7
              Redundant Entry) và trình đọc màn hình không đọc nhầm bước chưa tới. */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <div hidden={step !== 0}>
              <TextField
                id="project-title"
                label="Bạn cần làm gì"
                required={step === 0}
                maxLength={180}
                value={state.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="Ví dụ: Landing page giới thiệu thực đơn mùa mới"
                hint="Viết như bạn đang nhờ một người quen, càng cụ thể càng dễ tìm đúng người."
              />

              <TextField
                id="project-summary"
                label="Tóm tắt trong một câu"
                required={step === 0}
                maxLength={500}
                value={state.summary}
                onChange={(event) => patch({ summary: event.target.value })}
                placeholder="Ví dụ: Trang đặt bàn online, xem được trên điện thoại."
                hint="Câu này hiện ngay trong danh sách dự án, trước khi người ứng tuyển bấm vào xem chi tiết."
              />

              <div className="opp-form__pair">
                <SelectField
                  id="project-industry"
                  label="Lĩnh vực của bạn"
                  required={step === 0}
                  value={state.industry}
                  onChange={(event) => patch({ industry: event.target.value })}
                >
                  <option value="">Chọn một lĩnh vực</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry}>{industry}</option>
                  ))}
                </SelectField>

                <SelectField
                  id="project-size"
                  label="Quy mô doanh nghiệp"
                  required={step === 0}
                  value={state.smeSize}
                  onChange={(event) => patch({ smeSize: event.target.value })}
                >
                  <option value="">Chọn quy mô</option>
                  {SME_SIZES.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </SelectField>
              </div>

              <TextAreaField
                id="project-problem"
                label="Mô tả chi tiết yêu cầu"
                required={step === 0}
                rows={8}
                maxLength={5000}
                value={state.problem}
                onChange={(event) => patch({ problem: event.target.value })}
                placeholder="Tình hình hiện tại của bạn, bạn muốn đạt được gì, và bạn đã có sẵn những gì (nội dung, ảnh, tài khoản...)."
                hint="Nói rõ thứ bạn đã có sẵn sẽ giúp người ứng tuyển ước lượng đúng khối lượng việc."
              />
            </div>

            <div hidden={step !== 1}>
              <fieldset style={{ border: 0, margin: "0 0 var(--space-field-group)", padding: 0 }}>
                <legend className="field__label" style={{ marginBottom: "var(--space-field-label)" }}>
                  Kỹ năng cần có
                </legend>
                <p className="text-muted" style={{ marginBottom: "var(--space-3)" }}>
                  Chọn từ danh mục chuẩn của hệ thống. Kỹ năng bạn chọn ở đây quyết định dự án được gợi ý cho ai.
                </p>
                <SkillMultiSelect
                  options={skills}
                  value={state.skillCodes}
                  onChange={(skillCodes) => patch({ skillCodes })}
                  max={5}
                />
                {stepErrors.skills ? <p className="field__error">{stepErrors.skills}</p> : null}
              </fieldset>

              <ComplexitySelector
                policy={policy}
                value={state.complexity}
                onChange={(complexity) => {
                  patch({ complexity });
                  setStepErrors((current) => ({ ...current, complexity: undefined }));
                }}
                error={stepErrors.complexity}
              />

              <BudgetInput
                value={state.budget}
                onChange={changeBudget}
                overall={policy}
                level={range}
                levelLabel={levelLabel}
              />

              <div className="field">
                <label className="field__label" htmlFor="project-deadline">
                  Hạn hoàn thành toàn dự án
                  <span className="field__required" aria-hidden="true">
                    *
                  </span>
                  <span className="visually-hidden">(bắt buộc)</span>
                </label>
                <input
                  id="project-deadline"
                  className="input"
                  type="date"
                  required={step === 1}
                  min={minDeadline}
                  value={state.deadline}
                  onChange={(event) => patch({ deadline: event.target.value })}
                  aria-describedby="project-deadline-hint"
                />
                <p className="field__hint" id="project-deadline-hint">
                  Chỉ chọn được ngày trong tương lai. Đa số dự án trong khoảng này làm xong trong 2 đến 4 tuần.
                </p>
              </div>
            </div>

            <div hidden={step !== 2}>
              <TextAreaField
                id="project-acceptance"
                label="Thế nào là làm xong"
                required={step === 2}
                rows={5}
                value={state.acceptance}
                onChange={(event) => patch({ acceptance: event.target.value })}
                placeholder={"Mỗi dòng một tiêu chí, ví dụ:\nChạy tốt trên Chrome và Safari\nCó mã nguồn kèm hướng dẫn"}
                hint="Mỗi dòng là một tiêu chí nghiệm thu. Viết càng rõ thì càng ít phải sửa qua lại."
              />

              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="field__label" style={{ marginBottom: "var(--space-field-label)" }}>
                  Chia tiền theo mốc bàn giao
                </legend>
                <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
                  Người ứng tuyển đọc được phần này trước khi nộp đơn, nên nó cũng là cam kết của bạn về nhịp thanh
                  toán.
                </p>
                <MilestoneEditor
                  rows={state.milestones}
                  onChange={(milestones) => patch({ milestones, milestonesTouched: true })}
                  projectBudget={state.budget}
                  projectDeadline={state.deadline}
                  minDate={minDeadline}
                />
              </fieldset>
            </div>
          </div>

          <div
            className="cluster cluster--between"
            style={{ marginTop: "var(--space-8)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--color-border-subtle)" }}
          >
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Quay lại
            </Button>

            <span className="cluster">
              <span className="stack stack--sm" style={{ alignItems: "flex-end" }}>
                <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void onSaveDraft()}>
                  {busy === "save" ? "ĐANG LƯU..." : "LƯU BẢN NHÁP"}
                </Button>
                {savedAt ? (
                  <span className="text-caption" aria-live="polite">
                    Đã lưu lúc {savedAt}
                  </span>
                ) : null}
              </span>

              {/* Hai nút khác `key` để React thay hẳn phần tử: nếu tái sử dụng, nút "Tiếp tục" vừa bấm sẽ
                  đổi thành type="submit" ngay trong cú click và gửi dự án đi khi SME chưa xem bước cuối. */}
              {step < 2 ? (
                <Button key="next" type="button" onClick={goNext}>
                  Tiếp tục
                </Button>
              ) : (
                <Button key="submit" type="submit" disabled={busy !== null || submitBlocker !== null}>
                  {busy === "submit" ? "Đang gửi..." : "Gửi duyệt"}
                </Button>
              )}
            </span>
          </div>
          {step === 2 && submitBlocker ? (
            <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>
              {submitBlocker}
            </p>
          ) : null}
        </div>
      </form>
    </>
  );
}
