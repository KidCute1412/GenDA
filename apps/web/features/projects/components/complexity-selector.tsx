"use client";

import { COMPLEXITY_ORDER, LEVEL_COPY, formatRange, levelRange } from "../level-copy";
import type { ProjectComplexity, ProjectCreationPolicy } from "../sme-api";

/**
 * Chọn mức độ dự án (FR-PRJ-10). Mỗi lựa chọn cho thấy CÙNG LÚC ba hệ quả của nó: phạm vi việc phù hợp,
 * khoảng ngân sách và ai được ứng tuyển. SME thấy cái giá của việc khai thấp level ngay lúc chọn, thay vì
 * chỉ biết khi admin trả dự án về.
 */
export function ComplexitySelector({
  policy,
  value,
  onChange,
  error
}: {
  policy: ProjectCreationPolicy;
  value: ProjectComplexity | null;
  onChange: (complexity: ProjectComplexity) => void;
  error?: string;
}) {
  return (
    <fieldset className="level-choice" aria-describedby={error ? "complexity-error" : undefined}>
      <legend className="field__label">
        Mức độ dự án
        <span className="field__required" aria-hidden="true">
          *
        </span>
        <span className="visually-hidden">(bắt buộc)</span>
      </legend>
      <div className="level-choice__grid">
        {COMPLEXITY_ORDER.map((complexity) => {
          const copy = LEVEL_COPY[complexity];
          const range = levelRange(policy, complexity);
          return (
            <label key={complexity} className="level-choice__option" data-checked={value === complexity}>
              {/* Tên của lựa chọn chỉ là nhãn mức độ; khoảng tiền và mô tả được đọc như phần diễn giải. */}
              <input
                type="radio"
                name="project-complexity"
                value={complexity}
                checked={value === complexity}
                onChange={() => onChange(complexity)}
                aria-labelledby={`level-${complexity}-title`}
                aria-describedby={`level-${complexity}-range level-${complexity}-scope level-${complexity}-who`}
              />
              <span className="level-choice__title" id={`level-${complexity}-title`}>{copy.label}</span>
              {range ? <span className="level-choice__range num" id={`level-${complexity}-range`}>{formatRange(range)}</span> : null}
              <span className="level-choice__text" id={`level-${complexity}-scope`}>{copy.scope}</span>
              <span className="level-choice__text" id={`level-${complexity}-who`}>
                <strong>Ai ứng tuyển được:</strong> {copy.eligibility}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="field__error" id="complexity-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
