"use client";

import { useId, useState } from "react";
import { Field } from "../../../components/ui/field";
import { Eye, EyeSlash, ICON_WEIGHT } from "../../../components/ui/icons";

/**
 * Ô nhập mật khẩu, dùng chung cho cả đăng nhập và đăng ký.
 *
 * Hai yêu cầu bắt buộc được gộp vào đây để không màn hình nào quên mất một cái:
 *
 * 1. **Nút hiện/ẩn mật khẩu.** Gõ mù một chuỗi dài trên bàn phím ảo là nguồn lỗi
 *    lớn nhất của màn hình đăng nhập trên điện thoại, và người dùng không có
 *    cách nào tự phát hiện mình gõ sai cho tới khi bị từ chối.
 * 2. **Không chặn dán và khai đúng `autocomplete`** (WCAG 2.2 AA 3.3.8 —
 *    Accessible Authentication). Chặn dán thường được biện minh bằng lý do bảo
 *    mật nhưng thực tế làm điều ngược lại: nó vô hiệu hóa trình quản lý mật
 *    khẩu, nên đẩy người dùng về phía mật khẩu ngắn dễ nhớ.
 */
const LEVELS = [
  { label: "Quá ngắn", advice: "Mật khẩu cần ít nhất 8 ký tự." },
  { label: "Yếu", advice: "Thêm chữ hoa hoặc chữ số để khó đoán hơn." },
  { label: "Tạm ổn", advice: "Thêm một ký tự đặc biệt nữa là đủ an toàn." },
  { label: "Mạnh", advice: "Mật khẩu này đủ an toàn." }
];

function scorePassword(value: string): number {
  if (value.length < 8) return 0;

  let score = 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 3);
}

export function PasswordField({
  label = "Mật khẩu",
  autoComplete = "new-password",
  showStrength = false
}: {
  label?: string;
  autoComplete?: "new-password" | "current-password";
  showStrength?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  const level = LEVELS[scorePassword(value)];
  const percent = value.length === 0 ? 0 : ((scorePassword(value) + 1) / 4) * 100;
  const meterVisible = showStrength && value.length > 0;

  return (
    <Field
      id={id}
      label={label}
      required
      hint={showStrength && value.length === 0 ? "Ít nhất 8 ký tự." : undefined}
    >
      <div className="input-affix">
        <input
          id={id}
          className="input"
          type={visible ? "text" : "password"}
          required
          minLength={showStrength ? 8 : undefined}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={meterVisible ? `${id}-strength` : showStrength ? `${id}-hint` : undefined}
        />

        {/* Nhãn đọc được đổi theo trạng thái, nên trình đọc màn hình biết nút này
            vừa làm gì. aria-pressed nói rõ đây là nút bật/tắt chứ không phải nút
            thực hiện một hành động rồi thôi. */}
        <button
          type="button"
          className="input-affix__btn"
          aria-pressed={visible}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeSlash weight={ICON_WEIGHT} aria-hidden="true" />
          ) : (
            <Eye weight={ICON_WEIGHT} aria-hidden="true" />
          )}
        </button>
      </div>

      {meterVisible ? (
        <div style={{ marginTop: "var(--space-2)" }}>
          {/* Thanh đo là kênh thị giác thuần túy nên aria-hidden; dòng chữ bên
              dưới mới là nơi mang thông tin, và nó nằm trong vùng aria-live. */}
          <div className="meter" aria-hidden="true">
            <div className="meter__fill" style={{ width: `${percent}%` }} />
          </div>
          <p id={`${id}-strength`} className="field__hint" aria-live="polite">
            Độ mạnh: {level.label}. {level.advice}
          </p>
        </div>
      ) : null}
    </Field>
  );
}
