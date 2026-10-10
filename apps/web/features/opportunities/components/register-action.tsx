"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "../../../components/ui/alert";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { cancelRegistration, registerForOpportunity } from "../../demo-ledger/store";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { DemoOpportunity } from "../../demo-ledger/types";
import { KIND_META, activeRegistration, isOver, slotsLeft } from "../model";

const BUTTON_STYLE = { width: "100%", height: "48px" } as const;

/**
 * Hành động đăng ký ở cột phải trang chi tiết (FR-OPP-05). Đăng ký một chạm, không thư ngỏ, không CV:
 * với việc 50k–600k một buổi, bắt viết thư ngỏ là quá tay. Mọi nhánh bị chặn đều nói rõ vì sao.
 */
export function RegisterAction({ opportunity, today }: { opportunity: DemoOpportunity; today: string }) {
  const ledger = useDemoLedger();
  const { session, hydrated } = useAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <button type="button" className="btn--tactile-brand" style={BUTTON_STYLE} disabled>ĐANG TẢI…</button>;

  const user = ledger.users.find((item) => item.email === session?.email);
  const mine = activeRegistration(ledger.registrations, opportunity.id, user?.id);
  const left = slotsLeft(opportunity, ledger.registrations);
  const meta = KIND_META[opportunity.kind];

  if (!session) {
    return (
      <Link href="/login" className="btn--tactile-brand" style={{ ...BUTTON_STYLE, textDecoration: "none" }}>
        ĐĂNG NHẬP ĐỂ ĐĂNG KÝ
      </Link>
    );
  }
  if (session.role !== "CONTRIBUTOR") {
    return <Alert variant="info" title="Chỉ tài khoản cá nhân đăng ký được">Doanh nghiệp và quản trị viên xem được tin nhưng không đăng ký tham gia.</Alert>;
  }

  function run(action: () => { ok: true } | { ok: false; message: string }) {
    setBusy(true);
    const result = action();
    setError(result.ok ? null : result.message);
    setBusy(false);
  }

  if (mine) {
    const confirmed = mine.status === "CONFIRMED";
    return (
      <div className="stack stack--sm">
        <div className={`opp-mine opp-mine--${confirmed ? "confirmed" : "pending"}`} role="status">
          <strong>{confirmed ? "ĐÃ GIỮ CHỖ" : "ĐÃ ĐĂNG KÝ, CHỜ DUYỆT"}</strong>
          <span>
            {confirmed
              ? "Chỗ của bạn đã được giữ. Nhớ có mặt đúng giờ; thù lao nhận sau buổi tham gia."
              : `${opportunity.orgName} sẽ chọn người cho từng buổi. Kết quả hiện ở mục Đơn của tôi.`}
          </span>
        </div>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <div className="cluster">
          <Link href="/student/applications#registrations" className="btn--tactile-zinc" style={{ height: "36px", fontSize: "11px" }}>
            XEM LỊCH ĐÃ ĐĂNG KÝ
          </Link>
          <button type="button" className="btn--tactile-zinc" style={{ height: "36px", fontSize: "11px" }} disabled={busy}
            onClick={() => { if (window.confirm("Hủy đăng ký này? Chỗ của bạn sẽ được nhường cho người khác.")) run(() => cancelRegistration(session.email, mine.id)); }}>
            HỦY ĐĂNG KÝ
          </button>
        </div>
      </div>
    );
  }

  const over = isOver(opportunity, today);
  const blocked = over ? "ĐÃ DIỄN RA" : left === 0 ? "HẾT CHỖ" : null;

  return (
    <div className="stack stack--sm">
      {error ? <Alert variant="danger" title="Không thể đăng ký">{error}</Alert> : null}
      <button type="button" className="btn--tactile-brand" style={BUTTON_STYLE} disabled={Boolean(blocked) || busy}
        onClick={() => run(() => registerForOpportunity(session.email, opportunity.id))}>
        {blocked ?? meta.register.toUpperCase()}
      </button>
      {!blocked ? (
        <p className="text-caption" style={{ margin: 0 }}>
          {opportunity.kind === "EVENT"
            ? "Bấm là giữ chỗ ngay, không cần CV hay thư ngỏ. Hủy được nếu bạn bận."
            : "Không cần CV hay thư ngỏ. Đơn vị đăng tin chọn người, kết quả báo ở mục Đơn của tôi."}
        </p>
      ) : null}
    </div>
  );
}
