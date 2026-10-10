import type { ComponentProps, ReactNode } from "react";
import { ICON_WEIGHT, WarningCircle } from "./icons";

/**
 * Field — hợp đồng tại docs/design-tokens.md 3.2.
 *
 * Giải phẫu bắt buộc (khoảng cách do token quyết định, không phải số thô):
 *   Nhãn  -(6px)-  Ô nhập  -(6px)-  Dòng lỗi  -(20px)-  Nhóm trường kế tiếp
 *
 * Ba ràng buộc không được vi phạm:
 *  1. Nhãn đặt TRÊN ô nhập, không bao giờ dùng placeholder thay nhãn.
 *  2. Lỗi không được chỉ báo bằng mỗi màu đỏ: viền đỏ + icon + chữ nêu nguyên
 *     nhân và cách sửa, kèm aria-invalid + aria-describedby để trình đọc màn
 *     hình đọc được lý do chứ không chỉ thấy viền đổi màu.
 *  3. Cỡ chữ trong ô nhập không dưới 16px (iOS Safari tự phóng to trang).
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

/** Khung bọc cho control tùy biến (thanh trượt, nhóm checkbox, dropzone...). */
export function Field({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="visually-hidden">(bắt buộc)</span> : null}
      </label>

      {children}

      {hint && !error ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="field__error" id={`${id}-error`}>
          <WarningCircle weight={ICON_WEIGHT} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Nối đúng aria-describedby tới dòng gợi ý hoặc dòng lỗi đang hiển thị. */
function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ id, label, hint, error, required, ...rest }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        className="input"
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<"textarea">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextAreaField({ id, label, hint, error, required, ...rest }: TextAreaFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        className="textarea"
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Field>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function SelectField({ id, label, hint, error, required, children, ...rest }: SelectFieldProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        className="select"
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
}
