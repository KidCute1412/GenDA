"use client";

import { FormEvent, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/field";
import { Check, ICON_WEIGHT, WarningCircle } from "../../../components/ui/icons";
import { ApiRequestError } from "../../auth/services/session-request";
import { announceStandingChanged } from "../hooks/use-contributor-standing";
import { BACKGROUND_COPY, BACKGROUND_ORDER } from "../profile-copy";
import { saveProfile, type BackgroundType, type ContributorProfile, type SkillCatalogItem } from "../services/contributor-api";

const MAX_SKILLS = 8;

type Form = { displayName: string; backgroundType: BackgroundType | ""; specialization: string; skillCodes: string[] };
type Errors = Partial<Record<"displayName" | "backgroundType" | "specialization" | "skills", string>>;

function toForm(profile: ContributorProfile): Form {
  return {
    displayName: profile.displayName,
    backgroundType: profile.backgroundType ?? "",
    specialization: profile.specialization ?? "",
    skillCodes: profile.skills.map((skill) => skill.code)
  };
}

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.displayName.trim()) errors.displayName = "Nhập họ và tên của bạn.";
  else if (form.displayName.trim().length > 180) errors.displayName = "Họ và tên tối đa 180 ký tự.";
  if (!form.backgroundType) errors.backgroundType = "Chọn nền tảng gần đúng nhất với bạn.";
  if (!form.specialization.trim()) errors.specialization = "Nhập chuyên môn bạn muốn nhận việc, ví dụ Thiết kế UI hay Viết nội dung.";
  else if (form.specialization.trim().length > 180) errors.specialization = "Chuyên môn tối đa 180 ký tự.";
  if (form.skillCodes.length === 0) errors.skills = "Chọn ít nhất một kỹ năng.";
  return errors;
}

/** Thông tin nền tảng tự khai (design.md 7.2): loại nền tảng, chuyên môn và kỹ năng chuẩn. */
export function ContributorProfileForm({
  profile,
  skills,
  onSaved
}: {
  profile: ContributorProfile;
  skills: SkillCatalogItem[];
  onSaved: (profile: ContributorProfile) => void;
}) {
  const [form, setForm] = useState<Form>(() => toForm(profile));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<ApiRequestError | null>(null);

  function update<K extends keyof Form>(field: K, value: Form[K]) {
    setSaved(false);
    setSaveError(null);
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field === "skillCodes" ? "skills" : field]: undefined }));
  }

  function toggleSkill(code: string) {
    const selected = form.skillCodes.includes(code);
    if (!selected && form.skillCodes.length >= MAX_SKILLS) return;
    update("skillCodes", selected ? form.skillCodes.filter((item) => item !== code) : [...form.skillCodes, code]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0 || !form.backgroundType) return;
    setSaving(true);
    try {
      const updated = await saveProfile({
        displayName: form.displayName.trim(),
        backgroundType: form.backgroundType,
        specialization: form.specialization.trim(),
        skillCodes: form.skillCodes
      });
      setForm(toForm(updated));
      setSaved(true);
      onSaved(updated);
      announceStandingChanged();
    } catch (error) {
      setSaveError(error instanceof ApiRequestError ? error : new ApiRequestError("PROFILE_UPDATE_FAILED", "Không thể lưu hồ sơ. Vui lòng thử lại.", 0));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate id="profile-form">
      <TextField id="profile-email" label="Email đăng nhập" value={profile.email} readOnly disabled />
      <TextField id="profile-name" label="Họ và tên" required autoComplete="name" value={form.displayName} error={errors.displayName} onChange={(event) => update("displayName", event.target.value)} />

      <fieldset className="field" aria-describedby={errors.backgroundType ? "profile-background-error" : "profile-background-hint"}>
        <legend className="field__label">
          Nền tảng hiện tại <span className="field__required" aria-hidden="true">*</span>
          <span className="visually-hidden">(bắt buộc)</span>
        </legend>
        <div className="choice-pills">
          {BACKGROUND_ORDER.map((type) => (
            <label key={type} className="choice-pill" data-checked={form.backgroundType === type ? "true" : undefined}>
              <input type="radio" name="background-type" value={type} checked={form.backgroundType === type} onChange={() => update("backgroundType", type)} />
              {BACKGROUND_COPY[type]}
            </label>
          ))}
        </div>
        {errors.backgroundType ? (
          <p className="field__error" id="profile-background-error"><WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />{errors.backgroundType}</p>
        ) : (
          <p className="field__hint" id="profile-background-hint">Thông tin tự khai. GenDA không xác minh và không gắn huy hiệu cho mục này.</p>
        )}
      </fieldset>

      <TextField id="profile-specialization" label="Chuyên môn" required value={form.specialization} error={errors.specialization} hint="Việc bạn muốn nhận, viết ngắn gọn." onChange={(event) => update("specialization", event.target.value)} />

      <fieldset className="field" aria-describedby={errors.skills ? "profile-skills-error" : "profile-skills-hint"}>
        <legend className="field__label">
          Kỹ năng chuẩn <span className="field__required" aria-hidden="true">*</span>
          <span className="visually-hidden">(bắt buộc)</span>
        </legend>
        <ul className="pill-list" aria-label="Danh mục kỹ năng">
          {skills.map((skill) => {
            const selected = form.skillCodes.includes(skill.code);
            return (
              <li key={skill.code}>
                <button type="button" className="chip" aria-pressed={selected} disabled={!selected && form.skillCodes.length >= MAX_SKILLS} onClick={() => toggleSkill(skill.code)}>
                  {selected ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                  {skill.name}
                </button>
              </li>
            );
          })}
        </ul>
        {errors.skills ? (
          <p className="field__error" id="profile-skills-error"><WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />{errors.skills}</p>
        ) : null}
        <p className="field__hint num" id="profile-skills-hint" aria-live="polite">
          Đã chọn {form.skillCodes.length}/{MAX_SKILLS}. Kỹ năng chọn trước hiện trước trên hồ sơ.
        </p>
      </fieldset>

      {saveError ? (
        <Alert variant="danger" title="Chưa lưu được hồ sơ" live="assertive">
          <p>{saveError.message}</p>
          {saveError.requestId ? <p className="text-caption num">Mã yêu cầu: {saveError.requestId}</p> : null}
        </Alert>
      ) : null}
      {saved ? <Alert variant="success" title="Đã lưu hồ sơ" live="polite">Hồ sơ của bạn đã được cập nhật.</Alert> : null}

      <div><Button type="submit" loading={saving}>Lưu hồ sơ</Button></div>
    </form>
  );
}
