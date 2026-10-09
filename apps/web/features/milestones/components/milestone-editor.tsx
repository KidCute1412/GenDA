"use client";

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
 * Đây là Quy tắc Vàng số 5 — ngăn lỗi ngay tại giao diện; backend vẫn kiểm tra
 * lại khi gửi duyệt.
 *
 * Vì sao milestone khai báo TRƯỚC khi xuất bản, xem Quyết định thiết kế DD-01
 * trong docs/design.md: sinh viên cần đọc được cách chia tiền trước khi quyết
 * định ứng tuyển, nên các mốc bắt buộc phải tồn tại ở trạng thái PUBLISHED.
 */
export type MilestoneRow = { key: number; title: string; budget: number; deadline: string; criteria: string[] };

let nextKey = 1;
export function newMilestoneRow(patch: Partial<Omit<MilestoneRow, "key">> = {}): MilestoneRow {
  return { key: nextKey++, title: "", budget: 0, deadline: "", criteria: [], ...patch };
}

/** Chia ngân sách cho hai mốc mặc định theo tỷ lệ 40/60, làm tròn tới 100.000 đ. */
export function defaultSplit(budget: number): [number, number] {
  const first = Math.round((budget * 0.4) / 100_000) * 100_000;
  return [first, budget - first];
}

export function MilestoneEditor({
  rows,
  onChange,
  projectBudget,
  projectDeadline,
  minDate
}: {
  rows: MilestoneRow[];
  onChange: (rows: MilestoneRow[]) => void;
  projectBudget: number;
  projectDeadline: string;
  minDate: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.budget, 0);
  const difference = projectBudget - total;
  const balanced = difference === 0;

  function update(key: number, patch: Partial<MilestoneRow>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function remove(key: number) {
    // Luôn giữ ít nhất một mốc: một dự án không có mốc nào thì không có gì để
    // nghiệm thu, và trạng thái quỹ cũng không bám vào đâu được.
    if (rows.length > 1) onChange(rows.filter((row) => row.key !== key));
  }

  return (
    <div className="stack">
      <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((row, index) => {
          const late = Boolean(projectDeadline && row.deadline && row.deadline > projectDeadline);
          return (
            <li key={row.key} className="card stack stack--sm">
              <div className="cluster cluster--between">
                <h3 style={{ fontSize: "var(--text-h4-size)" }}>Mốc {index + 1}</h3>
                {rows.length > 1 ? (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => remove(row.key)}>
                    Xóa mốc
                    <span className="visually-hidden"> {index + 1}</span>
                  </button>
                ) : null}
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label" htmlFor={`milestone-title-${row.key}`}>
                  Mốc này bàn giao cái gì
                </label>
                <input
                  id={`milestone-title-${row.key}`}
                  className="input"
                  value={row.title}
                  maxLength={180}
                  placeholder="Ví dụ: Wireframe và thống nhất bố cục"
                  onChange={(event) => update(row.key, { title: event.target.value })}
                />
              </div>

              <div className="cluster" style={{ alignItems: "flex-start", gap: "var(--space-4)" }}>
                <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "160px" }}>
                  <label className="field__label" htmlFor={`milestone-budget-${row.key}`}>
                    Số tiền của mốc
                  </label>
                  <input
                    id={`milestone-budget-${row.key}`}
                    className="input num"
                    inputMode="numeric"
                    value={groupThousands(row.budget)}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, "");
                      update(row.key, { budget: digits ? Math.min(Number(digits), 5_000_000) : 0 });
                    }}
                  />
                </div>

                <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: "160px" }}>
                  <label className="field__label" htmlFor={`milestone-deadline-${row.key}`}>
                    Hạn của mốc
                  </label>
                  <input
                    id={`milestone-deadline-${row.key}`}
                    className="input"
                    type="date"
                    value={row.deadline}
                    min={minDate}
                    max={projectDeadline || undefined}
                    aria-invalid={late ? "true" : undefined}
                    aria-describedby={late ? `milestone-deadline-${row.key}-error` : undefined}
                    onChange={(event) => update(row.key, { deadline: event.target.value })}
                  />
                  {late ? (
                    <p className="field__error" id={`milestone-deadline-${row.key}-error`}>
                      Hạn của mốc không được sau hạn của cả dự án.
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div>
        <Button
          type="button"
          variant="outline"
          disabled={rows.length >= 10}
          onClick={() => onChange([...rows, newMilestoneRow({ budget: Math.max(difference, 0) })])}
        >
          Thêm một mốc nữa
        </Button>
      </div>

      {/* Đối chiếu tổng: hiển thị cả con số lẫn phần chênh, và nêu rõ cần làm gì */}
      <div className="card stack stack--sm" style={{ backgroundColor: "var(--color-surface-subtle)" }} aria-live="polite">
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
          <Alert variant="success">Tổng các mốc khớp đúng ngân sách dự án.</Alert>
        ) : (
          <p className="field__error" style={{ marginTop: "var(--space-2)" }}>
            <WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />
            {difference > 0
              ? `Còn thiếu ${formatVnd(difference)} chưa được chia vào mốc nào.`
              : `Đang thừa ${formatVnd(Math.abs(difference))} so với ngân sách dự án.`}
          </p>
        )}
      </div>
    </div>
  );
}
