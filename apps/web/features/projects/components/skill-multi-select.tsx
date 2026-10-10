"use client";

import { Check, ICON_WEIGHT } from "../../../components/ui/icons";
import type { CatalogSkill } from "../sme-api";

/**
 * Chọn kỹ năng từ danh mục chuẩn của hệ thống (FR-USR-05).
 *
 * CẤM nhập tự do, và đây là ràng buộc nghiệp vụ chứ không phải lựa chọn giao
 * diện: điểm phù hợp (Match Score) so khớp theo mã kỹ năng, nên chỉ cần một
 * người gõ "ReactJS" thay vì "React" là thuật toán ghép nối hỏng. Ràng buộc
 * được thể hiện TRỰC QUAN bằng việc không hề có ô nhập chữ nào (Visible
 * Constraint, design.md 4.3). Danh mục lấy từ backend, giá trị gửi đi là mã.
 *
 * Mỗi kỹ năng là một nút bật/tắt mang aria-pressed, không phải checkbox ẩn:
 * trạng thái bật được mã hóa cả bằng nền đậm lẫn dấu tích, không chỉ bằng màu.
 */
export function SkillMultiSelect({
  options,
  value,
  onChange,
  max
}: {
  options: CatalogSkill[];
  value: string[];
  onChange: (codes: string[]) => void;
  max?: number;
}) {
  const atLimit = max !== undefined && value.length >= max;

  function toggle(code: string) {
    if (value.includes(code)) onChange(value.filter((item) => item !== code));
    else if (!atLimit) onChange([...value, code]);
  }

  return (
    <div>
      <ul className="pill-list">
        {options.map((skill) => {
          const on = value.includes(skill.code);
          return (
            <li key={skill.code}>
              <button
                type="button"
                className="chip"
                aria-pressed={on}
                // Khóa các kỹ năng chưa chọn khi đã chạm trần, thay vì để người
                // dùng bấm rồi mới báo lỗi (Quy tắc Vàng số 5: ngăn lỗi).
                disabled={!on && atLimit}
                onClick={() => toggle(skill.code)}
              >
                {on ? <Check weight={ICON_WEIGHT} aria-hidden="true" /> : null}
                {skill.name}
              </button>
            </li>
          );
        })}
      </ul>

      {max ? (
        <p className="field__hint num" aria-live="polite">
          Đã chọn {value.length} trên tối đa {max} kỹ năng.
        </p>
      ) : null}
    </div>
  );
}
