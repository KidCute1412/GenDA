"use client";

import { useState } from "react";
import { Check, ICON_WEIGHT } from "../../../components/ui/icons";
import { SKILL_CATALOG } from "../../../mocks/data";

/**
 * Chọn kỹ năng từ danh mục chuẩn của hệ thống (FR-USR-05).
 *
 * CẤM nhập tự do, và đây là ràng buộc nghiệp vụ chứ không phải lựa chọn giao
 * diện: điểm phù hợp (Match Score) so khớp theo tên kỹ năng, nên chỉ cần một
 * người gõ "ReactJS" thay vì "React" là thuật toán ghép nối hỏng. Ràng buộc
 * được thể hiện TRỰC QUAN bằng việc không hề có ô nhập chữ nào (Visible
 * Constraint, design.md 4.3).
 *
 * Mỗi kỹ năng là một nút bật/tắt mang aria-pressed, không phải checkbox ẩn:
 * trạng thái bật được mã hóa cả bằng nền đậm lẫn dấu tích, không chỉ bằng màu.
 */
export function SkillMultiSelect({
  name,
  defaultSelected = [],
  max
}: {
  name: string;
  defaultSelected?: string[];
  max?: number;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const atLimit = max !== undefined && selected.length >= max;

  function toggle(skill: string) {
    setSelected((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : atLimit
          ? current
          : [...current, skill]
    );
  }

  return (
    <div>
      <ul className="pill-list">
        {SKILL_CATALOG.map((skill) => {
          const on = selected.includes(skill);
          return (
            <li key={skill}>
              <button
                type="button"
                className="chip"
                aria-pressed={on}
                // Khóa các kỹ năng chưa chọn khi đã chạm trần, thay vì để người
                // dùng bấm rồi mới báo lỗi (Quy tắc Vàng số 5: ngăn lỗi).
                disabled={!on && atLimit}
                onClick={() => toggle(skill)}
              >
                {on ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                {skill}
              </button>
            </li>
          );
        })}
      </ul>

      {max ? (
        <p className="field__hint num" aria-live="polite">
          Đã chọn {selected.length} trên tối đa {max} kỹ năng.
        </p>
      ) : null}

      {/* Giá trị thật gửi kèm form */}
      {selected.map((skill) => (
        <input key={skill} type="hidden" name={name} value={skill} />
      ))}
    </div>
  );
}
