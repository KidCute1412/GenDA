import Link from "next/link";
import type { DemoOpportunity } from "../../demo-ledger/types";
import { formatVnd } from "../../../lib/utils/format";
import { KIND_META, PAY_UNIT_LABEL, formatSession, nextSession, sortedSessions } from "../model";

type RowData = Pick<DemoOpportunity, "kind" | "orgName" | "industry" | "title" | "summary" | "pay" | "payUnit" | "sessions" | "mode" | "location" | "slots">;

/**
 * Một dòng trong danh sách cơ hội. Cùng khung cột với danh sách dự án (design.md 4.9): nội dung bên
 * trái, thù lao căn phải trên cùng một trục để so được giữa các tin. Dòng thông tin cố định theo thứ
 * tự: lịch → hình thức/địa điểm, rồi tới thù lao → số chỗ còn ở cột phải.
 *
 * `href` bỏ trống khi dùng làm bản xem trước trong form đăng tin.
 */
export function OpportunityRow({ data, left, today, href }: { data: RowData; left: number; today: string; href?: string }) {
  const sessions = sortedSessions(data);
  const next = nextSession(data, today) ?? sessions[0];
  const extra = sessions.length - 1;
  const full = left === 0;
  const scarce = !full && left <= 3;

  return (
    <li className="project-row opp-row">
      <div className="stack stack--sm" style={{ minWidth: 0 }}>
        <div className="opp-row__tagline">
          <span className={`opp-kind opp-kind--${data.kind.toLowerCase()}`}>{KIND_META[data.kind].tag}</span>
          <span>{data.orgName.toUpperCase()}</span>
          <span aria-hidden="true">{"//"}</span>
          <span>{data.industry.toUpperCase()}</span>
        </div>

        <h2 className="opp-row__title">
          {href ? <Link href={href}>{data.title}</Link> : data.title}
        </h2>
        <p className="text-muted" style={{ margin: 0, maxWidth: "62ch", lineHeight: 1.5 }}>{data.summary}</p>

        <dl className="opp-facts">
          <div>
            <dt>Lịch</dt>
            <dd className="num">{next ? formatSession(next) : "Chưa có buổi"}{extra > 0 ? ` (+${extra} buổi)` : ""}</dd>
          </div>
          <div>
            <dt>{data.mode === "ONLINE" ? "Trực tuyến" : "Tại chỗ"}</dt>
            <dd>{data.location}</dd>
          </div>
        </dl>
        <p className="opp-nofee">Không thu phí người tham gia</p>
      </div>

      <div className="project-row__meta stack stack--sm">
        <p className="project-row__money">
          {formatVnd(data.pay)}
          <span className="opp-unit">{PAY_UNIT_LABEL[data.payUnit]}</span>
        </p>
        <p className={`opp-slots${full ? " opp-slots--full" : scarce ? " opp-slots--scarce" : ""}`}>
          {full ? "HẾT CHỖ" : `CÒN ${left}/${data.slots} CHỖ`}
        </p>
        {href ? (
          <Link href={href} className="btn--tactile-zinc" style={{ height: "36px", fontSize: "12px", paddingInline: "var(--space-4)", display: "inline-flex" }}>
            {full ? "XEM CHI TIẾT" : "XEM & ĐĂNG KÝ"}
          </Link>
        ) : null}
      </div>
    </li>
  );
}
