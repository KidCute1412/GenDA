"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Alert } from "../../../components/ui/alert";
import { ICON_WEIGHT, WarningCircle } from "../../../components/ui/icons";
import { formatVnd, groupThousands } from "../../../lib/utils/format";

/**
 * Khai báo các mốc bàn giao trong Wizard đăng dự án (FR-MIL-01, FR-MIL-02).
 *
 * Bất biến nghiệp vụ: TỔNG ngân sách các mốc phải bằng ĐÚNG ngân sách dự án.
 * Giao diện kiểm tra ngay tại chỗ và hiển thị phần chênh lệch còn thiếu hoặc
 * đang thừa, thay vì chỉ báo "không hợp lệ" rồi để SME tự đi tính bằng tay.
 * Đây là Quy tắc Vàng số 5 — ngăn lỗi ngay tại giao diện, không để API trả lỗi.
 *
 * Vì sao milestone khai báo TRƯỚC khi xuất bản, xem Quyết định thiết kế DD-01
 * trong docs/design.md: sinh viên cần đọc được cách chia tiền trước khi quyết
 * định ứng tuyển, nên các mốc bắt buộc phải tồn tại ở trạng thái PUBLISHED.
 */
type Row = { id: number; title: string; budget: number; deadline: string };

let nextId = 3;

export function MilestoneEditor({ projectBudget }: { projectBudget: number }) {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, title: "", budget: Math.round(projectBudget * 0.4), deadline: "" },
    { id: 2, title: "", budget: projectBudget - Math.round(projectBudget * 0.4), deadline: "" }
  ]);

  const total = rows.reduce((sum, row) => sum + row.budget, 0);
  const difference = projectBudget - total;
  const balanced = difference === 0;

  function update(id: number, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function add() {
    setRows((current) => [...current, { id: nextId++, title: "", budget: 0, deadline: "" }]);
  }

  function remove(id: number) {
    // Luôn giữ ít nhất một mốc: một dự án không có mốc nào thì không có gì để
    // nghiệm thu, và trạng thái quỹ cũng không bám vào đâu được.
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
  }

  return (
    <div className="stack">
      <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((row, index) => (
          <li key={row.id} className="card stack stack--sm">
            <div className="cluster cluster--between">
              <h3 style={{ fontSize: "var(--text-h4-size)" }}>Mốc {index + 1}</h3>
              {rows.length > 1 ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => remove(row.id)}
                >
                  Xóa mốc
                  <span className="visually-hidden"> {index + 1}</span>
                </button>
              ) : null}
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label" htmlFor={`milestone-title-${row.id}`}>
                Mốc này bàn giao cái gì
              </label>
              <input
                id={`milestone-title-${row.id}`}
                className="input"
                value={row.title}
                placeholder="Ví dụ: Wireframe và thống nhất bố cục"
                onChange={(event) => update(row.id, { title: event.target.value })}
              />
            </div>

            <div className="cluster" style={{ alignItems: "flex-start", gap: "var(--space-4)" }}>
              <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "160px" }}>
                <label className="field__label" htmlFor={`milestone-budget-${row.id}`}>
                  Số tiền của mốc
                </label>
                <input
                  id={`milestone-budget-${row.id}`}
                  className="input num"
                  inputMode="numeric"
                  value={groupThousands(row.budget)}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "");
                    update(row.id, { budget: digits ? Number(digits) : 0 });
                  }}
                />
              </div>

              <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "160px" }}>
                <label className="field__label" htmlFor={`milestone-deadline-${row.id}`}>
                  Hạn của mốc
                </label>
                <input
                  id={`milestone-deadline-${row.id}`}
                  className="input"
                  type="date"
                  value={row.deadline}
                  onChange={(event) => update(row.id, { deadline: event.target.value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <Button type="button" variant="outline" onClick={add}>
          Thêm một mốc nữa
        </Button>
      </div>

      {/* Đối chiếu tổng: hiển thị cả con số lẫn phần chênh, và nêu rõ cần làm gì */}
      <div
        className="card stack stack--sm"
        style={{ backgroundColor: "var(--color-surface-subtle)" }}
        aria-live="polite"
      >
        <p className="cluster cluster--between num" style={{ margin: 0 }}>
          <span className="text-muted">Tổng tiền các mốc</span>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-heading)" }}>
            {formatVnd(total)}
          </span>
        </p>
        <p className="cluster cluster--between num" style={{ margin: 0 }}>
          <span className="text-muted">Ngân sách dự án</span>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-heading)" }}>
            {formatVnd(projectBudget)}
          </span>
        </p>

        {balanced ? (
          <Alert variant="success">Tổng các mốc khớp đúng ngân sách dự án. Bạn gửi duyệt được rồi.</Alert>
        ) : (
          <p className="field__error" style={{ marginTop: "var(--space-2)" }}>
            <WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />
            {difference > 0
              ? `Còn thiếu ${formatVnd(difference)} chưa được chia vào mốc nào.`
              : `Đang thừa ${formatVnd(Math.abs(difference))} so với ngân sách dự án.`}
          </p>
        )}
      </div>

      <input type="hidden" name="milestones" value={JSON.stringify(rows)} />
      <input type="hidden" name="milestonesBalanced" value={String(balanced)} />
    </div>
  );
}
