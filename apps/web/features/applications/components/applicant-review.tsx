"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/feedback";
import { Check, CheckCircle, ICON_WEIGHT, Star } from "../../../components/ui/icons";
import { formatDate } from "../../../lib/utils/format";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { ApiRequestError } from "../../auth/services/session-request";
import { mirrorAcceptedApplication } from "../../demo-ledger/store";
import { LEVEL_COPY } from "../../projects/level-copy";
import { getMyProject, type ManagedProject } from "../../projects/sme-api";
import { TierBadge } from "../../users/components/tier-insignia";
import { BACKGROUND_COPY, EDUCATION_LEVEL_COPY, EDUCATION_STATUS_COPY, formatPeriod } from "../../users/profile-copy";
import type { BackgroundType, EducationLevel, EducationStatus } from "../../users/services/contributor-api";
import {
  acceptApplicant,
  fetchApplicantCv,
  listApplicants,
  openPdf,
  shortlistApplicant,
  type Applicant,
  type ProjectApplicants
} from "../services/applications-api";

const STATUS_COPY: Record<Applicant["status"], string> = {
  SUBMITTED: "Đơn mới",
  SHORTLISTED: "Trong danh sách rút gọn",
  ACCEPTED: "Đã được chọn",
  REJECTED: "Không được chọn",
  WITHDRAWN: "Đã rút đơn"
};

/**
 * Màn hình 5, xét và chọn ứng viên (design.md 7.5, FR-APP-03..05, FR-MAT-03). Ứng viên xếp theo độ khớp kỹ năng,
 * điểm luôn đi kèm diễn giải "khớp mấy trên mấy". Hạng và XP là lịch sử hoàn thành trên GenDA; hồ sơ và học vấn
 * là thông tin tự khai. Chọn một người thì mọi đơn còn lại tự đóng.
 */
export function ApplicantReview({ projectId }: { projectId: string }) {
  const { session } = useAuthSession();
  const [data, setData] = useState<ProjectApplicants | null>(null);
  const [project, setProject] = useState<ManagedProject | null>(null);
  const [loadError, setLoadError] = useState<ApiRequestError | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Applicant | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const load = useCallback(async () => {
    try {
      const [applicants, managed] = await Promise.all([listApplicants(projectId), getMyProject(projectId)]);
      setData(applicants);
      setProject(managed);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof ApiRequestError ? error : new ApiRequestError("LOAD_FAILED", "Không thể tải danh sách ứng viên.", 0));
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function shortlist(applicant: Applicant) {
    setBusy(applicant.applicationId);
    setActionError(null);
    try {
      await shortlistApplicant(applicant.applicationId);
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể đưa vào danh sách rút gọn.");
    } finally {
      setBusy(null);
    }
  }

  function askAccept(applicant: Applicant) {
    setConfirming(applicant);
    dialogRef.current?.showModal();
  }

  async function accept() {
    if (!confirming) return;
    setBusy(confirming.applicationId);
    setActionError(null);
    try {
      const chosen = await acceptApplicant(confirming.applicationId);
      if (project && session && chosen.contactEmail) {
        mirrorAcceptedApplication({
          project: {
            id: project.id,
            title: project.title,
            smeName: project.smeName,
            smeContact: session.email,
            budget: project.budget ?? 0,
            deadline: project.deadline ?? "",
            summary: project.summary ?? "",
            problem: project.problem ?? "",
            skills: project.skills.map((skill) => skill.name),
            acceptance: project.acceptanceCriteria,
            milestones: project.milestones.map((milestone) => ({
              order: milestone.order,
              title: milestone.title ?? "",
              budget: milestone.budget,
              deadline: milestone.deadline ?? "",
              criteria: milestone.criteria.join(" · ")
            }))
          },
          sme: { email: session.email, name: session.name },
          contributor: { email: chosen.contactEmail, name: chosen.displayName },
          application: { id: chosen.applicationId, coverLetter: chosen.coverLetter, submittedAt: chosen.submittedAt }
        });
      }
      dialogRef.current?.close();
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể chấp nhận ứng viên.");
      dialogRef.current?.close();
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  async function openCv(applicant: Applicant) {
    setActionError(null);
    try {
      await openPdf(() => fetchApplicantCv(applicant.applicationId));
    } catch {
      setActionError("Không mở được CV của ứng viên này.");
    }
  }

  if (loadError) {
    return <ErrorState detail={loadError.message} requestId={loadError.requestId} action={<Button type="button" variant="outline" onClick={() => void load()}>Thử tải lại</Button>} />;
  }
  if (!data) return <div className="stack"><Skeleton height="6rem" /><Skeleton height="18rem" /></div>;

  const open = data.projectStatus === "PUBLISHED";
  const chosen = data.applicants.find((applicant) => applicant.status === "ACCEPTED");
  const others = data.applicants.filter((applicant) => applicant.status === "SUBMITTED" || applicant.status === "SHORTLISTED").length;

  return (
    <div className="stack stack--lg">
      <div>
        <h1 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, textTransform: "uppercase", margin: "var(--space-1) 0" }}>
          Xét duyệt ứng viên
        </h1>
        <p className="text-muted" style={{ margin: 0, fontSize: "13px", maxWidth: "70ch" }}>
          <strong style={{ color: "var(--color-text-heading)" }}>{data.projectTitle}</strong> · Mức {LEVEL_COPY[data.complexity].label} · {data.applicants.length} ứng viên.
          {open ? " Bạn chọn đúng một người; các đơn còn lại tự đóng." : null}
        </p>
      </div>

      {actionError ? <Alert variant="danger" title="Chưa thực hiện được" live="assertive">{actionError}</Alert> : null}

      {chosen ? (
        <Alert variant="success" title={`Bạn đã chọn ${chosen.displayName}`} live="polite">
          <p style={{ margin: 0 }}>
            Dự án đã bắt đầu. Liên hệ: <strong>{chosen.contactEmail}</strong>.{" "}
            <Link href={`/workspace/${data.projectId}?ledger=1`}>Vào workspace</Link>
          </p>
        </Alert>
      ) : null}

      {data.applicants.length === 0 ? (
        <div className="module-bay module-bay--static" style={{ padding: "var(--space-10)", textAlign: "center" }}>
          <EmptyState
            title="CHƯA CÓ ĐƠN ỨNG TUYỂN NÀO"
            advice="Dự án vừa xuất bản thường nhận đơn sau 1-2 ngày. Trong lúc chờ, bạn có thể đọc lại đề bài công khai như một ứng viên."
            action={<Link href={`/projects/${data.projectId}`} className="btn--tactile-zinc" style={{ height: "40px", fontSize: "12px", textDecoration: "none" }}>XEM ĐỀ BÀI CÔNG KHAI</Link>}
          />
        </div>
      ) : (
        <ol className="applicant-list">
          {data.applicants.map((applicant, index) => (
            <li key={applicant.applicationId}>
              <ApplicantCard
                applicant={applicant}
                rank={index + 1}
                projectSkillCount={data.projectSkills.length}
                open={open}
                busy={busy === applicant.applicationId}
                onShortlist={() => void shortlist(applicant)}
                onAccept={() => askAccept(applicant)}
                onOpenCv={() => void openCv(applicant)}
              />
            </li>
          ))}
        </ol>
      )}

      <dialog ref={dialogRef} className="dialog" aria-labelledby="accept-title" style={{ border: "2px solid var(--machinery-border)", borderRadius: 0 }} onClose={() => setConfirming(null)}>
        {confirming ? (
          <div className="stack">
            <h2 id="accept-title">Chọn {confirming.displayName}?</h2>
            <p style={{ margin: 0 }}>
              Dự án bắt đầu ngay với {confirming.displayName}.{" "}
              {others > 1 ? `${others - 1} đơn còn lại sẽ tự chuyển sang "Không được chọn".` : "Không còn đơn nào khác đang chờ."} Bạn không hoàn tác được bước này.
            </p>
            <div className="dialog__actions">
              <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Để sau</Button>
              <Button type="button" loading={busy === confirming.applicationId} onClick={() => void accept()}>Chấp nhận ứng viên</Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ApplicantCard({
  applicant,
  rank,
  projectSkillCount,
  open,
  busy,
  onShortlist,
  onAccept,
  onOpenCv
}: {
  applicant: Applicant;
  rank: number;
  projectSkillCount: number;
  open: boolean;
  busy: boolean;
  onShortlist: () => void;
  onAccept: () => void;
  onOpenCv: () => void;
}) {
  const decided = applicant.status === "ACCEPTED" || applicant.status === "REJECTED";
  const background = applicant.backgroundType ? BACKGROUND_COPY[applicant.backgroundType as BackgroundType] : null;
  const { basic, medium, high } = applicant.completedProjects;

  return (
    <article className="applicant-card" data-status={applicant.status} aria-labelledby={`applicant-${applicant.applicationId}`}>
      <div className="module-bay__header">
        <span className="module-bay__id">ỨNG VIÊN // {String(rank).padStart(2, "0")}</span>
        <span className="applicant-card__status">
          {applicant.status === "SHORTLISTED" ? <Star weight="fill" aria-hidden="true" /> : null}
          {applicant.status === "ACCEPTED" ? <CheckCircle weight={ICON_WEIGHT} aria-hidden="true" /> : null}
          {STATUS_COPY[applicant.status]}
        </span>
      </div>

      <div className="applicant-card__top">
        <div className="stack stack--sm" style={{ minWidth: 0 }}>
          <h2 id={`applicant-${applicant.applicationId}`} className="applicant-card__name">{applicant.displayName}</h2>
          <div className="cluster" style={{ gap: "var(--space-2)" }}>
            <TierBadge tier={applicant.tier} />
            <span className="applicant-card__xp num">{applicant.totalXp} XP</span>
          </div>
          <p className="text-muted" style={{ margin: 0, fontSize: "13px" }}>
            {[background, applicant.specialization].filter(Boolean).join(" · ") || "Chưa khai nền tảng"} · Nộp ngày {formatDate(applicant.submittedAt.slice(0, 10))}
          </p>
        </div>

        <div className="applicant-card__match" aria-label={`Độ khớp ${applicant.match.percent}%: khớp ${applicant.match.matchedSkills} trên ${applicant.match.totalSkills} kỹ năng dự án`}>
          <span className="applicant-card__match-label">ĐỘ KHỚP</span>
          <strong className="num">{applicant.match.percent}%</strong>
          <span className="text-caption num">Khớp {applicant.match.matchedSkills}/{applicant.match.totalSkills || projectSkillCount} kỹ năng</span>
        </div>
      </div>

      <p className="applicant-card__record-label">Dự án đã hoàn thành trên GenDA</p>
      <dl className="applicant-card__record num" aria-label="Số dự án đã hoàn thành trên GenDA theo mức">
        <div><dt>Cơ bản</dt><dd>{basic}</dd></div>
        <div><dt>Trung bình</dt><dd>{medium}</dd></div>
        <div><dt>Nâng cao</dt><dd>{high}</dd></div>
      </dl>

      <ul className="pill-list" aria-label="Kỹ năng ứng viên tự khai">
        {applicant.skills.map((skill) => (
          <li key={skill.code} className={`skill-pill ${skill.matched ? "skill-pill--matched" : ""}`}>
            {skill.matched ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
            {skill.name}
            {skill.matched ? <span className="visually-hidden">(dự án cần kỹ năng này)</span> : null}
          </li>
        ))}
      </ul>

      <blockquote className="applicant-card__letter">{applicant.coverLetter}</blockquote>

      {applicant.education.length > 0 ? (
        <details className="applicant-card__education">
          <summary>Học vấn tự khai ({applicant.education.length})</summary>
          <ul>
            {applicant.education.map((entry, index) => (
              <li key={index}>
                <strong>{entry.institution}</strong> · {entry.fieldOfStudy} · {EDUCATION_LEVEL_COPY[entry.level as EducationLevel]}
                <span className="text-caption"> · {formatPeriod(entry.startMonth, entry.endMonth, entry.status as EducationStatus)} · {EDUCATION_STATUS_COPY[entry.status as EducationStatus]}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="applicant-card__actions">
        {applicant.cv ? (
          <Button type="button" variant="outline" size="sm" onClick={onOpenCv}>Xem CV ({applicant.cv.pageCount} trang)</Button>
        ) : (
          <span className="text-caption">Ứng viên chưa có CV hợp lệ.</span>
        )}
        {open && !decided ? (
          <div className="cluster" style={{ gap: "var(--space-2)" }}>
            {applicant.status === "SUBMITTED" ? (
              <Button type="button" variant="outline" size="sm" loading={busy} onClick={onShortlist}>Đưa vào rút gọn</Button>
            ) : null}
            <Button type="button" size="sm" disabled={busy} onClick={onAccept}>Chấp nhận</Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
