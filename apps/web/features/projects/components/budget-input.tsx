"use client";

import { useEffect, useState } from "react";
import { formatVnd, groupThousands } from "../../../lib/utils/format";

type Range = { minimumBudget: number; maximumBudget: number };

/**
 * Ô nhập ngân sách dự án (BR-10, BR-18).
 *
 * Hai cách nhập cho cùng một giá trị, đồng bộ hai chiều:
 *  - Thanh trượt cho người muốn chọn nhanh một mức áng chừng.
 *  - Ô số cho người đã biết chính xác con số mình định trả.
 *
 * Ràng buộc thể hiện TRỰC QUAN (Visible Constraint, design.md 4.3): thanh trượt
 * chạy đúng khoảng chung 1–5 triệu, nên người dùng NHÌN THẤY giới hạn thay vì
 * gõ sai rồi mới bị báo lỗi. Khoảng của mức độ đã chọn chỉ được BÁO, không kẹp:
 * nếu kẹp, giao diện sẽ âm thầm đổi số tiền thay SME (design.md 7.3). Gửi duyệt
 * với số tiền ngoài khoảng vẫn bị backend chặn.
 *
 * Giá trị hiển thị có dấu phân cách hàng nghìn theo quy ước Việt Nam
 * (`2.500.000 đ`), nhưng giá trị gửi lên máy chủ vẫn là số thuần.
 */
const STEP = 100_000;

export function BudgetInput({
  value,
  onChange,
  overall,
  level,
  levelLabel
}: {
  value: number;
  onChange: (budget: number) => void;
  overall: Range;
  level: Range | null;
  levelLabel?: string;
}) {
  // Chuỗi đang gõ được giữ riêng: nếu ép định dạng ngay từng ký tự, con trỏ sẽ
  // nhảy lung tung giữa các dấu chấm và người dùng không gõ nổi.
  const [draft, setDraft] = useState(groupThousands(value));
  useEffect(() => setDraft(groupThousands(value)), [value]);

  function commit(raw: number) {
    const clamped = Math.min(overall.maximumBudget, Math.max(overall.minimumBudget, raw));
    onChange(clamped);
    // Kẹp về đúng giá trị cũ thì `value` không đổi và effect không chạy, nên đồng bộ ô gõ ngay tại đây.
    setDraft(groupThousands(clamped));
  }

  const outsideLevel = level !== null && (value < level.minimumBudget || value > level.maximumBudget);

  return (
    <div className="field">
      <label className="field__label" htmlFor="budget-amount">
        Ngân sách cho toàn dự án
        <span className="field__required" aria-hidden="true">
          *
        </span>
        <span className="visually-hidden">(bắt buộc)</span>
      </label>

      <div className="cluster" style={{ flexWrap: "nowrap" }}>
        <input
          id="budget-amount"
          className="input"
          type="text"
          inputMode="numeric"
          value={draft}
          aria-invalid={outsideLevel ? "true" : undefined}
          aria-describedby={outsideLevel ? "budget-error" : "budget-hint"}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            setDraft(digits ? groupThousands(Number(digits)) : "");
          }}
          onBlur={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            commit(digits ? Number(digits) : overall.minimumBudget);
          }}
        />
        <span style={{ color: "var(--color-text-muted)" }}>đ</span>
      </div>

      <input
        className="range"
        type="range"
        min={overall.minimumBudget}
        max={overall.maximumBudget}
        step={STEP}
        value={value}
        aria-label="Chọn nhanh ngân sách bằng thanh trượt"
        onChange={(event) => commit(Number(event.target.value))}
      />

      <p className="cluster cluster--between text-caption num" style={{ margin: 0 }}>
        <span>{formatVnd(overall.minimumBudget)}</span>
        <span>{formatVnd(overall.maximumBudget)}</span>
      </p>

      {outsideLevel && level ? (
        <p className="field__error" id="budget-error" role="alert">
          Mức {levelLabel ?? "đã chọn"} nhận ngân sách từ {formatVnd(level.minimumBudget)} đến{" "}
          {formatVnd(level.maximumBudget)}. Hãy chỉnh số tiền, hoặc chọn mức độ khác nếu phạm vi công việc thật sự
          lớn hơn hay nhỏ hơn.
        </p>
      ) : (
        <p className="field__hint" id="budget-hint">
          {level
            ? `Mức ${levelLabel ?? "đã chọn"}: từ ${formatVnd(level.minimumBudget)} đến ${formatVnd(level.maximumBudget)}. `
            : "Chọn mức độ dự án ở trên để biết khoảng ngân sách phù hợp. "}
          Số tiền này sẽ được chia vào các mốc bàn giao ở bước sau.
        </p>
      )}
    </div>
  );
}
