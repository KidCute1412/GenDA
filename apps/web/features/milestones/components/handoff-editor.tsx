"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Field, TextAreaField } from "../../../components/ui/field";
import { ErrorState } from "../../../components/ui/feedback";
import { ApiRequestError } from "../../auth/services/session-request";
import { uploadAttachment, submitHandoff, type Attachment, type ExecutionMilestone } from "../services/milestones-api";

export function HandoffEditor({ milestone, storageAvailable, reload }: { milestone: ExecutionMilestone; storageAvailable: boolean; reload: () => Promise<void> }) {
  const [note, setNote] = useState("");
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [fieldError, setFieldError] = useState("");
  const parsedLinks = links.split("\n").map(link => link.trim()).filter(Boolean);
  function validate() {
    let message = "";
    if (!note.trim() && !parsedLinks.length && !files.length) message = "Thêm ghi chú, liên kết hoặc tệp để bàn giao.";
    else if (parsedLinks.length > 5 || parsedLinks.some(link => { try { const url = new URL(link); return !["http:", "https:"].includes(url.protocol) || Boolean(url.username || url.password); } catch { return true; } })) message = "Nhập tối đa 5 liên kết HTTP/HTTPS hợp lệ, mỗi dòng một liên kết.";
    setFieldError(message); return !message;
  }
  async function upload(selected: File[]) {
    setBusy(true); setError(null);
    try {
      if (files.length + selected.length > 5 || selected.some(file => file.size > 5 * 1024 * 1024 || !/\.(pdf|txt)$/i.test(file.name))) throw new ApiRequestError("FILE_INVALID", "Tối đa 5 tệp PDF/TXT, mỗi tệp không quá 5 MB.", 0);
      for (const file of selected) {
        const uploaded = await uploadAttachment(milestone.id, file);
        setFiles(current => [...current, uploaded]);
      }
    } catch (e) { setError(e instanceof ApiRequestError ? e : new ApiRequestError("UPLOAD_FAILED", "Không thể tải tệp lên.", 0)); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!validate()) return;
    setBusy(true); setError(null);
    try { await submitHandoff(milestone.id, { expectedRevision: milestone.revision, note, links: parsedLinks, attachmentIds: files.map(file => file.id) }); await reload(); }
    catch (e) { setError(e instanceof ApiRequestError ? e : new ApiRequestError("SUBMIT_FAILED", "Chưa nộp được bàn giao. Nội dung bạn nhập vẫn được giữ.", 0)); }
    finally { setBusy(false); }
  }
  return <section className="card stack" aria-label="Nộp bàn giao">
    <h3>{milestone.status === "CHANGES_REQUESTED" ? "Nộp bản chỉnh sửa" : "Nộp bàn giao"}</h3>
    <TextAreaField id="handoff-note" label="Ghi chú bàn giao" maxLength={10000} value={note} onChange={e => setNote(e.target.value)} onBlur={validate} rows={5} error={fieldError || undefined} />
    <TextAreaField id="handoff-links" label="Liên kết sản phẩm" hint="Mỗi dòng một liên kết, tối đa 5. AI không tự mở các liên kết." value={links} onChange={e => setLinks(e.target.value)} onBlur={validate} rows={3} />
    <Field id="handoff-files" label="Tệp bàn giao" hint={storageAvailable ? "PDF hoặc TXT, tối đa 5 tệp, 5 MB/tệp. PDF scan chưa được AI đọc." : "Upload chưa được cấu hình. Bạn vẫn có thể bàn giao ghi chú hoặc liên kết."}>
      <input className="input" id="handoff-files" type="file" accept=".pdf,.txt" multiple disabled={busy || !storageAvailable} aria-describedby="handoff-files-hint" onChange={e => { const selected = Array.from(e.target.files ?? []); e.target.value = ""; void upload(selected); }} />
    </Field>
    {files.map(file => <div className="cluster cluster--between" key={file.id}><span>{file.name}</span><Button variant="ghost" size="sm" disabled={busy} onClick={() => setFiles(current => current.filter(f => f.id !== file.id))}>Bỏ tệp {file.name}</Button></div>)}
    {error ? <ErrorState detail={error.message} requestId={error.requestId} action={<Button variant="outline" onClick={() => void submit()}>Thử nộp lại</Button>} /> : null}
    <Button loading={busy} onClick={() => void submit()}>Nộp bản {milestone.revision + 1}</Button>
    {busy ? <p role="status">Đang tải tệp hoặc nộp bàn giao. Vui lòng đợi.</p> : null}
  </section>;
}
