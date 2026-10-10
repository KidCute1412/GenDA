"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/feedback";
import { TextAreaField, TextField } from "../../../components/ui/field";
import { ApiRequestError } from "../../auth/services/session-request";
import { getSmeProfile, saveSmeProfile, type SmeProfile } from "../services/sme-profile-api";

export function SmeProfileForm() {
  const [profile, setProfile] = useState<SmeProfile | null>(null);
  const [form, setForm] = useState({ displayName: "", description: "", industry: "" });
  const [error, setError] = useState<{ message: string; requestId?: string } | null>(null);
  const [nameError, setNameError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    getSmeProfile().then((data) => {
      if (!active) return;
      setProfile(data);
      setForm({ displayName: data.displayName, description: data.description ?? "", industry: data.industry ?? "" });
    }).catch((cause) => {
      if (active) setError({ message: cause instanceof Error ? cause.message : "Không thể tải hồ sơ doanh nghiệp.", requestId: cause instanceof ApiRequestError ? cause.requestId : undefined });
    });
    return () => { active = false; };
  }, [attempt]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setSaved(false);
    if (!form.displayName.trim()) { setNameError("Nhập tên doanh nghiệp."); return; }
    setNameError("");
    setError(null);
    setBusy(true);
    try {
      const data = await saveSmeProfile(form);
      setProfile(data);
      setForm({ displayName: data.displayName, description: data.description ?? "", industry: data.industry ?? "" });
      setSaved(true);
    } catch (cause) {
      setError({ message: cause instanceof Error ? cause.message : "Không thể lưu hồ sơ doanh nghiệp.", requestId: cause instanceof ApiRequestError ? cause.requestId : undefined });
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return error ? (
      <Alert variant="danger" title="Chưa tải được hồ sơ">
        <p>{error.message}</p>
        {error.requestId ? <p className="text-caption num">Mã yêu cầu: {error.requestId}</p> : null}
        <Button type="button" variant="outline" onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>
      </Alert>
    ) : <Skeleton height="12rem" />;
  }

  return (
    <form className="module-bay stack" style={{ padding: "var(--space-6)" }} aria-label="Hồ sơ doanh nghiệp" onSubmit={submit}>
      <h2>Thông tin doanh nghiệp</h2>
      <p className="text-muted">Thông tin do doanh nghiệp tự khai, chưa được GenDA xác minh.</p>
      {error ? <Alert variant="danger" title="Chưa lưu được hồ sơ" live="assertive">
        {error.message} Nhấn Lưu hồ sơ để thử lại.
        {error.requestId ? <p className="text-caption num">Mã yêu cầu: {error.requestId}</p> : null}
      </Alert> : null}
      {saved ? <Alert variant="success" title="Đã lưu hồ sơ" live="polite">Thông tin doanh nghiệp đã được cập nhật.</Alert> : null}
      <fieldset className="stack" disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="visually-hidden">Thông tin doanh nghiệp</legend>
        <TextField id="sme-name" label="Tên doanh nghiệp" required maxLength={180} value={form.displayName} error={nameError || undefined} onBlur={() => setNameError(form.displayName.trim() ? "" : "Nhập tên doanh nghiệp.")} onChange={(event) => update("displayName", event.target.value)} />
        <TextField id="sme-industry" label="Lĩnh vực hoạt động" maxLength={120} value={form.industry} onChange={(event) => update("industry", event.target.value)} />
        <TextAreaField id="sme-description" label="Mô tả doanh nghiệp" rows={4} maxLength={2000} value={form.description} onChange={(event) => update("description", event.target.value)} />
        <TextField id="sme-email" label="Email đăng nhập" type="email" value={profile.email} readOnly />
        <TextField id="sme-tax-code" label="Mã số thuế đăng ký" value={profile.taxCode ?? ""} readOnly hint="Thông tin đã khai khi đăng ký; không chỉnh sửa tại đây." />
        <TextField id="sme-website" label="Website đăng ký" type="url" value={profile.companyWebsite ?? ""} readOnly />
      </fieldset>
      <div><Button type="submit" loading={busy}>Lưu hồ sơ</Button></div>
      {busy ? <p role="status">Đang lưu hồ sơ...</p> : null}
    </form>
  );
}
