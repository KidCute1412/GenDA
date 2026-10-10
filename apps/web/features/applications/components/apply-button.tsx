"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Field, TextAreaField } from "../../../components/ui/field";
import { Alert } from "../../../components/ui/alert";
import { CheckCircle, ICON_WEIGHT, Lock } from "../../../components/ui/icons";
import { useDemoSession } from "../../auth/hooks/use-demo-session";
import { ApiRequestError } from "../../auth/services/session-request";
import { LEVEL_COPY } from "../../projects/level-copy";
import { CvUploader } from "../../users/components/cv-uploader";
import { ReadinessChecklist } from "../../users/components/readiness-checklist";
import { TierBadge } from "../../users/components/tier-insignia";
import { XpMeter } from "../../users/components/xp-meter";
import { useContributorStanding } from "../../users/hooks/use-contributor-standing";
import type { Experience, ProjectLevel } from "../../users/services/contributor-api";
import { levelGate, tierLabel } from "../../users/tier-copy";
import { announceApplicationsChanged, useMyApplications } from "../hooks/use-my-applications";
import { MISSING_COPY, applyToProject } from "../services/applications-api";

/**
 * Hộp thoại Ứng tuyển (docs/design.md 7.4, FR-APP-01, FR-APP-09).
 *
 * Dùng phần tử <dialog> của trình duyệt mở bằng showModal(): bẫy tiêu điểm, phím Esc, trả tiêu điểm và
 * ::backdrop đều có sẵn. Contributor luôn mở được hộp thoại để đọc yêu cầu; nút gửi chỉ bật khi checklist
 * chung (tài khoản, email, hồ sơ, CV READY) đạt và hạng đủ cho mức của dự án. Đây chỉ là hướng dẫn: backend
 * kiểm tra lại toàn bộ khi nhận đơn và trả về đúng điều kiện còn thiếu.
 */
type Status = "idle" | "submitting" | "done";

export function ApplyButton({
  projectTitle,
  projectId,
  complexity
}: {
  projectTitle: string;
  projectId: string;
  smeName?: string;
  budget?: number;
  complexity: ProjectLevel;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [letter, setLetter] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { session, hydrated } = useDemoSession();
  const isContributor = session?.role === "CONTRIBUTOR";
  const { state: standing } = useContributorStanding(isContributor);
  const { items: myApplications } = useMyApplications();
  const alreadyApplied = myApplications.some((application) => application.projectId === projectId && ["SUBMITTED", "SHORTLISTED", "ACCEPTED"].includes(application.status));

  const level = LEVEL_COPY[complexity];
  const ready = standing.status === "ready" ? standing : null;
  const gate = ready ? levelGate(ready.experience, complexity) : null;
  const locked = gate !== null && !gate.unlocked;
  const letterOk = letter.trim().length >= 80;
  const canSubmit = isContributor && ready !== null && ready.readiness.ready && !locked && letterOk && status === "idle";

  // Báo lỗi độ dài thư ngỏ chỉ sau khi người dùng rời ô, không phạt người đang gõ dở.
  const letterError = touched && letter.trim().length > 0 && !letterOk
    ? "Thư ngỏ cần ít nhất 80 ký tự. Hãy nói rõ bạn đã làm gì tương tự và khi nào bạn rảnh."
    : undefined;

  function open() {
    if (!isContributor) return;
    setStatus(alreadyApplied ? "done" : "idle");
    dialogRef.current?.showModal();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !session) return;
    setStatus("submitting");
    try {
      await applyToProject(projectId, letter);
      setSubmitError(null);
      setStatus("done");
      announceApplicationsChanged();
    } catch (error) {
      setSubmitError(applyErrorMessage(error));
      setStatus("idle");
    }
  }

  // Thiếu hạng nêu trước: không gỡ được ngay trong hộp thoại, còn checklist thì gỡ được.
  const blocker = !ready
    ? "Đang kiểm tra hạng và hồ sơ của bạn."
    : locked
      ? `Dự án này cần ${tierLabel(gate.requiredTier).toLowerCase()}.`
      : !ready.readiness.ready
        ? "Hoàn tất các mục còn thiếu ở trên để gửi được đơn."
        : !letterOk
          ? "Viết thư ngỏ ít nhất 80 ký tự để gửi được đơn."
          : null;

  return (
    <>
      <LevelRequirement complexity={complexity} experience={ready?.experience ?? null} />
      {hydrated && !isContributor ? <Alert variant="warning" title="Chỉ contributor được ứng tuyển">Hãy đăng nhập bằng tài khoản cá nhân đã xác minh để gửi đơn cho dự án này.</Alert> : null}
      {submitError ? <Alert variant="danger" title="Không thể gửi đơn">{submitError}</Alert> : null}
      <button
        type="button"
        className="btn--tactile-brand"
        style={{ width: "100%", height: "48px" }}
        onClick={open}
        disabled={hydrated && !isContributor}
      >
        {alreadyApplied ? "ĐÃ NỘP ĐƠN" : locked ? (
          <span className="cluster" style={{ gap: "var(--space-2)", justifyContent: "center" }}>
            <Lock weight={ICON_WEIGHT} aria-hidden="true" />
            {`CẦN ${tierLabel(gate.requiredTier).toUpperCase()}`}
          </span>
        ) : "ỨNG TUYỂN NGAY"}
      </button>

      <dialog ref={dialogRef} className="dialog dialog--lg" aria-labelledby="apply-title" style={{ border: "2px solid var(--machinery-border)", borderRadius: 0 }}>
        {status === "done" ? (
          <div className="stack">
            <h2 id="apply-title" className="cluster">
              <CheckCircle weight={ICON_WEIGHT} aria-hidden="true" style={{ color: "var(--color-status-verified)" }} />
              Đã gửi đơn của bạn
            </h2>
            <p>
              Doanh nghiệp sẽ thấy đơn của bạn ngay bây giờ. Bạn không cần gửi lại lần nữa, và có thể rút
              đơn bất cứ lúc nào trước khi được duyệt.
            </p>
            <Alert variant="info">
              Theo dõi trạng thái đơn ở mục <Link href="/student/applications">Đơn của tôi</Link>. Khi
              doanh nghiệp phản hồi, chúng tôi sẽ báo cho bạn qua email.
            </Alert>
            <div className="dialog__actions">
              <Button variant="outline" onClick={() => dialogRef.current?.close()}>Đóng</Button>
              <Link href="/student/applications" className="btn btn--primary">Xem đơn của tôi</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="apply-title">Ứng tuyển: {projectTitle}</h2>
            <p className="text-muted" style={{ marginBlock: "var(--space-2) var(--space-5)" }}>
              Mức {level.label}. Doanh nghiệp chỉ chọn một người cho dự án này, nên phần thư ngỏ là thứ tạo khác biệt.
            </p>

            {standing.status === "error" ? (
              <Alert variant="danger" title="Chưa kiểm tra được điều kiện ứng tuyển">{standing.error.message}</Alert>
            ) : null}

            {ready && locked ? (
              <div className="tier-gate" role="note">
                <div className="cluster cluster--between" style={{ gap: "var(--space-2)" }}>
                  <strong className="cluster" style={{ gap: "var(--space-2)" }}>
                    <Lock weight={ICON_WEIGHT} aria-hidden="true" />
                    Mức {level.label} chưa mở với bạn
                  </strong>
                  <TierBadge tier={ready.experience.tier} />
                </div>
                <p style={{ margin: 0 }}>{gate.message}</p>
                <XpMeter experience={ready.experience} compact />
                <p className="text-caption" style={{ margin: 0 }}>
                  Bạn vẫn đọc được toàn bộ dự án. <Link href="/student/profile">Xem cách lên hạng</Link>
                </p>
              </div>
            ) : null}

            {ready && !ready.readiness.ready ? <ReadinessChecklist readiness={ready.readiness} missingOnly /> : null}

            <div style={{ marginTop: "var(--space-5)" }}>
              <TextAreaField
                id="cover-letter"
                label="Thư ngỏ"
                required
                rows={7}
                value={letter}
                disabled={locked}
                onChange={(event) => setLetter(event.target.value)}
                onBlur={() => setTouched(true)}
                error={letterError}
                hint="Nói rõ bạn đã làm gì tương tự, bạn rảnh vào lúc nào, và phần nào bạn chưa chắc tay."
                placeholder="Em đã làm một trang tương tự cho..."
              />

              {ready && !locked && ready.readiness.emailVerified ? (
                <Field id="apply-cv" label="CV đính kèm (PDF)" required>
                  <CvUploader id="apply-cv" />
                  <p className="field__hint">Doanh nghiệp xem CV này cùng thư ngỏ. Thay CV ở đây cũng cập nhật CV trong hồ sơ của bạn.</p>
                </Field>
              ) : null}
            </div>

            <div className="dialog__actions">
              <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Để sau</Button>
              <Button type="submit" disabled={!canSubmit} loading={status === "submitting"}>Gửi đơn ứng tuyển</Button>
            </div>

            {/* Nút disabled luôn đi kèm lý do (design-tokens.md 3.1). */}
            {blocker ? <p className="hint-disabled" style={{ marginTop: "var(--space-3)", textAlign: "right" }}>{blocker}</p> : null}
          </form>
        )}
      </dialog>
    </>
  );
}

/** Lỗi từ backend viết lại thành việc contributor làm được. */
function applyErrorMessage(error: unknown) {
  if (!(error instanceof ApiRequestError)) return "Không thể gửi đơn. Vui lòng thử lại.";
  switch (error.code) {
    case "APPLICATION_NOT_ELIGIBLE": {
      const missing = Array.isArray(error.details.missing) ? (error.details.missing as string[]) : [];
      return `Chưa gửi được đơn: ${missing.map((code) => MISSING_COPY[code] ?? code).join(" ")}`;
    }
    case "APPLICATION_ALREADY_EXISTS":
      return "Bạn đã có một đơn đang chờ cho dự án này.";
    case "PROJECT_NOT_OPEN":
      return "Doanh nghiệp đã chọn người cho dự án này nên không nhận thêm đơn.";
    case "APPLICATION_COVER_LETTER_LENGTH":
      return "Thư ngỏ cần từ 80 đến 3.000 ký tự.";
    default:
      return error.message;
  }
}

/** Dải yêu cầu hạng ngay trên nút: ai cũng thấy mức dự án cần hạng nào, contributor thấy mình đã đủ chưa. */
function LevelRequirement({ complexity, experience }: { complexity: ProjectLevel; experience: Experience | null }) {
  const level = LEVEL_COPY[complexity];
  // Khách chưa đăng nhập chưa có policy từ backend: chỉ hiện chữ mô tả của mức.
  const requiredByLevel: Record<ProjectLevel, string> = { BASIC: "Mọi hạng", MEDIUM: "Từ hạng Bạc", HIGH: "Chỉ hạng Vàng" };

  if (!experience) {
    return (
      <p className="level-req">
        <span className="level-req__level">Mức {level.label}</span>
        <span>{requiredByLevel[complexity]} tự ứng tuyển được</span>
      </p>
    );
  }
  const gate = levelGate(experience, complexity);
  return (
    <p className="level-req" data-locked={gate.unlocked ? undefined : "true"}>
      <span className="level-req__level">Mức {level.label}</span>
      <span className="cluster" style={{ gap: "var(--space-2)" }}>
        <TierBadge tier={experience.tier} />
        {gate.unlocked ? "Bạn đủ hạng" : `Cần ${tierLabel(gate.requiredTier).toLowerCase()}`}
      </span>
    </p>
  );
}
