import { Check, ICON_WEIGHT } from "./icons";

/**
 * Stepper — hợp đồng tại docs/design-tokens.md 3.8.
 *
 * Hai kiểu dùng chung một component:
 *  - `wizard`    : đăng dự án 3 bước, trục ngang.
 *  - `milestone` : tiến độ mốc trong Workspace; dọc trên mobile, ngang từ md.
 *
 * Trạng thái bước KHÔNG chỉ mã hóa bằng màu: bước đã xong mang dấu tích, bước
 * hiện tại mang số thứ tự trên nền đặc, bước sắp tới chỉ có viền.
 */
export type StepState = "completed" | "current" | "upcoming";

export type Step = {
  label: string;
  state: StepState;
};

const STATE_TEXT: Record<StepState, string> = {
  completed: "đã xong",
  current: "đang ở bước này",
  upcoming: "chưa tới"
};

export function Stepper({ steps, ariaLabel }: { steps: Step[]; ariaLabel: string }) {
  return (
    <ol className="stepper" aria-label={ariaLabel}>
      {steps.map((step, index) => (
        <li
          key={step.label}
          className="stepper__item"
          data-state={step.state}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <span className="stepper__marker" aria-hidden="true">
            {step.state === "completed" ? <Check weight={ICON_WEIGHT} /> : index + 1}
          </span>
          <span className="stepper__label">
            {step.label}
            {/* Trạng thái đọc được bằng lời cho trình đọc màn hình: chỉ báo thị
                giác (nền đặc / dấu tích) không tự truyền đạt được điều này. */}
            <span className="visually-hidden"> - {STATE_TEXT[step.state]}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
