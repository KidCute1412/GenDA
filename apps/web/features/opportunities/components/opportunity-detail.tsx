"use client";

import { Alert } from "../../../components/ui/alert";
import { ButtonLink } from "../../../components/ui/button";
import { EmptyState, ProjectListSkeleton } from "../../../components/ui/feedback";
import { formatVnd } from "../../../lib/utils/format";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import { KIND_META, PAY_UNIT_LABEL, formatSession, isOver, slotsLeft, sortedSessions } from "../model";
import { useToday } from "../hooks/use-today";
import { RegisterAction } from "./register-action";
import { RegistrationManager } from "./registration-manager";

const HEADING_STYLE = { fontFamily: "ui-monospace, monospace", fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-500)" } as const;
const ROW_STYLE = { fontFamily: "ui-monospace, monospace", fontSize: "12px" } as const;

/**
 * Chi tiết một cơ hội ngắn. Cùng bố cục hai cột với chi tiết dự án; cột phải gom mọi thứ cần để quyết
 * định (thù lao, lịch, chỗ còn) và nút đăng ký. Tin chưa duyệt chỉ chủ tin và quản trị viên xem được.
 */
export function OpportunityDetail({ id }: { id: string }) {
  const ledger = useDemoLedger();
  const today = useToday();
  const { session } = useAuthSession();

  if (!today) return <ProjectListSkeleton rows={2} />;

  const opportunity = ledger.opportunities.find((item) => item.id === id);
  const owner = ledger.users.find((user) => user.email === session?.email);
  const isOwner = Boolean(opportunity && owner && owner.id === opportunity.ownerId && session?.role === "SME");
  const canPreview = isOwner || session?.role === "ADMIN";

  if (!opportunity || (opportunity.status !== "PUBLISHED" && !canPreview)) {
    return (
      <EmptyState
        title="KHÔNG TÌM THẤY TIN NÀY"
        advice="Tin không tồn tại, đã bị gỡ hoặc đang chờ duyệt."
        action={<ButtonLink href="/projects?type=event" variant="primary" className="btn--tactile-brand">Xem cơ hội khác</ButtonLink>}
      />
    );
  }

  const meta = KIND_META[opportunity.kind];
  const sessions = sortedSessions(opportunity);
  const left = slotsLeft(opportunity, ledger.registrations);
  const over = isOver(opportunity, today);

  return (
    <div className="layout-aside section--tight">
      <div className="stack stack--lg">
        {opportunity.status === "PENDING_REVIEW" ? <Alert variant="warning" title="Tin đang chờ quản trị viên duyệt">Người khác chưa thấy tin này. Bạn đang xem bản xem trước.</Alert> : null}
        {opportunity.status === "REJECTED" ? <Alert variant="danger" title="Tin chưa được duyệt">Lý do: {opportunity.rejectionReason}</Alert> : null}

        <div className="stack stack--sm" style={{ borderBottom: "2px solid var(--machinery-border)", paddingBottom: "var(--space-6)" }}>
          <div className="opp-row__tagline" style={{ fontSize: "12px" }}>
            <span className={`opp-kind opp-kind--${opportunity.kind.toLowerCase()}`}>{meta.tag}</span>
            <span>{opportunity.orgName.toUpperCase()}</span>
            <span aria-hidden="true">{"//"}</span>
            <span>{opportunity.industry.toUpperCase()}</span>
          </div>
          <h1 className="industrial-display" style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", margin: "var(--space-2) 0" }}>{opportunity.title}</h1>
          <p className="lede" style={{ color: "var(--color-text-muted)" }}>{opportunity.summary}</p>
        </div>

        <section>
          <h2 style={HEADING_STYLE}>{opportunity.kind === "EVENT" ? "[01] BẠN SẼ THAM GIA GÌ" : "[01] CÔNG VIỆC CỤ THỂ"}</h2>
          <p style={{ marginTop: "var(--space-2)", maxWidth: "65ch", lineHeight: 1.6 }}>{opportunity.details}</p>
        </section>

        <section>
          <h2 style={HEADING_STYLE}>[02] LỊCH ({sessions.length} BUỔI)</h2>
          <p className="text-muted" style={{ marginTop: "var(--space-1)", fontSize: "13px" }}>
            {opportunity.kind === "GIG" ? `Thù lao tính theo từng buổi bạn tham gia: ${formatVnd(opportunity.pay)}/buổi.` : "Thù lao nhận một lần sau buổi tham gia."}
          </p>
          <ul className="opp-sessions">
            {sessions.map((session) => (
              <li key={`${session.date}${session.start}`} className={session.date < today ? "is-past" : undefined}>
                <span className="num">{formatSession(session)}</span>
                {session.date < today ? <span className="text-caption">ĐÃ QUA</span> : null}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 style={HEADING_STYLE}>[03] ĐIỀU KIỆN THAM GIA</h2>
          {opportunity.requirements.length > 0 ? (
            <ul style={{ marginTop: "var(--space-3)", paddingLeft: "var(--space-5)", lineHeight: 1.6 }}>
              {opportunity.requirements.map((item) => <li key={item} style={{ marginBottom: "var(--space-2)" }}>{item}</li>)}
            </ul>
          ) : (
            <p style={{ marginTop: "var(--space-2)" }}>Không có điều kiện riêng.</p>
          )}
        </section>
      </div>

      <aside className="stack">
        <div className="module-bay stack" style={{ padding: "var(--space-5)" }}>
          <div className="module-bay__header">
            <span>SPEC-CARD</span>
            <span className="module-bay__id">{meta.tag}</span>
          </div>

          <div>
            <p className="text-caption" style={{ fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>
              Thù lao {opportunity.kind === "EVENT" ? "mỗi người" : "mỗi buổi"}
            </p>
            <p className="project-row__money" style={{ fontSize: "2rem", marginTop: "4px" }}>
              {formatVnd(opportunity.pay)}<span className="opp-unit">{PAY_UNIT_LABEL[opportunity.payUnit]}</span>
            </p>
          </div>

          <hr className="rule" style={{ borderTop: "2px solid var(--machinery-border)", margin: "var(--space-2) 0" }} />

          <dl className="stack stack--sm" style={{ margin: 0 }}>
            <div className="cluster cluster--between" style={ROW_STYLE}>
              <dt className="text-muted">HÌNH THỨC</dt>
              <dd style={{ margin: 0, fontWeight: 700 }}>{opportunity.mode === "ONLINE" ? "TRỰC TUYẾN" : "TẠI CHỖ"}</dd>
            </div>
            <div className="stack" style={{ ...ROW_STYLE, gap: "2px" }}>
              <dt className="text-muted">ĐỊA ĐIỂM</dt>
              <dd style={{ margin: 0, fontWeight: 700 }}>{opportunity.location}</dd>
            </div>
            <div className="cluster cluster--between" style={ROW_STYLE}>
              <dt className="text-muted">SỐ BUỔI</dt>
              <dd className="num" style={{ margin: 0, fontWeight: 700 }}>{sessions.length}</dd>
            </div>
            <div className="cluster cluster--between" style={ROW_STYLE}>
              <dt className="text-muted">CÒN CHỖ</dt>
              <dd className="num" style={{ margin: 0, fontWeight: 700, color: left === 0 ? "var(--color-status-danger)" : "inherit" }}>
                {over ? "ĐÃ DIỄN RA" : left === 0 ? "HẾT CHỖ" : `${left}/${opportunity.slots}`}
              </dd>
            </div>
          </dl>

          <hr className="rule" style={{ borderTop: "2px solid var(--machinery-border)", margin: "var(--space-2) 0" }} />

          {opportunity.status === "PUBLISHED" && !isOwner ? <RegisterAction opportunity={opportunity} today={today} /> : null}
        </div>

        <div className="opp-trust">
          <strong>{"// KHÔNG THU PHÍ NGƯỜI THAM GIA"}</strong>
          <p>
            Đơn vị đăng tin đã cam kết không thu bất kỳ khoản nào của bạn: không tiền cọc, không phí giữ chỗ, không
            mua sản phẩm. Nếu bị yêu cầu chuyển tiền, đừng chuyển và hãy báo cho GenDA.
          </p>
        </div>

        {isOwner && session ? <RegistrationManager opportunity={opportunity} registrations={ledger.registrations} ownerEmail={session.email} /> : null}
      </aside>
    </div>
  );
}
