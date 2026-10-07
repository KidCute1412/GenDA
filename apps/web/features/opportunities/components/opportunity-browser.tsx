"use client";

import { useState } from "react";
import { EmptyState, ProjectListSkeleton } from "../../../components/ui/feedback";
import { useDemoLedger } from "../../demo-ledger/use-demo-ledger";
import type { OpportunityKind, OpportunityMode } from "../../demo-ledger/types";
import { DATE_GROUP_LABEL, INDUSTRIES, KIND_META, PAY_BUCKETS, dateGroup, isOver, nextSession, slotsLeft, type DateGroup } from "../model";
import { useToday } from "../hooks/use-today";
import { OpportunityRow } from "./opportunity-row";

const MODES: Array<{ key: OpportunityMode; label: string }> = [
  { key: "OFFLINE", label: "Tại chỗ" },
  { key: "ONLINE", label: "Trực tuyến" }
];
const GROUP_ORDER: DateGroup[] = ["THIS_WEEK", "NEXT_WEEK", "LATER"];

/** Nhóm chip lọc chọn-một: bấm lại chip đang bật để bỏ lọc. */
function ChipGroup<T extends string>({ legend, options, value, onChange }: { legend: string; options: Array<{ key: T; label: string }>; value: T | null; onChange: (next: T | null) => void }) {
  if (options.length === 0) return null;
  return (
    <fieldset className="opp-filter">
      <legend>{legend}</legend>
      <ul className="pill-list">
        {options.map((option) => (
          <li key={option.key}>
            <button type="button" className="chip" aria-pressed={value === option.key} onClick={() => onChange(value === option.key ? null : option.key)}>
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/**
 * Danh sách cộng tác viên hoặc sự kiện. Xếp theo buổi sắp diễn ra và nhóm theo tuần, vì với việc
 * theo buổi câu hỏi đầu tiên là "khi nào", không phải "đăng lúc nào". Tin đã hết buổi thì ẩn.
 */
export function OpportunityBrowser({ kind }: { kind: OpportunityKind }) {
  const ledger = useDemoLedger();
  const today = useToday();
  const [industry, setIndustry] = useState<string | null>(null);
  const [bucket, setBucket] = useState<(typeof PAY_BUCKETS)[number]["key"] | null>(null);
  const [mode, setMode] = useState<OpportunityMode | null>(null);

  if (!today) return <ProjectListSkeleton rows={3} />;

  const pool = ledger.opportunities.filter((item) => item.kind === kind && item.status === "PUBLISHED" && !isOver(item, today));
  const range = PAY_BUCKETS.find((item) => item.key === bucket);
  const visible = pool
    .filter((item) => !industry || item.industry === industry)
    .filter((item) => !range || (item.pay >= range.min && item.pay <= range.max))
    .filter((item) => !mode || item.mode === mode)
    .sort((a, b) => {
      const left = nextSession(a, today)!;
      const right = nextSession(b, today)!;
      return `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`);
    });
  const groups = GROUP_ORDER.map((group) => ({ group, items: visible.filter((item) => dateGroup(item, today) === group) })).filter((entry) => entry.items.length > 0);
  const hasFilter = Boolean(industry || bucket || mode);

  return (
    <div className="stack" style={{ gap: "var(--space-8)" }}>
      <div className="stack stack--sm">
        <ChipGroup legend="// LĨNH VỰC" value={industry} onChange={setIndustry}
          options={INDUSTRIES.filter((name) => pool.some((item) => item.industry === name)).map((name) => ({ key: name, label: name }))} />
        <ChipGroup legend={`// THÙ LAO (${kind === "EVENT" ? "MỖI NGƯỜI" : "MỖI BUỔI"})`} value={bucket} onChange={setBucket}
          options={PAY_BUCKETS.map((item) => ({ key: item.key, label: item.label }))} />
        <ChipGroup legend="// HÌNH THỨC" value={mode} onChange={setMode} options={MODES} />
        {hasFilter ? (
          <p style={{ margin: "var(--space-2) 0 0" }}>
            <button type="button" className="btn--tactile-zinc" style={{ height: "32px", fontSize: "11px", paddingInline: "12px" }}
              onClick={() => { setIndustry(null); setBucket(null); setMode(null); }}>
              {"[XÓA TOÀN BỘ BỘ LỌC]"}
            </button>
          </p>
        ) : null}
      </div>

      <div className="section--tight">
        <div className="opp-results-head">
          <p aria-live="polite">
            KẾT QUẢ: <span style={{ color: "var(--brand-500)" }}>{visible.length}</span> TIN {KIND_META[kind].tag}
          </p>
          <span>SẮP XẾP: NGÀY DIỄN RA</span>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title="Chưa có tin nào khớp với bộ lọc này"
            advice="Hãy bỏ bớt một bộ lọc. Tin mới được duyệt mỗi ngày nên bạn quay lại sau cũng được."
          />
        ) : (
          groups.map(({ group, items }) => (
            <section key={group} aria-labelledby={`opp-group-${group}`} className="opp-group">
              <h2 id={`opp-group-${group}`} className="industrial-ruler">{DATE_GROUP_LABEL[group]} · {items.length}</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {items.map((item) => (
                  <OpportunityRow key={item.id} data={item} left={slotsLeft(item, ledger.registrations)} today={today} href={`/opportunities/${item.id}`} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
