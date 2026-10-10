"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/feedback";
import { SelectField, TextAreaField, TextField } from "../../../components/ui/field";
import { ICON_WEIGHT, PencilSimple, Plus, Trash } from "../../../components/ui/icons";
import { ApiRequestError } from "../../auth/services/session-request";
import { EDUCATION_LEVEL_COPY, EDUCATION_STATUS_COPY, formatPeriod } from "../profile-copy";
import {
  addEducation,
  deleteEducation,
  listEducation,
  updateEducation,
  type EducationEntry,
  type EducationInput,
  type EducationLevel,
  type EducationStatus
} from "../services/contributor-api";

const MAX_ENTRIES = 10;

type Draft = {
  institution: string;
  fieldOfStudy: string;
  level: EducationLevel | "";
  degreeName: string;
  startMonth: string;
  endMonth: string;
  status: EducationStatus | "";
  description: string;
};
type DraftErrors = Partial<Record<keyof Draft, string>>;

const EMPTY: Draft = { institution: "", fieldOfStudy: "", level: "", degreeName: "", startMonth: "", endMonth: "", status: "", description: "" };

function currentMonth() {
  // Tháng hiện tại theo giờ Việt Nam, cùng mốc với backend.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
}

function toDraft(entry: EducationEntry): Draft {
  return {
    institution: entry.institution,
    fieldOfStudy: entry.fieldOfStudy,
    level: entry.level,
    degreeName: entry.degreeName ?? "",
    startMonth: entry.startMonth ?? "",
    endMonth: entry.endMonth ?? "",
    status: entry.status,
    description: entry.description ?? ""
  };
}

function validate(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  const now = currentMonth();
  if (!draft.institution.trim()) errors.institution = "Nhập tên trường hoặc cơ sở đào tạo.";
  if (!draft.fieldOfStudy.trim()) errors.fieldOfStudy = "Nhập chuyên ngành hoặc nội dung khóa học.";
  if (!draft.level) errors.level = "Chọn bậc học.";
  if (!draft.status) errors.status = "Chọn trạng thái học tập.";
  if (!draft.startMonth) errors.startMonth = "Chọn tháng bắt đầu.";
  else if (draft.startMonth > now) errors.startMonth = "Tháng bắt đầu không thể ở tương lai.";
  if (draft.endMonth && draft.startMonth && draft.endMonth < draft.startMonth) errors.endMonth = "Tháng kết thúc phải sau tháng bắt đầu.";
  else if (draft.status && draft.status !== "CURRENTLY_STUDYING") {
    if (!draft.endMonth) errors.endMonth = "Chọn tháng kết thúc.";
    else if (draft.endMonth > now) errors.endMonth = "Đã kết thúc thì tháng kết thúc không thể ở tương lai.";
  }
  return errors;
}

function toInput(draft: Draft): EducationInput {
  return {
    institution: draft.institution.trim(),
    fieldOfStudy: draft.fieldOfStudy.trim(),
    level: draft.level as EducationLevel,
    degreeName: draft.degreeName.trim() || undefined,
    startMonth: draft.startMonth,
    endMonth: draft.endMonth || undefined,
    status: draft.status as EducationStatus,
    description: draft.description.trim() || undefined
  };
}

/**
 * Học vấn tự khai (design.md 7.2, FR-USR-10..11). Mục tùy chọn: không có học vấn vẫn đủ điều kiện ứng tuyển.
 * Mỗi bản ghi mang nhãn trung tính "Thông tin tự khai", không có màu hay icon xác thực.
 */
export function EducationSection() {
  const [entries, setEntries] = useState<EducationEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    listEducation().then(setEntries).catch((cause) => {
      setEntries([]);
      setError(cause instanceof Error ? cause.message : "Không thể tải học vấn.");
    });
  }, []);

  async function remove(id: string) {
    setError(null);
    try {
      await deleteEducation(id);
      setEntries((current) => current?.filter((entry) => entry.id !== id) ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xóa học vấn.");
    } finally {
      setConfirmDelete(null);
    }
  }

  function saved(entry: EducationEntry) {
    setEntries((current) => {
      const others = (current ?? []).filter((item) => item.id !== entry.id);
      return [entry, ...others].sort((a, b) => (b.startMonth ?? "").localeCompare(a.startMonth ?? ""));
    });
    setEditing(null);
  }

  if (entries === null) return <Skeleton height="6rem" />;

  return (
    <div className="stack">
      {error ? <Alert variant="danger" title="Có lỗi với mục học vấn" live="assertive">{error}</Alert> : null}

      {entries.length === 0 && editing !== "new" ? (
        <p className="text-muted" style={{ margin: 0 }}>
          Mục này tùy chọn. Bạn có thể ứng tuyển mà không khai học vấn; nếu khai, doanh nghiệp hiểu rõ bối cảnh của bạn hơn.
        </p>
      ) : null}

      <ul className="edu-list">
        {entries.map((entry) =>
          editing === entry.id ? (
            <li key={entry.id}><EducationForm initial={toDraft(entry)} entryId={entry.id} onSaved={saved} onCancel={() => setEditing(null)} /></li>
          ) : (
            <li key={entry.id} className="edu-card">
              <div className="edu-card__main">
                <strong className="edu-card__school">{entry.institution}</strong>
                <span>
                  {entry.fieldOfStudy} · {EDUCATION_LEVEL_COPY[entry.level]}
                  {entry.degreeName ? ` · ${entry.degreeName}` : ""}
                </span>
                <span className="text-caption num">
                  {formatPeriod(entry.startMonth, entry.endMonth, entry.status)} · {EDUCATION_STATUS_COPY[entry.status]}
                </span>
                {entry.description ? <p className="edu-card__note">{entry.description}</p> : null}
                <span className="edu-card__self">Thông tin tự khai</span>
              </div>
              <div className="edu-card__actions">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(entry.id)} aria-label={`Sửa học vấn ${entry.institution}`}>
                  <PencilSimple weight={ICON_WEIGHT} aria-hidden="true" /> Sửa
                </Button>
                {confirmDelete === entry.id ? (
                  <Button type="button" variant="danger" size="sm" onClick={() => void remove(entry.id)}>Xác nhận xóa</Button>
                ) : (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(entry.id)} aria-label={`Xóa học vấn ${entry.institution}`}>
                    <Trash weight={ICON_WEIGHT} aria-hidden="true" /> Xóa
                  </Button>
                )}
              </div>
            </li>
          )
        )}
      </ul>

      {editing === "new" ? (
        <EducationForm initial={EMPTY} onSaved={saved} onCancel={() => setEditing(null)} />
      ) : entries.length < MAX_ENTRIES ? (
        <div>
          <Button type="button" variant="outline" onClick={() => setEditing("new")}>
            <Plus weight={ICON_WEIGHT} aria-hidden="true" /> Thêm học vấn
          </Button>
        </div>
      ) : (
        <p className="field__hint">Bạn đã khai đủ {MAX_ENTRIES} mục học vấn.</p>
      )}
    </div>
  );
}

function EducationForm({
  initial,
  entryId,
  onSaved,
  onCancel
}: {
  initial: Draft;
  entryId?: string;
  onSaved: (entry: EducationEntry) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prefix = entryId ? `edu-${entryId.slice(0, 8)}` : "edu-new";
  const studying = draft.status === "CURRENTLY_STUDYING";

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      onSaved(entryId ? await updateEducation(entryId, toInput(draft)) : await addEducation(toInput(draft)));
    } catch (cause) {
      setSaveError(cause instanceof ApiRequestError && cause.code === "EDUCATION_INVALID_PERIOD"
        ? "Thời gian chưa hợp lệ. Kiểm tra lại tháng bắt đầu, tháng kết thúc và trạng thái."
        : cause instanceof Error ? cause.message : "Không thể lưu học vấn.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="edu-form stack" onSubmit={submit} noValidate aria-label={entryId ? "Sửa học vấn" : "Thêm học vấn"}>
      <TextField id={`${prefix}-institution`} label="Trường hoặc cơ sở đào tạo" required value={draft.institution} error={errors.institution} onChange={(event) => update("institution", event.target.value)} />
      <div className="edu-form__grid">
        <TextField id={`${prefix}-field`} label="Chuyên ngành" required value={draft.fieldOfStudy} error={errors.fieldOfStudy} onChange={(event) => update("fieldOfStudy", event.target.value)} />
        <SelectField id={`${prefix}-level`} label="Bậc học" required value={draft.level} error={errors.level} onChange={(event) => update("level", event.target.value as EducationLevel)}>
          <option value="">Chọn bậc học</option>
          {Object.entries(EDUCATION_LEVEL_COPY).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectField>
        <SelectField id={`${prefix}-status`} label="Trạng thái" required value={draft.status} error={errors.status} onChange={(event) => update("status", event.target.value as EducationStatus)}>
          <option value="">Chọn trạng thái</option>
          {Object.entries(EDUCATION_STATUS_COPY).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectField>
        <TextField id={`${prefix}-degree`} label="Tên bằng cấp (nếu có)" value={draft.degreeName} onChange={(event) => update("degreeName", event.target.value)} />
        <TextField id={`${prefix}-start`} type="month" label="Tháng bắt đầu" required max={currentMonth()} value={draft.startMonth} error={errors.startMonth} onChange={(event) => update("startMonth", event.target.value)} />
        <TextField id={`${prefix}-end`} type="month" label={studying ? "Dự kiến kết thúc" : "Tháng kết thúc"} required={!studying && draft.status !== ""} value={draft.endMonth} error={errors.endMonth} hint={studying ? "Có thể để trống nếu chưa biết." : undefined} onChange={(event) => update("endMonth", event.target.value)} />
      </div>
      <TextAreaField id={`${prefix}-description`} label="Mô tả (không bắt buộc)" rows={3} maxLength={1000} value={draft.description} onChange={(event) => update("description", event.target.value)} />
      {saveError ? <Alert variant="danger" title="Chưa lưu được học vấn" live="assertive">{saveError}</Alert> : null}
      <div className="cluster" style={{ gap: "var(--space-2)" }}>
        <Button type="submit" loading={saving}>{entryId ? "Lưu thay đổi" : "Thêm vào hồ sơ"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}
