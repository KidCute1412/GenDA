import { beforeEach, describe, expect, it } from "vitest";
import { cancelRegistration, createOpportunity, decideRegistration, getLedger, moderateOpportunity, registerForOpportunity, resetLedger } from "../demo-ledger/store";
import { addDays, dateGroup, formatPay, formatSession, isOver, slotsLeft, toIsoDate, validateOpportunity, type OpportunityDraft } from "./model";

const STUDENT = "letuanloc.2203@hcmus.edu.vn";
const SME = "contact@coffeelab.vn";
const ADMIN = "admin@genda.vn";
const today = toIsoDate(new Date());

const draft = (patch: Partial<OpportunityDraft> = {}): OpportunityDraft => ({
  kind: "EVENT", industry: "Truyền thông", title: "Khán giả buổi ghi hình", summary: "Ngồi hàng ghế khán giả trong buổi ghi hình.", details: "Chi tiết",
  pay: 100_000, slots: 2, mode: "OFFLINE", location: "Q.1, TP.HCM", sessions: [{ date: addDays(today, 5), start: "14:00", end: "16:00" }],
  requirements: [], noFeeCommitment: true, ...patch
});

/** SME đăng tin, quản trị viên duyệt, trả về id tin đã mở. */
function published(patch: Partial<OpportunityDraft> = {}) {
  const created = createOpportunity({ ...draft(patch), ownerEmail: SME });
  if (!created.ok) throw new Error(created.message);
  expect(moderateOpportunity(ADMIN, created.value, "approve").ok).toBe(true);
  return created.value;
}

describe("opportunity rules", () => {
  it("formats pay with its unit and sessions with the weekday", () => {
    expect(formatPay(150_000, "PER_PERSON")).toBe("150.000đ/người");
    expect(formatPay(300_000, "PER_SESSION")).toBe("300.000đ/buổi");
    expect(formatSession({ date: "2026-10-17", start: "14:00", end: "16:30" })).toBe("T7, 17/10 · 14:00–16:30");
  });

  it("rejects pay under 50k, past dates, inverted hours and a missing no-fee commitment", () => {
    expect(validateOpportunity(draft(), today)).toBeNull();
    expect(validateOpportunity(draft({ pay: 49_000 }), today)).toMatch(/tối thiểu/);
    expect(validateOpportunity(draft({ sessions: [{ date: addDays(today, -1), start: "14:00", end: "16:00" }] }), today)).toMatch(/quá khứ/);
    expect(validateOpportunity(draft({ sessions: [{ date: addDays(today, 1), start: "16:00", end: "14:00" }] }), today)).toMatch(/kết thúc/);
    expect(validateOpportunity(draft({ noFeeCommitment: false }), today)).toMatch(/không thu phí/);
    expect(validateOpportunity(draft({ slots: 0 }), today)).toMatch(/Số chỗ/);
  });

  it("groups by the next upcoming session and treats fully past listings as over", () => {
    const on = (days: number) => ({ sessions: [{ date: addDays(today, days), start: "09:00", end: "10:00" }] });
    expect(dateGroup(on(2), today)).toBe("THIS_WEEK");
    expect(dateGroup(on(9), today)).toBe("NEXT_WEEK");
    expect(dateGroup(on(30), today)).toBe("LATER");
    expect(isOver(on(-1), today)).toBe(true);
    expect(isOver({ sessions: [{ date: addDays(today, -3), start: "09:00", end: "10:00" }, { date: addDays(today, 3), start: "09:00", end: "10:00" }] }, today)).toBe(false);
  });
});

describe("opportunity lifecycle in the demo ledger", () => {
  beforeEach(() => { localStorage.clear(); resetLedger(); });

  it("seeds published gigs and events across several industries", () => {
    const { opportunities } = getLedger();
    expect(opportunities.some((item) => item.kind === "GIG")).toBe(true);
    expect(opportunities.some((item) => item.kind === "EVENT")).toBe(true);
    expect(new Set(opportunities.map((item) => item.industry)).size).toBeGreaterThan(3);
    expect(opportunities.every((item) => item.pay >= 50_000)).toBe(true);
  });

  it("only lets an approved SME post, and keeps the listing hidden until an admin approves it", () => {
    expect(createOpportunity({ ...draft(), ownerEmail: STUDENT })).toMatchObject({ ok: false, code: "WRONG_ROLE" });
    expect(createOpportunity({ ...draft({ pay: 10_000 }), ownerEmail: SME })).toMatchObject({ ok: false, code: "INVALID_INPUT" });
    const created = createOpportunity({ ...draft(), ownerEmail: SME });
    if (!created.ok) throw new Error();
    expect(getLedger().opportunities.find((item) => item.id === created.value)).toMatchObject({ status: "PENDING_REVIEW", payUnit: "PER_PERSON", orgName: "The Coffee Lab" });
    expect(registerForOpportunity(STUDENT, created.value)).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
    expect(moderateOpportunity(ADMIN, created.value, "reject")).toMatchObject({ ok: false, code: "REASON_REQUIRED" });
    expect(moderateOpportunity(SME, created.value, "approve")).toMatchObject({ ok: false, code: "WRONG_ROLE" });
    expect(moderateOpportunity(ADMIN, created.value, "approve").ok).toBe(true);
  });

  it("confirms an event seat immediately, blocks duplicates and closes when full", () => {
    const id = published({ slots: 1 });
    expect(registerForOpportunity(SME, id)).toMatchObject({ ok: false, code: "WRONG_ROLE" });
    expect(registerForOpportunity(STUDENT, id)).toMatchObject({ ok: true, value: "CONFIRMED" });
    expect(registerForOpportunity(STUDENT, id)).toMatchObject({ ok: false, code: "DUPLICATE_REGISTRATION" });
    const opportunity = getLedger().opportunities.find((item) => item.id === id)!;
    expect(slotsLeft(opportunity, getLedger().registrations)).toBe(0);
  });

  it("frees the seat when the participant cancels", () => {
    const id = published({ slots: 1 });
    registerForOpportunity(STUDENT, id);
    const mine = getLedger().registrations.find((item) => item.opportunityId === id)!;
    expect(cancelRegistration(SME, mine.id)).toMatchObject({ ok: false, code: "NOT_OWNER" });
    expect(cancelRegistration(STUDENT, mine.id).ok).toBe(true);
    const opportunity = getLedger().opportunities.find((item) => item.id === id)!;
    expect(slotsLeft(opportunity, getLedger().registrations)).toBe(1);
    expect(registerForOpportunity(STUDENT, id)).toMatchObject({ ok: true, value: "CONFIRMED" });
  });

  it("keeps a gig registration pending until the owner confirms it, within the slot limit", () => {
    const id = published({ kind: "GIG", slots: 1, pay: 300_000 });
    expect(getLedger().opportunities.find((item) => item.id === id)?.payUnit).toBe("PER_SESSION");
    expect(registerForOpportunity(STUDENT, id)).toMatchObject({ ok: true, value: "PENDING" });
    const mine = getLedger().registrations.find((item) => item.opportunityId === id)!;
    expect(decideRegistration(STUDENT, mine.id, "confirm")).toMatchObject({ ok: false, code: "NOT_OWNER" });
    expect(decideRegistration(SME, mine.id, "confirm").ok).toBe(true);
    expect(getLedger().registrations.find((item) => item.id === mine.id)?.status).toBe("CONFIRMED");
    expect(decideRegistration(SME, mine.id, "decline")).toMatchObject({ ok: false, code: "INVALID_TRANSITION" });
  });

  it("does not let the owner confirm more people than the slots", () => {
    // Tin mẫu "Phụ bàn workshop": 2 chỗ, 1 người chờ duyệt sẵn
    const seeded = "o-coffee-helper";
    expect(registerForOpportunity(STUDENT, seeded)).toMatchObject({ ok: true, value: "PENDING" });
    const pending = getLedger().registrations.filter((item) => item.opportunityId === seeded && item.status === "PENDING");
    expect(pending).toHaveLength(2);
    expect(decideRegistration(SME, pending[0].id, "confirm").ok).toBe(true);
    expect(decideRegistration(SME, pending[1].id, "confirm").ok).toBe(true);
    expect(registerForOpportunity("diep@student.vn", seeded)).toMatchObject({ ok: false, code: "OPPORTUNITY_FULL" });
  });
});
