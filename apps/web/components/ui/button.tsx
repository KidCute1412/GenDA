import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Button — hợp đồng tại docs/design-tokens.md 3.1.
 *
 * KHÔNG có biến thể `success` màu xanh lá: theo quy tắc khan hiếm (design.md
 * 4.4.2), xanh lá chỉ dành cho TRẠNG THÁI đã xác thực, không dành cho nút bấm.
 * Nút "Nghiệm thu mốc này" vì thế dùng biến thể `primary`.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

function classes(variant: ButtonVariant, size: ButtonSize, block?: boolean, extra?: string) {
  return [
    "btn",
    `btn--${variant}`,
    size !== "md" ? `btn--${size}` : "",
    block ? "btn--block" : "",
    extra ?? ""
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={classes(variant, size, block, className)}
      data-loading={loading ? "true" : undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {/* Khi đang tải: GIỮ NGUYÊN nhãn chữ và thêm spinner. Thay nhãn bằng
          spinner đơn độc khiến người dùng mất ngữ cảnh mình vừa bấm gì. */}
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      {children}
      {loading ? <span className="visually-hidden">Đang xử lý</span> : null}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
};

/** Cùng hình dạng với Button nhưng là liên kết điều hướng thật (`<a>`). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, block, className)} {...rest}>
      {children}
    </Link>
  );
}
