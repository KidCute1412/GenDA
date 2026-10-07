"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button, ButtonLink } from "../../../components/ui/button";
import { ErrorState, Skeleton } from "../../../components/ui/feedback";
import { SelectField, TextField } from "../../../components/ui/field";
import { Check, ICON_WEIGHT, WarningCircle } from "../../../components/ui/icons";
import {
  loadStudentProfileData,
  StudentProfileApiError,
  type SkillCatalogItem,
  type StudentProfile,
  type UpdateStudentProfileInput,
  updateStudentProfile
} from "../services/student-profile-api";

type StudyYear = UpdateStudentProfileInput["studyYear"];
type FormState = {
  displayName: string;
  school: string;
  major: string;
  studyYear: StudyYear | "";
  skillCodes: string[];
};
type Errors = Partial<Record<"displayName" | "school" | "major" | "studyYear" | "skills", string>>;

const EMPTY_FORM: FormState = { displayName: "", school: "", major: "", studyYear: "", skillCodes: [] };

const VERIFICATION = {
  UNVERIFIED: {
    variant: "info" as const,
    title: "Bạn chưa xác thực tài khoản sinh viên",
    body: "Bạn có thể hoàn thiện hồ sơ ngay bây giờ. Xác thực sinh viên là bước riêng trước khi nộp đơn ứng tuyển."
  },
  PENDING: {
    variant: "warning" as const,
    title: "Minh chứng đang được xem xét",
    body: "Bạn vẫn có thể cập nhật hồ sơ trong lúc chờ kết quả xác thực."
  },
  VERIFIED: {
    variant: "success" as const,
    title: "Tài khoản sinh viên đã được xác thực",
    body: "Trạng thái xác thực được giữ riêng với các thông tin hồ sơ bạn có thể chỉnh sửa."
  },
  REJECTED: {
    variant: "danger" as const,
    title: "Minh chứng chưa được chấp nhận",
    body: "Thông tin hồ sơ vẫn có thể cập nhật. Vui lòng gửi lại minh chứng ở luồng xác thực khi tính năng này khả dụng."
  }
};

function initialForm(profile: StudentProfile): FormState {
  return {
    displayName: profile.displayName,
    school: profile.school ?? "",
    major: profile.major ?? "",
    studyYear: profile.studyYear ?? "",
    skillCodes: profile.skills.map((skill) => skill.code)
  };
}

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.displayName.trim()) errors.displayName = "Nhập họ và tên của bạn.";
  else if (form.displayName.trim().length > 180) errors.displayName = "Họ và tên không được vượt quá 180 ký tự.";
  if (!form.school.trim()) errors.school = "Nhập trường bạn đang theo học.";
  else if (form.school.trim().length > 180) errors.school = "Tên trường không được vượt quá 180 ký tự.";
  if (!form.major.trim()) errors.major = "Nhập ngành học hiện tại.";
  else if (form.major.trim().length > 180) errors.major = "Tên ngành không được vượt quá 180 ký tự.";
  if (!form.studyYear) errors.studyYear = "Chọn năm học hiện tại.";
  if (form.skillCodes.length === 0) errors.skills = "Chọn ít nhất một kỹ năng.";
  return errors;
}

export function StudentProfileEditor() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState<SkillCatalogItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<StudentProfileApiError | null>(null);
  const [saveError, setSaveError] = useState<StudentProfileApiError | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await loadStudentProfileData();
      setProfile(data.profile);
      setSkills(data.skills);
      setForm(initialForm(data.profile));
    } catch (error) {
      setLoadError(error instanceof StudentProfileApiError ? error : new StudentProfileApiError("PROFILE_LOAD_FAILED", "Không thể tải hồ sơ của bạn."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setSaved(false);
    setSaveError(null);
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleSkill(code: string) {
    const selected = form.skillCodes.includes(code);
    if (!selected && form.skillCodes.length >= 8) return;
    updateField("skillCodes", selected ? form.skillCodes.filter((item) => item !== code) : [...form.skillCodes, code]);
    setErrors((current) => ({ ...current, skills: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSaved(false);
    setSaveError(null);
    if (Object.keys(nextErrors).length > 0 || !form.studyYear) return;

    setSaving(true);
    try {
      const updated = await updateStudentProfile({
        displayName: form.displayName.trim(),
        school: form.school.trim(),
        major: form.major.trim(),
        studyYear: form.studyYear,
        skillCodes: form.skillCodes
      });
      setProfile(updated);
      setForm(initialForm(updated));
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof StudentProfileApiError ? error : new StudentProfileApiError("PROFILE_UPDATE_FAILED", "Không thể lưu hồ sơ. Vui lòng thử lại."));
    } finally {
      setSaving(false);
    }
  }

  if (!profile && !loadError) return <ProfileSkeleton />;
  if (loadError) {
    return (
      <ErrorState
        detail={loadError.message}
        requestId={loadError.requestId}
        action={<Button type="button" variant="outline" onClick={() => void load()}>Thử tải lại</Button>}
      />
    );
  }
  if (!profile) return null;

  const verification = VERIFICATION[profile.verificationStatus as keyof typeof VERIFICATION] ?? VERIFICATION.UNVERIFIED;
  const atSkillLimit = form.skillCodes.length >= 8;

  return (
    <div className="stack stack--lg" style={{ maxWidth: "880px" }}>
      <Alert variant={verification.variant} title={verification.title}>{verification.body}</Alert>

      {!profile.complete ? (
        <Alert variant="warning" title="Hồ sơ chưa hoàn chỉnh">
          Điền đủ thông tin và chọn ít nhất một kỹ năng để hoàn thiện hồ sơ.
        </Alert>
      ) : null}

      <form className="stack stack--lg" onSubmit={submit} noValidate>
        <section className="module-bay" style={{ padding: "var(--space-6)" }}>
          <div className="module-bay__header">
            <span className="module-bay__id">MODULE // 01</span>
            <span>Thông tin cơ bản</span>
          </div>
          <div className="stack" style={{ gap: "var(--space-4)" }}>
            <TextField id="profile-email" label="Email đăng nhập" value={profile.email} readOnly disabled />
            <TextField id="profile-name" label="Họ và tên sinh viên" required autoComplete="name" value={form.displayName} error={errors.displayName} onChange={(event) => updateField("displayName", event.target.value)} />
            <TextField id="profile-school" label="Trường đang theo học" required value={form.school} error={errors.school} onChange={(event) => updateField("school", event.target.value)} />
            <TextField id="profile-major" label="Ngành học hiện tại" required value={form.major} error={errors.major} onChange={(event) => updateField("major", event.target.value)} />
            <SelectField id="profile-study-year" label="Năm học hiện tại" required value={form.studyYear} error={errors.studyYear} onChange={(event) => updateField("studyYear", event.target.value as StudyYear | "")}>
              <option value="">Chọn năm học</option>
              <option value="YEAR_1">Năm 1</option>
              <option value="YEAR_2">Năm 2</option>
              <option value="YEAR_3">Năm 3</option>
              <option value="YEAR_4">Năm 4</option>
              <option value="RECENT_GRADUATE">Mới tốt nghiệp</option>
            </SelectField>
          </div>
        </section>

        <section className="module-bay" style={{ padding: "var(--space-6)" }}>
          <div className="module-bay__header">
            <span className="module-bay__id">MODULE // 02</span>
            <span>Kỹ năng chuẩn</span>
          </div>
          <fieldset className="field" aria-describedby={errors.skills ? "profile-skills-error" : "profile-skills-hint"}>
            <legend className="field__label">
              Kỹ năng của bạn <span className="field__required" aria-hidden="true">*</span>
              <span className="visually-hidden">(bắt buộc)</span>
            </legend>
            <ul className="pill-list" aria-label="Danh mục kỹ năng">
              {skills.map((skill) => {
                const selected = form.skillCodes.includes(skill.code);
                return (
                  <li key={skill.code}>
                    <button type="button" className="chip" aria-pressed={selected} disabled={!selected && atSkillLimit} onClick={() => toggleSkill(skill.code)}>
                      {selected ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                      {skill.name}
                    </button>
                  </li>
                );
              })}
            </ul>
            {errors.skills ? (
              <p className="field__error" id="profile-skills-error">
                <WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />
                {errors.skills}
              </p>
            ) : null}
            <p className="field__hint num" id="profile-skills-hint" aria-live="polite">
              Đã chọn {form.skillCodes.length} trên tối đa 8 kỹ năng.
            </p>
          </fieldset>
        </section>

        <section className="module-bay" style={{ padding: "var(--space-6)" }}>
          <div className="module-bay__header">
            <span className="module-bay__id">MODULE // 03</span>
            <span>CV sinh viên</span>
          </div>
          <p className="text-muted">CV được quản lý ở luồng riêng và không được ghi nhận giả như một phần của lần lưu hồ sơ này.</p>
          <ButtonLink href="/student/cv" variant="outline">Đi đến trang CV</ButtonLink>
        </section>

        {saveError ? (
          <Alert variant="danger" title="Chưa lưu được hồ sơ" live="assertive">
            <p>{saveError.message}</p>
            {saveError.requestId ? <p className="text-caption num">Mã yêu cầu: {saveError.requestId}</p> : null}
          </Alert>
        ) : null}
        {saved ? <Alert variant="success" title="Đã lưu hồ sơ" live="polite">Thông tin mới đã được cập nhật thành công.</Alert> : null}

        <div><Button type="submit" loading={saving}>Lưu hồ sơ</Button></div>
      </form>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="stack stack--lg" style={{ maxWidth: "880px" }} aria-busy="true" aria-label="Đang tải hồ sơ">
      <Skeleton height="5rem" />
      <section className="module-bay" style={{ padding: "var(--space-6)" }}>
        <div className="stack">
          <Skeleton width="35%" height="1.25rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
        </div>
      </section>
    </div>
  );
}
