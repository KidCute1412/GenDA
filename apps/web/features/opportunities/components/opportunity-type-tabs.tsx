"use client";

import Link from "next/link";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { OpportunityKind } from "../../demo-ledger/types";
import { isOver } from "../model";
import { useToday } from "../hooks/use-today";

type TabKey = "PROJECT" | OpportunityKind;

const TABS: Array<{ key: TabKey; href: string; label: string; intro: string }> = [
  { key: "PROJECT", href: "/projects", label: "Dự án", intro: "Một người nhận trọn gói, làm theo mốc bàn giao, ngân sách 1–5 triệu. Ứng tuyển bằng thư ngỏ và CV." },
  { key: "GIG", href: "/projects?type=gig", label: "Cộng tác viên", intro: "Việc theo buổi cho sự kiện, cửa hàng, studio. Đăng ký nhanh không cần CV, đơn vị đăng tin chọn người." },
  { key: "EVENT", href: "/projects?type=event", label: "Sự kiện & workshop", intro: "Làm khán giả, người dùng thử, học viên thử. Đăng ký là giữ chỗ ngay, nhận thù lao theo người." }
];

/**
 * Tab loại cơ hội ở đầu trang "Tìm cơ hội" (docs/opportunities.md mục 4). Loại là tab chính, lĩnh vực
 * chỉ là bộ lọc phụ bên trong từng tab. Mỗi tab kèm một câu nói rõ loại đó khác gì, vì cùng là
 * "việc" nhưng cách nhận tiền và cách đăng ký khác hẳn nhau.
 */
export function OpportunityTypeTabs({ active, projectCount }: { active: TabKey; projectCount?: number }) {
  const ledger = useDemoLedger();
  const today = useToday();
  const openCount = (kind: OpportunityKind) =>
    today ? ledger.opportunities.filter((item) => item.kind === kind && item.status === "PUBLISHED" && !isOver(item, today)).length : undefined;
  const counts: Record<TabKey, number | undefined> = { PROJECT: projectCount, GIG: openCount("GIG"), EVENT: openCount("EVENT") };
  const current = TABS.find((tab) => tab.key === active) ?? TABS[0];

  return (
    <div className="opp-tabs">
      <nav className="tabs" aria-label="Loại cơ hội" style={{ marginBottom: "var(--space-3)" }}>
        {TABS.map((tab) => (
          <Link key={tab.key} href={tab.href} className="tab" aria-current={tab.key === active ? "page" : undefined} scroll={false}>
            <span>{tab.label}</span>
            {counts[tab.key] !== undefined ? <span className="tab__count num">{counts[tab.key]}</span> : null}
          </Link>
        ))}
      </nav>
      <p className="opp-tabs__intro">{current.intro}</p>
    </div>
  );
}
