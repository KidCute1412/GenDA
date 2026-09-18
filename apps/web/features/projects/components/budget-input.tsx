"use client";

import { useState } from "react";
import { BUDGET_MAX, BUDGET_MIN } from "../../../mocks/data";
import { formatVnd, groupThousands } from "../../../lib/utils/format";

/**
 * Ô nhập ngân sách dự án (BR-10: 1.000.000 - 5.000.000 VNĐ).
 *
 * Hai cách nhập cho cùng một giá trị, đồng bộ hai chiều:
 *  - Thanh trượt cho người muốn chọn nhanh một mức áng chừng.
 *  - Ô số cho người đã biết chính xác con số mình định trả.
 *
 * Ràng buộc thể hiện TRỰC QUAN (Visible Constraint, design.md 4.3): thanh trượt
 * chạy đúng từ 1 tới 5 triệu nên người dùng NHÌN THẤY giới hạn thay vì phải gõ
 * sai rồi mới bị báo lỗi. Ô số vẫn kẹp cứng giá trị khi rời ô, phòng trường hợp
 * người dùng gõ tay ra ngoài khoảng.
 *
 * Giá trị hiển thị có dấu phân cách hàng nghìn theo quy ước Việt Nam
 * (`2.500.000 đ`), nhưng giá trị gửi lên máy chủ vẫn là số thuần.
 */
const STEP = 100_000;

export function BudgetInput({ name = "budget", defaultValue = 2_000_000 }: { name?: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  // Chuỗi đang gõ được giữ riêng: nếu ép định dạng ngay từng ký tự, con trỏ sẽ
  // nhảy lung tung giữa các dấu chấm và người dùng không gõ nổi.
  const [draft, setDraft] = useState(groupThousands(defaultValue));

  function commit(raw: number) {
    const clamped = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, raw));
    setValue(clamped);
    setDraft(groupThousands(clamped));
  }

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
          aria-describedby="budget-hint"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            setDraft(digits ? groupThousands(Number(digits)) : "");
            if (digits) setValue(Number(digits));
          }}
          onBlur={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            commit(digits ? Number(digits) : BUDGET_MIN);
          }}
        />
        <span style={{ color: "var(--color-text-muted)" }}>đ</span>
      </div>

      <input
        className="range"
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={STEP}
        value={value}
        aria-label="Chọn nhanh ngân sách bằng thanh trượt"
        onChange={(event) => commit(Number(event.target.value))}
      />

      <p className="cluster cluster--between text-caption num" style={{ margin: 0 }}>
        <span>{formatVnd(BUDGET_MIN)}</span>
        <span>{formatVnd(BUDGET_MAX)}</span>
      </p>

      <p className="field__hint" id="budget-hint">
        GenDA giới hạn mỗi dự án trong khoảng 1 đến 5 triệu đồng, để công việc đủ nhỏ cho một sinh viên
        làm xong trong vài tuần. Số tiền này sẽ được chia vào các mốc bàn giao ở bước sau.
      </p>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
