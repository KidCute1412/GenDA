import type { ReactNode } from "react";
import { CheckCircle, ICON_WEIGHT, Info, Warning, WarningCircle } from "./icons";

/**
 * Alert / Banner — hợp đồng tại docs/design-tokens.md 3.5.
 *
 * `live` bật vùng thông báo động (WCAG 4.1.3): dùng cho banner xuất hiện SAU
 * một hành động của người dùng. Banner tĩnh có sẵn khi tải trang thì không cần,
 * vì trình đọc màn hình đã đọc nó theo thứ tự tài liệu.
 */
type AlertVariant = "info" | "warning" | "success" | "danger";

const ICONS = {
  info: Info,
  warning: Warning,
  success: CheckCircle,
  danger: WarningCircle
} as const;

export function Alert({
  variant = "info",
  title,
  children,
  live
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  live?: "polite" | "assertive";
}) {
  const Icon = ICONS[variant];

  return (
    <div className={`alert alert--${variant}`} role={live ? "status" : undefined} aria-live={live}>
      <Icon weight={ICON_WEIGHT} aria-hidden="true" />
      <div>
        {title ? <p className="alert__title">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
