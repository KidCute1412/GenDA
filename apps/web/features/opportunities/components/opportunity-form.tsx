"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { SelectField, TextAreaField, TextField } from "../../../components/ui/field";
import { groupThousands } from "../../../lib/utils/format";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { createOpportunity } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { OpportunityKind, OpportunityMode, OpportunitySession } from "../../demo-ledger/types";
import { INDUSTRIES, KIND_META, MAX_SESSIONS, MIN_PAY, PAY_UNIT_LABEL, validateOpportunity, type OpportunityDraft } from "../model";
import { useToday } from "../hooks/use-today";
import { OpportunityRow } from "./opportunity-row";

const KIND_CHOICES: Array<{ kind: OpportunityKind; title: string; text: string }> = [
  { kind: "EVENT", title: "Sự kiện & workshop", text: "Tuyển khán giả, người dùng thử, học viên thử. Người đăng ký giữ chỗ ngay. Thù lao tính theo người." },
  { kind: "GIG", title: "Cộng tác viên", text: "Tuyển người làm theo buổi: check-in, phụ bàn, quay video… Bạn chọn từng người. Thù lao tính theo buổi." }
];

const EMPTY_SESSION: OpportunitySession = { date: "", start: "", end: "" };

/**
 * Form đăng tin cộng tác viên / sự kiện (FR-OPP-01…03). Một trang, không chia bước: tin ngắn chỉ cần
 * chừng mười trường. Bản xem trước bên dưới dùng đúng thẻ của trang danh sách, để người đăng thấy tin
 * sẽ hiện ra thế nào khi người khác lướt qua.
 */
export function OpportunityForm() {
  const ledger = useDemoLedger();
  const today = useToday();
  const { session } = useAuthSession();
  const [kind, setKind] = useState<OpportunityKind>("EVENT");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [pay, setPay] = useState("");
  const [slots, setSlots] = useState("");
  const [mode, setMode] = useState<OpportunityMode>("OFFLINE");
  const [location, setLocation] = useState("");
  const [sessions, setSessions] = useState<OpportunitySession[]>([EMPTY_SESSION]);
  const [requirements, setRequirements] = useState("");
  const [noFeeCommitment, setNoFeeCommitment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const owner = ledger.users.find((user) => user.email === session?.email);
  const unit = KIND_META[kind].payUnit;
  const draft: OpportunityDraft = {
    kind, industry, title, summary, details: details || summary,
    pay: Number(pay.replace(/\D/g, "")) || 0, slots: Number(slots) || 0,
    mode, location, sessions, requirements: requirements.split("\n").map((line) => line.trim()).filter(Boolean), noFeeCommitment
  };

  function updateSession(index: number, patch: Partial<OpportunitySession>) {
    setSessions((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!today || !session) return;
    const problem = validateOpportunity(draft, today);
    if (problem) { setError(problem); return; }
    const result = createOpportunity({ ...draft, ownerEmail: session.email });
    if (!result.ok) { setError(result.message); return; }
    setError(null);
    setCreatedId(result.value);
  }

  if (createdId) {
    return (
      <div className="stack" role="status">
        <h2 style={{ margin: 0 }}>Đã gửi tin đi duyệt</h2>
        <p style={{ margin: 0 }}>Quản trị viên kiểm tra tin trong giờ làm việc. Được duyệt là tin hiện ngay ở tab {KIND_META[kind].label}.</p>
        <div className="cluster">
          <Link href={`/opportunities/${createdId}`} className="btn--tactile-zinc" style={{ height: "40px", fontSize: "12px" }}>XEM BẢN XEM TRƯỚC</Link>
          <Link href="/sme/projects" className="btn--tactile-brand" style={{ height: "40px", fontSize: "12px" }}>VỀ TRANG QUẢN LÝ</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="stack" style={{ gap: "var(--space-6)" }} onSubmit={submit} noValidate>
      <fieldset className="opp-kind-choice">
        <legend className="field__label">Bạn cần tuyển gì?</legend>
        <div className="opp-kind-choice__grid">
          {KIND_CHOICES.map((choice) => (
            <label key={choice.kind} className="opp-kind-choice__option" data-checked={kind === choice.kind}>
              <input type="radio" name="opp-kind" value={choice.kind} checked={kind === choice.kind} onChange={() => setKind(choice.kind)} />
              <span className="opp-kind-choice__title">{choice.title}</span>
              <span className="opp-kind-choice__text">{choice.text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <TextField id="opp-title" label="Tiêu đề tin" required value={title} onChange={(e) => setTitle(e.target.value)}
        hint={kind === "EVENT" ? "Ví dụ: Khán giả talkshow \"Làm podcast từ con số 0\"" : "Ví dụ: Cộng tác viên check-in workshop cuối tuần"} />

      <SelectField id="opp-industry" label="Lĩnh vực" required value={industry} onChange={(e) => setIndustry(e.target.value)}>
        <option value="">Chọn lĩnh vực</option>
        {INDUSTRIES.map((name) => <option key={name}>{name}</option>)}
      </SelectField>

      <TextAreaField id="opp-summary" label="Mô tả ngắn (hiện trên thẻ)" required rows={2} value={summary} onChange={(e) => setSummary(e.target.value)}
        hint="Một câu: người tham gia sẽ làm gì." />
      <TextAreaField id="opp-details" label="Mô tả chi tiết" rows={4} value={details} onChange={(e) => setDetails(e.target.value)}
        hint="Diễn ra thế nào, cần mang gì, nhận thù lao khi nào." />

      <div className="opp-form__pair">
        <TextField id="opp-pay" label={`Thù lao (đồng${PAY_UNIT_LABEL[unit]})`} required inputMode="numeric" value={pay}
          onChange={(e) => setPay(e.target.value)} hint={`Tối thiểu ${groupThousands(MIN_PAY)}đ${PAY_UNIT_LABEL[unit]}.`} />
        <TextField id="opp-slots" label="Số chỗ" required inputMode="numeric" value={slots} onChange={(e) => setSlots(e.target.value)}
          hint={kind === "EVENT" ? "Đủ chỗ thì tin tự đóng đăng ký." : "Số người bạn cần cho mỗi buổi."} />
      </div>

      <div className="opp-form__pair">
        <SelectField id="opp-mode" label="Hình thức" required value={mode} onChange={(e) => setMode(e.target.value as OpportunityMode)}>
          <option value="OFFLINE">Tại chỗ</option>
          <option value="ONLINE">Trực tuyến</option>
        </SelectField>
        <TextField id="opp-location" label={mode === "ONLINE" ? "Nền tảng" : "Địa điểm"} required value={location} onChange={(e) => setLocation(e.target.value)}
          hint={mode === "ONLINE" ? "Ví dụ: Google Meet (gửi link sau khi giữ chỗ)" : "Ví dụ: Nhà văn hóa Thanh Niên, Q.1, TP.HCM"} />
      </div>

      <fieldset className="opp-form__sessions">
        <legend className="field__label">Lịch ({sessions.length}/{MAX_SESSIONS} buổi)</legend>
        {sessions.map((item, index) => (
          <div key={index} className="opp-form__session">
            <TextField id={`opp-date-${index}`} label={`Ngày buổi ${index + 1}`} type="date" min={today ?? undefined} value={item.date} onChange={(e) => updateSession(index, { date: e.target.value })} />
            <TextField id={`opp-start-${index}`} label="Bắt đầu" type="time" value={item.start} onChange={(e) => updateSession(index, { start: e.target.value })} />
            <TextField id={`opp-end-${index}`} label="Kết thúc" type="time" value={item.end} onChange={(e) => updateSession(index, { end: e.target.value })} />
            {sessions.length > 1 ? (
              <button type="button" className="btn--tactile-zinc" style={{ height: "42px", fontSize: "11px", alignSelf: "end" }}
                onClick={() => setSessions((current) => current.filter((_, i) => i !== index))} aria-label={`Bỏ buổi ${index + 1}`}>
                BỎ
              </button>
            ) : null}
          </div>
        ))}
        {sessions.length < MAX_SESSIONS ? (
          <button type="button" className="btn--tactile-zinc" style={{ height: "36px", fontSize: "11px", justifySelf: "start" }}
            onClick={() => setSessions((current) => [...current, EMPTY_SESSION])}>
            + THÊM BUỔI
          </button>
        ) : null}
      </fieldset>

      <TextAreaField id="opp-requirements" label="Điều kiện tham gia (mỗi dòng một ý)" rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)}
        hint="Ví dụ: Từ 18 tuổi trở lên. Bỏ trống nếu ai cũng tham gia được." />

      <label className="opp-form__commit">
        <input type="checkbox" checked={noFeeCommitment} onChange={(e) => setNoFeeCommitment(e.target.checked)} />
        <span>
          <strong>Tôi cam kết không thu bất kỳ khoản phí nào của người tham gia</strong> (tiền cọc, phí giữ chỗ, mua sản phẩm).
          Vi phạm thì tin bị gỡ và tài khoản bị khóa.
        </span>
      </label>

      {error ? <Alert variant="danger" title="Chưa gửi được tin">{error}</Alert> : null}

      {today && title.trim() ? (
        <section aria-label="Xem trước thẻ tin" className="stack stack--sm">
          <div className="industrial-ruler">XEM TRƯỚC // NGƯỜI KHÁC SẼ THẤY</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <OpportunityRow today={today} left={draft.slots}
              data={{ ...draft, orgName: owner?.name ?? "Doanh nghiệp của bạn", industry: industry || "Lĩnh vực", summary: summary || "Mô tả ngắn", location: location || "Địa điểm", payUnit: unit, sessions: sessions.filter((item) => item.date && item.start && item.end) }} />
          </ul>
        </section>
      ) : null}

      <button type="submit" className="btn--tactile-brand" style={{ height: "48px" }} disabled={!today || !session}>
        GỬI DUYỆT
      </button>
    </form>
  );
}
